// IndexedDB service for local persistence
export interface DBSchema {
  jobs: Job[]
  candidates: Candidate[]
  assessments: Assessment[]
  assessmentResponses: Record<string, any>
}

class TalentFlowDB {
  private db: IDBDatabase | null = null
  private readonly dbName = "talentflow-db"
  private readonly version = 1

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("jobs")) {
          db.createObjectStore("jobs", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("candidates")) {
          db.createObjectStore("candidates", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("assessments")) {
          db.createObjectStore("assessments", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("assessmentResponses")) {
          db.createObjectStore("assessmentResponses")
        }
        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata")
        }
      }
    })
  }

  async get<T>(storeName: string, key?: string): Promise<T[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)

      if (key) {
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result ? [request.result] : [])
        request.onerror = () => reject(request.error)
      } else {
        const request = store.getAll()
        request.onsuccess = () => resolve(request.result || [])
        request.onerror = () => reject(request.error)
      }
    })
  }

  async put(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async putMany(storeName: string, items: any[]): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)

      let completed = 0
      const total = items.length

      if (total === 0) {
        resolve()
        return
      }

      items.forEach((item) => {
        const request = store.put(item)
        request.onsuccess = () => {
          completed++
          if (completed === total) resolve()
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async isInitialized(): Promise<boolean> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["metadata"], "readonly")
      const store = transaction.objectStore("metadata")
      const request = store.get("initialized")

      request.onsuccess = () => resolve(!!request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markInitialized(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["metadata"], "readwrite")
      const store = transaction.objectStore("metadata")
      const request = store.put({ initialized: true }, "initialized")

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Export singleton instance
export const talentFlowDB = new TalentFlowDB()

// Import types
import type { Job, Candidate, Assessment } from "./types"
