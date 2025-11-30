/**
 * SVG Path Definitions for Road Tiles
 *
 * Each tile is rendered as SVG paths within a 40x40 viewBox.
 * Grid lines are drawn at 10px intervals.
 * Roads connect at port positions (10, 20, 30 on each side).
 *
 * Base Patterns (13 road patterns + 2 markers = 15 total):
 * - curve-12-12, curve-12-23, curve-23-12, curve-23-23 (4 curve patterns)
 * - curve-ul-12-12, curve-ul-12-23, curve-ul-23-12, curve-ul-23-23 (4 curve UL patterns)
 * - sharp-12-12, sharp-12-23, sharp-23-12, sharp-23-23 (4 sharp patterns)
 * - sharp-ul-12-12, sharp-ul-12-23, sharp-ul-23-12, sharp-ul-23-23 (4 sharp UL patterns)
 * - straight-23 (1 straight pattern)
 * - start, goal (2 marker patterns)
 *
 * All other tiles are derived via rotation and mirroring transforms.
 */

import type { TileDefinition } from "./tile-types"

// SVG constants
export const TILE_SIZE = 40
export const GRID_STROKE = "#cccccc"
export const GRID_STROKE_WIDTH = 0.5
export const ROAD_STROKE = "#000000"
export const ROAD_STROKE_WIDTH = 2

// Grid background SVG (shared by all tiles)
export const GRID_BACKGROUND = `
  <g stroke="${GRID_STROKE}" stroke-width="${GRID_STROKE_WIDTH}" fill="none">
    <line x1="0" y1="0" x2="0" y2="40"/>
    <line x1="10" y1="0" x2="10" y2="40"/>
    <line x1="20" y1="0" x2="20" y2="40"/>
    <line x1="30" y1="0" x2="30" y2="40"/>
    <line x1="40" y1="0" x2="40" y2="40"/>
    <line x1="0" y1="0" x2="40" y2="0"/>
    <line x1="0" y1="10" x2="40" y2="10"/>
    <line x1="0" y1="20" x2="40" y2="20"/>
    <line x1="0" y1="30" x2="40" y2="30"/>
    <line x1="0" y1="40" x2="40" y2="40"/>
  </g>
`

// ===========================================
// BASE PATTERNS (from SVG files)
// ===========================================

/**
 * Base Road Path Patterns
 *
 * Port System (40x40 grid, 10px intervals):
 * - Port 1: position 10
 * - Port 2: position 20
 * - Port 3: position 30
 *
 * PortSet:
 * - "12": uses ports 1,2 (positions 10,20)
 * - "23": uses ports 2,3 (positions 20,30)
 *
 * Base patterns are defined for Up→Right direction.
 * Other directions are derived via rotation/mirroring.
 *
 * Lane Continuity Rule:
 * - Outer boundary (port 1 side) connects to outer boundary
 * - Inner boundary (port 2 or 3 side) connects to inner boundary
 * - This prevents lane crossing within a tile
 */

// Base patterns keyed by "variant-entryPorts-exitPorts"
const BASE_PATTERNS: Record<string, string> = {
  // Curve patterns (Up→Right, bezier curves)
  "curve-12-12": `
    <path d="M 10 0 L 10 10 C 10 15, 15 20, 20 20 L 40 20"/>
    <path d="M 20 0 L 20 5 C 20 7.5, 22.5 10, 25 10 L 40 10"/>
  `,
  "curve-12-23": `
    <path d="M 10 0 L 10 20 C 10 25, 15 30, 20 30 L 40 30"/>
    <path d="M 20 0 L 20 10 C 20 15, 25 20, 30 20 L 40 20"/>
  `,
  "curve-23-12": `
    <path d="M 20 0 L 20 10 C 20 15, 25 20, 30 20 L 40 20"/>
    <path d="M 30 0 L 30 5 C 30 7.5, 32.5 10, 35 10 L 40 10"/>
  `,
  "curve-23-23": `
    <path d="M 20 0 L 20 20 C 20 25, 25 30, 30 30 L 40 30"/>
    <path d="M 30 0 L 30 15 C 30 17.5, 32.5 20, 35 20 L 40 20"/>
  `,
  // Curve patterns (Up→Left) to preserve port ordering without mirroring
  "curve-ul-12-12": `
    <path d="M 10 0 L 10 10 C 10 15, 5 20, 0 20 L 0 20"/>
    <path d="M 20 0 L 20 5 C 20 7.5, 17.5 10, 15 10 L 0 10"/>
  `,
  "curve-ul-12-23": `
    <path d="M 10 0 L 10 20 C 10 25, 5 30, 0 30 L 0 30"/>
    <path d="M 20 0 L 20 10 C 20 15, 15 20, 10 20 L 0 20"/>
  `,
  "curve-ul-23-12": `
    <path d="M 20 0 L 20 20 C 20 25, 15 30, 10 30 L 0 30"/>
    <path d="M 30 0 L 30 15 C 30 17.5, 25 20, 20 20 L 0 20"/>
  `,
  "curve-ul-23-23": `
    <path d="M 20 0 L 20 20 C 20 25, 25 30, 30 30 L 0 30"/>
    <path d="M 30 0 L 30 15 C 30 17.5, 32.5 20, 35 20 L 0 20"/>
  `,

  // Sharp patterns (Up→Right, 90° turns)
  "sharp-12-12": `
    <path d="M 10 0 L 10 20 L 40 20"/>
    <path d="M 20 0 L 20 10 L 40 10"/>
  `,
  "sharp-12-23": `
    <path d="M 10 0 L 10 30 L 40 30"/>
    <path d="M 20 0 L 20 20 L 40 20"/>
  `,
  "sharp-23-12": `
    <path d="M 20 0 L 20 20 L 40 20"/>
    <path d="M 30 0 L 30 10 L 40 10"/>
  `,
  "sharp-23-23": `
    <path d="M 20 0 L 20 30 L 40 30"/>
    <path d="M 30 0 L 30 20 L 40 20"/>
  `,
  // Sharp patterns (Up→Left)
  "sharp-ul-12-12": `
    <path d="M 10 0 L 10 20 L 0 20"/>
    <path d="M 20 0 L 20 10 L 0 10"/>
  `,
  "sharp-ul-12-23": `
    <path d="M 10 0 L 10 30 L 0 30"/>
    <path d="M 20 0 L 20 20 L 0 20"/>
  `,
  "sharp-ul-23-12": `
    <path d="M 20 0 L 20 30 L 0 30"/>
    <path d="M 30 0 L 30 10 L 0 10"/>
  `,
  "sharp-ul-23-23": `
    <path d="M 20 0 L 20 30 L 0 30"/>
    <path d="M 30 0 L 30 20 L 0 20"/>
  `,

  // Straight patterns - Vertical (same port = straight lines)
  "straight-v-11": `
    <path d="M 10 0 L 10 40"/>
    <path d="M 20 0 L 20 40"/>
  `,
  "straight-v-22": `
    <path d="M 20 0 L 20 40"/>
    <path d="M 30 0 L 30 40"/>
  `,
  // Straight patterns - Vertical (port transition = lane shift)
  "straight-v-12": `
    <path d="M 10 0 C 10 20, 20 20, 20 40"/>
    <path d="M 20 0 C 20 20, 30 20, 30 40"/>
  `,
  "straight-v-21": `
    <path d="M 20 0 C 20 20, 10 20, 10 40"/>
    <path d="M 30 0 C 30 20, 20 20, 20 40"/>
  `,
  // Straight patterns - Horizontal (same port = straight lines)
  "straight-h-44": `
    <path d="M 0 10 L 40 10"/>
    <path d="M 0 20 L 40 20"/>
  `,
  "straight-h-88": `
    <path d="M 0 20 L 40 20"/>
    <path d="M 0 30 L 40 30"/>
  `,
  // Straight patterns - Horizontal (port transition = lane shift)
  "straight-h-48": `
    <path d="M 0 10 C 20 10, 20 20, 40 20"/>
    <path d="M 0 20 C 20 20, 20 30, 40 30"/>
  `,
  "straight-h-84": `
    <path d="M 0 20 C 20 20, 20 10, 40 10"/>
    <path d="M 0 30 C 20 30, 20 20, 40 20"/>
  `,
}

// ===========================================
// TRANSFORM UTILITIES
// ===========================================

type Transform = "rotate90" | "rotate180" | "rotate270" | "mirrorX" | "mirrorY"

/**
 * Apply SVG transform to a path group
 * All transforms are around the center point (20, 20)
 */
function applyTransform(pathSvg: string, transform: Transform): string {
  const center = TILE_SIZE / 2 // 20
  let transformAttr: string

  switch (transform) {
    case "rotate90":
      transformAttr = `rotate(90, ${center}, ${center})`
      break
    case "rotate180":
      transformAttr = `rotate(180, ${center}, ${center})`
      break
    case "rotate270":
      transformAttr = `rotate(270, ${center}, ${center})`
      break
    case "mirrorX":
      // Mirror horizontally (flip left-right)
      transformAttr = `translate(${TILE_SIZE}, 0) scale(-1, 1)`
      break
    case "mirrorY":
      // Mirror vertically (flip up-down)
      transformAttr = `translate(0, ${TILE_SIZE}) scale(1, -1)`
      break
  }

  return `<g transform="${transformAttr}">${pathSvg}</g>`
}

/**
 * Apply multiple transforms in sequence
 */
function applyTransforms(pathSvg: string, transforms: Transform[]): string {
  return transforms.reduce((svg, t) => applyTransform(svg, t), pathSvg)
}

// ===========================================
// TILE TO BASE PATTERN MAPPING
// ===========================================

/**
 * Mapping from tile ID to base pattern + transforms
 *
 * Base patterns are Up→Right direction:
 * - curve-12-12: Up(12) → Right(12)
 * - curve-12-23: Up(12) → Right(23)
 * - curve-23-23: Up(23) → Right(23)
 * - sharp-12-12: Up(12) → Right(12)
 * - sharp-12-23: Up(12) → Right(23)
 * - sharp-23-23: Up(23) → Right(23)
 * - straight-23: Up(23) ↔ Down(23)
 *
 * Transforms to derive other directions:
 * - rotate90: Up→Right becomes Right→Down
 * - rotate180: Up→Right becomes Down→Left
 * - rotate270: Up→Right becomes Left→Up
 * - mirrorX: Up→Right becomes Up→Left
 */

interface TileMapping {
  base: string
  transforms: Transform[]
}

const TILE_MAPPINGS: Record<string, TileMapping> = {
  // ===========================================
  // CURVE TILES (16 patterns)
  // ===========================================

  // Up→Right (base direction, no transform)
  "curve-05": { base: "curve-12-12", transforms: [] }, // Up(12)+Right(12)
  "curve-06": { base: "curve-23-12", transforms: [] }, // Up(23)+Right(12)
  "curve-09": { base: "curve-12-23", transforms: [] }, // Up(12)+Right(23)
  "curve-0A": { base: "curve-23-23", transforms: [] }, // Up(23)+Right(23)

  // Right→Down (rotate90) - Right port inverts: P12↔P23
  "curve-14": { base: "curve-12-23", transforms: ["rotate90"] }, // Right(12)+Down(12) ← needs Up(12)+Right(23)
  "curve-18": { base: "curve-23-23", transforms: ["rotate90"] }, // Right(23)+Down(12) ← needs Up(23)+Right(23)
  "curve-24": { base: "curve-12-12", transforms: ["rotate90"] }, // Right(12)+Down(23) ← needs Up(12)+Right(12)
  "curve-28": { base: "curve-23-12", transforms: ["rotate90"] }, // Right(23)+Down(23) ← needs Up(23)+Right(12)

  // Down→Left (rotate180) - both ports invert: P12↔P23
  "curve-50": { base: "curve-23-23", transforms: ["rotate180"] }, // Down(12)+Left(12) ← needs Up(23)+Right(23)
  "curve-60": { base: "curve-12-23", transforms: ["rotate180"] }, // Down(23)+Left(12) ← needs Up(12)+Right(23)
  "curve-90": { base: "curve-23-12", transforms: ["rotate180"] }, // Down(12)+Left(23) ← needs Up(23)+Right(12)
  "curve-A0": { base: "curve-12-12", transforms: ["rotate180"] }, // Down(23)+Left(23) ← needs Up(12)+Right(12)

  // Up→Left (mirrorX) - base pattern's Up port inverts: P12↔P23
  "curve-41": { base: "curve-23-12", transforms: ["mirrorX"] }, // Up(12)+Left(12) ← needs Up(23)+Right(12)
  "curve-42": { base: "curve-12-12", transforms: ["mirrorX"] }, // Up(23)+Left(12) ← needs Up(12)+Right(12)
  "curve-81": { base: "curve-23-23", transforms: ["mirrorX"] }, // Up(12)+Left(23) ← needs Up(23)+Right(23)
  "curve-82": { base: "curve-12-23", transforms: ["mirrorX"] }, // Up(23)+Left(23) ← needs Up(12)+Right(23)

  // ===========================================
  // SHARP TILES (16 patterns)
  // ===========================================

  // Up→Right (base direction)
  "sharp-05": { base: "sharp-12-12", transforms: [] },
  "sharp-06": { base: "sharp-23-12", transforms: [] },
  "sharp-09": { base: "sharp-12-23", transforms: [] },
  "sharp-0A": { base: "sharp-23-23", transforms: [] },

  // Right→Down (rotate90) - Right port inverts: P12↔P23
  "sharp-14": { base: "sharp-12-23", transforms: ["rotate90"] }, // Right(12)+Down(12) ← needs Up(12)+Right(23)
  "sharp-18": { base: "sharp-23-23", transforms: ["rotate90"] }, // Right(23)+Down(12) ← needs Up(23)+Right(23)
  "sharp-24": { base: "sharp-12-12", transforms: ["rotate90"] }, // Right(12)+Down(23) ← needs Up(12)+Right(12)
  "sharp-28": { base: "sharp-23-12", transforms: ["rotate90"] }, // Right(23)+Down(23) ← needs Up(23)+Right(12)

  // Down→Left (rotate180) - both ports invert: P12↔P23
  "sharp-50": { base: "sharp-23-23", transforms: ["rotate180"] }, // Down(12)+Left(12) ← needs Up(23)+Right(23)
  "sharp-60": { base: "sharp-12-23", transforms: ["rotate180"] }, // Down(23)+Left(12) ← needs Up(12)+Right(23)
  "sharp-90": { base: "sharp-23-12", transforms: ["rotate180"] }, // Down(12)+Left(23) ← needs Up(23)+Right(12)
  "sharp-A0": { base: "sharp-12-12", transforms: ["rotate180"] }, // Down(23)+Left(23) ← needs Up(12)+Right(12)

  // Up→Left (mirrorX) - base pattern's Up port inverts: P12↔P23
  "sharp-41": { base: "sharp-23-12", transforms: ["mirrorX"] }, // Up(12)+Left(12) ← needs Up(23)+Right(12)
  "sharp-42": { base: "sharp-12-12", transforms: ["mirrorX"] }, // Up(23)+Left(12) ← needs Up(12)+Right(12)
  "sharp-81": { base: "sharp-23-23", transforms: ["mirrorX"] }, // Up(12)+Left(23) ← needs Up(23)+Right(23)
  "sharp-82": { base: "sharp-12-23", transforms: ["mirrorX"] }, // Up(23)+Left(23) ← needs Up(12)+Right(23)

  // ===========================================
  // STRAIGHT TILES (8 patterns)
  // ===========================================

  // Vertical straight tiles
  "straight-v-11": { base: "straight-v-11", transforms: [] }, // Up(P12) → Down(P12)
  "straight-v-12": { base: "straight-v-12", transforms: [] }, // Up(P12) → Down(P23)
  "straight-v-21": { base: "straight-v-21", transforms: [] }, // Up(P23) → Down(P12)
  "straight-v-22": { base: "straight-v-22", transforms: [] }, // Up(P23) → Down(P23)
  // Horizontal straight tiles
  "straight-h-44": { base: "straight-h-44", transforms: [] }, // Left(P12) → Right(P12)
  "straight-h-48": { base: "straight-h-48", transforms: [] }, // Left(P12) → Right(P23)
  "straight-h-84": { base: "straight-h-84", transforms: [] }, // Left(P23) → Right(P12)
  "straight-h-88": { base: "straight-h-88", transforms: [] }, // Left(P23) → Right(P23)
}

// ===========================================
// ROAD PATH GENERATION
// ===========================================

/**
 * Generate road path SVG for a tile ID
 */
function generateRoadPath(tileId: string): string {
  const mapping = TILE_MAPPINGS[tileId]
  if (!mapping) {
    console.warn(`No mapping found for tile: ${tileId}`)
    return ""
  }

  const basePath = BASE_PATTERNS[mapping.base]
  if (!basePath) {
    console.warn(`No base pattern found: ${mapping.base}`)
    return ""
  }

  if (mapping.transforms.length === 0) {
    return basePath
  }

  return applyTransforms(basePath, mapping.transforms)
}

// Pre-generate all road paths
const ROAD_PATHS: Record<string, string> = {}
for (const tileId of Object.keys(TILE_MAPPINGS)) {
  ROAD_PATHS[tileId] = generateRoadPath(tileId)
}

// ===========================================
// MARKER PATHS (marker + text only, centered)
// ===========================================

// Start marker: flag icon + START text, centered in cell
export const MARKER_START_PATH = `
  <g transform="translate(20, 14)">
    <rect x="-6" y="-6" width="1.5" height="16" fill="#555"/>
    <path d="M -4.5 -6 v 8 L 6 -2 z" fill="#3498db"/>
  </g>
  <g transform="translate(20, 32)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="7" text-anchor="middle" font-weight="bold" fill="#3498db">START</text>
  </g>
`

// Goal marker: target icon + GOAL text, centered in cell
export const MARKER_GOAL_PATH = `
  <g transform="translate(20, 14)">
    <circle cx="0" cy="0" r="8" fill="none" stroke="#e74c3c" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="4" fill="none" stroke="#e74c3c" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="1.5" fill="#e74c3c"/>
  </g>
  <g transform="translate(20, 32)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="7" text-anchor="middle" font-weight="bold" fill="#e74c3c">GOAL</text>
  </g>
`

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Get road path SVG content for a tile
 */
export function getRoadPath(tile: TileDefinition): string {
  return ROAD_PATHS[tile.id] || ""
}

/**
 * Generate complete SVG for a tile
 */
export function generateTileSvg(tile: TileDefinition): string {
  const roadPath = getRoadPath(tile)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_SIZE}" height="${TILE_SIZE}" viewBox="0 0 ${TILE_SIZE} ${TILE_SIZE}">
  ${GRID_BACKGROUND}
  <g stroke="${ROAD_STROKE}" stroke-width="${ROAD_STROKE_WIDTH}" fill="none">
    ${roadPath}
  </g>
</svg>`
}

/**
 * Generate SVG for start marker
 */
export function generateStartMarkerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_SIZE}" height="${TILE_SIZE}" viewBox="0 0 ${TILE_SIZE} ${TILE_SIZE}">
  ${GRID_BACKGROUND}
  ${MARKER_START_PATH}
</svg>`
}

/**
 * Generate SVG for goal marker
 */
export function generateGoalMarkerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_SIZE}" height="${TILE_SIZE}" viewBox="0 0 ${TILE_SIZE} ${TILE_SIZE}">
  ${GRID_BACKGROUND}
  ${MARKER_GOAL_PATH}
</svg>`
}

/**
 * Get inline SVG content (without svg wrapper) for embedding
 */
export function getTilePathsOnly(tile: TileDefinition): string {
  const roadPath = getRoadPath(tile)
  return `<g stroke="${ROAD_STROKE}" stroke-width="${ROAD_STROKE_WIDTH}" fill="none">${roadPath}</g>`
}
