# init()

## Overview

Creates a MeshKit client instance configured with a storage provider. The current implementation creates a `PinataProvider` using the supplied `providerToken` and optional `gatewayUrl`.

## Purpose

Use `init()` before calling any instance method. It wires MeshKit to the configured provider and returns the SDK client object.

## Endpoint / Method

```ts
static async init(config: MeshkitConfig): Promise<Meshkit>
```

## Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `config` | `MeshkitConfig` | Yes | Provider and authentication configuration. |
| `config.provider` | `"pinata" \| "filebase" \| "storacha"` | Yes | Provider selector from the public type. The current implementation uses Pinata. |
| `config.providerToken` | `string` | Yes | Pinata JWT. Empty values throw an error. |
| `config.gatewayUrl` | `string` | No | IPFS gateway base URL. Defaults to `https://gateway.pinata.cloud/ipfs/`. |
| `config.keyService` | `KeyService` | No | Reserved by the type system. Not used by the current implementation. |

### Request schema table

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `provider` | `"pinata" \| "filebase" \| "storacha"` | Yes | Type allows all three values. Current implementation creates `PinataProvider`. |
| `providerToken` | `string` | Yes | Must be a non-empty Pinata JWT. |
| `gatewayUrl` | `string` | No | Used for gateway reads in `retrieve()` and `download()`. |
| `keyService` | `KeyService` | No | Defined in `types.ts`; not consumed by `Meshkit.init()`. |

## Response

Returns a `Promise<Meshkit>`.

```ts
class Meshkit {
  store<T>(data: T, options?: StoreOptions): Promise<MeshkitRecord<T>>;
  retrieve<T>(cid: string, options?: RetrieveOptions): Promise<T>;
  testConnection(): Promise<boolean>;
  upload(file: Blob | File, options?: StoreOptions): Promise<MeshkitRecord<void>>;
  download(cid: string): Promise<Blob>;
  send(recipientId: string, message: string): Promise<MeshkitRecord<MeshkitMessage>>;
  receive(cid: string): Promise<MeshkitMessage>;
  revoke(cid: string): Promise<boolean>;
}
```

### Response schema table

| Type | Description |
| --- | --- |
| `Meshkit` | SDK client instance with methods for auth testing, JSON storage, JSON retrieval, file upload, file download, message storage, message retrieval, and revocation. |

## Examples

### Example request

```ts
import { Meshkit } from "../../src/meshkit/Meshkit";

const meshkit = await Meshkit.init({
  provider: "pinata",
  providerToken: "PINATA_JWT",
});
```

### Example response

```ts
// meshkit is a Meshkit instance.
const ok = await meshkit.testConnection();
```

## Errors

| Error | Cause |
| --- | --- |
| `Pinata JWT is required` | `providerToken` is empty or whitespace. |

### Error schema table

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Standard JavaScript error name. |
| `message` | `string` | Error message thrown by `PinataProvider`. |

## Notes

- `Meshkit.init()` is asynchronous but does not call the provider authentication endpoint. Use `testConnection()` to validate credentials.
- The current implementation does not branch on `config.provider`; it constructs `PinataProvider`.

## Best Practices

- Initialize once and reuse the client where practical.
- Store tokens outside source control.
- Call `testConnection()` after users update credentials.

## Related APIs

- [testConnection()](./testConnection.md)
- [Authentication](../authentication.md)
