export interface IPFSUploadResult {
  cid: string;
  url: string;
  timestamp: string;
}

export async function uploadInvoiceToIPFS(
  invoiceJson: string,
  filename: string,
  apiKey: string
): Promise<IPFSUploadResult> {
  const file = new File([invoiceJson], `${filename}.json`, {
    type: "application/json",
  });
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("https://node.lighthouse.storage/api/v0/add", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Lighthouse upload failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const cid = data.Hash;

  return {
    cid,
    url: `https://gateway.lighthouse.storage/ipfs/${cid}`,
    timestamp: new Date().toISOString(),
  };
}
