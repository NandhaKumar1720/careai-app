/**
 * Thin promise wrapper around IndexedDB.
 *
 * Why IndexedDB: a browser React app cannot rewrite a TypeScript source file
 * such as src/data/mockData.ts at runtime. mockData.ts is therefore seed data
 * only; every runtime change is written here and survives refresh and restart.
 */

export const DB_NAME = 'careai';
export const DB_VERSION = 1;

export const STORES = {
  users: 'users',
  medicines: 'medicines',
  logs: 'logs',
  alerts: 'alerts',
  relationships: 'relationships',
  chat: 'chat',
  avatars: 'avatars',
  settings: 'settings',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser does not support IndexedDB, so CareAI cannot save data here.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      Object.values(STORES).forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('CareAI could not open its local database.'));
  });

  return dbPromise;
}

function runRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Local database request failed.'));
  });
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDatabase();
  const tx = db.transaction(store, 'readonly');
  const result = await runRequest<T[]>(tx.objectStore(store).getAll() as IDBRequest<T[]>);
  return result;
}

export async function getOne<T>(store: StoreName, id: string): Promise<T | undefined> {
  const db = await openDatabase();
  const tx = db.transaction(store, 'readonly');
  return runRequest<T | undefined>(tx.objectStore(store).get(id) as IDBRequest<T | undefined>);
}

export async function putOne<T extends { id: string }>(store: StoreName, value: T): Promise<T> {
  const db = await openDatabase();
  const tx = db.transaction(store, 'readwrite');
  await runRequest(tx.objectStore(store).put(value) as IDBRequest<IDBValidKey>);
  return value;
}

export async function putMany<T extends { id: string }>(store: StoreName, values: T[]): Promise<T[]> {
  const db = await openDatabase();
  const tx = db.transaction(store, 'readwrite');
  const objectStore = tx.objectStore(store);
  await Promise.all(values.map((value) => runRequest(objectStore.put(value) as IDBRequest<IDBValidKey>)));
  return values;
}

export async function removeOne(store: StoreName, id: string): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(store, 'readwrite');
  await runRequest(tx.objectStore(store).delete(id) as IDBRequest<undefined>);
}

export async function clearStore(store: StoreName): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(store, 'readwrite');
  await runRequest(tx.objectStore(store).clear() as IDBRequest<undefined>);
}
