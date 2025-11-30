/**
 * Async API for WASM operations
 *
 * This module provides async wrappers for WASM functions that run in a Web Worker.
 * Heavy computations are offloaded to avoid blocking the main thread.
 */

import type { GridSize, Point } from "./grid-utils"
import type { CellData, PathResult, RoadGridResult } from "./wasm-api"

// Worker instance
let worker: Worker | null = null
let workerInitPromise: Promise<void> | null = null
let requestId = 0
const pendingRequests = new Map<
  number,
  { resolve: (value: unknown) => void; reject: (error: Error) => void }
>()

/**
 * Message types for worker communication
 */
interface WorkerRequest {
  id: number
  type: "findPath" | "pathToRoadGrid" | "getCellParity" | "hasDifferentParity"
  payload: unknown
}

interface WorkerResponse {
  id: number
  success: boolean
  result?: unknown
  error?: string
}

/**
 * Initialize the Web Worker
 */
export function initWorkerWithInstance(workerInstance: Worker): Promise<void> {
  if (worker) {
    return Promise.resolve()
  }

  worker = workerInstance

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const { id, success, result, error } = event.data
    const pending = pendingRequests.get(id)
    if (pending) {
      pendingRequests.delete(id)
      if (success) {
        pending.resolve(result)
      } else {
        pending.reject(new Error(error || "Unknown error"))
      }
    }
  }

  worker.onerror = (error) => {
    console.error("Worker error:", error)
  }

  // Wait for worker to be ready
  workerInitPromise = new Promise((resolve, reject) => {
    const initId = requestId++
    pendingRequests.set(initId, {
      resolve: () => resolve(),
      reject: (error) => reject(error),
    })

    // Send init message
    worker?.postMessage({ id: initId, type: "init", payload: null })

    // Timeout after 5 seconds
    setTimeout(() => {
      if (pendingRequests.has(initId)) {
        pendingRequests.delete(initId)
        reject(new Error("Worker initialization timeout"))
      }
    }, 5000)
  })

  return workerInitPromise
}

/**
 * Send a request to the worker and wait for response
 */
function sendWorkerRequest<T>(type: WorkerRequest["type"], payload: unknown): Promise<T> {
  if (!worker) {
    return Promise.reject(new Error("Worker not initialized"))
  }

  return new Promise((resolve, reject) => {
    const id = requestId++
    pendingRequests.set(id, {
      resolve: resolve as (value: unknown) => void,
      reject,
    })

    worker?.postMessage({ id, type, payload })
  })
}

/**
 * Terminate the Web Worker
 */
export function terminateWorker(): void {
  if (worker) {
    worker.terminate()
    worker = null
    workerInitPromise = null
    pendingRequests.clear()
  }
}

/**
 * Find a path asynchronously using Web Worker
 */
export async function findRoadPathAsync(
  start: Point,
  end: Point,
  gridSize: GridSize,
  maxIterations = 500000,
): Promise<PathResult> {
  if (workerInitPromise) {
    await workerInitPromise
  }

  return sendWorkerRequest<PathResult>("findPath", {
    start,
    end,
    gridSize,
    maxIterations,
  })
}

/**
 * Convert path to road grid asynchronously using Web Worker
 */
export async function pathToRoadGridAsync(
  path: Point[],
  gridSize: GridSize,
): Promise<RoadGridResult> {
  if (workerInitPromise) {
    await workerInitPromise
  }

  return sendWorkerRequest<RoadGridResult>("pathToRoadGrid", {
    path,
    gridSize,
  })
}

/**
 * Get cell parity asynchronously
 */
export async function getCellParityAsync(row: number, col: number): Promise<number> {
  if (workerInitPromise) {
    await workerInitPromise
  }

  return sendWorkerRequest<number>("getCellParity", { row, col })
}

/**
 * Check if two points have different parity asynchronously
 */
export async function hasDifferentParityAsync(p1: Point, p2: Point): Promise<boolean> {
  if (workerInitPromise) {
    await workerInitPromise
  }

  return sendWorkerRequest<boolean>("hasDifferentParity", { p1, p2 })
}

// Re-export types
export type { CellData, PathResult, RoadGridResult }
