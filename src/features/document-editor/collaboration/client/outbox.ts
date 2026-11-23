import type { OfflineBatch } from "../model/protocol";

const databaseName = "x2x-collaboration";
const storeName = "document-outbox";

function openOutbox() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName, { keyPath: "id" }).createIndex("scope", "scope");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class DocumentOutbox {
  private database = openOutbox();

  private async request<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
    const database = await this.database;
    return new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(storeName, mode);
      const request = run(transaction.objectStore(storeName));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error ?? request.error ?? new Error("本地保存中断"));
    });
  }

  read(scope: string) {
    return this.request<OfflineBatch[]>("readonly", (store) => store.index("scope").getAll(scope))
      .then((batches) => batches.sort((first, second) => (first.createdAt ?? 0) - (second.createdAt ?? 0)));
  }

  persist(batch: OfflineBatch) {
    return this.request("readwrite", (store) => store.put(batch));
  }

  confirm(id: string) {
    return this.request("readwrite", (store) => store.delete(id));
  }

  close() {
    void this.database.then((database) => database.close(), () => {});
  }
}
