package com.autocare.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "diagnoses")
public class Diagnosis {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "service_case_id", nullable = false) private ServiceCase serviceCase;
    @Column(nullable = false, columnDefinition = "text") private String diagnosis;
    @Column(name = "technician_notes", columnDefinition = "text") private String technicianNotes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "diagnosed_by_employee_id") private Employee diagnosedBy;
    @Column(name = "diagnosed_at", nullable = false) private Instant diagnosedAt;
    protected Diagnosis() { } public Diagnosis(ServiceCase c,String value,String notes){serviceCase=c;diagnosis=value;technicianNotes=notes;diagnosedAt=Instant.now();} public Long getId(){return id;} public String getDiagnosis(){return diagnosis;} public String getTechnicianNotes(){return technicianNotes;} public void update(String value,String notes){diagnosis=value;technicianNotes=notes;diagnosedAt=Instant.now();}
}
