/**
 * Road Tile Editor - Main React Component
 *
 * This component handles all UI rendering and user interactions.
 * It delegates path computation to the @road-tile/lib WASM module.
 * Heavy computations run in a Web Worker for better UI responsiveness.
 */

import {
  type CellData,
  findRoadPathAsync,
  type GridSize,
  getRoadPath,
  getTileById,
  hasDifferentParity,
  initWorkerWithInstance,
  MARKER_GOAL_PATH,
  MARKER_START_PATH,
  type Point,
  pathToRoadGridAsync,
  ROAD_STROKE,
  ROAD_STROKE_WIDTH,
  TILE_SIZE,
} from "@road-tile/lib"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHoverQueue } from "../hooks/useHoverQueue"
import PathWorker from "../worker/road-tile.worker?worker"
import RequestMetricsPanel from "./RequestMetricsPanel"

// ============================================================================
// Types
// ============================================================================

type Mode = "start" | "end" | "done"

/** Road grid type - 2D array of CellData */
type RoadGrid = (CellData | null)[][]

interface EditorState {
  grid: RoadGrid
  path: Point[]
  previewPath: Point[]
  previewGrid: RoadGrid | null
  startPoint: Point | null
  endPoint: Point | null
  hoverPoint: Point | null
  mode: Mode
  status: string
  isCalculating: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

function createParityTable(gridSize: GridSize): number[][] {
  const table: number[][] = []
  for (let row = 0; row < gridSize.rows; row++) {
    const rowTable: number[] = []
    for (let col = 0; col < gridSize.cols; col++) {
      rowTable[col] = (row + col) % 2
    }
    table[row] = rowTable
  }
  return table
}

function calculateMaxIterations(gridSize: GridSize): number {
  const totalCells = gridSize.rows * gridSize.cols
  if (totalCells <= 100) return 500_000
  if (totalCells <= 400) return 2_000_000
  if (totalCells <= 1000) return 5_000_000
  return 10_000_000
}

function createEmptyRoadGrid(gridSize: GridSize): RoadGrid {
  return Array(gridSize.rows)
    .fill(null)
    .map(() => Array(gridSize.cols).fill(null))
}

// ============================================================================
// SVG Tile Component - Renders road tile from CellData
// ============================================================================

interface SvgTileProps {
  cell: CellData
  isPreviewMode?: boolean
}

const SvgTile = React.memo(function SvgTile({ cell, isPreviewMode = false }: SvgTileProps) {
  const tile = getTileById(cell.tile_id)
  if (!tile) return null

  const roadPath = getRoadPath(tile)
  return (
    <svg
      role='img'
      aria-label={`Road tile ${tile.id}`}
      xmlns='http://www.w3.org/2000/svg'
      width={TILE_SIZE}
      height={TILE_SIZE}
      viewBox={`0 0 ${TILE_SIZE} ${TILE_SIZE}`}
      className={`w-full h-full ${isPreviewMode ? "opacity-60" : ""}`}
    >
      <g
        stroke={isPreviewMode ? "#3b82f6" : ROAD_STROKE}
        strokeWidth={ROAD_STROKE_WIDTH}
        fill='none'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG paths from trusted lib
        dangerouslySetInnerHTML={{ __html: roadPath }}
      />
    </svg>
  )
})

// ============================================================================
// Marker SVG Components
// ============================================================================

const StartMarkerSvg = React.memo(function StartMarkerSvg() {
  return (
    <svg
      role='img'
      aria-label='Start marker'
      xmlns='http://www.w3.org/2000/svg'
      width={TILE_SIZE}
      height={TILE_SIZE}
      viewBox={`0 0 ${TILE_SIZE} ${TILE_SIZE}`}
      className='w-full h-full'
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: SVG paths from trusted lib */}
      <g dangerouslySetInnerHTML={{ __html: MARKER_START_PATH }} />
    </svg>
  )
})

const GoalMarkerSvg = React.memo(function GoalMarkerSvg() {
  return (
    <svg
      role='img'
      aria-label='Goal marker'
      xmlns='http://www.w3.org/2000/svg'
      width={TILE_SIZE}
      height={TILE_SIZE}
      viewBox={`0 0 ${TILE_SIZE} ${TILE_SIZE}`}
      className='w-full h-full'
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: SVG paths from trusted lib */}
      <g dangerouslySetInnerHTML={{ __html: MARKER_GOAL_PATH }} />
    </svg>
  )
})

// ============================================================================
// Grid Cell Component
// ============================================================================

interface GridCellProps {
  row: number
  col: number
  cell: CellData | null
  isStart: boolean
  isEnd: boolean
  isHover: boolean
  isPreviewMode: boolean
  hasPreviewPath: boolean
  parity: number
  mode: Mode
  showBorder: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const GridCell = React.memo(function GridCell({
  row,
  col,
  cell,
  isStart,
  isEnd,
  isHover,
  isPreviewMode,
  hasPreviewPath,
  parity,
  mode,
  showBorder,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: GridCellProps) {
  const cellClass = useMemo(() => {
    const classes = [
      "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center",
      "outline outline-1",
      showBorder ? "outline-gray-300" : "outline-transparent",
      "cursor-pointer relative",
      "transition-all duration-100",
    ]

    if (!cell) {
      classes.push(parity === 0 ? "bg-white" : "bg-gray-100")
    } else {
      classes.push("bg-white")
    }

    if (isStart) classes.push("ring-2 ring-inset ring-green-500")
    if (isEnd) classes.push("ring-2 ring-inset ring-red-500")
    if (isHover && !isStart) classes.push("ring-2 ring-inset ring-blue-400")
    if (mode === "end" && !isStart) classes.push("hover:bg-blue-50")
    if (mode === "start") classes.push("hover:bg-green-50")

    return classes.join(" ")
  }, [cell, parity, isStart, isEnd, isHover, mode, showBorder])

  return (
    <button
      type='button'
      aria-label={`セル (${row}, ${col})${isStart ? " - 始点" : ""}${isEnd ? " - 終点" : ""}`}
      className={cellClass}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Road tile SVG from CellData */}
      {cell && <SvgTile cell={cell} isPreviewMode={isPreviewMode} />}

      {/* Start marker overlay */}
      {isStart && (
        <div className='absolute inset-0 z-10'>
          <StartMarkerSvg />
        </div>
      )}

      {/* End marker (confirmed) */}
      {isEnd && mode === "done" && (
        <div className='absolute inset-0 z-10'>
          <GoalMarkerSvg />
        </div>
      )}

      {/* Hover preview marker */}
      {isHover && mode === "end" && !isStart && (
        <div
          className={`absolute inset-1 border-2 rounded flex items-center justify-center z-10 ${
            hasPreviewPath
              ? "border-blue-500 bg-blue-50 bg-opacity-90"
              : "border-orange-500 bg-orange-50 bg-opacity-90"
          }`}
        >
          <div className='text-center'>
            <div className={hasPreviewPath ? "text-blue-500 text-lg" : "text-orange-500 text-lg"}>
              {hasPreviewPath ? "\u25CE" : "\u2715"}
            </div>
            <div
              className={`text-xs font-bold ${hasPreviewPath ? "text-blue-600" : "text-orange-600"}`}
            >
              {hasPreviewPath ? "GOAL?" : "不可"}
            </div>
          </div>
        </div>
      )}
    </button>
  )
})

// ============================================================================
// Toolbar Component
// ============================================================================

interface ToolbarProps {
  gridSize: GridSize
  onResize: (rows: number, cols: number) => void
  onReset: () => void
  status: string
  isCalculating: boolean
  mode: Mode
  showBorder: boolean
  onToggleBorder: (show: boolean) => void
}

function Toolbar({
  gridSize,
  onResize,
  onReset,
  status,
  isCalculating,
  mode,
  showBorder,
  onToggleBorder,
}: ToolbarProps) {
  return (
    <div className='flex items-center gap-3 p-3 bg-gray-100 border-b border-gray-300 shrink-0 flex-wrap'>
      <span className='text-gray-600 text-sm font-medium'>行:</span>
      <input
        type='number'
        min='2'
        max='20'
        value={gridSize.rows}
        onChange={(e) => onResize(Number.parseInt(e.target.value, 10) || 2, gridSize.cols)}
        className='w-14 bg-white border border-gray-300 rounded px-2 py-1 text-sm'
      />
      <span className='text-gray-600 text-sm font-medium'>列:</span>
      <input
        type='number'
        min='2'
        max='40'
        value={gridSize.cols}
        onChange={(e) => onResize(gridSize.rows, Number.parseInt(e.target.value, 10) || 2)}
        className='w-14 bg-white border border-gray-300 rounded px-2 py-1 text-sm'
      />

      <div className='w-px h-6 bg-gray-300 mx-2' />

      <button
        type='button'
        onClick={onReset}
        className='px-4 py-1.5 rounded text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300'
      >
        リセット
      </button>

      <div className='w-px h-6 bg-gray-300 mx-2' />

      <label className='flex items-center gap-1.5 cursor-pointer'>
        <input
          type='checkbox'
          checked={showBorder}
          onChange={(e) => onToggleBorder(e.target.checked)}
          className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
        />
        <span className='text-gray-600 text-sm'>枠線</span>
      </label>

      <div className='w-px h-6 bg-gray-300 mx-2' />

      <span
        className={`text-sm ${
          status.includes("完了")
            ? "text-green-600 font-medium"
            : status.includes("できません")
              ? "text-red-600 font-medium"
              : "text-gray-600"
        }`}
      >
        {status}
        {isCalculating && <span className='ml-2 text-blue-500'>計算中...</span>}
      </span>

      <div className='ml-auto text-xs text-gray-500'>
        {mode === "end" && "終点候補にホバーするとプレビュー表示"}
      </div>
    </div>
  )
}

// ============================================================================
// Footer Component
// ============================================================================

interface FooterProps {
  gridSize: GridSize
  pathLength: number
  startPoint: Point | null
  endPoint: Point | null
  hoverPoint: Point | null
  mode: Mode
}

function Footer({ gridSize, pathLength, startPoint, endPoint, hoverPoint, mode }: FooterProps) {
  const parityInfo = useMemo(() => {
    const comparePoint = mode === "end" ? hoverPoint : endPoint
    if (!startPoint || !comparePoint) return null

    const isDifferent = hasDifferentParity(startPoint, comparePoint)
    return {
      isDifferent,
      text: isDifferent ? "異なる(推奨)" : "同じ(解なしの可能性)",
      className: isDifferent ? "text-green-600" : "text-orange-600",
    }
  }, [startPoint, endPoint, hoverPoint, mode])

  return (
    <div className='p-2 bg-gray-100 border-t border-gray-300 text-xs text-gray-500 text-center'>
      グリッド: {gridSize.rows}×{gridSize.cols} = {gridSize.rows * gridSize.cols}
      セル
      {pathLength > 0 && ` | 経路長: ${pathLength}`}
      {parityInfo && (
        <span className={parityInfo.className}>
          {" | "}パリティ: {parityInfo.text}
        </span>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

function createInitialState(gridSize: GridSize): EditorState {
  return {
    grid: createEmptyRoadGrid(gridSize),
    path: [],
    previewPath: [],
    previewGrid: null,
    startPoint: null,
    endPoint: null,
    hoverPoint: null,
    mode: "start",
    status: "始点を配置してください",
    isCalculating: false,
  }
}

const HOVER_DEBOUNCE_MS = 50

export default function RoadTileEditor() {
  const [gridSize, setGridSize] = useState<GridSize>({ rows: 5, cols: 8 })
  const [state, setState] = useState<EditorState>(() => createInitialState({ rows: 5, cols: 8 }))
  const [workerReady, setWorkerReady] = useState(false)
  const [showBorder, setShowBorder] = useState(true)

  // Cache for computed paths
  const pathCacheRef = useRef<Map<string, Point[]>>(new Map())
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingHoverRef = useRef<Point | null>(null)

  const hoverQueue = useHoverQueue()

  // Initialize Web Worker
  useEffect(() => {
    const worker = new PathWorker()
    initWorkerWithInstance(worker)
      .then(() => setWorkerReady(true))
      .catch((err) => console.error("Worker init failed:", err))

    return () => worker.terminate()
  }, [])

  useEffect(() => {
    hoverQueue.setGridSize(gridSize.rows, gridSize.cols)
  }, [gridSize.rows, gridSize.cols, hoverQueue.setGridSize])

  const parityTable = useMemo(() => createParityTable(gridSize), [gridSize])

  const {
    grid,
    path,
    previewPath,
    previewGrid,
    startPoint,
    endPoint,
    hoverPoint,
    mode,
    status,
    isCalculating,
  } = state

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleResize = useCallback(
    (rows: number, cols: number) => {
      const r = Math.max(2, Math.min(20, rows))
      const c = Math.max(2, Math.min(40, cols))
      const newSize = { rows: r, cols: c }
      setGridSize(newSize)
      setState(createInitialState(newSize))
      pathCacheRef.current.clear()
      hoverQueue.reset()
    },
    [hoverQueue.reset],
  )

  const handleReset = useCallback(() => {
    setState(createInitialState(gridSize))
    pathCacheRef.current.clear()
    hoverQueue.reset()
  }, [gridSize, hoverQueue.reset])

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  const handleCellClick = useCallback(
    async (row: number, col: number) => {
      if (mode === "start") {
        pathCacheRef.current.clear()
        hoverQueue.markStart(row, col)
        setState((prev) => ({
          ...prev,
          grid: createEmptyRoadGrid(gridSize),
          startPoint: { row, col },
          endPoint: null,
          path: [],
          previewPath: [],
          previewGrid: null,
          mode: "end",
          status: "終点を配置してください（ホバーでプレビュー）",
        }))
      } else if (mode === "end") {
        if (startPoint?.row === row && startPoint?.col === col) {
          setState((prev) => ({
            ...prev,
            status: "終点は始点と異なる位置に配置してください",
          }))
          return
        }

        if (!workerReady || !startPoint) return

        // Use preview path if available
        let resultPath = previewPath
        if (previewPath.length === 0 || hoverPoint?.row !== row || hoverPoint?.col !== col) {
          setState((prev) => ({ ...prev, isCalculating: true }))
          const maxIterations = calculateMaxIterations(gridSize)
          const result = await findRoadPathAsync(startPoint, { row, col }, gridSize, maxIterations)
          resultPath = result.found ? result.path : []
        }

        if (resultPath.length > 0) {
          hoverQueue.markGoal(row, col)
          const roadGridResult = await pathToRoadGridAsync(resultPath, gridSize)
          setState((prev) => ({
            ...prev,
            path: resultPath,
            previewPath: [],
            previewGrid: null,
            grid: roadGridResult.grid,
            endPoint: { row, col },
            hoverPoint: null,
            mode: "done",
            status: `経路生成完了: ${resultPath.length}セル`,
            isCalculating: false,
          }))
        } else {
          setState((prev) => ({
            ...prev,
            status: "この配置では一本道を生成できません",
            isCalculating: false,
          }))
        }
      }
    },
    [
      mode,
      startPoint,
      gridSize,
      previewPath,
      hoverPoint,
      workerReady,
      hoverQueue.markStart,
      hoverQueue.markGoal,
    ],
  )

  const handleCellHover = useCallback(
    (row: number, col: number) => {
      if (mode !== "end" || !startPoint || !workerReady) return
      if (startPoint.row === row && startPoint.col === col) {
        if (hoverTimerRef.current) {
          clearTimeout(hoverTimerRef.current)
          hoverTimerRef.current = null
        }
        setState((prev) => ({
          ...prev,
          hoverPoint: null,
          previewPath: [],
          previewGrid: null,
          isCalculating: false,
        }))
        return
      }

      pendingHoverRef.current = { row, col }

      setState((prev) => ({
        ...prev,
        hoverPoint: { row, col },
      }))

      const cacheKey = `${startPoint.row},${startPoint.col}-${row},${col}`
      const cachedPath = pathCacheRef.current.get(cacheKey)

      if (cachedPath !== undefined) {
        hoverQueue.markCached(row, col, cachedPath.length > 0)
        if (cachedPath.length > 0) {
          // Compute road grid for cached path
          pathToRoadGridAsync(cachedPath, gridSize).then((roadGridResult) => {
            setState((prev) => {
              if (prev.hoverPoint?.row !== row || prev.hoverPoint?.col !== col) {
                return prev
              }
              return {
                ...prev,
                previewPath: cachedPath,
                previewGrid: roadGridResult.grid,
                isCalculating: false,
              }
            })
          })
        } else {
          setState((prev) => ({
            ...prev,
            previewPath: cachedPath,
            previewGrid: null,
            isCalculating: false,
          }))
        }
        return
      }

      hoverQueue.markPending(row, col)

      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }

      setState((prev) => ({
        ...prev,
        isCalculating: true,
      }))

      hoverTimerRef.current = setTimeout(async () => {
        const pending = pendingHoverRef.current
        if (!pending || pending.row !== row || pending.col !== col) {
          hoverQueue.markIdle(row, col)
          return
        }

        hoverQueue.markProcessing(row, col)

        const maxIterations = calculateMaxIterations(gridSize)
        const result = await findRoadPathAsync(startPoint, { row, col }, gridSize, maxIterations)
        const resultPath = result.found ? result.path : []

        hoverQueue.markCompleted(row, col, result.found)

        pathCacheRef.current.set(cacheKey, resultPath)

        if (resultPath.length > 0) {
          const roadGridResult = await pathToRoadGridAsync(resultPath, gridSize)
          setState((prev) => {
            if (prev.hoverPoint?.row !== row || prev.hoverPoint?.col !== col) {
              return { ...prev, isCalculating: false }
            }
            return {
              ...prev,
              previewPath: resultPath,
              previewGrid: roadGridResult.grid,
              isCalculating: false,
            }
          })
        } else {
          setState((prev) => {
            if (prev.hoverPoint?.row !== row || prev.hoverPoint?.col !== col) {
              return { ...prev, isCalculating: false }
            }
            return {
              ...prev,
              previewPath: [],
              previewGrid: null,
              isCalculating: false,
            }
          })
        }
      }, HOVER_DEBOUNCE_MS)
    },
    [
      mode,
      startPoint,
      gridSize,
      workerReady,
      hoverQueue.markCached,
      hoverQueue.markPending,
      hoverQueue.markIdle,
      hoverQueue.markProcessing,
      hoverQueue.markCompleted,
    ],
  )

  const handleCellLeave = useCallback(() => {
    if (mode === "end") {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }
      const pending = pendingHoverRef.current
      if (pending) {
        const cellState = hoverQueue.getCellState(pending.row, pending.col)
        if (cellState && (cellState.status === "pending" || cellState.status === "processing")) {
          hoverQueue.markIdle(pending.row, pending.col)
        }
      }
      pendingHoverRef.current = null
      setState((prev) => ({
        ...prev,
        hoverPoint: null,
        previewPath: [],
        previewGrid: null,
        isCalculating: false,
      }))
    }
  }, [mode, hoverQueue.getCellState, hoverQueue.markIdle])

  // ============================================================================
  // Computed Values
  // ============================================================================

  const displayGrid = mode === "end" && previewGrid ? previewGrid : grid
  const displayPath = previewPath.length > 0 ? previewPath : path
  const isPreviewMode = mode === "end" && previewPath.length > 0

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className='h-screen w-screen bg-white flex flex-col overflow-hidden'>
      <Toolbar
        gridSize={gridSize}
        onResize={handleResize}
        onReset={handleReset}
        status={status}
        isCalculating={isCalculating}
        mode={mode}
        showBorder={showBorder}
        onToggleBorder={setShowBorder}
      />

      <div className='flex-1 flex overflow-hidden'>
        {/* Main grid area */}
        <div className='flex-1 flex items-center justify-center p-4 overflow-auto bg-gray-50'>
          <div
            className='inline-grid'
            style={{ gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)` }}
          >
            {Array(gridSize.rows)
              .fill(null)
              .map((_, rowIdx) =>
                Array(gridSize.cols)
                  .fill(null)
                  .map((_, colIdx) => (
                    <GridCell
                      key={`cell-${rowIdx}-${colIdx}`}
                      row={rowIdx}
                      col={colIdx}
                      cell={displayGrid[rowIdx]?.[colIdx] ?? null}
                      isStart={startPoint?.row === rowIdx && startPoint?.col === colIdx}
                      isEnd={endPoint?.row === rowIdx && endPoint?.col === colIdx}
                      isHover={hoverPoint?.row === rowIdx && hoverPoint?.col === colIdx}
                      isPreviewMode={isPreviewMode}
                      hasPreviewPath={previewPath.length > 0}
                      parity={parityTable[rowIdx]?.[colIdx] ?? 0}
                      mode={mode}
                      showBorder={showBorder}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      onMouseEnter={() => handleCellHover(rowIdx, colIdx)}
                      onMouseLeave={handleCellLeave}
                    />
                  )),
              )}
          </div>
        </div>

        {/* Metrics panel - right sidebar */}
        <div className='w-64 shrink-0'>
          <RequestMetricsPanel
            metrics={hoverQueue.metrics}
            cellStates={hoverQueue.cellStates}
            gridSize={hoverQueue.gridSize}
          />
        </div>
      </div>

      <Footer
        gridSize={gridSize}
        pathLength={displayPath.length}
        startPoint={startPoint}
        endPoint={endPoint}
        hoverPoint={hoverPoint}
        mode={mode}
      />
    </div>
  )
}
