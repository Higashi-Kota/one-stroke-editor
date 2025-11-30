/**
 * Web Worker for Road Tile WASM Operations
 *
 * This worker runs WASM computations off the main thread to avoid
 * blocking the UI during heavy path-finding operations.
 */

import {
  findRoadPath,
  getCellParity,
  hasDifferentParity,
  initWasm,
  pathToRoadGrid,
} from "@road-tile/lib"

interface WorkerRequest {
  id: number
  type: "init" | "findPath" | "pathToRoadGrid" | "getCellParity" | "hasDifferentParity"
  payload: unknown
}

interface WorkerResponse {
  id: number
  success: boolean
  result?: unknown
  error?: string
}

interface Point {
  row: number
  col: number
}

interface GridSize {
  rows: number
  cols: number
}

// WASM initialization state
let wasmInitialized = false
let initPromise: Promise<void> | null = null

// Initialize WASM
async function ensureInitialized(): Promise<void> {
  if (wasmInitialized) return

  if (!initPromise) {
    initPromise = initWasm().then(() => {
      wasmInitialized = true
    })
  }

  return initPromise
}

// Handle incoming messages
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, type, payload } = event.data
  let response: WorkerResponse

  try {
    switch (type) {
      case "init": {
        await ensureInitialized()
        response = { id, success: true }
        break
      }

      case "findPath": {
        await ensureInitialized()
        const { start, end, gridSize, maxIterations } = payload as {
          start: Point
          end: Point
          gridSize: GridSize
          maxIterations: number
        }

        const result = findRoadPath(start, end, gridSize, maxIterations)
        response = { id, success: true, result }
        break
      }

      case "pathToRoadGrid": {
        await ensureInitialized()
        const { path, gridSize } = payload as {
          path: Point[]
          gridSize: GridSize
        }

        const result = pathToRoadGrid(path, gridSize)
        response = { id, success: true, result }
        break
      }

      case "getCellParity": {
        const { row, col } = payload as { row: number; col: number }
        const result = getCellParity(row, col)
        response = { id, success: true, result }
        break
      }

      case "hasDifferentParity": {
        const { p1, p2 } = payload as { p1: Point; p2: Point }
        const result = hasDifferentParity(p1, p2)
        response = { id, success: true, result }
        break
      }

      default:
        response = { id, success: false, error: `Unknown request type: ${type}` }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    response = { id, success: false, error: errorMessage }
  }

  self.postMessage(response)
}
