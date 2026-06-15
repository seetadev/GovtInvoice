# API Reference

This section documents the public MeshKit TypeScript API.

## Navigation

| API | Purpose |
| --- | --- |
| [init()](./api/init.md) | Create a MeshKit client instance. |
| [testConnection()](./api/testConnection.md) | Validate provider authentication. |
| [store()](./api/store.md) | Store JSON-compatible data on IPFS. |
| [retrieve()](./api/retrieve.md) | Retrieve JSON-compatible data by CID. |
| [upload()](./api/upload.md) | Upload a `Blob` or `File`. |
| [download()](./api/download.md) | Download a file as a `Blob`. |
| [send()](./api/send.md) | Store a simple recipient message. |
| [receive()](./api/receive.md) | Retrieve a stored recipient message. |
| [revoke()](./api/revoke.md) | Unpin a CID from Pinata. |

## Shared Models

### MeshkitConfig

```ts
interface MeshkitConfig {
  provider: "pinata" | "filebase" | "storacha";
  providerToken: string;
  gatewayUrl?: string;
  keyService?: KeyService;
}
```

`providerToken` is currently used as the Pinata JWT. `gatewayUrl` is optional and defaults to the Pinata public gateway. `keyService` is defined but not used by the current implementation.

### MeshkitRecord

```ts
interface MeshkitRecord<T = any> {
  cid: string;
  timestamp: number;
  data?: T;
  size: number;
}
```

Write operations return a record containing the CID, a Unix timestamp in milliseconds, optional data, and a size value.

### MeshkitMessage

```ts
interface MeshkitMessage {
  recipientId: string;
  payload: string;
  timestamp: number;
}
```

`send()` stores this object and `receive()` retrieves it.

### StoreOptions

```ts
interface StoreOptions {
  encrypt?: boolean;
  label?: string;
}
```

These options are accepted by the method signature but are not currently applied by the implementation.

### RetrieveOptions

```ts
interface RetrieveOptions {
  decrypt?: boolean;
}
```

This option is accepted by the method signature but is not currently applied by the implementation.

## Current Provider

Pinata is the only implemented provider. The `provider` union type includes future provider names, but `Meshkit.init()` currently constructs `PinataProvider`.

## Related Guides

- [Getting Started](./getting-started.md)
- [Authentication](./authentication.md)
- [Architecture Overview](./architecture.md)
- [Error Handling](./error-handling.md)
