export type MeshkitErrorCode =
  | "AUTH_ERROR"
  | "PROVIDER_ERROR"
  | "FETCH_ERROR"
  | "INVALID_CID";

export class MeshkitError extends Error {
  constructor(
    public readonly code: MeshkitErrorCode,
    message: string
  ) {
    super(message);
  }
}