# send()

## Overview

Stores a simple message object for a recipient. Internally, `send()` creates a `MeshkitMessage` and calls `store()`.

## Purpose

Use `send()` when you want MeshKit to wrap a string payload in the standard `MeshkitMessage` model and store it on IPFS.

## Endpoint / Method

```ts
async send(
  recipientId: string,
  message: string
): Promise<MeshkitRecord<MeshkitMessage>>
```

Provider endpoint:

```http
POST https://api.pinata.cloud/pinning/pinJSONToIPFS
```

## Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `recipientId` | `string` | Yes | Application-defined recipient identifier. |
| `message` | `string` | Yes | Message payload to store. |

## Response

Returns `Promise<MeshkitRecord<MeshkitMessage>>`.

```ts
interface MeshkitMessage {
  recipientId: string;
  payload: string;
  timestamp: number;
}
```

The returned `data` field contains the message object.

## Examples

### Example request

```ts
const record = await meshkit.send(
  "user_123",
  "Invoice INV-1001 is available."
);
```

### Example response

```ts
{
  cid: "bafybeimessageexamplecid",
  timestamp: 1760000000000,
  data: {
    recipientId: "user_123",
    payload: "Invoice INV-1001 is available.",
    timestamp: 1760000000000,
  },
  size: 91,
}
```

## Errors

| Error | Cause |
| --- | --- |
| Provider error details | Pinata rejected the JSON pin request. |
| `HTTP error 401` | Invalid Pinata JWT. |
| Serialization error | Message object could not be stringified. |

## Notes

- `send()` does not deliver a push notification, email, websocket event, or inbox update.
- `recipientId` is stored as plain JSON.
- The current implementation does not encrypt messages.

## Best Practices

- Treat this as message storage, not message delivery.
- Do not store private messages unless they are encrypted before calling `send()`.
- Persist the returned CID so the recipient or application can later call `receive()`.

## Related APIs

- [receive()](./receive.md)
- [store()](./store.md)
