# Project Context & Agent Instructions

**Root Directory**: `/Invoice` (Always use this as the root for commands and file paths).

## 📱 Project Overview
*   **Type**: Hybrid Mobile App (iOS, Android, PWA, Web).
*   **Framework**: Ionic Framework (React) + Capacitor.
*   **Focus**: **Mobile and Tablet First**. UI/UX must be optimized for touch and smaller screens.
*   **Core Feature**: Offline-first Invoice Generation using SocialCalc.

## 🏗 Project Structure
*   **`/Invoice`**: The main application root.
    *   **`src`**: Source code.
    *   **`ios` / `android`**: Native platform projects.
    *   **`public/templates`**: Core invoice templates.

## ⚙️ Core Engine: SocialCalc
*   **Location**: `src/components/socialcalc`
*   **Status**: **Legacy Code**.
*   **Instruction**: Do **NOT** modify the core SocialCalc engine unless explicitly instructed. It is a complex spreadsheet engine adapted for this app.

## 📄 Template System (`public/templates`)
The app uses a file-based template system.
*   **Structure**:
    *   **`data/{id}.json`**: Contains the actual template data.
    *   **`meta/{id}-meta.json`**: Contains metadata (name, description, preview image, etc.).
*   **Data JSON Schema**:
    *   `msc`: The SocialCalc save format (spreadsheet content).
    *   `appMapping`: Defines which cells are editable or mapped to specific data types (text, forms, tables).
    *   `footers`: Definitions for invoice footers.

### 🔌 Template Loading & Injection Logic
**Critical**: How templates are loaded into `InvoicePage.tsx`.

1.  **Fetch**: The app fetches `data/{id}.json`.
2.  **Generate Editable Cells**:
    *   Function: `generateEditableCells(appMapping, sheetName)` (in `InvoicePage.tsx`).
    *   Logic: Iterates through `appMapping` to find all cells marked `editable: true`. Handles nested forms and dynamic tables.
    *   Output: A list of allow-listed cells.
3.  **Inject**: The result is **injected** into the MSC object before loading.
    ```typescript
    const mscWithEditableCells = {
      ...templateData.msc,
      EditableCells: editableCells
    };
    ```
4.  **Load**: `mscWithEditableCells` is stringified and passed to `AppGeneral.initializeApp()` or `AppGeneral.viewFile()`.

## 💾 Storage Architecture (Local Storage)
The app is **100% Offline**. All data is stored in the browser/device `localStorage`.

### Service: `localTemplateService` (`src/services/local-template-service.ts`)
Handles logic for Templates and Invoices.

**Primary Storage Keys**:
*   `invoicecalc_user_templates`: User-imported templates.
*   `invoicecalc_saved_invoices`: Saved invoices.
    *   **Schema**: `{ id, name, templateId, content, billType, createdAt, modifiedAt, total, ... }`

**Secondary Storage Keys (Direct Usage)**:
*   `userLogos`: Array of `{ id, name, data (base64) }`.
*   `userSignatures`: Array of `{ id, name, data (base64) }`.
*   `businessAddresses`: Saved business details.
*   `customers`: Saved customer profiles.
*   `inventoryItems`: Saved inventory items.

## 📦 Services Layout
*   **`localTemplateService`**: Core CRUD for invoices/templates.
*   **`invoiceEditingService`**: Helper functions for SocialCalc interactions.
*   **`exportAsPdf` / `html2canvas` / `jspdf`**: Client-side PDF generation.

## 📝 Documentation Protocol
*   **Directory**: `/docs`
*   **Requirement**:
    *   Maintain a **running summary of changes** for every chat session that involves medium to critical fixes.
    *   Create new doc files or update existing ones in `/docs` to reflect architectural changes or major bug fixes.
    *   Always ensure this file (`gemini.md` / `claude.md`) is up to date if the core architecture changes.

## 🚀 Development
*   **Run**: `npm run dev` (inside `/Invoice`).
*   **Build**: `ionic build` / `npx cap sync`.
