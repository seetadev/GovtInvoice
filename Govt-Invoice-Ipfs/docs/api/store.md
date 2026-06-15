# store()

## Overview

Stores JSON-compatible data on IPFS using Pinata and returns a MeshKit record containing the resulting CID.

## Purpose

Use `store()` when your application needs to persist structured JSON data and keep the returned CID for later retrieval.

## Endpoint / Method

```ts
async store<T>(
  data: T,
  options?: StoreOptions
): Promise<MeshkitRecord<T>>
```

Provider endpoint:

```http
POST https://api.pinata.cloud/pinning/pinJSONToIPFS
```

## Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `data` | `T` | Yes | JSON-compatible value to pin. |
| `options` | `StoreOptions` | No | Accepted by the signature. Current implementation does not apply these options. |
| `options.encrypt` | `boolean` | No | Reserved. Not currently applied. |
| `options.label` | `string` | No | Reserved. Not currently applied. Pinata metadata name is generated as `meshkit-{timestamp}`. |

### Request schema table

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `data` | `T` | Yes | JSON-compatible value passed to `pinataContent`. |
| `options.encrypt` | `boolean` | No | Accepted by type; not implemented. |
| `options.label` | `string` | No | Accepted by type; not implemented. |

## Response

Returns `Promise<MeshkitRecord<T>>`.

```ts
interface MeshkitRecord<T = any> {
  cid: string;
  timestamp: number;
  data?: T;
  size: number;
}
```

| Field | Description |
| --- | --- |
| `cid` | IPFS CID returned by Pinata as `IpfsHash`. |
| `timestamp` | Client-side `Date.now()` value in milliseconds. |
| `data` | Original data passed to `store()`. |
| `size` | Character length of `JSON.stringify(data)`. |

### Response schema table

| Field | Type | Description |
| --- | --- | --- |
| `cid` | `string` | CID returned by `provider.putJSON(data)`. |
| `timestamp` | `number` | `Date.now()` when the record is created. |
| `data` | `T` | Original data passed to the method. |
| `size` | `number` | `JSON.stringify(data).length`. |

## Examples

### Example request

```ts
type Invoice = {
  id: string;
  total: number;
  currency: string;
};

const record = await meshkit.store<Invoice>({
  id: "INV-1001",
  total: 2499,
  currency: "INR",
});
```

### Example response

```ts
{
  cid: "bafybeigdyrzt5examplecid",
  timestamp: 1760000000000,
  data: {
    id: "INV-1001",
    total: 2499,
    currency: "INR",
  },
  size: 48,
}
```

## Errors

| Error | Cause |
| --- | --- |
| Provider error details | Pinata rejected the request. |
| `HTTP error 401` | Invalid Pinata JWT. |
| Serialization error | `JSON.stringify(data)` fails for unsupported values such as circular references. |

### Error schema table

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Standard JavaScript error name. |
| `message` | `string` | Pinata error details, `HTTP error {status}`, or serialization error message. |

## Notes

- Data should be JSON-compatible.
- Stored content may be publicly retrievable by CID unless encrypted before calling `store()`.
- The current implementation does not encrypt data.

## Best Practices

- Store structured data with explicit version fields when schemas may evolve.
- Avoid storing secrets in plain JSON.
- Persist the returned CID in your application database or local storage.

## Related APIs

- [retrieve()](./retrieve.md)
- [send()](./send.md)
- [upload()](./upload.md)
