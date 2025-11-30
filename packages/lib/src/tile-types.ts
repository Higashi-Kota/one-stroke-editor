/**
 * Road Tile Types and Definitions
 *
 * Port system:
 * - Each side (U/D/L/R) has 4 ports (0-3)
 * - Roads use 2-lane connections (ports 1,2 or 2,3)
 * - Mask uses bit flags: U=0x01/0x02, R=0x04/0x08, D=0x10/0x20, L=0x40/0x80
 */

// Direction types
export type Direction = "up" | "down" | "left" | "right"

// Port position within a side (0-3, but roads use 1-2 or 2-3)
export type PortSet = "12" | "23" // ports 1,2 or ports 2,3

// Tile variant type
export type TileVariant = "curve" | "sharp" | "straight"

// Connection specification
export interface TileConnection {
  direction: Direction
  ports: PortSet
}

// Tile definition
export interface TileDefinition {
  id: string
  variant: TileVariant
  mask: number
  connections: [TileConnection, TileConnection]
}

// Marker types
export type MarkerType = "start" | "goal"

export interface MarkerDefinition {
  type: MarkerType
  mask: number
  connection: TileConnection
}

// Direction to mask bits mapping
const DIRECTION_MASKS: Record<Direction, Record<PortSet, number>> = {
  up: { "12": 0x01, "23": 0x02 },
  right: { "12": 0x04, "23": 0x08 },
  down: { "12": 0x10, "23": 0x20 },
  left: { "12": 0x40, "23": 0x80 },
}

// Get mask for a connection
export function getConnectionMask(conn: TileConnection): number {
  return DIRECTION_MASKS[conn.direction][conn.ports]
}

// All tile definitions with proper masks
export const TILE_DEFINITIONS: TileDefinition[] = [
  // Curve tiles (16 variations)
  {
    id: "curve-05",
    variant: "curve",
    mask: 0x05,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "right", ports: "12" },
    ],
  },
  {
    id: "curve-06",
    variant: "curve",
    mask: 0x06,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "right", ports: "12" },
    ],
  },
  {
    id: "curve-09",
    variant: "curve",
    mask: 0x09,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "right", ports: "23" },
    ],
  },
  {
    id: "curve-0A",
    variant: "curve",
    mask: 0x0a,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "right", ports: "23" },
    ],
  },
  {
    id: "curve-14",
    variant: "curve",
    mask: 0x14,
    connections: [
      { direction: "right", ports: "12" },
      { direction: "down", ports: "12" },
    ],
  },
  {
    id: "curve-18",
    variant: "curve",
    mask: 0x18,
    connections: [
      { direction: "right", ports: "23" },
      { direction: "down", ports: "12" },
    ],
  },
  {
    id: "curve-24",
    variant: "curve",
    mask: 0x24,
    connections: [
      { direction: "right", ports: "12" },
      { direction: "down", ports: "23" },
    ],
  },
  {
    id: "curve-28",
    variant: "curve",
    mask: 0x28,
    connections: [
      { direction: "right", ports: "23" },
      { direction: "down", ports: "23" },
    ],
  },
  {
    id: "curve-41",
    variant: "curve",
    mask: 0x41,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "left", ports: "12" },
    ],
  },
  {
    id: "curve-42",
    variant: "curve",
    mask: 0x42,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "left", ports: "12" },
    ],
  },
  {
    id: "curve-50",
    variant: "curve",
    mask: 0x50,
    connections: [
      { direction: "down", ports: "12" },
      { direction: "left", ports: "12" },
    ],
  },
  {
    id: "curve-60",
    variant: "curve",
    mask: 0x60,
    connections: [
      { direction: "down", ports: "23" },
      { direction: "left", ports: "12" },
    ],
  },
  {
    id: "curve-81",
    variant: "curve",
    mask: 0x81,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "left", ports: "23" },
    ],
  },
  {
    id: "curve-82",
    variant: "curve",
    mask: 0x82,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "left", ports: "23" },
    ],
  },
  {
    id: "curve-90",
    variant: "curve",
    mask: 0x90,
    connections: [
      { direction: "down", ports: "12" },
      { direction: "left", ports: "23" },
    ],
  },
  {
    id: "curve-A0",
    variant: "curve",
    mask: 0xa0,
    connections: [
      { direction: "down", ports: "23" },
      { direction: "left", ports: "23" },
    ],
  },

  // Sharp tiles (16 variations)
  {
    id: "sharp-05",
    variant: "sharp",
    mask: 0x05,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "right", ports: "12" },
    ],
  },
  {
    id: "sharp-06",
    variant: "sharp",
    mask: 0x06,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "right", ports: "12" },
    ],
  },
  {
    id: "sharp-09",
    variant: "sharp",
    mask: 0x09,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "right", ports: "23" },
    ],
  },
  {
    id: "sharp-0A",
    variant: "sharp",
    mask: 0x0a,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "right", ports: "23" },
    ],
  },
  {
    id: "sharp-14",
    variant: "sharp",
    mask: 0x14,
    connections: [
      { direction: "right", ports: "12" },
      { direction: "down", ports: "12" },
    ],
  },
  {
    id: "sharp-18",
    variant: "sharp",
    mask: 0x18,
    connections: [
      { direction: "right", ports: "23" },
      { direction: "down", ports: "12" },
    ],
  },
  {
    id: "sharp-24",
    variant: "sharp",
    mask: 0x24,
    connections: [
      { direction: "right", ports: "12" },
      { direction: "down", ports: "23" },
    ],
  },
  {
    id: "sharp-28",
    variant: "sharp",
    mask: 0x28,
    connections: [
      { direction: "right", ports: "23" },
      { direction: "down", ports: "23" },
    ],
  },
  {
    id: "sharp-41",
    variant: "sharp",
    mask: 0x41,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "left", ports: "12" },
    ],
  },
  {
    id: "sharp-42",
    variant: "sharp",
    mask: 0x42,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "left", ports: "12" },
    ],
  },
  {
    id: "sharp-50",
    variant: "sharp",
    mask: 0x50,
    connections: [
      { direction: "down", ports: "12" },
      { direction: "left", ports: "12" },
    ],
  },
  {
    id: "sharp-60",
    variant: "sharp",
    mask: 0x60,
    connections: [
      { direction: "down", ports: "23" },
      { direction: "left", ports: "12" },
    ],
  },
  {
    id: "sharp-81",
    variant: "sharp",
    mask: 0x81,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "left", ports: "23" },
    ],
  },
  {
    id: "sharp-82",
    variant: "sharp",
    mask: 0x82,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "left", ports: "23" },
    ],
  },
  {
    id: "sharp-90",
    variant: "sharp",
    mask: 0x90,
    connections: [
      { direction: "down", ports: "12" },
      { direction: "left", ports: "23" },
    ],
  },
  {
    id: "sharp-A0",
    variant: "sharp",
    mask: 0xa0,
    connections: [
      { direction: "down", ports: "23" },
      { direction: "left", ports: "23" },
    ],
  },

  // Straight tiles - Vertical (4 variations)
  {
    id: "straight-v-11",
    variant: "straight",
    mask: 0x11,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "down", ports: "12" },
    ],
  },
  {
    id: "straight-v-12",
    variant: "straight",
    mask: 0x12,
    connections: [
      { direction: "up", ports: "12" },
      { direction: "down", ports: "23" },
    ],
  },
  {
    id: "straight-v-21",
    variant: "straight",
    mask: 0x21,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "down", ports: "12" },
    ],
  },
  {
    id: "straight-v-22",
    variant: "straight",
    mask: 0x22,
    connections: [
      { direction: "up", ports: "23" },
      { direction: "down", ports: "23" },
    ],
  },
  // Straight tiles - Horizontal (4 variations)
  {
    id: "straight-h-44",
    variant: "straight",
    mask: 0x44,
    connections: [
      { direction: "left", ports: "12" },
      { direction: "right", ports: "12" },
    ],
  },
  {
    id: "straight-h-48",
    variant: "straight",
    mask: 0x48,
    connections: [
      { direction: "left", ports: "12" },
      { direction: "right", ports: "23" },
    ],
  },
  {
    id: "straight-h-84",
    variant: "straight",
    mask: 0x84,
    connections: [
      { direction: "left", ports: "23" },
      { direction: "right", ports: "12" },
    ],
  },
  {
    id: "straight-h-88",
    variant: "straight",
    mask: 0x88,
    connections: [
      { direction: "left", ports: "23" },
      { direction: "right", ports: "23" },
    ],
  },
]

// Marker definitions
export const MARKER_DEFINITIONS: MarkerDefinition[] = [
  {
    type: "start",
    mask: 0x04,
    connection: { direction: "right", ports: "12" },
  },
  {
    type: "goal",
    mask: 0x80,
    connection: { direction: "left", ports: "23" },
  },
]

// Helper: Get opposite direction
export function getOppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case "up":
      return "down"
    case "down":
      return "up"
    case "left":
      return "right"
    case "right":
      return "left"
  }
}

// Helper: Check if two tiles can connect
export function canConnect(
  tile1: TileDefinition,
  tile2: TileDefinition,
  tile1Dir: Direction,
): boolean {
  const tile2Dir = getOppositeDirection(tile1Dir)
  const conn1 = tile1.connections.find((c) => c.direction === tile1Dir)
  const conn2 = tile2.connections.find((c) => c.direction === tile2Dir)

  if (!conn1 || !conn2) return false

  // Ports must match for connection
  return conn1.ports === conn2.ports
}

// Create lookup maps for quick access
export const TILE_BY_ID = new Map(TILE_DEFINITIONS.map((t) => [t.id, t]))
export const TILES_BY_MASK = new Map<number, TileDefinition[]>()
for (const tile of TILE_DEFINITIONS) {
  const existing = TILES_BY_MASK.get(tile.mask) || []
  existing.push(tile)
  TILES_BY_MASK.set(tile.mask, existing)
}

/**
 * Get tile definition by ID
 */
export function getTileById(id: string): TileDefinition | undefined {
  return TILE_BY_ID.get(id)
}
