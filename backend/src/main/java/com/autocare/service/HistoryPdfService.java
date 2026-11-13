package com.autocare.service;

import com.autocare.dto.response.*;
import com.autocare.entity.*;
import com.autocare.exception.*;
import com.autocare.repository.*;
import com.autocare.security.*;
import jakarta.transaction.Transactional;
import java.io.*;
import java.util.*;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.font.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class HistoryPdfService {
    private static final java.time.format.DateTimeFormatter PDF_DATE_TIME =
            java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.ROOT)
                    .withZone(java.time.ZoneOffset.UTC);

    private String dateTime(java.time.Instant value) {
        return value == null ? "N/A" : PDF_DATE_TIME.format(value);
    }

    private final VehicleRepository vehicles;
    private final ServiceCaseRepository cases;
    private final ServiceIssueRepository issues;
    private final ServiceItemRepository items;
    private final CurrentUserService current;

    public HistoryPdfService(
            VehicleRepository v,
            ServiceCaseRepository c,
            ServiceIssueRepository i,
            ServiceItemRepository si,
            CurrentUserService x) {
        vehicles = v;
        cases = c;
        issues = i;
        items = si;
        current = x;
    }

    public List<ServiceHistoryResponse> history(String vehicleId) {
        Vehicle v = vehicle(vehicleId);
        access(v);
        return cases.findByVehicle_VehicleId(vehicleId).stream()
                .sorted(
                        Comparator.comparing(
                                ServiceCase::getCheckInTime,
                                Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::history)
                .toList();
    }

    public byte[] pdf(String id) throws IOException {
        ServiceCase c = caseAccess(id);
        try (PDDocument document = new PDDocument();
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                DocumentWriter writer = new DocumentWriter(document)) {
            writer.heading("AutoCare Manager", 20);
            writer.line("SERVICE REPORT & BILL", 11);
            writer.line(
                    "Service case: " + c.getServiceCaseId() + " | Status: " + c.getStatus(), 11);
            writer.heading("Customer & vehicle", 14);
            Vehicle v = c.getVehicle();
            Customer customer = c.getCustomer();
            writer.line(customer.getName() + " | Phone: " + customer.getPhone(), 11);
            writer.line(
                    v.getMake()
                            + " "
                            + v.getModel()
                            + " | "
                            + v.getColor()
                            + " | "
                            + v.getLicensePlate(),
                    11);
            writer.line(
                    "Visit: "
                            + c.getVisitType()
                            + " | Service: "
                            + c.getServiceType()
                            + " | Priority: "
                            + c.getPriority(),
                    10);
            writer.line("Check-in: " + dateTime(c.getCheckInTime()), 10);
            writer.line(
                    "Service started by: "
                            + (c.getStartedBy() == null
                                    ? "Not recorded"
                                    : c.getStartedBy().getUsername()),
                    10);
            writer.heading("Case details", 14);
            writer.line("Customer issue: " + value(issue(c)), 11);
            writer.line("Diagnosis: " + value(c.getDiagnosis()), 11);
            writer.line("Work performed: " + value(c.getSolution()), 11);
            writer.line("Technician notes: " + value(c.getTechnicianNotes()), 11);
            writer.heading(c.getBilledAt() == null ? "Billing items - draft" : "Itemized bill", 14);
            String currency =
                    c.getBillingCurrency() == null ? "INR " : c.getBillingCurrency() + " ";
            java.math.BigDecimal total = java.math.BigDecimal.ZERO;
            boolean unpriced = false;
            List<ServiceItem> bill = items.findByServiceCase_ServiceCaseId(id);
            if (bill.isEmpty()) writer.line("No billing items recorded.", 11);
            for (ServiceItem item : bill) {
                writer.line(item.getName(), 11);
                if (item.getDescription() != null && !item.getDescription().isBlank())
                    writer.line(item.getDescription(), 10);
                writer.line(
                        "Quantity: "
                                + item.getQuantity()
                                + " | Unit price: "
                                + (item.getUnitPrice() == null
                                        ? "Not priced"
                                        : currency
                                                + item.getUnitPrice().setScale(2).toPlainString())
                                + " | Amount: "
                                + (item.getLineTotal() == null
                                        ? "Not priced"
                                        : currency
                                                + item.getLineTotal().setScale(2).toPlainString()),
                        10);
                if (item.getLineTotal() == null) unpriced = true;
                else total = total.add(item.getLineTotal());
            }
            writer.heading(
                    "Total: "
                            + (unpriced
                                    ? "Pending pricing"
                                    : currency
                                            + (c.getBillingTotal() == null
                                                            ? total
                                                            : c.getBillingTotal())
                                                    .setScale(2)
                                                    .toPlainString()),
                    14);
            writer.line(
                    c.getBilledAt() == null
                            ? "DRAFT - bill has not been finalized."
                            : "Bill finalized: " + dateTime(c.getBilledAt()),
                    10);
            writer.line(
                    "Payment: "
                            + (c.getPaidAt() == null
                                    ? "Not recorded"
                                    : "PAID IN FULL - " + dateTime(c.getPaidAt())),
                    11);
            writer.line("Ready for pickup: " + dateTime(c.getReadyForPickupAt()), 10);
            writer.line("Completed / vehicle collected: " + dateTime(c.getCompletedAt()), 10);
            writer.heading("Acknowledgement", 14);
            writer.line("Customer signature: ______________________________", 11);
            writer.line("Workshop representative: _________________________", 11);
            writer.close();
            document.save(out);
            return out.toByteArray();
        }
    }

    /** Wraps text to the actual font width and creates additional pages instead of clipping. */
    private static class DocumentWriter implements AutoCloseable {
        private final PDDocument document;
        private final PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        private PDPageContentStream stream;
        private float y;

        DocumentWriter(PDDocument document) throws IOException {
            this.document = document;
            page();
        }

        private void page() throws IOException {
            if (stream != null) stream.close();
            PDPage page = new PDPage();
            document.addPage(page);
            stream = new PDPageContentStream(document, page);
            y = 742;
            stream.setNonStrokingColor(new java.awt.Color(90, 105, 125));
            write("AutoCare Manager | Page " + document.getNumberOfPages(), 9, 38);
        }

        void heading(String text, int size) throws IOException {
            if (y < 115) page();
            y -= 14;
            stream.setNonStrokingColor(new java.awt.Color(23, 43, 69));
            line(text, size);
            y -= 5;
        }

        void line(String text, int size) throws IOException {
            stream.setNonStrokingColor(new java.awt.Color(40, 50, 65));
            for (String paragraph : text.replace("\r", "").split("\n", -1)) {
                StringBuilder row = new StringBuilder();
                for (String word : clean(paragraph).split(" ")) {
                    String candidate = row.length() == 0 ? word : row + " " + word;
                    if (width(candidate, size) > 512 && row.length() > 0) {
                        output(row.toString(), size);
                        row.setLength(0);
                    }
                    if (row.length() > 0) row.append(' ');
                    for (char ch : word.toCharArray()) {
                        if (width(row.toString() + ch, size) > 512) {
                            output(row.toString(), size);
                            row.setLength(0);
                        }
                        row.append(ch);
                    }
                }
                output(row.toString(), size);
            }
        }

        private String clean(String text) {
            StringBuilder result = new StringBuilder();
            text.codePoints()
                    .forEach(
                            cp -> {
                                String ch = new String(Character.toChars(cp));
                                try {
                                    font.encode(ch);
                                    result.append(ch);
                                } catch (Exception e) {
                                    result.append('?');
                                }
                            });
            return result.toString();
        }

        private float width(String text, int size) throws IOException {
            return font.getStringWidth(text) * size / 1000;
        }

        private void output(String text, int size) throws IOException {
            if (y < 65) page();
            write(text, size, y);
            y -= size + 5;
        }

        private void write(String text, int size, float position) throws IOException {
            stream.beginText();
            stream.setFont(font, size);
            stream.newLineAtOffset(50, position);
            stream.showText(text);
            stream.endText();
        }

        public void close() throws IOException {
            if (stream != null) {
                stream.close();
                stream = null;
            }
        }
    }

    private ServiceHistoryResponse history(ServiceCase c) {
        return new ServiceHistoryResponse(
                c.getServiceCaseId(),
                c.getVisitType(),
                c.getServiceType(),
                c.getPriority(),
                c.getStatus(),
                issue(c),
                c.getDiagnosis(),
                c.getSolution(),
                items.findByServiceCase_ServiceCaseId(c.getServiceCaseId()).stream()
                        .map(ServiceItemResponse::from)
                        .toList(),
                c.getCheckInTime(),
                c.getReadyForPickupAt());
    }

    private String issue(ServiceCase c) {
        return issues.findByServiceCase_ServiceCaseId(c.getServiceCaseId()).stream()
                .findFirst()
                .map(ServiceIssue::getIssueDescription)
                .orElse(null);
    }

    private String value(Object x) {
        return x == null ? "N/A" : x.toString();
    }

    private Vehicle vehicle(String id) {
        return vehicles.findByVehicleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
    }

    private ServiceCase caseAccess(String id) {
        ServiceCase c =
                cases.findByServiceCaseId(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Service case not found"));
        access(c.getVehicle());
        return c;
    }

    private void access(Vehicle v) {
        CurrentUser u = current.requireCurrentUser();
        if (Set.of("EMPLOYEE", "MANAGER", "OWNER").contains(u.role())) return;
        Customer c = current.requireCurrentCustomer();
        if (!v.getCustomer().getId().equals(c.getId()))
            throw new AccessDeniedException("You cannot access this vehicle");
    }
}
