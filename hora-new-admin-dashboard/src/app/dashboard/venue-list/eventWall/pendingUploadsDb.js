import { openDB } from "idb";

export function createPendingUploadsDb({
  dbName,
  storeName = "pending",
  version = 1,
  indexes = [],
}) {
  if (!dbName) throw new Error("dbName is required");

  let dbPromise = null;

  async function getDB() {
    if (!dbPromise) {
      dbPromise = openDB(dbName, version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id" });
            for (const idx of indexes) {
              if (!idx?.name || !idx?.keyPath) continue;
              store.createIndex(idx.name, idx.keyPath);
            }
          }
        },
      });
    }
    return dbPromise;
  }

  async function add(item) {
    const db = await getDB();
    return db.add(storeName, item);
  }

  async function put(item) {
    const db = await getDB();
    return db.put(storeName, item);
  }

  async function get(id) {
    const db = await getDB();
    return db.get(storeName, id);
  }

  async function getAll() {
    const db = await getDB();
    return db.getAll(storeName);
  }

  async function getAllFromIndex(indexName, value) {
    const db = await getDB();
    return db.getAllFromIndex(storeName, indexName, value);
  }

  async function update(id, changes) {
    const db = await getDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const item = await store.get(id);
    if (!item) return null;
    const updated = { ...item, ...changes };
    await store.put(updated);
    await tx.done;
    return updated;
  }

  async function remove(id) {
    const db = await getDB();
    return db.delete(storeName, id);
  }

  async function removeAllFromIndex(indexName, value) {
    const db = await getDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const idx = store.index(indexName);
    const items = await idx.getAll(value);
    for (const item of items) {
      await store.delete(item.id);
    }
    await tx.done;
  }

  return {
    getDB,
    add,
    put,
    get,
    getAll,
    getAllFromIndex,
    update,
    remove,
    removeAllFromIndex,
  };
}

