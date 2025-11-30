/**
 * WASM API Wrapper
 *
 * This module provides a safe TypeScript interface for the Rust WASM module.
 * It handles initialization and type conversions.
 */

import type { GridSize, Point } from "./grid-utils"

// Import WASM functions (will be initialized later)
let wasmModule: typeof import("@road-tile/wasm/pkg/road_tile_wasm") | null = null
let wasmInitialized = false
let initPromise: Promise<void> | null = null

/**
 * Path finding result
 */
export interface PathResult {
  found: boolean
  path: Point[]
  iterations: number
}

/**
 * Connection data for a cell
 */
export interface ConnectionData {
  direction: string
  ports: string
}

/**
 * Cell data for rendering
 */
export interface CellData {
  tile_id: string
  connections: ConnectionData[]
  path_index: number
}

/**
 * Road grid result
 */
export interface RoadGridResult {
  grid: (CellData | null)[][]
  valid: boolean
}

/**
 * Initialize the WASM module
 * Can be called multiple times safely - only initializes once
 */
export async function initWasm(): Promise<void> {
  if (wasmInitialized) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      // Dynamic import of WASM module
      const wasm = await import("@road-tile/wasm/pkg/road_tile_wasm")
      await wasm.default()
      wasmModule = wasm
      wasmInitialized = true
    } catch (error) {
      initPromise = null
      throw error
    }
  })()

  return initPromise
}

/**
 * Check if WASM is initialized
 */
export function isWasmInitialized(): boolean {
  return wasmInitialized
}

/**
 * Ensure WASM is initialized, throw if not
 * Returns the initialized module for use
 */
function getWasmModule(): NonNullable<typeof wasmModule> {
  if (!wasmInitialized || !wasmModule) {
    throw new Error("WASM module not initialized. Call initWasm() first.")
  }
  return wasmModule
}

/**
 * Find a Hamiltonian path from start to end
 *
 * @param start - Starting point
 * @param end - Ending point
 * @param gridSize - Grid dimensions
 * @param maxIterations - Maximum iterations for search (default: 500000)
 * @returns Path result with found flag and path points
 */
export function findRoadPath(
  start: Point,
  end: Point,
  gridSize: GridSize,
  maxIterations = 500000,
): PathResult {
  const wasm = getWasmModule()

  const result = wasm.find_road_path(
    start.row,
    start.col,
    end.row,
    end.col,
    gridSize.rows,
    gridSize.cols,
    maxIterations,
  )

  return result as PathResult
}

/**
 * Convert a path to a road grid with tile assignments
 *
 * @param path - Array of points representing the path
 * @param gridSize - Grid dimensions
 * @returns Road grid result with tile data
 */
export function pathToRoadGrid(path: Point[], gridSize: GridSize): RoadGridResult {
  const wasm = getWasmModule()

  const result = wasm.path_to_road_grid(path, gridSize.rows, gridSize.cols)

  return result as RoadGridResult
}
