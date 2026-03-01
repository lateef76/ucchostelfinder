import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";


interface PlatformSettings {
  maintenanceMode: boolean;
  defaultBookingLimit: number;
}
interface PlatformAnalytics {
  totalUsers: number;
  totalHostels: number;
  totalBookings: number;
  totalReviews: number;
}
interface PlatformReports {
  lastReportDate: string;
  downloadUrl: string;
}
export type { PlatformSettings, PlatformAnalytics, PlatformReports };

const db = getFirestore();

export async function fetchPlatformSettings(): Promise<PlatformSettings | null> {
  const ref = doc(db, "platform", "settings");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as PlatformSettings) : null;
}

export async function updatePlatformSettings(data: Partial<PlatformSettings>) {
  const ref = doc(db, "platform", "settings");
  await setDoc(ref, data, { merge: true });
}

export async function fetchPlatformAnalytics(): Promise<PlatformAnalytics | null> {
  const ref = doc(db, "platform", "analytics");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as PlatformAnalytics) : null;
}

export async function fetchPlatformReports(): Promise<PlatformReports | null> {
  const ref = doc(db, "platform", "reports");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as PlatformReports) : null;
}
