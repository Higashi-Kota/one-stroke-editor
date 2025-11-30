/**
 * Type declarations for @road-tile/wasm module
 *
 * These types mirror the exports from the wasm-bindgen generated code.
 */

declare module "@road-tile/wasm/pkg/road_tile_wasm" {
  /**
   * Get parity of a cell (0 or 1 based on row+col)
   */
  export function cell_parity(row: number, col: number): number

  /**
   * Find a path from start to end that visits all cells
   */
  export function find_road_path(
    start_row: number,
    start_col: number,
    end_row: number,
    end_col: number,
    grid_rows: number,
    grid_cols: number,
    max_iterations: number,
  ): {
    found: boolean
    path: Array<{ row: number; col: number }>
    iterations: number
  }

  /**
   * Check if two cells have different parity
   */
  export function has_different_parity(r1: number, c1: number, r2: number, c2: number): boolean

  /**
   * Initialize the WASM module
   */
  export function init(): void

  /**
   * Convert a path to a road grid with tile assignments
   */
  export function path_to_road_grid(
    path_js: Array<{ row: number; col: number }>,
    grid_rows: number,
    grid_cols: number,
  ): {
    grid: Array<
      Array<{
        tile_id: string
        connections: Array<{ direction: string; ports: string }>
        path_index: number
      } | null>
    >
    valid: boolean
  }

  export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module

  export interface InitOutput {
    readonly memory: WebAssembly.Memory
    readonly find_road_path: (
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number,
      g: number,
    ) => unknown
    readonly path_to_road_grid: (a: unknown, b: number, c: number) => unknown
    readonly cell_parity: (a: number, b: number) => number
    readonly has_different_parity: (a: number, b: number, c: number, d: number) => number
    readonly init: () => void
  }

  /**
   * Default export initializes the WASM module
   */
  export default function __wbg_init(
    module_or_path?:
      | { module_or_path: InitInput | Promise<InitInput> }
      | InitInput
      | Promise<InitInput>,
  ): Promise<InitOutput>
}
