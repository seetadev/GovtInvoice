// app/api/user/setup/route.js
import { getFirebaseAdmin } from "@/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { verifySessionCookie } from "@/lib/verifySession";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function GET(request) {
  const session = cookies().get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: "No session provided" }, { status: 400 });
  }
  try {
    const sessionData = await verifySessionCookie(session);
    if (!sessionData) {
      return NextResponse.json(
        { error: "No session provided" },
        { status: 400 }
      );
    }
  
    const email = sessionData.email;
    const admin = await getFirebaseAdmin();

    const db = admin.firestore();
    const storage = admin.storage();

    const userDocRef = db.collection("users").doc(email);
    // Get the current date
    const currentDate = new Date();

    // Format the date to `dd/mm/yyyy`
    const formattedDate = new Intl.DateTimeFormat("en-GB").format(currentDate);
    const userDoc = await userDocRef.get();
    const id = uuidv4();
    // If the user document does not exist, create it with default fields
    if (!userDoc.exists) {
      await userDocRef.set({
        name: sessionData.name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        files: [{ fileName: "default", createdAt: formattedDate, id: id }],
      });

      // Assuming content is passed in the request body
      const content = "";
      // Create a file in Firebase Storage
      const file = storage
        .bucket("sih-internal-4375c.appspot.com")
        .file(`users/${encodeURIComponent(email)}/${id}`);
      await file.save(content, {
        metadata: {
          contentType: "text/plain",
        },
      });

      return NextResponse.json(
        { message: "User document and file created successfully." },
        { status: 201 }
      );
    } else {
      // If the user document exists, return the existing document
      const userData = userDoc.data();
      return NextResponse.json({ user: userData }, { status: 200 });
    }
  } catch (error) {
    console.error("Error setting up user:", error);
    return NextResponse.json(
      { error: "Failed to set up user." },
      { status: 500 }
    );
  }
}
export async function POST(request) {
  const session = cookies().get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: "No session provided" }, { status: 400 });
  }
  try {
    const sessionData = await verifySessionCookie(session);
    if (!sessionData) {
      return NextResponse.json({ error: "Invalid session." }, { status: 400 });
    }

    const { fileName } = await request.json();
    // Check if fileName is provided
    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required." },
        { status: 400 }
      );
    }

    const email = sessionData.email;
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const storage = admin.storage();

    const userDocRef = db.collection("users").doc(email);
    const userDoc = await userDocRef.get();
    const id = uuidv4();
    const currentDate = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-GB").format(currentDate);

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userFiles = userDoc.data().files || [];
    userFiles.push({ fileName, createdAt: formattedDate, id });

    await userDocRef.update({ files: userFiles });

    const content = "";
    const file = storage
      .bucket("sih-internal-4375c.appspot.com")
      .file(`users/${encodeURIComponent(email)}/${id}`);
    await file.save(content, {
      metadata: {
        contentType: "text/plain",
      },
    });

    return NextResponse.json(
      { message: "File created and user document updated." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating file:", error);
    return NextResponse.json(
      { error: "Failed to create file." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const session = cookies().get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: "No session provided" }, { status: 400 });
  }
  try {
    const { id, fileName } = await request.json();
    const sessionData = await verifySessionCookie(session);
    if (!sessionData) {
      return NextResponse.json({ error: "Invalid session." }, { status: 400 });
    }

    const email = sessionData.email;
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const userDocRef = db.collection("users").doc(email);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userFiles = userDoc.data().files || [];
    const fileIndex = userFiles.findIndex((file) => file.id === id);
    if (fileIndex === -1) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    userFiles[fileIndex].fileName = fileName;
    await userDocRef.update({ files: userFiles });

    return NextResponse.json(
      { message: "File renamed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error renaming file:", error);
    return NextResponse.json(
      { error: "Failed to rename file." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const session = cookies().get("session")?.value;
  if (!session) {
    return NextResponse.json({ error: "No session provided" }, { status: 400 });
  }
  try {
    const { id } = await request.json();
    const sessionData = await verifySessionCookie(session);
    if (!sessionData) {
      return NextResponse.json({ error: "Invalid session." }, { status: 400 });
    }

    const email = sessionData.email;
    const admin = await getFirebaseAdmin();
    const db = admin.firestore();
    const storage = admin.storage();

    const userDocRef = db.collection("users").doc(email);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const userFiles = userDoc.data().files || [];
    const fileIndex = userFiles.findIndex((file) => file.id === id);
    if (fileIndex === -1) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const filePath = `users/${encodeURIComponent(email)}/${id}`;
    const file = storage
      .bucket("sih-internal-4375c.appspot.com")
      .file(filePath);

    await file.delete();
    userFiles.splice(fileIndex, 1);

    await userDocRef.update({ files: userFiles });

    return NextResponse.json(
      { message: "File deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file." },
      { status: 500 }
    );
  }
}
