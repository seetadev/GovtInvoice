# Installation

MeshKit currently lives inside the application source tree under `src/meshkit`. It is not yet packaged as a standalone npm package in this repository.

## Import MeshKit

Use the local TypeScript module path from your application code.

```ts
import { Meshkit } from "../meshkit/Meshkit";
```

The exact relative path depends on where your calling file lives.

## Runtime Requirements

MeshKit requires a runtime that provides:

| Requirement | Used by |
| --- | --- |
| `fetch` | Pinata API requests and gateway reads |
| `Blob` | File download responses |
| `File` | Browser file uploads |
| `FormData` | Pinata file uploads |
| TypeScript generics | Typed `store()` and `retrieve()` usage |

## Ionic Usage

The current implementation is tested in an Ionic application.

```ts
import { Meshkit } from "../meshkit/Meshkit";

const meshkit = await Meshkit.init({
  provider: "pinata",
  providerToken: pinataJwt,
});

const record = await meshkit.store({ id: "invoice-001" });
```

## Package Installation Status

There is currently no published package name or npm installation command in this repository. Do not document or depend on an npm package until one exists.

Planned, not yet implemented:

- npm package name
- version support policy
- ESM/CommonJS support
- platform-specific installation notes for React Native and Flutter bridges

## Related APIs

- [init()](./api/init.md)
- [Authentication](./authentication.md)
