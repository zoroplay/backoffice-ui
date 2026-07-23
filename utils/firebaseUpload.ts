import { initializeApp, getApps } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

function firebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

function getConfiguredStorage() {
  const config = firebaseConfig();

  if (!config.apiKey || !config.storageBucket) {
    throw new Error("Firebase upload is not configured");
  }

  const app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
  return getStorage(app);
}

function safeFileName(file: File) {
  const fallbackName = `file_${Date.now()}`;
  return (file.name || fallbackName).replace(/\s+/g, "_");
}

export async function uploadFileToFirebase(file: File, folder = "") {
  const normalizedFolder = folder.replace(/^\/+|\/+$/g, "");
  const filePath = normalizedFolder ? `${normalizedFolder}/${safeFileName(file)}` : safeFileName(file);
  const storageRef = ref(getConfiguredStorage(), filePath);
  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || "application/octet-stream",
  });

  return getDownloadURL(snapshot.ref);
}
