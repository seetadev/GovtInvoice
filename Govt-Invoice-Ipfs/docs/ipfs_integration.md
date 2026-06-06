# IPFS Save & Retrieve Integration

This document outlines the architecture, setup, and operations for decentralized backup and retrieval using Pinata IPFS.

## Architecture Overview

All application operations are offline-first and client-side. The IPFS integration connects directly to the Pinata Pinning API and public/custom IPFS Gateways from the client environment.

```
+------------------+       Pin JSON       +-------------+
|   Invoice App    | -------------------> | Pinata API  | -> Pinned to IPFS
| (Capacitor/Vite) |                      +-------------+
|                  |       GET CID        +-------------+
|                  | <------------------- | IPFS Gateway|
+------------------+                      +-------------+
```

## Configuration

Users must configure their own credentials on the **Settings** page:

1.  **Pinata JWT Token** (Recommended): A single access token providing direct write access to the user's Pinata account.
2.  **Pinata API Key + API Secret** (Legacy option): Standard credentials.
3.  **IPFS Gateway URL**: Used to retrieve JSON objects by CID. Default: `https://gateway.pinata.cloud/ipfs/`.

## User Operations

### 1. Saving to IPFS
*   **Editor**: Select **More Actions** -> **Save to IPFS**.
    *   The app saves the invoice locally first to compile updated spreadsheet content and metadata.
    *   The JSON object is sent to the Pinata pinning API.
    *   On success, the CID is displayed and automatically copied to the clipboard.
*   **File Manager**: Click the green **Pin to IPFS** icon on the invoice row.

### 2. Retrieving from IPFS
*   **File Manager**: Click **Import IPFS**.
    *   Input the invoice CID.
    *   The app fetches the content from the configured Gateway.
    *   Validates the structure and saves it to the local app database (automatically renaming if a collision is detected).
