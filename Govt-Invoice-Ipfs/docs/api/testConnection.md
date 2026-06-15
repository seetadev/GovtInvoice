# testConnection()

## Overview

Tests whether the configured provider credentials are valid. For Pinata, this calls the authentication test endpoint and returns `true` when Pinata returns a success message.

## Purpose

Use `testConnection()` to validate stored or newly entered provider credentials before performing write or read operations.

## Endpoint / Method

```ts
async testConnection(): Promise<boolean>
```

Provider endpoint:

```http
GET https://api.pinata.cloud/data/testAuthentication
```

## Parameters

This method does not accept parameters.

### Request schema table

No request body or method parameters.

## Response

Returns a `Promise<boolean>`.

| Value | Description |
| --- | --- |
| `true` | Authentication succeeded. |
| Rejected promise | Authentication or provider request failed. |

### Response schema table

| Type | Description |
| --- | --- |
| `boolean` | `true` when Pinata authentication succeeds. Failed HTTP responses throw instead of returning `false`. |

## Examples

### Example request

```ts
const meshkit = await Meshkit.init({
  provider: "pinata",
  providerToken: "PINATA_JWT",
});

const connected = await meshkit.testConnection();
```

### Example response

```ts
true
```

## Errors

| Error | Cause |
| --- | --- |
| `HTTP error 401` or provider details | Invalid or expired Pinata JWT. |
| `HTTP error 403` or provider details | Token lacks required access. |
| Network error | Runtime could not reach Pinata. |

### Error schema table

| Field | Type | Description |
| --- | --- | --- |
| `name` | `string` | Standard JavaScript error name. |
| `message` | `string` | Pinata error details when available, otherwise `HTTP error {status}`. |

## Notes

- A `false` value is not returned for failed HTTP responses. Failed provider responses throw.
- Use this method when saving or rotating credentials.

## Best Practices

- Run this method before the first write operation in onboarding flows.
- Avoid calling it before every SDK operation; it is a network request.

## Related APIs

- [init()](./init.md)
- [store()](./store.md)
- [Authentication](../authentication.md)
