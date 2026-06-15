# Getting Started

MeshKit is a TypeScript SDK for storing and retrieving application data on decentralized storage. The current implementation uses Pinata as the storage provider and writes data to IPFS.

```text
Meshkit
  -> StorageProvider
    -> PinataProvider
      -> Pinata IPFS
```

## Documentation Navigation

- [Getting Started](./getting-started.md)
- [Installation](./installation.md)
- [Authentication](./authentication.md)
- [Architecture Overview](./architecture.md)
- [Error Handling](./error-handling.md)
- [API Reference Overview](./api-reference.md)
- API Reference
  - [init()](./api/init.md)
  - [testConnection()](./api/testConnection.md)
  - [store()](./api/store.md)
  - [retrieve()](./api/retrieve.md)
  - [upload()](./api/upload.md)
  - [download()](./api/download.md)
  - [send()](./api/send.md)
  - [receive()](./api/receive.md)
  - [revoke()](./api/revoke.md)

## Quickstart

Initialize MeshKit with a Pinata JWT, test the connection, then store and retrieve JSON data.

```ts
import { Meshkit } from "../src/meshkit/Meshkit";

const meshkit = await Meshkit.init({
  provider: "pinata",
  providerToken: "PINATA_JWT",
});

const connected = await meshkit.testConnection();

if (!connected) {
  throw new Error("Could not connect to Pinata");
}

const record = await meshkit.store({
  invoiceId: "INV-1001",
  total: 2499,
  currency: "INR",
});

console.log(record.cid);

const invoice = await meshkit.retrieve<{
  invoiceId: string;
  total: number;
  currency: string;
}>(record.cid);

console.log(invoice.invoiceId);
```

## Current Capabilities

MeshKit currently supports:

- Initializing a storage client with `Meshkit.init()`
- Testing Pinata authentication with `testConnection()`
- Storing JSON-compatible data with `store()`
- Retrieving JSON-compatible data with `retrieve()`
- Uploading `Blob` or `File` objects with `upload()`
- Downloading files as `Blob` objects with `download()`
- Storing simple recipient messages with `send()`
- Reading stored messages with `receive()`
- Unpinning CIDs from Pinata with `revoke()`

## Platform Support

MeshKit is implemented in TypeScript and uses Web Platform APIs such as `fetch`, `Blob`, `File`, and `FormData`.

The current implementation is tested in an Ionic application. Future public SDK packaging can target Ionic, React Native, and Flutter integrations, but the current source API is TypeScript-first.

## Minimal Workflow

```ts
const meshkit = await Meshkit.init({
  provider: "pinata",
  providerToken: "PINATA_JWT",
});

const saved = await meshkit.store({ hello: "ipfs" });
const loaded = await meshkit.retrieve<{ hello: string }>(saved.cid);
```

## Related APIs

- [init()](./api/init.md)
- [testConnection()](./api/testConnection.md)
- [store()](./api/store.md)
- [retrieve()](./api/retrieve.md)
