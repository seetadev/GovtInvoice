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
  updateDoc,
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
      const prevFile = await getDoc(
        doc(db, "invoices", `${user.uid}-${newName}`)
      );
      if (prevFile.exists()) {
        alert("File With the same name exists");
        return;
      }
      fileData.name = newName;
      await setDoc(doc(db, "invoices", `${user.uid}-${newName}`), {
        ...fileData,
        owner: user.uid,
      });
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
      const docSnapshot = await getDoc(doc(db, "invoices", `${userId}-${key}`));
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
      local._saveFile(file as File);
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
      local._saveFile(file as File);
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
const subscriptionTiers = {
  bronze: { prints: 10, emails: 10, price: 150 },
  silver: { prints: 20, emails: 20, price: 200 },
  gold: { prints: 30, emails: 30, price: 250 },
};

interface UserSubscription {
  tier: keyof typeof subscriptionTiers;
  remainingPrints: number;
  remainingEmails: number;
  expirationDate: Date;
}

const getUserSubscription = async (
  userId: string
): Promise<UserSubscription | null> => {
  const docRef = doc(db, "subscriptions", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserSubscription;
  } else {
    console.log("No subscription found for this user");
    return null;
  }
};

const initializeUserSubscription = async (
  userId: string,
  tier: keyof typeof subscriptionTiers
) => {
  const subscriptionData: UserSubscription = {
    tier,
    remainingPrints: subscriptionTiers[tier].prints,
    remainingEmails: subscriptionTiers[tier].emails,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  await setDoc(doc(db, "subscriptions", userId), subscriptionData);
};

const updateUserQuota = async (
  userId: string,
  action: "print" | "email"
): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const quotaField = action === "print" ? "remainingPrints" : "remainingEmails";
  if (subscription[quotaField] > 0) {
    await updateDoc(doc(db, "subscriptions", userId), {
      [quotaField]: subscription[quotaField] - 1,
    });
    return true;
  }
  return false;
};

const canUserPerformAction = async (
  userId: string,
  action: "print" | "email"
): Promise<boolean> => {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const quotaField = action === "print" ? "remainingPrints" : "remainingEmails";
  return subscription[quotaField] > 0;
};

const updateUserSubscription = async (userId: string, tier: string) => {
  const subscriptionData = {
    tier,
    remainingPrints: subscriptionTiers[tier].prints,
    remainingEmails: subscriptionTiers[tier].emails,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  await setDoc(doc(db, "subscriptions", userId), subscriptionData, {
    merge: true,
  });
};

export {
  uploadFileToCloud,
  getFilesKeysFromFirestore,
  downloadFileFromFirebase,
  deleteFileFromFirebase,
  getUserSubscription,
  updateUserQuota,
  canUserPerformAction,
  initializeUserSubscription,
  subscriptionTiers,
  updateUserSubscription,
};
