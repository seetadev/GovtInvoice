# Authentication

MeshKit authenticates with the configured storage provider. The current provider implementation is Pinata and expects a Pinata JWT.

## Overview

Authentication is configured once when calling `Meshkit.init()`.

```ts
const meshkit = await Meshkit.init({
  provider: "pinata",
  providerToken: "PINATA_JWT",
});
```

The token is sent to Pinata using a Bearer authorization header.

```http
Authorization: Bearer PINATA_JWT
```

## Configuration

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `provider` | `"pinata" \| "filebase" \| "storacha"` | Yes | Provider selector from the public type. The current implementation constructs `PinataProvider`. |
| `providerToken` | `string` | Yes | Pinata JWT used for API authentication. |
| `gatewayUrl` | `string` | No | Custom IPFS gateway base URL. Defaults to `https://gateway.pinata.cloud/ipfs/`. |
| `keyService` | `KeyService` | No | Reserved by the type system. The current implementation does not use it. |

## Test Credentials

Use `testConnection()` after initialization to verify the token.

```ts
const meshkit = await Meshkit.init({
  provider: "pinata",
  providerToken: "PINATA_JWT",
});

const ok = await meshkit.testConnection();
```

`testConnection()` calls Pinata's authentication test endpoint and returns `true` when the response contains a success message.

## Security Guidance

- Do not commit Pinata JWTs to source control.
- Do not hardcode production tokens in client applications.
- Prefer platform-specific secure storage for mobile applications.
- Use a restricted Pinata token where possible.
- Treat CIDs as public identifiers. Anyone with gateway access and the CID may be able to fetch unencrypted content.

## Current Limitations

The `keyService`, `encrypt`, and `decrypt` fields are present in the TypeScript types but are not applied by the current MeshKit implementation. Do not assume automatic encryption until the implementation explicitly supports it.

## Related APIs

- [init()](./api/init.md)
- [testConnection()](./api/testConnection.md)
- [Error Handling](./error-handling.md)
