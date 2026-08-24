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
}
