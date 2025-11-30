# Road Tile SVG Generator

道路タイルの基本パターンSVGファイルを生成するPythonスクリプトです。
`svg-paths.ts` の `BASE_PATTERNS` と完全に一致する26種類のパターンを生成します。

## 使用方法

```bash
# 実行
python3 generate.py

# または
./generate.py
```

生成されたSVGファイルは `assets/` ディレクトリに出力されます。

## 生成されるタイル（26種類）

### カーブタイル（8種類）

**Up->Right 方向（4種類）**
| ファイル名 | 入口ポート | 出口ポート |
|------------|------------|------------|
| `curve-12-12.svg` | Up(P12) | Right(P12) |
| `curve-12-23.svg` | Up(P12) | Right(P23) |
| `curve-23-12.svg` | Up(P23) | Right(P12) |
| `curve-23-23.svg` | Up(P23) | Right(P23) |

**Up->Left 方向（4種類）**
| ファイル名 | 入口ポート | 出口ポート |
|------------|------------|------------|
| `curve-ul-12-12.svg` | Up(P12) | Left(P12) |
| `curve-ul-12-23.svg` | Up(P12) | Left(P23) |
| `curve-ul-23-12.svg` | Up(P23) | Left(P12) |
| `curve-ul-23-23.svg` | Up(P23) | Left(P23) |

### シャープタイル（8種類）

**Up->Right 方向（4種類）**
| ファイル名 | 入口ポート | 出口ポート |
|------------|------------|------------|
| `sharp-12-12.svg` | Up(P12) | Right(P12) |
| `sharp-12-23.svg` | Up(P12) | Right(P23) |
| `sharp-23-12.svg` | Up(P23) | Right(P12) |
| `sharp-23-23.svg` | Up(P23) | Right(P23) |

**Up->Left 方向（4種類）**
| ファイル名 | 入口ポート | 出口ポート |
|------------|------------|------------|
| `sharp-ul-12-12.svg` | Up(P12) | Left(P12) |
| `sharp-ul-12-23.svg` | Up(P12) | Left(P23) |
| `sharp-ul-23-12.svg` | Up(P23) | Left(P12) |
| `sharp-ul-23-23.svg` | Up(P23) | Left(P23) |

### 直線タイル（8種類）

**垂直方向（4種類）**
| ファイル名 | 入口ポート | 出口ポート | 説明 |
|------------|------------|------------|------|
| `straight-v-11.svg` | Up(P12) | Down(P12) | 直線 |
| `straight-v-22.svg` | Up(P23) | Down(P23) | 直線 |
| `straight-v-12.svg` | Up(P12) | Down(P23) | レーンシフト |
| `straight-v-21.svg` | Up(P23) | Down(P12) | レーンシフト |

**水平方向（4種類）**
| ファイル名 | 入口ポート | 出口ポート | 説明 |
|------------|------------|------------|------|
| `straight-h-44.svg` | Left(P12) | Right(P12) | 直線 |
| `straight-h-88.svg` | Left(P23) | Right(P23) | 直線 |
| `straight-h-48.svg` | Left(P12) | Right(P23) | レーンシフト |
| `straight-h-84.svg` | Left(P23) | Right(P12) | レーンシフト |

### マーカー（2種類）

| ファイル名 | 説明 |
|------------|------|
| `start.svg` | 始点マーカー |
| `goal.svg` | 終点マーカー |

## タイル仕様

- **タイルサイズ**: 40x40 ピクセル
- **グリッド分割**: 4x4 の格子（10ピクセル間隔）
- **道路幅**: 2レーン（2本の境界線で描画）

### ポートシステム

各辺には3つのポート位置があります：

- **Port 1**: 位置 10px
- **Port 2**: 位置 20px
- **Port 3**: 位置 30px

**ポートセット（PortSet）**:
- `P12`: Port 1,2 を使用（位置 10,20）
- `P23`: Port 2,3 を使用（位置 20,30）

## 設計背景

### 基本パターンと派生タイル

このジェネレーターは **基本パターン**（24種類 + マーカー2種類）を生成します。

アプリケーション側（`svg-paths.ts`）では、これらの基本パターンから回転・ミラーリング変換で **派生タイル**（40種類）を生成します。

### 変換ルール

- `rotate90`: Up->Right が Right->Down になる
- `rotate180`: Up->Right が Down->Left になる
- `rotate270`: Up->Right が Left->Up になる
- `mirrorX`: Up->Right が Up->Left になる

### レーン継続性ルール

- 外側境界（Port 1/3 側）は外側境界に接続
- 内側境界（Port 2 側）は内側境界に接続
- タイル内でレーンが交差しないようにする
