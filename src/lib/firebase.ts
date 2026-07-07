import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  writeBatch,
  query,
  limit
} from 'firebase/firestore';
import { 
  User, Machine, RepairRequest, WorkOrder, SparePart, 
  PreventiveMaintenance, MaintenanceSchedule, SpareTransaction, 
  SystemNotification, AuditLog 
} from '../types';
import {
  INITIAL_USERS, INITIAL_MACHINES, INITIAL_SPARE_PARTS,
  INITIAL_REPAIR_REQUESTS, INITIAL_WORK_ORDERS, INITIAL_PREVENTIVE_MAINTENANCE,
  INITIAL_MAINTENANCE_SCHEDULE, INITIAL_SPARE_TRANSACTIONS,
  INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS
} from '../data/mockData';

// Firebase Configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyB86x0lyan5oqTS6msamN3q8D_CSwkjung",
  authDomain: "gen-lang-client-0335532868.firebaseapp.com",
  projectId: "gen-lang-client-0335532868",
  storageBucket: "gen-lang-client-0335532868.firebasestorage.app",
  messagingSenderId: "317251357265",
  appId: "1:317251357265:web:e3b5d9cc9e2690fe25c670"
};

const databaseId = "ai-studio-maintenancemanag-c128d3bd-6eff-4ed5-9679-32f3e4c4ca26";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, databaseId);

/**
 * Seeding helper to populate Firebase Firestore with default industrial mock data on first launch
 */
export async function seedDatabaseIfEmpty() {
  try {
    console.log('[Firebase] Checking database status for auto-seeding...');
    
    // Check users
    const usersCol = collection(db, 'users');
    const userSnap = await getDocs(query(usersCol, limit(1)));
    if (userSnap.empty) {
      console.log('[Firebase] Seeding users collection...');
      const batch = writeBatch(db);
      INITIAL_USERS.forEach((item) => {
        const ref = doc(usersCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    // Check machines
    const machinesCol = collection(db, 'machines');
    const machineSnap = await getDocs(query(machinesCol, limit(1)));
    if (machineSnap.empty) {
      console.log('[Firebase] Seeding machines collection...');
      const batch = writeBatch(db);
      INITIAL_MACHINES.forEach((item) => {
        const ref = doc(machinesCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    // Check spare parts
    const partsCol = collection(db, 'parts');
    const partsSnap = await getDocs(query(partsCol, limit(1)));
    if (partsSnap.empty) {
      console.log('[Firebase] Seeding spare parts collection...');
      const batch = writeBatch(db);
      INITIAL_SPARE_PARTS.forEach((item) => {
        const ref = doc(partsCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    // Check repair requests
    const repairCol = collection(db, 'repair_requests');
    const repairSnap = await getDocs(query(repairCol, limit(1)));
    if (repairSnap.empty) {
      console.log('[Firebase] Seeding repair requests...');
      const batch = writeBatch(db);
      INITIAL_REPAIR_REQUESTS.forEach((item) => {
        const ref = doc(repairCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    // Check work orders
    const woCol = collection(db, 'work_orders');
    const woSnap = await getDocs(query(woCol, limit(1)));
    if (woSnap.empty) {
      console.log('[Firebase] Seeding work orders...');
      const batch = writeBatch(db);
      INITIAL_WORK_ORDERS.forEach((item) => {
        const ref = doc(woCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    // Check pm plans
    const pmPlansCol = collection(db, 'pm_plans');
    const pmPlansSnap = await getDocs(query(pmPlansCol, limit(1)));
    if (pmPlansSnap.empty) {
      console.log('[Firebase] Seeding PM plans...');
      const batch = writeBatch(db);
      INITIAL_PREVENTIVE_MAINTENANCE.forEach((item) => {
        const ref = doc(pmPlansCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    // Check pm schedules
    const pmSchedCol = collection(db, 'pm_schedules');
    const pmSchedSnap = await getDocs(query(pmSchedCol, limit(1)));
    if (pmSchedSnap.empty) {
      console.log('[Firebase] Seeding PM schedules...');
      const batch = writeBatch(db);
      INITIAL_MAINTENANCE_SCHEDULE.forEach((item) => {
        const ref = doc(pmSchedCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    // Check transactions
    const transCol = collection(db, 'spare_transactions');
    const transSnap = await getDocs(query(transCol, limit(1)));
    if (transSnap.empty) {
      console.log('[Firebase] Seeding spare transactions...');
      const batch = writeBatch(db);
      INITIAL_SPARE_TRANSACTIONS.forEach((item) => {
        const ref = doc(transCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    // Check audit logs
    const logsCol = collection(db, 'audit_logs');
    const logsSnap = await getDocs(query(logsCol, limit(1)));
    if (logsSnap.empty) {
      console.log('[Firebase] Seeding audit logs...');
      const batch = writeBatch(db);
      INITIAL_AUDIT_LOGS.forEach((item) => {
        const ref = doc(logsCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    // Check notifications
    const notifyCol = collection(db, 'notifications');
    const notifySnap = await getDocs(query(notifyCol, limit(1)));
    if (notifySnap.empty) {
      console.log('[Firebase] Seeding initial notifications...');
      const batch = writeBatch(db);
      INITIAL_NOTIFICATIONS.forEach((item) => {
        const ref = doc(notifyCol, item.id);
        batch.set(ref, item);
      });
      await batch.commit();
    }

    console.log('[Firebase] Completed all seeding checks successfully.');
  } catch (err) {
    console.error('[Firebase] Failed to seed database:', err);
  }
}

/**
 * Firestore Helper to load a full collection
 */
export async function loadCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const items: T[] = [];
    snap.forEach((d) => {
      items.push(d.data() as T);
    });
    return items;
  } catch (err) {
    console.error(`[Firebase] Failed to load collection ${collectionName}:`, err);
    throw err;
  }
}

/**
 * Firestore Helper to save an individual document
 */
export async function saveDocument<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item);
  } catch (err) {
    console.error(`[Firebase] Failed to save document to ${collectionName} with ID ${item.id}:`, err);
    throw err;
  }
}
