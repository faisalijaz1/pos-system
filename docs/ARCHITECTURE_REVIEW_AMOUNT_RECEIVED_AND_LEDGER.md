# Architecture Review: Amount Received & Ledger — POS Financial Flow

**Role:** Senior Software Architect + Enterprise Accounting Systems Expert  
**Scope:** Frontend → Backend → Database → Ledger → Reports  
**Objective:** Ensure Amount Received is a proper financial transaction with correct ledger, customer balance, and audit trail.

---

## 1. Executive Summary

| Area | Status | Risk |
|------|--------|------|
| Frontend sending amountReceived | ✅ Implemented | Low |
| Backend persisting amountReceived | ✅ Implemented | Low |
| **Payment ledger posting** | ❌ **Missing** | **Critical** |
| **Customer balance correctness** | ❌ **At risk** | **High** |
| **LedgerService balance update** | ⚠️ Credit side wrong | High |
| Database schema | ✅ Adequate | Low |
| Transaction boundaries | ⚠️ Single TX per op | Medium |

**Critical finding:** Amount Received is stored on the invoice and sent from all POS tabs, but **no ledger entry is created when the customer pays**. The system posts **Dr Customer, Cr Revenue** (sale) but never **Dr Cash, Cr Customer** (payment). As a result:

- Customer balance only increases (sales); it never decreases when they pay.
- Cash/Bank balance does not reflect POS collections.
- Ledger and reports are inconsistent with actual cash and receivables.

---

## 2. Frontend Review

### 2.1 Billing Tab (PosBillingPage.js)

- **Create (Complete Sale):** Sends `amountReceived`, `changeReturned` in POST body. ✅  
- **Draft:** Sends `amountReceived: 0`, `changeReturned: 0`. ✅  
- **Payment modal:** Editable amount; on Confirm calls `handleCompleteSale` or `handleConfirmPaymentHistory` / `handleConfirmByInvoiceNo` with current amount. ✅  

### 2.2 Sales History Tab (SalesHistoryInvoicePage.js)

- **Save Changes → Preview dialog:** User can edit Amount Received; on **Confirm & Save** calls `handleSaveChanges({ amountReceived })` → PATCH `/v1/invoices/{id}` with `amountReceived`. ✅  

### 2.3 By Invoice No (ByInvoiceNoPage)

- **Create with payment:** Uses `executeCreate(received, changeReturned)` which builds create body with `amountReceived` / `changeReturned`. ✅  

### 2.4 Gaps

- None for sending amountReceived. All tabs and preview/payment modals send it to the backend.

---

## 3. Backend API & Service Review

### 3.1 Invoice Create (SalesInvoiceService.createInvoice)

- Accepts `CreateInvoiceRequest.amountReceived`, `changeReturned`. ✅  
- Persists on `SalesInvoice` (`amount_received`, `change_returned`). ✅  
- **Ledger:** Posts **only** for credit customer, netTotal > 0: **Dr Customer, Cr Revenue** (REF_TYPE_SALE). ✅  
- **Missing:** No posting when `amountReceived > 0` (Dr Cash, Cr Customer). ❌  

### 3.2 Invoice Update (SalesInvoiceService.updateInvoice)

- Accepts `UpdateInvoiceRequest.amountReceived`, `changeReturned`. ✅  
- Updates entity and recalculates net total. ✅  
- **Missing:** No ledger posting for payment; no reversal/adjustment when amountReceived changes. ❌  

### 3.3 LedgerService.post

- Creates two ledger entries (Dr and Cr) and updates **both** account balances by **adding** the amount.  
- **Bug:** For double-entry, the **credit** account balance should **decrease** (receivable goes down when customer pays). Currently both accounts get `currentBalance += amount`, so customer balance would increase again on payment instead of decreasing. ❌  

### 3.4 Customer Balance (CustomerService.getBalance)

- Returns `account.getCurrentBalance()`.  
- That balance is updated only by LedgerService. If we never post Cr Customer (payment), it never goes down. If we post Cr but LedgerService adds instead of subtracts, balance would be wrong. ❌  

---

## 4. Database Review

### 4.1 sales_invoices

- `amount_received NUMERIC(18,2) NOT NULL DEFAULT 0` ✅  
- `change_returned` added in migration 04. ✅  

### 4.2 ledger_entries

- `debit_amount`, `credit_amount`, `ref_type`, `ref_id`. ✅  
- `ref_type` used: SALE, manual. **PAYMENT** not yet used.  

### 4.3 customer_receipts

- Exists for standalone “customer receipt” (branch, bank_account_id). Not used for POS invoice payment; POS stores payment on invoice and (after fix) posts to ledger. Acceptable.  

### 4.4 Gaps

- **POS Cash account:** No dedicated “POS Cash” or “Cash” account in seed; commented in 02_seed_data. Needed for Dr Cash, Cr Customer.  

---

## 5. Ledger Posting Logic (Correct Design)

### 5.1 Rules

1. **Invoice (sale)** = obligation: **Dr Customer (receivable), Cr Revenue.**  
2. **Payment** = cash movement: **Dr Cash, Cr Customer (receivable).**  
3. Amount Received must generate a **payment** ledger pair when > 0.  
4. Partial / overpayment: post the **actual amount received**; change is cash handling only (no extra ledger for change).  

### 5.2 Full payment (amountReceived = netTotal)

- On **create:** After posting SALE (Dr Customer, Cr Revenue), post PAYMENT: **Dr Cash (amountReceived), Cr Customer (amountReceived).**  
- Customer balance: +netTotal (sale) − amountReceived (payment) = 0. ✅  

### 5.3 Partial payment (amountReceived < netTotal)

- Post PAYMENT for `amountReceived` only.  
- Customer balance: +netTotal − amountReceived = balance due. ✅  

### 5.4 Overpayment (amountReceived > netTotal)

- Post PAYMENT for full `amountReceived`; change returned is physical cash only.  
- Customer balance: +netTotal − amountReceived = negative (credit/advance). ✅  

### 5.5 Update (Sales History: change amountReceived)

- **Old** amount = A, **new** amount = B.  
- If B > A: post additional payment **Dr Cash (B−A), Cr Customer (B−A).**  
- If B < A: post reversal **Dr Customer (A−B), Cr Cash (A−B).**  
- If B = A: no ledger change.  

### 5.6 LedgerService balance update (fix)

- **Debit account:** `currentBalance += amount` (unchanged).  
- **Credit account:** `currentBalance -= amount` (so Cr reduces receivable).  
- Set `balanceType = "Dr"` if `currentBalance >= 0`, else `"Cr"`; use absolute value for display if desired.  

---

## 6. Transaction Integrity

- **Create invoice:** Save invoice + items → stock transaction → **SALE posting** → **PAYMENT posting (if amountReceived > 0)** in **one** `@Transactional` method.  
- **Update invoice:** Load invoice → apply request → save → **delta PAYMENT posting** in **one** `@Transactional` method.  
- Any failure must roll back all steps (invoice, ledger, account balances).  

---

## 7. Implemented Fixes (Summary)

1. **LedgerService:** Credit account balance is updated by **subtracting** the amount so that Cr reduces the balance.  
2. **SalesInvoiceService.createInvoice:** When not draft, customer is credit, and `amountReceived > 0`, post PAYMENT (Dr POS Cash, Cr Customer) with ref_type PAYMENT, ref_id = invoice id.  
3. **SalesInvoiceService.updateInvoice:** When `amountReceived` changes, post delta (extra payment or reversal) with same ref_type/ref_id.  
4. **Migration:** Add POS Cash account (e.g. `POS-CASH` or `CASH001`) if not present.  
5. **Frontend:** No change required; already sends amountReceived everywhere.  

---

## 8. Files Touched

| File | Change |
|------|--------|
| `LedgerService.java` | Credit account: subtract amount; set balanceType from sign. |
| `SalesInvoiceService.java` | Post PAYMENT on create (if amountReceived > 0); on update post delta for amountReceived. |
| `database/07_migration_payment_ledger.sql` | Add POS Cash account; comment ref_type PAYMENT. |

---

## 9. Non-Negotiable Quality Rules (Verified)

- Invoice ≠ Payment: invoice = obligation; payment = cash movement. ✅  
- Ledger is event-based; no overwriting of balances; every transaction has Dr and Cr. ✅  
- Amount Received is sent from frontend, persisted, and generates payment ledger entries. ✅  
- Partial, exact, and overpayment supported by posting actual amountReceived. ✅  
- Financial correctness over UI convenience. ✅  

---

## 10. Ledger Posting Logic (Pseudocode)

### Create invoice (complete sale)

```
1. Validate customer, items, stock.
2. Build SalesInvoice + items; set amountReceived, changeReturned from request.
3. Save invoice.
4. If not draft: create StockTransaction + items; update product stock.
5. If not draft && customer && netTotal > 0:
   POST SALE: Dr Customer (netTotal), Cr Revenue (netTotal); ref_type=SALE, ref_id=invoiceId.
6. If not draft && customer && amountReceived > 0:
   POST PAYMENT: Dr Cash (amountReceived), Cr Customer (amountReceived); ref_type=PAYMENT, ref_id=invoiceId.
7. Return invoice response.
```

### Update invoice (Sales History: change amountReceived)

```
1. Load invoice; oldAmount = invoice.amountReceived ?? 0.
2. Apply request (including amountReceived, changeReturned); recalcNetTotal; save.
3. newAmount = invoice.amountReceived ?? 0.
4. If customer && (delta = newAmount - oldAmount) != 0:
   If delta > 0: POST Dr Cash (delta), Cr Customer (delta); ref_type=PAYMENT.
   If delta < 0: POST Dr Customer (|delta|), Cr Cash (|delta|); ref_type=PAYMENT (reversal).
5. Return updated invoice.
```

### LedgerService.post (double-entry)

```
1. Validate amount > 0, debitAccountId != creditAccountId.
2. Create LedgerEntry (debit account): debitAmount=amount, creditAmount=0.
3. Create LedgerEntry (credit account): debitAmount=0, creditAmount=amount.
4. debitAccount.currentBalance += amount; debitAccount.balanceType = "Dr"; save.
5. creditAccount.currentBalance -= amount; creditAccount.balanceType = (balance >= 0 ? "Dr" : "Cr"); save.
```

---

*Document generated as part of enterprise POS financial flow review.*
