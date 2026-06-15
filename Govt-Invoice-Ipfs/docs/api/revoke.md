# revoke()

## Overview

Unpins a CID from Pinata. This removes the provider pin but does not guarantee immediate or global deletion from IPFS gateways or other nodes.

## Purpose

Use `revoke()` when your application needs to remove its Pinata pin for a CID.

## Endpoint / Method

```ts
async revoke(cid: string): Promise<boolean>
```

Provider endpoint:

```http
DELETE https://api.pinata.cloud/pinning/unpin/{cid}
```

## Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Raw CID or URL containing `/ipfs/`. |

### Request schema table

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Normalized before calling Pinata's unpin endpoint. |

## Response

Returns `Promise<boolean>`.

| Value | Description |
| --- | --- |
| `true` | Pinata accepted the unpin request. |
| Rejected promise | The CID was invalid or Pinata rejected the request. |

### Response schema table

| Type | Description |
| --- | --- |
| `boolean` | `true` when `response.ok` is true. Failed HTTP responses throw. |

## Examples

### Example request

```ts
const revoked = await meshkit.revoke("bafybeigdyrzt5examplecid");
```

### Example response

```ts
true
```

## Errors

| Error | Cause |
| --- | --- |
| `Invalid CID` | CID is empty after trimming and normalization. |
| `HTTP error 401` | Invalid Pinata JWT. |
| Provider error details | Pinata rejected the unpin request. |

### Error schema table

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Standard JavaScript error name. |
| `message` | `string` | `Invalid CID`, Pinata error details, `HTTP error {status}`, or network error message. |

## Notes

- This method calls Pinata unpinning, not a universal IPFS delete operation.
- Content may still be available if pinned elsewhere, cached by gateways, or retained by other IPFS nodes.
- Query strings and trailing slashes are removed before the provider calls Pinata.

## Best Practices

- Use precise language in product UI, such as "unpin" or "revoke provider pin", instead of promising deletion.
- Keep an audit trail in your app if revocation matters for compliance workflows.
- Handle missing or already-unpinned CIDs as provider errors.

## Related APIs

- [store()](./store.md)
- [upload()](./upload.md)
- [Error Handling](../error-handling.md)
