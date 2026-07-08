import { initializeApp, getApps, cert, type App } from "firebase-admin";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

interface FirebaseAdminConfig {
  projectId: string;
  clientEmail?: string;
  privateKey?: string;
}

function resolveConfig(): FirebaseAdminConfig | null {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) return null;

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  return { projectId, clientEmail, privateKey };
}

function initializeFirebaseAdmin(): App | null {
  if (getApps().length > 0) return getApps()[0];

  const config = resolveConfig();
  if (!config) return null;

  if (config.clientEmail && config.privateKey) {
    return initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  console.warn(
    "Firebase Admin: Initializing with project ID only — relying on Application Default Credentials. " +
      "Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY for production."
  );
  return initializeApp({ projectId: config.projectId });
}

const adminApp: App | null = initializeFirebaseAdmin();

export const adminDb: Firestore | null = adminApp ? getFirestore(adminApp) : null;
export const adminStorage: Storage | null = adminApp ? getStorage(adminApp) : null;

export function requireDb(): Firestore {
  if (!adminDb) {
    throw new Error("Firebase Admin Firestore is not initialized — check environment variables.");
  }
  return adminDb;
}

export function requireStorage(): Storage {
  if (!adminStorage) {
    throw new Error("Firebase Admin Storage is not initialized — check environment variables.");
  }
  return adminStorage;
}

export const FIREBASE_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stagenameclub.firebasestorage.app";
