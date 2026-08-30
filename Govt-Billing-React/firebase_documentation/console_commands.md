# Firebase Console Commands To Check

import * as fs from '../src/utils/storage';
import { auth } from '../src/lib/firebase';
const user = await auth.signInWithEmailAndPassword('demo@demo.com','secret123');

// LIST
    console.table(await fs.getFilesKeysFromFirestore(user.uid));

// DOWNLOAD
    await fs.downloadFileFromFirebase(user.uid,'demo_invoice',()=>console.log('Download complete'));

// DELETE
    await fs.deleteFileFromFirebase(user.uid,'demo_invoice',()=>console.log('Deleted'));

// UPLOAD
    await fs.uploadFileToFirebase(user.uid,'./seed-pdfs/new_invoice.pdf','new_invoice',()=>console.log('Uploaded'));

