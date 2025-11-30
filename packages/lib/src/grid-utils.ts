/**
 * Grid Utilities for Road Tile Editor
 */

import type { Direction, PortSet, TileDefinition } from "./tile-types"
import { getOppositeDirection, TILE_DEFINITIONS } from "./tile-types"

export interface GridSize {
  rows: number
  cols: number
}

export interface Point {
  row: number
  col: number
}

export interface GridCellState {
  tile: TileDefinition | null
  isStart: boolean
  isGoal: boolean
}

export type Grid = GridCellState[][]

// Create an empty grid
export function createEmptyGrid(size: GridSize): Grid {
  return Array(size.rows)
    .fill(null)
    .map(() =>
      Array(size.cols)
        .fill(null)
        .map(() => ({
          tile: null,
          isStart: false,
          isGoal: false,
        })),
    )
}

// Get neighbor position
export function getNeighbor(point: Point, direction: Direction): Point {
  switch (direction) {
    case "up":
      return { row: point.row - 1, col: point.col }
    case "down":
      return { row: point.row + 1, col: point.col }
    case "left":
      return { row: point.row, col: point.col - 1 }
    case "right":
      return { row: point.row, col: point.col + 1 }
  }
}

// Check if a point is within grid bounds
export function isInBounds(point: Point, size: GridSize): boolean {
  return point.row >= 0 && point.row < size.rows && point.col >= 0 && point.col < size.cols
}

// Get required port set for connection from direction
export function getRequiredPortsFromNeighbor(
  grid: Grid,
  point: Point,
  size: GridSize,
  direction: Direction,
): PortSet | null {
  const neighbor = getNeighbor(point, direction)
  if (!isInBounds(neighbor, size)) return null

  const neighborCell = grid[neighbor.row]?.[neighbor.col]
  const neighborTile = neighborCell?.tile
  if (!neighborTile) return null

  // Find the connection that faces our point
  const oppDir = getOppositeDirection(direction)
  const conn = neighborTile.connections.find((c) => c.direction === oppDir)
  return conn?.ports ?? null
}

// Get all tiles that can connect in a given direction with specific ports
export function getTilesForConnection(direction: Direction, ports: PortSet): TileDefinition[] {
  return TILE_DEFINITIONS.filter((tile) =>
    tile.connections.some((conn) => conn.direction === direction && conn.ports === ports),
  )
}

// Get valid tiles for a cell based on neighboring connections
export function getValidTilesForCell(grid: Grid, point: Point, size: GridSize): TileDefinition[] {
  const constraints: { direction: Direction; ports: PortSet }[] = []

  // Check each direction for existing connections
  const directions: Direction[] = ["up", "down", "left", "right"]
  for (const dir of directions) {
    const requiredPorts = getRequiredPortsFromNeighbor(grid, point, size, dir)
    if (requiredPorts) {
      constraints.push({ direction: dir, ports: requiredPorts })
    }
  }

  // If no constraints, all tiles are valid
  if (constraints.length === 0) {
    return TILE_DEFINITIONS
  }

  // Filter tiles that satisfy all constraints
  return TILE_DEFINITIONS.filter((tile) =>
    constraints.every((constraint) =>
      tile.connections.some(
        (conn) => conn.direction === constraint.direction && conn.ports === constraint.ports,
      ),
    ),
  )
}

// Check if placing a tile would create valid connections
export function isValidPlacement(
  grid: Grid,
  point: Point,
  tile: TileDefinition,
  size: GridSize,
): boolean {
  for (const conn of tile.connections) {
    const neighbor = getNeighbor(point, conn.direction)
    if (!isInBounds(neighbor, size)) continue

    const neighborCell = grid[neighbor.row]?.[neighbor.col]
    const neighborTile = neighborCell?.tile
    if (!neighborTile) continue

    // Check if neighbor has a matching connection
    const oppDir = getOppositeDirection(conn.direction)
    const neighborConn = neighborTile.connections.find((c) => c.direction === oppDir)

    // If neighbor faces us, ports must match
    if (neighborConn && neighborConn.ports !== conn.ports) {
      return false
    }
  }
  return true
}

// Check if cell has a connection facing a direction
export function hasConnectionInDirection(grid: Grid, point: Point, direction: Direction): boolean {
  const cell = grid[point.row]?.[point.col]
  if (!cell?.tile) return false
  return cell.tile.connections.some((c) => c.direction === direction)
}

/**
 * Get the parity of a cell (0 or 1 based on row+col)
 * Used for checkerboard coloring and Hamiltonian path validation
 *
 * @param row - Row index
 * @param col - Column index
 * @returns 0 or 1
 */
export function getCellParity(row: number, col: number): number {
  return (row + col) % 2
}

/**
 * Check if two cells have different parity
 * Cells with different parity are required for Hamiltonian paths on even-sized grids
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @returns true if parities are different
 */
export function hasDifferentParity(p1: Point, p2: Point): boolean {
  return getCellParity(p1.row, p1.col) !== getCellParity(p2.row, p2.col)
}
