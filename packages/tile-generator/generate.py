#!/usr/bin/env python3
"""
Road Tile SVG Generator

Generates all base pattern SVG files used by the app.
These patterns match the BASE_PATTERNS defined in svg-paths.ts.

Generated Files (26 total):
- Curve (Up->Right): curve-12-12, curve-12-23, curve-23-12, curve-23-23
- Curve (Up->Left): curve-ul-12-12, curve-ul-12-23, curve-ul-23-12, curve-ul-23-23
- Sharp (Up->Right): sharp-12-12, sharp-12-23, sharp-23-12, sharp-23-23
- Sharp (Up->Left): sharp-ul-12-12, sharp-ul-12-23, sharp-ul-23-12, sharp-ul-23-23
- Straight Vertical: straight-v-11, straight-v-12, straight-v-21, straight-v-22
- Straight Horizontal: straight-h-44, straight-h-48, straight-h-84, straight-h-88
- Markers: start, goal

Port System (40x40 grid, 10px intervals):
- Port 1: position 10
- Port 2: position 20
- Port 3: position 30

PortSet:
- "12": uses ports 1,2 (positions 10,20)
- "23": uses ports 2,3 (positions 20,30)
"""

from pathlib import Path
from dataclasses import dataclass
from typing import Dict

# =============================================================================
# Constants
# =============================================================================

TILE_SIZE = 40
GRID_STROKE = "#cccccc"
GRID_STROKE_WIDTH = 0.5
ROAD_STROKE = "#000000"
ROAD_STROKE_WIDTH = 1
PORT_MARKER_COLOR = "#ff0000"
PORT_MARKER_RADIUS = 1

# Output directory
SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "assets"

# =============================================================================
# SVG Templates
# =============================================================================

SVG_HEADER = '''<?xml version="1.0" encoding="UTF-8"?>
<svg id="{svg_id}" xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'''

GRID_LINES = f'''  <!-- Grid lines -->
  <g stroke="{GRID_STROKE}" stroke-width="{GRID_STROKE_WIDTH}" fill="none">
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
  </g>'''

PORT_MARKERS = f'''  <!-- Port markers -->
  <g fill="{PORT_MARKER_COLOR}">
    <circle cx="10" cy="0" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="20" cy="0" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="30" cy="0" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="40" cy="10" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="40" cy="20" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="40" cy="30" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="10" cy="40" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="20" cy="40" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="30" cy="40" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="0" cy="10" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="0" cy="20" r="{PORT_MARKER_RADIUS}"/>
    <circle cx="0" cy="30" r="{PORT_MARKER_RADIUS}"/>
  </g>'''

SVG_FOOTER = '</svg>'

# =============================================================================
# Tile Data Structure
# =============================================================================

@dataclass
class TileData:
    comment: str
    outer_path: str
    inner_path: str

# =============================================================================
# Tile Definitions (matching svg-paths.ts BASE_PATTERNS exactly)
# =============================================================================

TILE_DEFINITIONS: Dict[str, TileData] = {
    # =========================================================================
    # Curve patterns (Up->Right, bezier curves)
    # =========================================================================
    "curve-12-12": TileData(
        comment="Curve: Up(P12) -> Right(P12)",
        outer_path="M 10 0 L 10 10 C 10 15, 15 20, 20 20 L 40 20",
        inner_path="M 20 0 L 20 5 C 20 7.5, 22.5 10, 25 10 L 40 10",
    ),
    "curve-12-23": TileData(
        comment="Curve: Up(P12) -> Right(P23)",
        outer_path="M 10 0 L 10 20 C 10 25, 15 30, 20 30 L 40 30",
        inner_path="M 20 0 L 20 10 C 20 15, 25 20, 30 20 L 40 20",
    ),
    "curve-23-12": TileData(
        comment="Curve: Up(P23) -> Right(P12)",
        outer_path="M 20 0 L 20 10 C 20 15, 25 20, 30 20 L 40 20",
        inner_path="M 30 0 L 30 5 C 30 7.5, 32.5 10, 35 10 L 40 10",
    ),
    "curve-23-23": TileData(
        comment="Curve: Up(P23) -> Right(P23)",
        outer_path="M 20 0 L 20 20 C 20 25, 25 30, 30 30 L 40 30",
        inner_path="M 30 0 L 30 15 C 30 17.5, 32.5 20, 35 20 L 40 20",
    ),

    # =========================================================================
    # Curve patterns (Up->Left, bezier curves)
    # =========================================================================
    "curve-ul-12-12": TileData(
        comment="Curve: Up(P12) -> Left(P12)",
        outer_path="M 10 0 L 10 10 C 10 15, 5 20, 0 20 L 0 20",
        inner_path="M 20 0 L 20 5 C 20 7.5, 17.5 10, 15 10 L 0 10",
    ),
    "curve-ul-12-23": TileData(
        comment="Curve: Up(P12) -> Left(P23)",
        outer_path="M 10 0 L 10 20 C 10 25, 5 30, 0 30 L 0 30",
        inner_path="M 20 0 L 20 10 C 20 15, 15 20, 10 20 L 0 20",
    ),
    "curve-ul-23-12": TileData(
        comment="Curve: Up(P23) -> Left(P12)",
        outer_path="M 20 0 L 20 20 C 20 25, 15 30, 10 30 L 0 30",
        inner_path="M 30 0 L 30 15 C 30 17.5, 25 20, 20 20 L 0 20",
    ),
    "curve-ul-23-23": TileData(
        comment="Curve: Up(P23) -> Left(P23)",
        outer_path="M 20 0 L 20 20 C 20 25, 25 30, 30 30 L 0 30",
        inner_path="M 30 0 L 30 15 C 30 17.5, 32.5 20, 35 20 L 0 20",
    ),

    # =========================================================================
    # Sharp patterns (Up->Right, 90 degree turns)
    # =========================================================================
    "sharp-12-12": TileData(
        comment="Sharp: Up(P12) -> Right(P12)",
        outer_path="M 10 0 L 10 20 L 40 20",
        inner_path="M 20 0 L 20 10 L 40 10",
    ),
    "sharp-12-23": TileData(
        comment="Sharp: Up(P12) -> Right(P23)",
        outer_path="M 10 0 L 10 30 L 40 30",
        inner_path="M 20 0 L 20 20 L 40 20",
    ),
    "sharp-23-12": TileData(
        comment="Sharp: Up(P23) -> Right(P12)",
        outer_path="M 20 0 L 20 20 L 40 20",
        inner_path="M 30 0 L 30 10 L 40 10",
    ),
    "sharp-23-23": TileData(
        comment="Sharp: Up(P23) -> Right(P23)",
        outer_path="M 20 0 L 20 30 L 40 30",
        inner_path="M 30 0 L 30 20 L 40 20",
    ),

    # =========================================================================
    # Sharp patterns (Up->Left, 90 degree turns)
    # =========================================================================
    "sharp-ul-12-12": TileData(
        comment="Sharp: Up(P12) -> Left(P12)",
        outer_path="M 10 0 L 10 20 L 0 20",
        inner_path="M 20 0 L 20 10 L 0 10",
    ),
    "sharp-ul-12-23": TileData(
        comment="Sharp: Up(P12) -> Left(P23)",
        outer_path="M 10 0 L 10 30 L 0 30",
        inner_path="M 20 0 L 20 20 L 0 20",
    ),
    "sharp-ul-23-12": TileData(
        comment="Sharp: Up(P23) -> Left(P12)",
        outer_path="M 20 0 L 20 30 L 0 30",
        inner_path="M 30 0 L 30 10 L 0 10",
    ),
    "sharp-ul-23-23": TileData(
        comment="Sharp: Up(P23) -> Left(P23)",
        outer_path="M 20 0 L 20 30 L 0 30",
        inner_path="M 30 0 L 30 20 L 0 20",
    ),

    # =========================================================================
    # Straight patterns - Vertical
    # =========================================================================
    "straight-v-11": TileData(
        comment="Straight Vertical: Up(P12) -> Down(P12)",
        outer_path="M 10 0 L 10 40",
        inner_path="M 20 0 L 20 40",
    ),
    "straight-v-22": TileData(
        comment="Straight Vertical: Up(P23) -> Down(P23)",
        outer_path="M 20 0 L 20 40",
        inner_path="M 30 0 L 30 40",
    ),
    "straight-v-12": TileData(
        comment="Straight Vertical: Up(P12) -> Down(P23) (lane shift)",
        outer_path="M 10 0 C 10 20, 20 20, 20 40",
        inner_path="M 20 0 C 20 20, 30 20, 30 40",
    ),
    "straight-v-21": TileData(
        comment="Straight Vertical: Up(P23) -> Down(P12) (lane shift)",
        outer_path="M 20 0 C 20 20, 10 20, 10 40",
        inner_path="M 30 0 C 30 20, 20 20, 20 40",
    ),

    # =========================================================================
    # Straight patterns - Horizontal
    # =========================================================================
    "straight-h-44": TileData(
        comment="Straight Horizontal: Left(P12) -> Right(P12)",
        outer_path="M 0 10 L 40 10",
        inner_path="M 0 20 L 40 20",
    ),
    "straight-h-88": TileData(
        comment="Straight Horizontal: Left(P23) -> Right(P23)",
        outer_path="M 0 20 L 40 20",
        inner_path="M 0 30 L 40 30",
    ),
    "straight-h-48": TileData(
        comment="Straight Horizontal: Left(P12) -> Right(P23) (lane shift)",
        outer_path="M 0 10 C 20 10, 20 20, 40 20",
        inner_path="M 0 20 C 20 20, 20 30, 40 30",
    ),
    "straight-h-84": TileData(
        comment="Straight Horizontal: Left(P23) -> Right(P12) (lane shift)",
        outer_path="M 0 20 C 20 20, 20 10, 40 10",
        inner_path="M 0 30 C 20 30, 20 20, 40 20",
    ),
}

# =============================================================================
# Marker Definitions
# =============================================================================

START_MARKER = '''  <!-- Start marker -->
  <g transform="translate(20, 14)">
    <rect x="-6" y="-6" width="1.5" height="16" fill="#555"/>
    <path d="M -4.5 -6 v 8 L 6 -2 z" fill="#3498db"/>
  </g>
  <g transform="translate(20, 32)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="7" text-anchor="middle" font-weight="bold" fill="#3498db">START</text>
  </g>'''

GOAL_MARKER = '''  <!-- Goal marker -->
  <g transform="translate(20, 14)">
    <circle cx="0" cy="0" r="8" fill="none" stroke="#e74c3c" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="4" fill="none" stroke="#e74c3c" stroke-width="1.5"/>
    <circle cx="0" cy="0" r="1.5" fill="#e74c3c"/>
  </g>
  <g transform="translate(20, 32)">
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="7" text-anchor="middle" font-weight="bold" fill="#e74c3c">GOAL</text>
  </g>'''

# =============================================================================
# SVG Generation Functions
# =============================================================================

def generate_road_svg(svg_id: str, tile: TileData) -> str:
    """Generate a complete road tile SVG."""
    road_group = f'''  <!-- {tile.comment} -->
  <g stroke="{ROAD_STROKE}" stroke-width="{ROAD_STROKE_WIDTH}" fill="none">
    <path d="{tile.outer_path}"/>
    <path d="{tile.inner_path}"/>
  </g>'''

    return "\n".join([
        SVG_HEADER.format(svg_id=svg_id, size=TILE_SIZE),
        GRID_LINES,
        "",
        road_group,
        "",
        PORT_MARKERS,
        SVG_FOOTER,
        "",  # trailing newline
    ])


def generate_marker_svg(svg_id: str, marker_content: str) -> str:
    """Generate a marker tile SVG (no port markers, matching app behavior)."""
    return "\n".join([
        SVG_HEADER.format(svg_id=svg_id, size=TILE_SIZE),
        GRID_LINES,
        "",
        marker_content,
        SVG_FOOTER,
        "",  # trailing newline
    ])


def write_svg(filename: str, content: str) -> None:
    """Write SVG content to file."""
    filepath = OUTPUT_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  Generated: {filename}")


# =============================================================================
# Main Generation
# =============================================================================

def main():
    """Generate all SVG tile files."""
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("Road Tile SVG Generator")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print()

    # Generate road tiles
    print("Generating road tiles...")
    for tile_id, tile in TILE_DEFINITIONS.items():
        svg_content = generate_road_svg(tile_id, tile)
        write_svg(f"{tile_id}.svg", svg_content)

    # Generate markers
    print("\nGenerating marker tiles...")
    write_svg("start.svg", generate_marker_svg("start", START_MARKER))
    write_svg("goal.svg", generate_marker_svg("goal", GOAL_MARKER))

    # Summary
    total_files = len(TILE_DEFINITIONS) + 2  # tiles + markers

    print()
    print("=" * 60)
    print(f"Generation complete! {total_files} SVG files created.")
    print("=" * 60)
    print()
    print("Generated files:")
    print("  Curve (Up->Right):     curve-12-12, curve-12-23, curve-23-12, curve-23-23")
    print("  Curve (Up->Left):      curve-ul-12-12, curve-ul-12-23, curve-ul-23-12, curve-ul-23-23")
    print("  Sharp (Up->Right):     sharp-12-12, sharp-12-23, sharp-23-12, sharp-23-23")
    print("  Sharp (Up->Left):      sharp-ul-12-12, sharp-ul-12-23, sharp-ul-23-12, sharp-ul-23-23")
    print("  Straight (Vertical):   straight-v-11, straight-v-12, straight-v-21, straight-v-22")
    print("  Straight (Horizontal): straight-h-44, straight-h-48, straight-h-84, straight-h-88")
    print("  Markers:               start, goal")


if __name__ == "__main__":
    main()
