# retrieve()

## Overview

Retrieves JSON data from IPFS by CID using the configured gateway.

## Purpose

Use `retrieve()` to load JSON-compatible data that was previously stored by `store()` or another compatible IPFS JSON workflow.

## Endpoint / Method

```ts
async retrieve<T>(
  cid: string,
  options?: RetrieveOptions
): Promise<T>
```

Gateway request:

```http
GET {gatewayUrl}/{cid}
```

## Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Raw CID or URL containing `/ipfs/`. |
| `options` | `RetrieveOptions` | No | Accepted by the signature. Current implementation does not apply these options. |
| `options.decrypt` | `boolean` | No | Reserved. Not currently applied. |

## Response

Returns `Promise<T>` containing the parsed JSON response from the gateway.

## Examples

### Example request

```ts
type Invoice = {
  id: string;
  total: number;
  currency: string;
};

const invoice = await meshkit.retrieve<Invoice>("bafybeigdyrzt5examplecid");
```

### Example response

```ts
{
  id: "INV-1001",
  total: 2499,
  currency: "INR",
}
```

## Errors

| Error | Cause |
| --- | --- |
| `Invalid CID` | CID is empty after trimming and normalization. |
| `Failed to fetch from gateway. HTTP error 404` | Gateway could not resolve the CID. |
| JSON parse error | Gateway response is not valid JSON. |
| Network error | Runtime could not reach the gateway. |

## Notes

- The provider removes query strings and trailing slashes.
- URLs containing `/ipfs/` are normalized to the CID segment.
- The method expects JSON content. Use `download()` for file/blob content.

## Best Practices

- Type the response with a TypeScript generic.
- Validate the shape of untrusted data after retrieval.
- Use a custom gateway when your application needs predictable availability.

## Related APIs

- [store()](./store.md)
- [download()](./download.md)
- [receive()](./receive.md)
