package com.autocare.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "service_issues")
public class ServiceIssue {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "service_case_id", nullable = false) private ServiceCase serviceCase;
    @Column(name = "issue_description", nullable = false, columnDefinition = "text") private String issueDescription;
    @Column(name = "additional_notes", columnDefinition = "text") private String additionalNotes;
    @Column(name = "reported_at", nullable = false) private Instant reportedAt;
    @Column(name = "reported_by", length = 100) private String reportedBy;
    protected ServiceIssue() { }
    public ServiceIssue(ServiceCase serviceCase, String description, String notes, String reporter) { this.serviceCase=serviceCase;issueDescription=description;additionalNotes=notes;reportedAt=Instant.now();reportedBy=reporter; } public String getIssueDescription(){return issueDescription;}
}
