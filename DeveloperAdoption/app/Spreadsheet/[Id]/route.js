import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import nunjucks from "nunjucks";
import { getFirebaseAdmin } from "@/lib/firebaseAdmin"; // Import your Firebase Admin setup
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/verifySession";

// Configure Nunjucks
const templatesDir = path.join(process.cwd(), "public");
nunjucks.configure(templatesDir, { autoescape: true });

export async function GET(request, { params }) {
  const session = cookies().get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: "No session provided" }, { status: 400 });
  }
  const { Id } = params;
  const sessionData = await verifySessionCookie(session);
  if (!sessionData) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }
  // Initialize Firebase Admin
  const admin = await getFirebaseAdmin();
  const db = admin.firestore();
  const storage = admin.storage();

  try {
    // Retrieve file metadata from Firestore
    const userDocRef = db.collection("users").doc(sessionData.email);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return new NextResponse("Bad Request", { status: 400 });
    }

    const userData = userDoc.data();
    const fileMetadata = userData.files.find((file) => file.id === Id);

    if (!fileMetadata) {
      return new NextResponse("File not found", { status: 404 });
    }

    const filePath = `users/${encodeURIComponent(sessionData.email)}/${
      fileMetadata.id
    }`;

    // Download the file content from Firebase Storage
    const file = storage
      .bucket("sih-internal-4375c.appspot.com")
      .file(filePath);
    const [fileContent] = await file.download();

    // Add code to process the content if needed

    const data = {
      entry: {
        sheetstr: fileContent.toString(),
        fname: fileMetadata.fileName,
        fid: fileMetadata.id,
      },
    };
    const templatePath = "importcollabload.html"; // Path to the template file

    const renderedContent = nunjucks.render(templatePath, data);

    // Return the rendered content as an HTML response
    return new NextResponse(renderedContent, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error retrieving file:", error);
    return new NextResponse("Error retrieving file", { status: 500 });
  }
}
