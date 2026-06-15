# download()

## Overview

Downloads file content from IPFS by CID using the configured gateway.

## Purpose

Use `download()` to fetch binary content previously uploaded with `upload()` or otherwise available by CID.

## Endpoint / Method

```ts
async download(cid: string): Promise<Blob>
```

Gateway request:

```http
GET {gatewayUrl}/{cid}
```

## Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Raw CID or URL containing `/ipfs/`. |

## Response

Returns `Promise<Blob>`.

| Value | Description |
| --- | --- |
| `Blob` | File content returned by the gateway. |

## Examples

### Example request

```ts
const blob = await meshkit.download("bafybeifileexamplecid");
const text = await blob.text();
```

### Example response

```ts
// Blob
console.log(blob.size);
console.log(blob.type);
```

## Errors

| Error | Cause |
| --- | --- |
| `Invalid CID` | CID is empty after trimming and normalization. |
| `Failed to fetch from gateway. HTTP error 404` | Gateway could not resolve the CID. |
| Network error | Runtime could not reach the gateway. |

## Notes

- Use `retrieve()` for JSON content that should be parsed automatically.
- The returned `Blob.type` depends on gateway response headers.

## Best Practices

- Convert the `Blob` only after checking expected size and content type where possible.
- Use object URLs carefully and revoke them when no longer needed in browser contexts.
- Store original filenames separately if your app needs to restore them.

## Related APIs

- [upload()](./upload.md)
- [retrieve()](./retrieve.md)
