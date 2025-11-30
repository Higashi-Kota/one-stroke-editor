# One stroke editor

2車線道路タイルを使用して、グリッド上のすべてのセルを通る一本道を生成するアプリケーションです。

![アプリのスクリーンショット](./screenshots/スクリーンショット 2025-12-01 011424.png)

## 数学的背景

### ハミルトン経路問題

このアプリケーションの核心は **ハミルトン経路問題**（Hamiltonian Path Problem）です。

ハミルトン経路とは、グラフの各頂点をちょうど一度ずつ通る経路のことです。m x n のグリッドグラフにおいて、始点から終点までのハミルトン経路を求めることは、一般にNP完全問題として知られています。

```
+---+---+---+
| S | > | > |    S: 始点 (Start)
+---+---+---+    G: 終点 (Goal)
| v | < | v |    > v < ^: 経路方向
+---+---+---+
| > | > | G |
+---+---+---+
```

### パリティ制約

グリッドグラフでは、チェッカーボードのように白黒で塗り分けると、隣接セルは必ず異なる色になります。

```
+---+---+---+---+
| B | W | B | W |    B: 黒 (Black)
+---+---+---+---+    W: 白 (White)
| W | B | W | B |
+---+---+---+---+
| B | W | B | W |
+---+---+---+---+
```

ハミルトン経路では各移動で色が変わるため、経路長（移動回数）が偶数なら始点と終点は同じ色、奇数なら異なる色になります。

**重要な定理**: m x n グリッドで全 m x n セルを訪問するハミルトン経路の移動回数は m x n - 1 回です。

- **m x n が偶数** の場合（例: 3 x 4 = 12）: m x n - 1 は奇数 → 始点と終点は **異なるパリティ**
- **m x n が奇数** の場合（例: 3 x 3 = 9）: m x n - 1 は偶数 → 始点と終点は **同じパリティ**

このアプリでは、異なるパリティの組み合わせを「推奨」、同じパリティを「解なしの可能性」として表示します。

## タイルシステム

### 40x40 グリッドとポートシステム

各タイルは 40x40 ピクセルの正方形で、10px 間隔のグリッドに分割されています。

```
        10   20   30
       +----+----+----+----+
       | P1 | P2 | P3 |    |  <- 上辺ポート (y=0)
    10 +----+----+----+----+
       |    |    |    | P1 |  <- 右辺ポート (x=40)
    20 +----+----+----+----+
       |    |    |    | P2 |
    30 +----+----+----+----+
       | P1 | P2 | P3 | P3 |  <- 下辺ポート (y=40)
       +----+----+----+----+
              ^
           左辺ポート (x=0)
```

各辺には 3 つのポート位置があります：

| ポート | 位置 | 座標（水平辺） | 座標（垂直辺） |
|--------|------|----------------|----------------|
| Port 1 | 10px | x=10           | y=10           |
| Port 2 | 20px | x=20           | y=20           |
| Port 3 | 30px | x=30           | y=30           |

### ポートセット（PortSet）

2車線道路は 2 つの境界線で描画され、それぞれが隣接する 2 つのポートを使用します：

| PortSet | 使用ポート | 位置        | 説明       |
|---------|------------|-------------|------------|
| `P12`   | Port 1,2   | 10px, 20px  | 内側寄り   |
| `P23`   | Port 2,3   | 20px, 30px  | 外側寄り   |

### ビットマスクによるタイル識別

各方向・ポートセットの組み合わせは 8 ビットマスクで表現されます：

```
方向        PortSet   ビット
------------------------------
Up          P12       0x01
Up          P23       0x02
Right       P12       0x04
Right       P23       0x08
Down        P12       0x10
Down        P23       0x20
Left        P12       0x40
Left        P23       0x80
```

例えば、mask=0x05 (0000_0101) は Up(P12) + Right(P12) の接続を表し、`tile-types.ts` では `curve-05` や `sharp-05` として定義されています。基本パターン（SVGファイル）では `curve-12-12`、`sharp-12-12` に対応します。

## タイルの種類

### 基本パターン（24種類）と派生タイル（40種類）

アプリケーションは 2 層構造でタイルを管理しています：

1. **基本パターン（BASE_PATTERNS）**: `svg-paths.ts` で定義された24種類のSVGパス
2. **派生タイル（TILE_MAPPINGS）**: 基本パターン + 変換で定義された40種類のタイル

### 基本パターン一覧

| カテゴリ | パターン数 | 説明 |
|----------|------------|------|
| カーブ（Up->Right） | 4種類 | curve-12-12, curve-12-23, curve-23-12, curve-23-23 |
| カーブ（Up->Left） | 4種類 | curve-ul-12-12, curve-ul-12-23, curve-ul-23-12, curve-ul-23-23 |
| シャープ（Up->Right） | 4種類 | sharp-12-12, sharp-12-23, sharp-23-12, sharp-23-23 |
| シャープ（Up->Left） | 4種類 | sharp-ul-12-12, sharp-ul-12-23, sharp-ul-23-12, sharp-ul-23-23 |
| 直線（垂直） | 4種類 | straight-v-11, straight-v-12, straight-v-21, straight-v-22 |
| 直線（水平） | 4種類 | straight-h-44, straight-h-48, straight-h-84, straight-h-88 |

### 派生タイル一覧

基本パターンに回転・ミラーリング変換を適用することで、全 40 種類のタイルを生成します：

- **カーブタイル**: 16 種類（4方向 x 4ポート組み合わせ）
- **シャープタイル**: 16 種類（4方向 x 4ポート組み合わせ）
- **直線タイル**: 8 種類（縦4種 + 横4種）

### 変換（Transform）によるポート位置の変化

```typescript
type Transform = "rotate90" | "rotate180" | "rotate270" | "mirrorX" | "mirrorY"
```

変換を適用すると、ポート位置が以下のように変化します：

| 変換        | 方向変化               | ポート変化                          |
|-------------|------------------------|-------------------------------------|
| `rotate90`  | Up->Right->Down->Left  | 回転先の辺でポートが反転（P12<->P23）|
| `rotate180` | Up<->Down, Left<->Right| 両方向でポートが反転                |
| `rotate270` | Up->Left->Down->Right  | 回転先の辺でポートが反転            |
| `mirrorX`   | Left<->Right           | 垂直軸（Up/Down）でポートが反転     |
| `mirrorY`   | Up<->Down              | 水平軸（Left/Right）でポートが反転  |

例：`curve-12-12` (Up(P12)->Right(P12)) に `rotate90` を適用すると、Right(P12)->Down(P23) の接続になります（`tile-types.ts` では `curve-24` として定義）。

## レーン継続性ルール

2車線道路が正しく接続するための重要な制約です。

```
    外側境界線                内側境界線
         |                        |
         v                        v
    +-------------------------------------+
    |  ================================   |   <- 外側境界線
    |                                     |
    |     ============================    |   <- 内側境界線
    +-------------------------------------+
```

**ルール**: タイル内でレーンが交差してはならない

- 外側境界（Port 1/3 側）は外側境界に接続
- 内側境界（Port 2 側）は内側境界に接続

このルールにより、隣接タイルは **同じポートセット** で接続する必要があります：

```
正しい接続（P23同士）:          誤った接続（P12とP23）:
+---------+---------+          +---------+---------+
|    ===  |  ===    |          |    ===  |         |
|  ===    |    ===  |          |  ===    |    ===  |
|         |         |          |         |  ===    |
+---------+---------+          +---------+---------+
      P23 <-> P23                    P12 x P23 (断裂!)
```

## パス探索アルゴリズム

### バックトラッキング + ワーンスドルフのルール

```rust
fn find_path_internal(state: &mut PathState, current: Point, end: Point) -> bool {
    state.visit(current);

    if current == end && state.all_visited() {
        return true;  // ハミルトン経路発見!
    }

    // ワーンスドルフのルール: 未訪問隣接セルが少ない順にソート
    let mut neighbors = state.get_neighbors(current);
    neighbors.sort_by(|(a, _), (b, _)| {
        count_unvisited_neighbors(state, *a)
            .cmp(&count_unvisited_neighbors(state, *b))
    });

    for (next, _) in neighbors {
        if find_path_internal(state, next, end) {
            return true;
        }
    }

    state.unvisit(current);  // バックトラック
    false
}
```

**ワーンスドルフのルール**（Warnsdorff's rule）は、チェスのナイトツアー問題で使われるヒューリスティックで、次に移動する候補の中から「そこから移動できる未訪問セルが最も少ない」ものを優先します。これにより、行き止まりになりやすいセルを早めに訪問し、探索効率を大幅に向上させます。

### タイル割り当てとポート伝播

パスが見つかった後、各セルにタイルを割り当てます：

```rust
fn path_to_tiles(path: &[Point], grid_size: GridSize) -> RoadGridResult {
    let mut required_entry_port: Option<PortSet> = None;

    for i in 0..path.len() {
        let entry_dir = /* 前のセルからの方向 */;
        let exit_dir = /* 次のセルへの方向 */;

        // ポート制約を満たすタイルを検索
        // 入口ポート = 出口ポート（同一レーン維持）かつ
        // 入口ポート = required_entry_port（前タイルの出口と一致）
        let tile = find_tile_with_port_constraint(
            &tiles, entry_dir, exit_dir, required_entry_port
        );

        // 出口ポートを次のタイルの入口制約として伝播
        required_entry_port = tile.exit_port;
    }
}
```

## プロジェクト構成

```
one-stroke-editor/
├── apps/
│   └── editor-app/          # Vite + React フロントエンド
├── packages/
│   ├── lib/                  # 共有ライブラリ
│   │   └── src/
│   │       ├── tile-types.ts # タイル型定義
│   │       └── svg-paths.ts  # SVGパス生成
│   ├── crates/
│   │   └── road-tile-wasm/   # Rust WASM パス探索
│   │       └── src/lib.rs    # ハミルトン経路探索 + タイル割り当て
│   └── tile-generator/       # SVGタイル生成スクリプト
│       ├── generate.py
│       └── assets/
└── README.md
```

## 使用方法

### 開発

```bash
# 依存関係のインストール
pnpm install

# WASMビルド + 開発サーバー起動
pnpm dev
```

### ビルド

```bash
pnpm build
```

### タイル生成

```bash
cd packages/tile-generator
python3 generate.py
```

## 技術スタック

- **フロントエンド**: React + Vite + TypeScript
- **スタイリング**: TailwindCSS
- **パス探索**: Rust + WebAssembly (wasm-pack)
- **ビルドツール**: pnpm workspaces, Rslib

## ライセンス

MIT
