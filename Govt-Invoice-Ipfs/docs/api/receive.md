# receive()

## Overview

Retrieves a message stored by `send()`. Internally, `receive()` calls `retrieve<MeshkitMessage>()`.

## Purpose

Use `receive()` to read a message CID that is expected to contain a `MeshkitMessage`.

## Endpoint / Method

```ts
async receive(cid: string): Promise<MeshkitMessage>
```

Gateway request:

```http
GET {gatewayUrl}/{cid}
```

## Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | CID returned by `send()`. |

### Request schema table

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `cid` | `string` | Yes | Passed to `retrieve<MeshkitMessage>(cid)`. |

## Response

Returns `Promise<MeshkitMessage>`.

```ts
interface MeshkitMessage {
  recipientId: string;
  payload: string;
  timestamp: number;
}
```

### Response schema table

| Field | Type | Description |
| --- | --- | --- |
| `recipientId` | `string` | Application-defined recipient identifier. |
| `payload` | `string` | Message string. |
| `timestamp` | `number` | Timestamp created by `send()`. |

## Examples

### Example request

```ts
const message = await meshkit.receive("bafybeimessageexamplecid");
```

### Example response

```ts
{
  recipientId: "user_123",
  payload: "Invoice INV-1001 is available.",
  timestamp: 1760000000000,
}
```

## Errors

| Error | Cause |
| --- | --- |
| `Invalid CID` | CID is empty after trimming and normalization. |
| `Failed to fetch from gateway. HTTP error 404` | Gateway could not resolve the CID. |
| JSON parse error | CID does not point to JSON content. |

### Error schema table

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Standard JavaScript error name. |
| `message` | `string` | `Invalid CID`, gateway HTTP error, JSON parse error, or network error message. |

## Notes

- The method does not verify that the message belongs to the current user.
- The method does not decrypt content.
- Validate the returned object before trusting it in application logic.

## Best Practices

- Use `receive()` only for CIDs expected to contain `MeshkitMessage`.
- Validate `recipientId`, `payload`, and `timestamp` after retrieval.
- Avoid storing sensitive messages without application-level encryption.

## Related APIs

- [send()](./send.md)
- [retrieve()](./retrieve.md)
