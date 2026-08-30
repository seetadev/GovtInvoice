# Govt-Billing React Module – **User Guide**

A concise handbook for uploading, viewing, editing, or deleting invoice PDFs through the web-app *or* directly in Firebase Console.

---

## 1&nbsp;· Prerequisites
| Requirement | Details |
|-------------|---------|
| Browser     | Chrome ≥ 114, Firefox ≥ 115, Edge ≥ 114 |
| Account     | Sign-up is e-mail + password via Firebase Auth |
| PDF limit   | ≤ 10 MB per invoice |

---

## 2&nbsp;· Getting Started
1. Browse **\<app-URL>**.  
2. **Sign Up** (first visit) or **Log In**.  
3. You land on **Dashboard ▸ Invoices**.  
   *(Nav: Invoices • Reports • Settings).*

---

## 3&nbsp;· Everyday Tasks

### 3.1 Upload
1. **New Invoice ➜ Upload PDF**.  
2. Pick a PDF (≤ 10 MB).  
3. Fill *Invoice No, Vendor, Amount, Date* → **Save**.  
   *Behind the scenes*  
   * PDF → **Storage** `/invoices/<uid>/<timestamp>.pdf`  
   * Metadata → **Firestore** `invoices` collection  
4. Toast **“Invoice uploaded”** confirms success.

---

### 3.2 View / Download
Hover row → **⋯ Actions ▸ Download**.

### 3.3 Edit
Click row → **Edit** → change fields → **Save**.

### 3.4 Delete
**⋯ Actions ▸ Delete** → confirm. Removes Firestore doc **and** Storage file.

### 3.5 Search / Filter
* Search box covers invoice No, vendor, amount.  
* Date-range picker hits composite index `vendor + invoiceDate`.

### 3.6 Log Out
Avatar → **Log Out**.

---

## 4&nbsp;· Console Fallback (Admin / Emergency)

| Action | Console Path | Steps |
|--------|--------------|-------|
| **Upload PDF** | *Storage ▸ Files* | `invoices/{uid}` → **Upload file** |
| **Create metadata** | *Firestore ▸ invoices* | **+ Add document** → add `uid`, `url`, `invoiceNo`, `vendor`, `amount`, `invoiceDate`, `createdAt` |
| **Edit / Delete** | same tabs | Select row/file → **⋯** menu |


---

## 5&nbsp;· Troubleshooting
| Symptom | Cause | Fix |
|---------|-------|-----|
| `PERMISSION_DENIED` on upload | Auth missing / rule mismatch | Re-login, check rules & `uid`. |
| Blank PDF | Wrong MIME | Upload via **Upload PDF** button or Storage Console “Upload file”. |
| Infinite login spinner | Bad env keys | Correct `.env` values, rebuild. |

---

