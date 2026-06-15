# Error Handling

MeshKit methods return promises. Failed provider requests, invalid input, and gateway failures reject with an `Error`.

## Overview

Use `try`/`catch` around SDK calls.

```ts
try {
  const meshkit = await Meshkit.init({
    provider: "pinata",
    providerToken: pinataJwt,
  });

  const record = await meshkit.store({ id: "invoice-001" });
  console.log(record.cid);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("MeshKit operation failed:", message);
}
```

## Error Sources

| Source | Example message | Common cause |
| --- | --- | --- |
| Initialization | `Pinata JWT is required` | Empty or missing `providerToken`. |
| Authentication | `HTTP error 401` or provider details | Invalid or expired Pinata JWT. |
| Pinning | `HTTP error 400`, `HTTP error 401`, or provider details | Invalid payload, invalid token, or Pinata API failure. |
| Gateway read | `Failed to fetch from gateway. HTTP error 404` | CID not found or gateway cannot resolve it. |
| CID validation | `Invalid CID` | Empty CID after normalization. |

## MeshkitError Type

The repository defines a `MeshkitError` class and these error codes:

```ts
type MeshkitErrorCode =
  | "AUTH_ERROR"
  | "PROVIDER_ERROR"
  | "FETCH_ERROR"
  | "INVALID_CID";
```

The current provider implementation throws standard `Error` objects directly. Do not rely on `MeshkitError.code` unless the implementation is updated to throw `MeshkitError`.

## Recommended Pattern

```ts
async function safeRetrieve<T>(cid: string): Promise<T | null> {
  try {
    const meshkit = await Meshkit.init({
      provider: "pinata",
      providerToken: "PINATA_JWT",
    });

    return await meshkit.retrieve<T>(cid);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("Invalid CID")) {
      console.warn("The provided CID is empty or malformed.");
    } else if (message.includes("HTTP error 401")) {
      console.warn("Pinata authentication failed.");
    } else {
      console.warn("Unable to retrieve data from IPFS:", message);
    }

    return null;
  }
}
```

## Best Practices

- Validate user-entered CIDs before calling `retrieve()`, `download()`, or `revoke()`.
- Call `testConnection()` when credentials are saved or changed.
- Show provider error messages during development, but map them to user-friendly messages in production apps.
- Treat gateway reads as eventually consistent. A recently pinned CID may not be immediately available through every gateway.
- Handle all SDK methods as asynchronous network operations.

## Related APIs

- [testConnection()](./api/testConnection.md)
- [retrieve()](./api/retrieve.md)
- [download()](./api/download.md)
- [revoke()](./api/revoke.md)
