import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { verifySessionCookie } from "@/lib/verifySession";
import { cookies } from "next/headers";

export async function POST(request) {
  // Retrieve session cookie
  const a = await request.formData();
  const session = cookies().get("session")?.value;

  // Read the request body for the file ID, new content, and new file name
  const fid = a.get("fid");
  const content = a.get("content");
  const newFileName = a.get("newFileName");

  if (!session || !fid || !content || !newFileName) {
    return new NextResponse("Session, file ID, content, and new file name are required", { status: 400 });
  }

  try {
    // Verify the session cookie
    const sessionData = await verifySessionCookie(session);
    if (!sessionData) {
      return new NextResponse("Invalid session", { status: 401 });
    }

    const email = sessionData.email;

    // Initialize Firebase Admin
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const storage = admin.storage();

    // Retrieve file metadata from Firestore
    const userDocRef = db.collection("users").doc(email);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return new NextResponse("User not found", { status: 404 });
    }

    const userData = userDoc.data();
    const fileMetadata = userData.files.find((file) => file.id === fid);

    if (!fileMetadata) {
      return new NextResponse("File metadata not found", { status: 404 });
    }

    // Update file metadata in Firestore
    const updatedFiles = userData.files.map((file) =>
      file.id === fid ? { ...file, fileName: newFileName } : file
    );

    await userDocRef.update({ files: updatedFiles });

    // Update the file content in Firebase Storage
    const filePath = `users/${encodeURIComponent(email)}/${fileMetadata.id}`;
    const file = storage.bucket("sih-internal-4375c.appspot.com").file(filePath);
    await file.save(content, {
      metadata: {
        contentType: "text/plain",
      },
    });

    return new NextResponse("File updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error saving file:", error);
    return new NextResponse("Error saving file", { status: 500 });
  }
}