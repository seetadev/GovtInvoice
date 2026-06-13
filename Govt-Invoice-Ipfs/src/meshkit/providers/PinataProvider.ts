// src/meshkit/providers/PinataProvider.ts

import { StorageProvider } from "../types";

export class PinataProvider implements StorageProvider {
  private readonly BASE_URL = "https://api.pinata.cloud";
  private readonly gatewayUrl: string;
  private readonly jwt: string;

  constructor(jwt: string, gatewayUrl?: string) {
    this.jwt = jwt;
    this.gatewayUrl =
      gatewayUrl ?? "https://gateway.pinata.cloud/ipfs/";

    if (!this.jwt?.trim()) {
      throw new Error("Pinata JWT is required");
    }
  }

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.jwt}`,
    };
  }

  async testAuth(): Promise<boolean> {
    const response = await fetch(
      `${this.BASE_URL}/data/testAuthentication`,
      {
        method: "GET",
        headers: this.headers,
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({}));

      throw new Error(
        errorData.error?.details ??
          `HTTP error ${response.status}`
      );
    }

    const data = await response.json();
    return !!data.message;
  }

  async putJSON(data: any): Promise<string> {
    const body = {
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: `meshkit-${Date.now()}`,
      },
      pinataContent: data,
    };

    const response = await fetch(
      `${this.BASE_URL}/pinning/pinJSONToIPFS`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({}));

      throw new Error(
        errorData.error?.details ??
          `HTTP error ${response.status}`
      );
    }

    const result = await response.json();

    return result.IpfsHash;
  }

  async putFile(file: Blob | File): Promise<string> {
    const formData = new FormData();
    formData.append(
      "file",
      file,
      file instanceof File ? file.name : "meshkit-file"
    );

    const response = await fetch(`${this.BASE_URL}/pinning/pinFileToIPFS`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.error?.details ?? `HTTP error ${response.status}`
      );
    }

    const result = await response.json();
    return result.IpfsHash;
  }

  async getJSON(cid: string): Promise<any> {
    let cleanedCid = cid.trim();

    if (cleanedCid.includes("/ipfs/")) {
      cleanedCid = cleanedCid.split("/ipfs/")[1];
    }

    cleanedCid = cleanedCid
      .split("?")[0]
      .replace(/\/+$/, "");

    if (!cleanedCid) {
      throw new Error("Invalid CID");
    }

    const gateway = this.gatewayUrl.endsWith("/")
      ? this.gatewayUrl
      : `${this.gatewayUrl}/`;

    const response = await fetch(
      `${gateway}${cleanedCid}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from gateway. HTTP error ${response.status}`
      );
    }

    return await response.json();
  }

  async getFile(cid: string): Promise<Blob> {
    let cleanedCid = cid.trim();

    if (cleanedCid.includes("/ipfs/")) {
      cleanedCid = cleanedCid.split("/ipfs/")[1];
    }

    cleanedCid = cleanedCid.split("?")[0].replace(/\/+$/, "");

    if (!cleanedCid) {
      throw new Error("Invalid CID");
    }

    const gateway = this.gatewayUrl.endsWith("/")
      ? this.gatewayUrl
      : `${this.gatewayUrl}/`;

    const response = await fetch(`${gateway}${cleanedCid}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch from gateway. HTTP error ${response.status}`);
    }

    return await response.blob();
  }

  async delete(cid: string): Promise<boolean> {
    let cleanedCid = cid.trim();

    if (cleanedCid.includes("/ipfs/")) {
      cleanedCid = cleanedCid.split("/ipfs/")[1];
    }

    cleanedCid = cleanedCid.split("?")[0].replace(/\/+$/, "");

    if (!cleanedCid) {
      throw new Error("Invalid CID");
    }

    const response = await fetch(`${this.BASE_URL}/pinning/unpin/${cleanedCid}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.details ?? `HTTP error ${response.status}`);
    }

    return response.ok;
  }
}