# upload()

## Overview

Uploads a `Blob` or `File` to IPFS using Pinata and returns a MeshKit record containing the resulting CID.

## Purpose

Use `upload()` for binary file content such as documents, exports, images, or generated blobs.

## Endpoint / Method

```ts
async upload(
  file: Blob | File,
  options?: StoreOptions
): Promise<MeshkitRecord<void>>
```

Provider endpoint:

```http
POST https://api.pinata.cloud/pinning/pinFileToIPFS
```

## Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | `Blob \| File` | Yes | Binary content to upload. |
| `options` | `StoreOptions` | No | Accepted by the signature. Current implementation does not apply these options. |
| `options.encrypt` | `boolean` | No | Reserved. Not currently applied. |
| `options.label` | `string` | No | Reserved. Not currently applied. |

## Response

Returns `Promise<MeshkitRecord<void>>`.

```ts
{
  cid: string;
  timestamp: number;
  data: undefined;
  size: number;
}
```

| Field | Description |
| --- | --- |
| `cid` | IPFS CID returned by Pinata as `IpfsHash`. |
| `timestamp` | Client-side `Date.now()` value in milliseconds. |
| `data` | Always `undefined` for file uploads. |
| `size` | `file.size` in bytes. |

## Examples

### Example request

```ts
const file = new File(["hello"], "hello.txt", {
  type: "text/plain",
});

const record = await meshkit.upload(file);
```

### Example response

```ts
{
  cid: "bafybeifileexamplecid",
  timestamp: 1760000000000,
  data: undefined,
  size: 5,
}
```

## Errors

| Error | Cause |
| --- | --- |
| Provider error details | Pinata rejected the upload. |
| `HTTP error 401` | Invalid Pinata JWT. |
| Network error | Runtime could not reach Pinata. |

## Notes

- If the value is a `File`, its `name` is sent to Pinata.
- If the value is a `Blob`, MeshKit uses `meshkit-file` as the upload filename.
- The current implementation does not attach custom metadata from `options.label`.

## Best Practices

- Use `store()` for JSON data and `upload()` for binary content.
- Keep the returned CID with any application metadata needed to identify the file later.
- Consider file size limits and upload progress needs in the host application.

## Related APIs

- [download()](./download.md)
- [store()](./store.md)
