# Invoice App - Data Architecture Diagram

## Overview

The app uses a **hybrid storage architecture** combining:
1. **SQLite (Primary)** - via `@capacitor-community/sqlite` for structured data
2. **localStorage** - For app settings, preferences, and quick state persistence
3. **Capacitor Preferences** - Legacy file storage (migrated to SQLite)
4. **Static Files** - Template data served from `/public/templates/`

---

## 🗂️ Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    UI LAYER                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  DashboardHome   │  │   InvoicePage    │  │   SettingsPage   │  │  InventoryPage   │ │
│  │                  │  │                  │  │                  │  │                  │ │
│  │  • Analytics     │  │  • Edit Invoice  │  │  • App Settings  │  │  • Manage Items  │ │
│  │  • File List     │  │  • Save Invoice  │  │  • Currency      │  │  • CRUD Items    │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │
│           │                     │                     │                     │           │
└───────────┼─────────────────────┼─────────────────────┼─────────────────────┼───────────┘
            │                     │                     │                     │
            ▼                     ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              CONTEXT & STATE LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                           InvoiceContext (React Context)                            │ │
│  │  ┌─────────────────────────────────────────────────────────────────────────────┐   │ │
│  │  │  State:                                                                      │   │ │
│  │  │  • selectedFile: string          • currency: string                         │   │ │
│  │  │  • billType: number              • activeTemplateData: TemplateData         │   │ │
│  │  │  • activeTemplateId: string      • currentSheetId: string                   │   │ │
│  │  │  • store: Local (legacy)                                                    │   │ │
│  │  └─────────────────────────────────────────────────────────────────────────────┘   │ │
│  │                          ▲                     │                                    │ │
│  │               Load on mount                    │ Persist changes                    │ │
│  │                          │                     ▼                                    │ │
│  │                    ┌─────────────────────────────────────┐                          │ │
│  │                    │     localStorage (State Sync)       │                          │ │
│  │                    │  • stark-invoice-selected-file      │                          │ │
│  │                    │  • stark-invoice-bill-type          │                          │ │
│  │                    │  • stark-invoice-active-template-id │                          │ │
│  │                    │  • stark-invoice-current-sheet-id   │                          │ │
│  │                    └─────────────────────────────────────┘                          │ │
│  └────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                          │
└────────────────────────────────────────────────┬────────────────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SERVICE LAYER                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                     localTemplateService (Primary Service)                          │ │
│  │                                                                                      │ │
│  │  Invoice Operations:              Template Operations:                              │ │
│  │  ├── getSavedInvoices()           ├── fetchStoreTemplates()                        │ │
│  │  ├── getInvoice(id)               ├── fetchStoreTemplate(id)                       │ │
│  │  ├── saveInvoice(invoice)         ├── getUserTemplates()                           │ │
│  │  ├── deleteInvoice(id)            ├── saveUserTemplate(template)                   │ │
│  │  └── invoiceExists(id)            ├── importTemplate(id, name, color)              │ │
│  │                                   ├── deleteUserTemplate(id)                        │ │
│  │  Settings:                        └── getActiveTemplateId() / setActiveTemplateId() │ │
│  │  └── Uses localStorage                                                              │ │
│  └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                           │                                     │                        │
│           Reads templates from static files           Delegates to repository            │
│                           ▼                                     ▼                        │
│  ┌─────────────────────────────────┐           ┌─────────────────────────────────────┐  │
│  │  /public/templates/             │           │         invoiceRepository           │  │
│  │  ├── meta/{id}-meta.json        │           │  (from src/data/repositories/)      │  │
│  │  ├── data/{id}.json             │           │                                     │  │
│  │  └── meta-consolidated/         │           │  • getAllInvoices()                 │  │
│  │      └── {id}-meta.json         │           │  • getInvoiceById(id)               │  │
│  └─────────────────────────────────┘           │  • saveInvoice(invoice)             │  │
│                                                │  • deleteInvoice(id)                │  │
│                                                │  • getAllUserTemplates()            │  │
│                                                │  • createUserTemplate()             │  │
│                                                └──────────────────┬──────────────────┘  │
│                                                                   │                      │
│  ┌────────────────────────────┐    ┌────────────────────────────┐ │                      │
│  │   settings.ts (utils)      │    │  Other Repositories        │ │                      │
│  │                            │    │                            │ │                      │
│  │  • getSettings()           │    │  customerRepository        │ │                      │
│  │  • saveSettings()          │    │  inventoryRepository       │ │                      │
│  │  • getAutoSaveEnabled()    │    │  businessInfoRepository    │ │                      │
│  │  • getDefaultCurrency()    │    │                            │ │                      │
│  │  • getInvoiceFormat()      │    │  All use same pattern:     │ │                      │
│  │                            │    │  • getAll(), getById()     │ │                      │
│  │  Storage: localStorage     │    │  • save(), delete()        │ │                      │
│  │  Key: "app_settings"       │    │  • search(), count()       │ │                      │
│  └────────────────────────────┘    └─────────────┬──────────────┘ │                      │
│                                                  │                │                      │
└──────────────────────────────────────────────────┼────────────────┼──────────────────────┘
                                                   │                │
                                                   ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               DATA ACCESS LAYER                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                         DatabaseService (database.ts)                               │ │
│  │                                                                                      │ │
│  │   Initialization:                    Query Methods:                                 │ │
│  │   ├── initialize()                   ├── query<T>(sql, params): T[]                │ │
│  │   ├── initWebStore() [web only]      ├── queryOne<T>(sql, params): T | null        │ │
│  │   └── runMigrations()                ├── run(sql, params): changes                 │ │
│  │                                      └── getConnection(): SQLiteDBConnection        │ │
│  │                                                                                      │ │
│  │   Connection Management:                                                            │ │
│  │   • SQLiteConnection (from @capacitor-community/sqlite)                             │ │
│  │   • Handles web vs native platform differences                                      │ │
│  │   • Manages connection pooling & consistency                                        │ │
│  └────────────────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                               │
│                                          ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│  │                            migration.ts                                             │ │
│  │                                                                                      │ │
│  │   One-time migration from localStorage/Preferences → SQLite:                        │ │
│  │   ├── migrateCustomers()          ├── migrateSignatures()                          │ │
│  │   ├── migrateInventory()          ├── migrateLogos()                               │ │
│  │   ├── migrateAddresses()          ├── migrateInvoices()                            │ │
│  │   └── migrateUserTemplates()                                                        │ │
│  │                                                                                      │ │
│  │   Flag: localStorage["invoice_sqlite_migrated"] = "true"                            │ │
│  └────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               STORAGE LAYER                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────────────────────┐   ┌──────────────────────────────────────────────┐│
│  │       SQLite Database            │   │              localStorage                     ││
│  │     (Primary Storage)            │   │           (Settings & State)                 ││
│  │                                  │   │                                              ││
│  │  Database: "invoice_db"          │   │  Keys:                                       ││
│  │                                  │   │  • app_settings (JSON)                       ││
│  │  Tables:                         │   │    - autoSaveEnabled                         ││
│  │  ┌─────────────────────────────┐ │   │    - defaultCurrency                         ││
│  │  │ customers                   │ │   │    - invoiceFormat                           ││
│  │  │ • id, name, street_address  │ │   │    - sequentialNumber                        ││
│  │  │ • city_state_zip, phone     │ │   │    - invoicePrefix                           ││
│  │  │ • email, timestamps         │ │   │                                              ││
│  │  └─────────────────────────────┘ │   │  • stark-invoice-selected-file               ││
│  │  ┌─────────────────────────────┐ │   │  • stark-invoice-bill-type                   ││
│  │  │ inventory_items             │ │   │  • stark-invoice-active-template-id          ││
│  │  │ • id, name, description     │ │   │  • stark-invoice-current-sheet-id            ││
│  │  │ • price, stock              │ │   │  • invoice_sqlite_migrated                   ││
│  │  │ • is_infinite_stock         │ │   │                                              ││
│  │  └─────────────────────────────┘ │   └──────────────────────────────────────────────┘│
│  │  ┌─────────────────────────────┐ │                                                   │
│  │  │ business_addresses          │ │   ┌──────────────────────────────────────────────┐│
│  │  │ • id, label, street_address │ │   │      Capacitor Preferences (Legacy)          ││
│  │  │ • city_state_zip, phone     │ │   │                                              ││
│  │  │ • email                     │ │   │  Used by LocalStorage.ts (File class)        ││
│  │  └─────────────────────────────┘ │   │  • _saveFile(file)                           ││
│  │  ┌─────────────────────────────┐ │   │  • _getFile(name)                            ││
│  │  │ signatures                  │ │   │  • _getAllFiles()                            ││
│  │  │ • id, name, data (base64)   │ │   │  • _deleteFile(name)                         ││
│  │  │ • is_selected               │ │   │                                              ││
│  │  └─────────────────────────────┘ │   │  Note: This is the OLD storage method        ││
│  │  ┌─────────────────────────────┐ │   │  Data migrated to SQLite on first run        ││
│  │  │ logos                       │ │   └──────────────────────────────────────────────┘│
│  │  │ • id, name, data (base64)   │ │                                                   │
│  │  │ • is_selected               │ │   ┌──────────────────────────────────────────────┐│
│  │  └─────────────────────────────┘ │   │        Static File System                    ││
│  │  ┌─────────────────────────────┐ │   │       /public/templates/                     ││
│  │  │ invoices (Primary)          │ │   │                                              ││
│  │  │ • id, name, template_id     │ │   │  Template Metadata:                          ││
│  │  │ • content (sheet data)      │ │   │  • /meta/{id}-meta.json                      ││
│  │  │ • bill_type, total          │ │   │  • /meta-consolidated/{id}-meta.json         ││
│  │  │ • invoice_number, date      │ │   │                                              ││
│  │  │ • from_details (JSON)       │ │   │  Template Data:                              ││
│  │  │ • bill_to_details (JSON)    │ │   │  • /data/{id}.json                           ││
│  │  │ • items (JSON)              │ │   │                                              ││
│  │  │ • timestamps                │ │   │  Contains:                                   ││
│  │  └─────────────────────────────┘ │   │  • msc: Multi-sheet configuration            ││
│  │  ┌─────────────────────────────┐ │   │  • footers: Footer definitions               ││
│  │  │ user_templates              │ │   │  • appMapping: Field mappings                ││
│  │  │ • id, template_data (JSON)  │ │   └──────────────────────────────────────────────┘│
│  │  │ • selected_color            │ │                                                   │
│  │  │ • imported_at               │ │                                                   │
│  │  └─────────────────────────────┘ │                                                   │
│  │  ┌─────────────────────────────┐ │                                                   │
│  │  │ schema_version              │ │                                                   │
│  │  │ • version (migration track) │ │                                                   │
│  │  └─────────────────────────────┘ │                                                   │
│  └──────────────────────────────────┘                                                   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagrams

### 1. Invoice Save Flow

```
┌─────────────────┐    ┌─────────────────────┐    ┌────────────────────┐    ┌─────────────┐
│   InvoicePage   │───▶│ localTemplateService│───▶│ invoiceRepository  │───▶│   SQLite    │
│                 │    │   .saveInvoice()    │    │   .saveInvoice()   │    │  invoices   │
│  User clicks    │    │                     │    │                    │    │   table     │
│  "Save"         │    │  Validates &        │    │  INSERT or UPDATE  │    │             │
└─────────────────┘    │  formats data       │    │  with timestamps   │    └─────────────┘
                       └─────────────────────┘    └────────────────────┘
```

### 2. Invoice Load Flow (Dashboard)

```
┌─────────────────┐    ┌─────────────────────┐    ┌────────────────────┐    ┌─────────────┐
│  DashboardHome  │◀───│ localTemplateService│◀───│ invoiceRepository  │◀───│   SQLite    │
│                 │    │ .getSavedInvoices() │    │ .getAllInvoices()  │    │  invoices   │
│  useEffect()    │    │                     │    │                    │    │   table     │
│  calls loadData │    │  Maps DB rows to    │    │  SELECT * ORDER BY │    │             │
│                 │    │  SavedInvoice[]     │    │  modified_at DESC  │    │             │
└─────────────────┘    └─────────────────────┘    └────────────────────┘    └─────────────┘
        │
        ▼
┌─────────────────┐
│ parseInvoiceData│
│  (analytics)    │
│                 │
│ Calculates:     │
│ • totalInvoices │
│ • totalRevenue  │
└─────────────────┘
```

### 3. Template Load Flow

```
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────────────────┐
│   InvoicePage   │───▶│ localTemplateService│───▶│  Static Files (fetch API)  │
│                 │    │ .fetchStoreTemplate │    │                             │
│  Needs template │    │       (id)          │    │  /templates/meta/{id}.json  │
│  data to render │    │                     │    │  /templates/data/{id}.json  │
└─────────────────┘    └─────────────────────┘    └─────────────────────────────┘
        │
        ▼
┌─────────────────┐
│ InvoiceContext  │
│                 │
│ updateActive    │
│ TemplateData()  │
│                 │
│ Stores in state │
│ + localStorage  │
└─────────────────┘
```

### 4. Settings Flow

```
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│  SettingsPage   │───▶│   settings.ts       │───▶│  localStorage   │
│                 │    │   (utils)           │    │                 │
│  User changes   │    │                     │    │  "app_settings" │
│  currency/auto  │    │  saveSettings({     │    │  (JSON blob)    │
│  save settings  │    │    currency: "USD"  │    │                 │
│                 │    │  })                 │    │                 │
└─────────────────┘    └─────────────────────┘    └─────────────────┘
        │
        ▼
┌─────────────────┐
│ InvoiceContext  │
│                 │
│ updateCurrency()│
│                 │
│ Updates context │
│ state + syncs   │
│ to localStorage │
└─────────────────┘
```

### 5. Delete Invoice Flow (with Analytics Refresh)

```
┌─────────────────┐    ┌─────────────────────┐    ┌────────────────────┐    ┌─────────────┐
│     Files       │───▶│ localTemplateService│───▶│ invoiceRepository  │───▶│   SQLite    │
│   Component     │    │   .deleteInvoice()  │    │   .deleteInvoice() │    │  invoices   │
│                 │    │                     │    │                    │    │   table     │
│  User confirms  │    │                     │    │  DELETE FROM       │    │             │
│  delete         │    │                     │    │  WHERE id = ?      │    │             │
└────────┬────────┘    └─────────────────────┘    └────────────────────┘    └─────────────┘
         │
         │ calls onDataChange()
         ▼
┌─────────────────┐
│  DashboardHome  │
│                 │
│  loadData()     │
│  re-fetches all │
│  invoices &     │
│  recalculates   │
│  analytics      │
└─────────────────┘
```

---

## 🏗️ App Initialization Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                main.tsx                                          │
│                                                                                  │
│  1. initializeEdgeToEdgeStatusBar()                                             │
│                     │                                                            │
│                     ▼                                                            │
│  2. [Web only] Initialize jeep-sqlite custom elements                           │
│     • jeepSqlite(window)                                                        │
│     • customElements.whenDefined('jeep-sqlite')                                 │
│     • initWebStore()                                                            │
│                     │                                                            │
│                     ▼                                                            │
│  3. initializeDataLayer() ─────────────────────────────────────────────────┐    │
│                                                                             │    │
│     ┌───────────────────────────────────────────────────────────────────┐  │    │
│     │  src/data/index.ts                                                 │  │    │
│     │                                                                    │  │    │
│     │  a) database.initialize()                                          │  │    │
│     │     • Check platform (web/native)                                  │  │    │
│     │     • Create/retrieve SQLite connection                            │  │    │
│     │     • Execute CREATE_TABLES_SQL (schema.ts)                        │  │    │
│     │     • Run pending migrations                                       │  │    │
│     │                                                                    │  │    │
│     │  b) runMigration() [if not already done]                           │  │    │
│     │     • Check localStorage["invoice_sqlite_migrated"]                │  │    │
│     │     • Migrate: customers, inventory, addresses,                    │  │    │
│     │       signatures, logos, invoices, user_templates                  │  │    │
│     │     • Set migration flag                                           │  │    │
│     └───────────────────────────────────────────────────────────────────┘  │    │
│                                                                             │    │
│  4. Render React App ◀──────────────────────────────────────────────────────┘    │
│     • <InvoiceProvider> wraps app                                                │
│     • Context loads persisted state from localStorage                            │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure Reference

```
src/
├── data/                          # Data layer
│   ├── index.ts                   # Entry point, exports everything
│   ├── database.ts                # SQLite connection & queries
│   ├── schema.ts                  # Table definitions & migrations
│   ├── types.ts                   # TypeScript interfaces
│   ├── migration.ts               # localStorage → SQLite migration
│   └── repositories/              # Data access objects
│       ├── index.ts
│       ├── customer-repository.ts
│       ├── inventory-repository.ts
│       ├── business-info-repository.ts
│       └── invoice-repository.ts
│
├── services/
│   └── local-template-service.ts  # High-level API for templates/invoices
│
├── contexts/
│   └── InvoiceContext.tsx         # Global state management
│
├── components/
│   └── Storage/
│       └── LocalStorage.ts        # Legacy Capacitor Preferences wrapper
│
├── utils/
│   └── settings.ts                # App settings utilities
│
└── main.tsx                       # App entry point & initialization
```

---

## 🔑 Key Points

| Storage | Purpose | Data |
|---------|---------|------|
| **SQLite** | Primary persistent storage | Invoices, Customers, Inventory, Signatures, Logos, User Templates |
| **localStorage** | Quick state persistence | App settings, Active template ID, UI state |
| **Static Files** | Read-only template data | Template metadata & spreadsheet data |
| **Capacitor Preferences** | Legacy (migrated) | Previously stored invoice files |

---

## 🔄 Migration Path

```
[First App Launch]
        │
        ▼
┌───────────────────────┐
│ Check migration flag  │
│ "invoice_sqlite_      │
│  migrated" === "true"?│
└───────────┬───────────┘
            │
     ┌──────┴──────┐
     │ No          │ Yes
     ▼             ▼
┌─────────────┐  ┌─────────────┐
│ Run full    │  │ Skip        │
│ migration   │  │ migration   │
│ from        │  │             │
│ localStorage│  │             │
│ & Capacitor │  │             │
│ Preferences │  │             │
│ to SQLite   │  │             │
└──────┬──────┘  └──────┬──────┘
       │                │
       └───────┬────────┘
               ▼
        [App Ready]
```
