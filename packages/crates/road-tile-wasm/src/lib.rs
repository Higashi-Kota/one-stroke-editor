//! Road Tile WASM Library
//!
//! This library provides high-performance road tile path finding and grid generation
//! for WebAssembly. It finds paths that can be rendered using 2-lane road tiles
//! with proper port connections.

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

// ============================================================================
// Panic Hook Setup
// ============================================================================

#[cfg(feature = "console_error_panic_hook")]
fn set_panic_hook() {
    console_error_panic_hook::set_once();
}

#[cfg(not(feature = "console_error_panic_hook"))]
fn set_panic_hook() {}

/// Initialize the WASM module
#[wasm_bindgen(start)]
pub fn init() {
    set_panic_hook();
}

// ============================================================================
// Core Types
// ============================================================================

/// A point on the grid
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct Point {
    pub row: i32,
    pub col: i32,
}

impl Point {
    pub fn new(row: i32, col: i32) -> Self {
        Self { row, col }
    }
}

/// Grid size specification
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct GridSize {
    pub rows: i32,
    pub cols: i32,
}

/// Direction of movement/connection
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

impl Direction {
    pub fn opposite(&self) -> Direction {
        match self {
            Direction::Up => Direction::Down,
            Direction::Down => Direction::Up,
            Direction::Left => Direction::Right,
            Direction::Right => Direction::Left,
        }
    }

    pub fn delta(&self) -> (i32, i32) {
        match self {
            Direction::Up => (-1, 0),
            Direction::Down => (1, 0),
            Direction::Left => (0, -1),
            Direction::Right => (0, 1),
        }
    }

    pub fn to_string(&self) -> &'static str {
        match self {
            Direction::Up => "up",
            Direction::Down => "down",
            Direction::Left => "left",
            Direction::Right => "right",
        }
    }

    pub fn all() -> [Direction; 4] {
        [
            Direction::Up,
            Direction::Right,
            Direction::Down,
            Direction::Left,
        ]
    }
}

/// Port set for 2-lane roads
/// "12" uses ports 1,2 (positions 10,20)
/// "23" uses ports 2,3 (positions 20,30)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum PortSet {
    P12, // Ports 1,2
    P23, // Ports 2,3
}

impl PortSet {
    pub fn to_string(&self) -> &'static str {
        match self {
            PortSet::P12 => "12",
            PortSet::P23 => "23",
        }
    }
}

/// Connection specification for a tile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Connection {
    pub direction: String,
    pub ports: String,
}

/// Result of path finding
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PathResult {
    pub found: bool,
    pub path: Vec<Point>,
    pub iterations: u32,
}

/// Cell data for rendering
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CellData {
    pub tile_id: String,
    pub connections: Vec<Connection>,
    pub path_index: usize,
}

/// Road grid result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoadGridResult {
    pub grid: Vec<Vec<Option<CellData>>>,
    pub valid: bool,
}

// ============================================================================
// Tile Definitions
// ============================================================================

/// Tile variant type
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TileVariant {
    Curve,
    Sharp,
    Straight,
}

/// Tile definition
#[derive(Debug, Clone)]
pub struct TileDefinition {
    pub id: &'static str,
    pub variant: TileVariant,
    pub mask: u8,
    pub conn1: (Direction, PortSet),
    pub conn2: (Direction, PortSet),
}

impl TileDefinition {
    pub fn get_connection(&self, dir: Direction) -> Option<PortSet> {
        if self.conn1.0 == dir {
            Some(self.conn1.1)
        } else if self.conn2.0 == dir {
            Some(self.conn2.1)
        } else {
            None
        }
    }

    pub fn has_direction(&self, dir: Direction) -> bool {
        self.conn1.0 == dir || self.conn2.0 == dir
    }
}

/// Get all tile definitions
fn get_all_tiles() -> Vec<TileDefinition> {
    use Direction::*;
    use PortSet::*;
    use TileVariant::*;

    vec![
        // Curve tiles (16)
        TileDefinition { id: "curve-05", variant: Curve, mask: 0x05, conn1: (Up, P12), conn2: (Right, P12) },
        TileDefinition { id: "curve-06", variant: Curve, mask: 0x06, conn1: (Up, P23), conn2: (Right, P12) },
        TileDefinition { id: "curve-09", variant: Curve, mask: 0x09, conn1: (Up, P12), conn2: (Right, P23) },
        TileDefinition { id: "curve-0A", variant: Curve, mask: 0x0A, conn1: (Up, P23), conn2: (Right, P23) },
        TileDefinition { id: "curve-14", variant: Curve, mask: 0x14, conn1: (Right, P12), conn2: (Down, P12) },
        TileDefinition { id: "curve-18", variant: Curve, mask: 0x18, conn1: (Right, P23), conn2: (Down, P12) },
        TileDefinition { id: "curve-24", variant: Curve, mask: 0x24, conn1: (Right, P12), conn2: (Down, P23) },
        TileDefinition { id: "curve-28", variant: Curve, mask: 0x28, conn1: (Right, P23), conn2: (Down, P23) },
        TileDefinition { id: "curve-41", variant: Curve, mask: 0x41, conn1: (Up, P12), conn2: (Left, P12) },
        TileDefinition { id: "curve-42", variant: Curve, mask: 0x42, conn1: (Up, P23), conn2: (Left, P12) },
        TileDefinition { id: "curve-50", variant: Curve, mask: 0x50, conn1: (Down, P12), conn2: (Left, P12) },
        TileDefinition { id: "curve-60", variant: Curve, mask: 0x60, conn1: (Down, P23), conn2: (Left, P12) },
        TileDefinition { id: "curve-81", variant: Curve, mask: 0x81, conn1: (Up, P12), conn2: (Left, P23) },
        TileDefinition { id: "curve-82", variant: Curve, mask: 0x82, conn1: (Up, P23), conn2: (Left, P23) },
        TileDefinition { id: "curve-90", variant: Curve, mask: 0x90, conn1: (Down, P12), conn2: (Left, P23) },
        TileDefinition { id: "curve-A0", variant: Curve, mask: 0xA0, conn1: (Down, P23), conn2: (Left, P23) },

        // Sharp tiles (16)
        TileDefinition { id: "sharp-05", variant: Sharp, mask: 0x05, conn1: (Up, P12), conn2: (Right, P12) },
        TileDefinition { id: "sharp-06", variant: Sharp, mask: 0x06, conn1: (Up, P23), conn2: (Right, P12) },
        TileDefinition { id: "sharp-09", variant: Sharp, mask: 0x09, conn1: (Up, P12), conn2: (Right, P23) },
        TileDefinition { id: "sharp-0A", variant: Sharp, mask: 0x0A, conn1: (Up, P23), conn2: (Right, P23) },
        TileDefinition { id: "sharp-14", variant: Sharp, mask: 0x14, conn1: (Right, P12), conn2: (Down, P12) },
        TileDefinition { id: "sharp-18", variant: Sharp, mask: 0x18, conn1: (Right, P23), conn2: (Down, P12) },
        TileDefinition { id: "sharp-24", variant: Sharp, mask: 0x24, conn1: (Right, P12), conn2: (Down, P23) },
        TileDefinition { id: "sharp-28", variant: Sharp, mask: 0x28, conn1: (Right, P23), conn2: (Down, P23) },
        TileDefinition { id: "sharp-41", variant: Sharp, mask: 0x41, conn1: (Up, P12), conn2: (Left, P12) },
        TileDefinition { id: "sharp-42", variant: Sharp, mask: 0x42, conn1: (Up, P23), conn2: (Left, P12) },
        TileDefinition { id: "sharp-50", variant: Sharp, mask: 0x50, conn1: (Down, P12), conn2: (Left, P12) },
        TileDefinition { id: "sharp-60", variant: Sharp, mask: 0x60, conn1: (Down, P23), conn2: (Left, P12) },
        TileDefinition { id: "sharp-81", variant: Sharp, mask: 0x81, conn1: (Up, P12), conn2: (Left, P23) },
        TileDefinition { id: "sharp-82", variant: Sharp, mask: 0x82, conn1: (Up, P23), conn2: (Left, P23) },
        TileDefinition { id: "sharp-90", variant: Sharp, mask: 0x90, conn1: (Down, P12), conn2: (Left, P23) },
        TileDefinition { id: "sharp-A0", variant: Sharp, mask: 0xA0, conn1: (Down, P23), conn2: (Left, P23) },

        // Straight tiles - Vertical (4 variants)
        TileDefinition { id: "straight-v-11", variant: Straight, mask: 0x11, conn1: (Up, P12), conn2: (Down, P12) },
        TileDefinition { id: "straight-v-12", variant: Straight, mask: 0x12, conn1: (Up, P12), conn2: (Down, P23) },
        TileDefinition { id: "straight-v-21", variant: Straight, mask: 0x21, conn1: (Up, P23), conn2: (Down, P12) },
        TileDefinition { id: "straight-v-22", variant: Straight, mask: 0x22, conn1: (Up, P23), conn2: (Down, P23) },
        // Straight tiles - Horizontal (4 variants)
        TileDefinition { id: "straight-h-44", variant: Straight, mask: 0x44, conn1: (Left, P12), conn2: (Right, P12) },
        TileDefinition { id: "straight-h-48", variant: Straight, mask: 0x48, conn1: (Left, P12), conn2: (Right, P23) },
        TileDefinition { id: "straight-h-84", variant: Straight, mask: 0x84, conn1: (Left, P23), conn2: (Right, P12) },
        TileDefinition { id: "straight-h-88", variant: Straight, mask: 0x88, conn1: (Left, P23), conn2: (Right, P23) },
    ]
}

/// Find tiles that connect in given directions with given ports
#[allow(dead_code)]
fn find_matching_tiles(
    from_dir: Direction,
    from_ports: PortSet,
    to_dir: Direction,
    to_ports: PortSet,
    tiles: &[TileDefinition],
) -> Vec<&TileDefinition> {
    tiles
        .iter()
        .filter(|tile| {
            tile.get_connection(from_dir.opposite()) == Some(from_ports)
                && tile.get_connection(to_dir) == Some(to_ports)
        })
        .collect()
}

// ============================================================================
// Path Finding Algorithm
// ============================================================================

/// State for path finding
struct PathState {
    grid: Vec<Vec<bool>>, // visited cells
    path: Vec<Point>,
    grid_size: GridSize,
    iterations: u32,
    max_iterations: u32,
}

impl PathState {
    fn new(grid_size: GridSize, max_iterations: u32) -> Self {
        let grid = vec![vec![false; grid_size.cols as usize]; grid_size.rows as usize];
        Self {
            grid,
            path: Vec::new(),
            grid_size,
            iterations: 0,
            max_iterations,
        }
    }

    fn is_valid(&self, p: Point) -> bool {
        p.row >= 0
            && p.row < self.grid_size.rows
            && p.col >= 0
            && p.col < self.grid_size.cols
    }

    fn is_visited(&self, p: Point) -> bool {
        if !self.is_valid(p) {
            return true;
        }
        self.grid[p.row as usize][p.col as usize]
    }

    fn visit(&mut self, p: Point) {
        self.grid[p.row as usize][p.col as usize] = true;
        self.path.push(p);
    }

    fn unvisit(&mut self, p: Point) {
        self.grid[p.row as usize][p.col as usize] = false;
        self.path.pop();
    }

    fn all_visited(&self) -> bool {
        let total = (self.grid_size.rows * self.grid_size.cols) as usize;
        self.path.len() == total
    }

    fn get_neighbors(&self, p: Point) -> Vec<(Point, Direction)> {
        Direction::all()
            .iter()
            .filter_map(|&dir| {
                let (dr, dc) = dir.delta();
                let next = Point::new(p.row + dr, p.col + dc);
                if self.is_valid(next) && !self.is_visited(next) {
                    Some((next, dir))
                } else {
                    None
                }
            })
            .collect()
    }
}

/// Find a Hamiltonian path from start to end using backtracking
fn find_path_internal(
    state: &mut PathState,
    current: Point,
    end: Point,
) -> bool {
    state.iterations += 1;

    if state.iterations > state.max_iterations {
        return false;
    }

    state.visit(current);

    // Check if we reached the end and visited all cells
    if current == end {
        if state.all_visited() {
            return true;
        }
        state.unvisit(current);
        return false;
    }

    // Check if we visited all cells but not at end
    if state.all_visited() {
        state.unvisit(current);
        return false;
    }

    // Get unvisited neighbors
    let mut neighbors = state.get_neighbors(current);

    // Heuristic: Sort neighbors by distance to end (closer first when near end)
    // and by number of unvisited neighbors (fewer first - Warnsdorff's rule)
    neighbors.sort_by(|(a, _), (b, _)| {
        let a_neighbors = count_unvisited_neighbors(state, *a);
        let b_neighbors = count_unvisited_neighbors(state, *b);

        // Prioritize cells with fewer unvisited neighbors (Warnsdorff's rule)
        a_neighbors.cmp(&b_neighbors)
    });

    for (next, _dir) in neighbors {
        if find_path_internal(state, next, end) {
            return true;
        }
    }

    state.unvisit(current);
    false
}

fn count_unvisited_neighbors(state: &PathState, p: Point) -> usize {
    Direction::all()
        .iter()
        .filter(|&&dir| {
            let (dr, dc) = dir.delta();
            let next = Point::new(p.row + dr, p.col + dc);
            state.is_valid(next) && !state.is_visited(next)
        })
        .count()
}

// ============================================================================
// Grid to Tiles Conversion
// ============================================================================

/// Convert a path to a grid with tile assignments
/// Uses port propagation to ensure smooth connections between tiles
fn path_to_tiles(path: &[Point], grid_size: GridSize) -> RoadGridResult {
    if path.len() < 2 {
        return RoadGridResult {
            grid: vec![vec![None; grid_size.cols as usize]; grid_size.rows as usize],
            valid: false,
        };
    }

    let tiles = get_all_tiles();
    let mut grid: Vec<Vec<Option<CellData>>> =
        vec![vec![None; grid_size.cols as usize]; grid_size.rows as usize];

    // Track the required entry port for the next tile (propagated from previous tile's exit)
    let mut required_entry_port: Option<PortSet> = None;

    // Process each cell in the path
    for i in 0..path.len() {
        let current = path[i];

        // Determine entry and exit directions
        let entry_dir = if i > 0 {
            let prev = path[i - 1];
            Some(get_direction(prev, current))
        } else {
            None
        };

        let exit_dir = if i < path.len() - 1 {
            let next = path[i + 1];
            Some(get_direction(current, next))
        } else {
            None
        };

        // Find matching tile with port propagation
        let (tile_id, entry_port, exit_port) = match (entry_dir, exit_dir) {
            (Some(entry), Some(exit)) => {
                // Middle cell: needs entry and exit with port matching
                let result = find_tile_with_port_constraint(&tiles, entry, exit, required_entry_port);
                match result {
                    Some((id, ep, xp)) => (Some(id), Some(ep), Some(xp)),
                    None => (None, None, None),
                }
            }
            (None, Some(_exit)) => {
                // Start cell: use marker, start with P23 (outer lane)
                (Some("start".to_string()), None, Some(PortSet::P23))
            }
            (Some(_entry), None) => {
                // End cell: use marker
                (Some("goal".to_string()), required_entry_port, None)
            }
            (None, None) => {
                (None, None, None)
            }
        };

        if let Some(id) = tile_id {
            let connections = match (entry_dir, exit_dir) {
                (Some(entry), Some(exit)) => {
                    vec![
                        Connection {
                            direction: entry.opposite().to_string().to_string(),
                            ports: entry_port.map(|p| p.to_string()).unwrap_or("23").to_string(),
                        },
                        Connection {
                            direction: exit.to_string().to_string(),
                            ports: exit_port.map(|p| p.to_string()).unwrap_or("23").to_string(),
                        },
                    ]
                }
                (None, Some(exit)) => {
                    vec![Connection {
                        direction: exit.to_string().to_string(),
                        ports: "23".to_string(),
                    }]
                }
                (Some(entry), None) => {
                    vec![Connection {
                        direction: entry.opposite().to_string().to_string(),
                        ports: entry_port.map(|p| p.to_string()).unwrap_or("23").to_string(),
                    }]
                }
                _ => vec![],
            };

            grid[current.row as usize][current.col as usize] = Some(CellData {
                tile_id: id,
                connections,
                path_index: i,
            });
        } else {
            // 一つでもタイルが見つからなければ無効扱い
            return RoadGridResult {
                grid,
                valid: false,
            };
        }

        // Propagate exit port to next tile's required entry port
        required_entry_port = exit_port;
    }

    RoadGridResult { grid, valid: true }
}

/// Find tile with port constraint for smooth connections
/// Returns (tile_id, entry_port, exit_port)
fn find_tile_with_port_constraint(
    tiles: &[TileDefinition],
    entry: Direction,
    exit: Direction,
    required_entry_port: Option<PortSet>,
) -> Option<(String, PortSet, PortSet)> {
    let entry_from = entry.opposite();

    // 1) 「入るポート＝出るポート」で必ず同一レーンを維持するパターンのみ採用
    for tile in tiles {
        if tile.has_direction(entry_from) && tile.has_direction(exit) {
            if let (Some(ep), Some(xp)) = (tile.get_connection(entry_from), tile.get_connection(exit)) {
                if ep == xp && required_entry_port.map_or(true, |req| ep == req) {
                    return Some((tile.id.to_string(), ep, xp));
                }
            }
        }
    }

    None
}

fn get_direction(from: Point, to: Point) -> Direction {
    let dr = to.row - from.row;
    let dc = to.col - from.col;

    match (dr, dc) {
        (-1, 0) => Direction::Up,
        (1, 0) => Direction::Down,
        (0, -1) => Direction::Left,
        (0, 1) => Direction::Right,
        _ => panic!("Invalid direction: from {:?} to {:?}", from, to),
    }
}

// ============================================================================
// WASM Exports
// ============================================================================

/// Find a path from start to end that visits all cells
#[wasm_bindgen]
pub fn find_road_path(
    start_row: i32,
    start_col: i32,
    end_row: i32,
    end_col: i32,
    grid_rows: i32,
    grid_cols: i32,
    max_iterations: u32,
) -> JsValue {
    let start = Point::new(start_row, start_col);
    let end = Point::new(end_row, end_col);
    let grid_size = GridSize {
        rows: grid_rows,
        cols: grid_cols,
    };

    let mut state = PathState::new(grid_size, max_iterations);
    let found = find_path_internal(&mut state, start, end);

    let result = PathResult {
        found,
        path: if found { state.path } else { vec![] },
        iterations: state.iterations,
    };

    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

/// Convert a path to a road grid with tile assignments
#[wasm_bindgen]
pub fn path_to_road_grid(path_js: JsValue, grid_rows: i32, grid_cols: i32) -> JsValue {
    let path: Vec<Point> = match serde_wasm_bindgen::from_value(path_js) {
        Ok(p) => p,
        Err(_) => return JsValue::NULL,
    };

    let grid_size = GridSize {
        rows: grid_rows,
        cols: grid_cols,
    };

    let result = path_to_tiles(&path, grid_size);
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

/// Get parity of a cell (0 or 1 based on row+col)
#[wasm_bindgen]
pub fn cell_parity(row: i32, col: i32) -> i32 {
    (row + col) % 2
}

/// Check if two cells have different parity
#[wasm_bindgen]
pub fn has_different_parity(r1: i32, c1: i32, r2: i32, c2: i32) -> bool {
    cell_parity(r1, c1) != cell_parity(r2, c2)
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_path_small_grid() {
        // For a 2x2 grid, start and end must have different parity for Hamiltonian path
        // (0,0) has parity 0, (0,1) has parity 1
        let start = Point::new(0, 0);
        let end = Point::new(0, 1);
        let grid_size = GridSize { rows: 2, cols: 2 };

        let mut state = PathState::new(grid_size, 1000);
        let found = find_path_internal(&mut state, start, end);

        assert!(found);
        assert_eq!(state.path.len(), 4);
    }

    #[test]
    fn test_parity() {
        assert_eq!(cell_parity(0, 0), 0);
        assert_eq!(cell_parity(0, 1), 1);
        assert_eq!(cell_parity(1, 0), 1);
        assert_eq!(cell_parity(1, 1), 0);
    }

    #[test]
    fn test_different_parity() {
        assert!(has_different_parity(0, 0, 0, 1));
        assert!(!has_different_parity(0, 0, 1, 1));
    }

    #[test]
    fn test_tile_definitions() {
        let tiles = get_all_tiles();
        assert_eq!(tiles.len(), 40); // 16 curve + 16 sharp + 8 straight
    }

    #[test]
    fn test_path_to_tiles() {
        // Test a simple 3-cell path
        let path = vec![
            Point::new(0, 0),
            Point::new(0, 1),
            Point::new(0, 2),
        ];
        let grid_size = GridSize { rows: 1, cols: 3 };
        let result = path_to_tiles(&path, grid_size);

        assert!(result.valid);
        // First cell should be start
        assert_eq!(result.grid[0][0].as_ref().unwrap().tile_id, "start");
        // Last cell should be goal
        assert_eq!(result.grid[0][2].as_ref().unwrap().tile_id, "goal");
    }
}
