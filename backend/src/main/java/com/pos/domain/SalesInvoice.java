package com.pos.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sales_invoice_id")
    private Integer salesInvoiceId;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 50)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "invoice_time")
    private LocalTime invoiceTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_type_id", nullable = false)
    private TransactionType transactionType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_mode_id")
    private DeliveryMode deliveryMode;

    @Column(name = "is_cash_customer", nullable = false)
    private Boolean isCashCustomer = false;

    @Column(name = "grand_total", nullable = false, precision = 18, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "additional_discount", nullable = false, precision = 18, scale = 2)
    private BigDecimal additionalDiscount = BigDecimal.ZERO;

    @Column(name = "additional_expenses", nullable = false, precision = 18, scale = 2)
    private BigDecimal additionalExpenses = BigDecimal.ZERO;

    @Column(name = "net_total", nullable = false, precision = 18, scale = 2)
    private BigDecimal netTotal = BigDecimal.ZERO;

    @Column(name = "amount_received", nullable = false, precision = 18, scale = 2)
    private BigDecimal amountReceived = BigDecimal.ZERO;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "billing_no", length = 100)
    private String billingNo;

    @Column(name = "billing_date")
    private LocalDate billingDate;

    @Column(name = "billing_packing", length = 100)
    private String billingPacking;

    @Column(name = "billing_adda", length = 200)
    private String billingAdda;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "salesInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SalesInvoiceItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
