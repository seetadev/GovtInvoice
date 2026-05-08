import { User } from "firebase/auth";
import { db } from "./index";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { Local } from "../components/Storage/LocalStorage";

interface File {
  created: string;
  modified: string;
  name: string;
  content: string;
  billType: number;
}

const uploadFileToCloud = async (
  user: User,
  fileData: File,
  onSuccess?: Function
) => {
  try {
    const prevFile = await getDoc(
      doc(db, "invoices", `${user.uid}-${fileData.name}`)
    );
    if (prevFile.exists()) {
      alert("File With the same name exists");
      const newName = prompt("Enter New Name for File");
      if (!newName) {
        alert("Name Cannot be empty");
        return;
      }
      const prevFileWithNewName = await getDoc(
        doc(db, "invoices", `${user.uid}-${newName}`)
      );
      if (prevFileWithNewName.exists()) {
        alert("File With the same name exists");
        return;
      }
      fileData.name = newName;
      await setDoc(doc(db, "invoices", `${user.uid}-${newName}`), {
        ...fileData,
        owner: user.uid,
      });
      // FIX 1: Added return here. Previously the code fell through and
      // saved the file a second time under the original duplicate name.
      if (onSuccess) onSuccess();
      return;
    }
    await setDoc(doc(db, "invoices", `${user.uid}-${fileData.name}`), {
      ...fileData,
      owner: user.uid,
    });
    if (onSuccess) onSuccess();
  } catch (e) {
    alert(e.message);
    console.error(e.message);
  }
};

const getFilesKeysFromFirestore = async (userid: string) => {
  const q = query(collection(db, "invoices"), where("owner", "==", userid));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return {};
  }
  const files = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    files[data.name] = data.modified;
  });
  return files;
};

const downloadFileFromFirebase = async (userId, key, onSuccess) => {
  try {
    const local = new Local();
    const getFile = async () => {
      const docSnapshot = await getDoc(
        doc(db, "invoices", `${userId}-${key}`)
      );
      const data = docSnapshot.data();
      delete data["owner"];
      return data;
    };

    const localFile = await local._getFile(key);
    let option;
    if (localFile) {
      option = confirm(
        "File With Same Name Exists in Local Storage, Press OK to override and Cancel to Get a New Name"
      );
    }
    if (option || !localFile) {
      const file = await getFile();
      // FIX 2: Added await here. Previously _saveFile() was called without
      // await, so the save started but did not finish before the success
      // callback fired, causing silent save failures.
      await local._saveFile(file as File);
      alert("File Downloaded");
      onSuccess && onSuccess();
      return;
    }

    if (!option) {
      const newName = prompt("Enter New Name for File");
      if (!newName) {
        alert("Name Cannot be empty");
        return;
      }
      const localFile = await local._getFile(newName);
      if (localFile) {
        alert("File With This Name Also Exists");
        return;
      }
      const file = await getFile();
      file.name = newName;
      // FIX 3: Added await here for the same reason as Fix 2.
      await local._saveFile(file as File);
      alert("File Downloaded");
      onSuccess && onSuccess();
    }
  } catch {
    alert("Something Went Wrong");
  }
};

const deleteFileFromFirebase = async (userId, key, onSuccess) => {
  try {
    await deleteDoc(doc(db, "invoices", `${userId}-${key}`));
    alert("File Deleted");
    onSuccess && onSuccess();
  } catch {
    alert("Something went wrong");
  }
};

export {
  uploadFileToCloud,
  getFilesKeysFromFirestore,
  downloadFileFromFirebase,
  deleteFileFromFirebase,
};