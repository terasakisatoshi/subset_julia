# subset_julia_vm_web

SubsetJuliaVM の WebAssembly バインディング。ブラウザで Julia サブセットコードを実行できる Playground を提供します。

## アーキテクチャ

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Web Browser                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────┐          ┌─────────────────────────────┐   │
│  │   Monaco Editor     │          │      Output Panel           │   │
│  │   (Julia syntax)    │          │  - println() 出力           │   │
│  └──────────┬──────────┘          │  - 実行結果                 │   │
│             │                      │  - エラーメッセージ         │   │
│             ▼                      └──────────────▲──────────────┘   │
│  ┌──────────────────────┐                        │                   │
│  │  web-tree-sitter     │                        │                   │
│  │  (Julia パーサー)     │                        │                   │
│  └──────────┬───────────┘                        │                   │
│             │ CST JSON                            │                   │
│             ▼                                     │                   │
│  ┌────────────────────────────────────────────────┴──────────────┐   │
│  │                    subset_julia_vm_web.wasm                    │   │
│  │   - CST JSON パース                                            │   │
│  │   - Lowering (CST → Core IR)                                   │   │
│  │   - Compiler (Core IR → Bytecode)                              │   │
│  │   - VM (Bytecode 実行)                                         │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  samples_ir.js (プリコンパイル済み IR JSON)                    │   │
│  └───────────────────────────────┬───────────────────────────────┘   │
│                                  ▼                                   │
│                    subset_julia_vm_web.wasm                           │
│                    - IR JSON パース → 実行                            │
└──────────────────────────────────────────────────────────────────────┘
```

## ビルド

### 必要なツール

```bash
# WASM ターゲットを追加
rustup target add wasm32-unknown-unknown

# wasm-pack をインストール
cargo install wasm-pack
```

### WASM ビルド

```bash
# subset_julia_vm_web ディレクトリ内で実行
wasm-pack build --target web --out-dir ../web/pkg
```

## ローカル開発

### クイックスタート

```bash
# subset_julia_vm_web ディレクトリ内で実行
wasm-pack build --target web --out-dir ../web/pkg && \
python3 -m http.server 8080 --directory ../web
```

ブラウザで http://localhost:8080 を開く。

### 開発サーバー（ホットリロードなし）

```bash
# 1. WASM をビルド (subset_julia_vm_web ディレクトリ内で実行)
wasm-pack build --target web --out-dir ../web/pkg

# 2. 別ターミナルでサーバー起動
python3 -m http.server 8080 --directory ../web
```

コード変更後は WASM の再ビルドが必要です。

## API

### ExecutionResult 型

```typescript
interface ExecutionResult {
    success: boolean;      // 実行が成功したかどうか
    value: number;         // 数値結果 (f64)
    output: string;        // println() 等の出力
    error_message: string | null;  // エラーメッセージ (成功時は null)
}
```

### `run_ir_json(ir_json: string, seed: number): ExecutionResult`

IR JSON を受け取り、コンパイル・実行して結果を返す。

```javascript
import init, { run_ir_json } from './pkg/subset_julia_vm_web.js';

await init();
const result = run_ir_json(irJsonString, 42);
console.log(result);
// { success: true, value: 3.14, output: "Hello, World!\n", error_message: null }
```

### `run_ir_simple(ir_json: string, seed: number): number`

IR JSON を受け取り、数値結果のみを返す。エラー時は NaN を返す。

```javascript
import { run_ir_simple } from './pkg/subset_julia_vm_web.js';
const value = run_ir_simple(irJsonString, 42);
console.log(value); // 3.14
```

### `get_version(): string`

SubsetJuliaVM のバージョンを返す。

```javascript
import { get_version } from './pkg/subset_julia_vm_web.js';
console.log(get_version()); // "0.1.0"
```

### `get_supported_features(): string[]`

サポートされている機能の一覧を返す。

```javascript
import { get_supported_features } from './pkg/subset_julia_vm_web.js';
console.log(get_supported_features());
// ["functions", "loops (for, while)", "conditionals (if/else)", "arrays (1D, 2D)",
//  "complex numbers", "structs", "modules", "try/catch/finally", "lambdas",
//  "higher-order functions (map, filter, reduce)", "broadcast operations (.*. .+)",
//  "random numbers (rand)", "math functions (sin, cos, sqrt, etc.)"]
```

### `get_unsupported_features(): string[]`

未サポートの機能の一覧を返す。

```javascript
import { get_unsupported_features } from './pkg/subset_julia_vm_web.js';
console.log(get_unsupported_features());
// ["using/import", "macro definitions", "eval()", "@generated", "C extensions"]
```

### Unicode 入力支援

Monaco Editor の補完機能で `\` をトリガーにし、カーソル直前の LaTeX 風プレフィックスを
WASM API の `unicode_completions(prefix)` に渡して候補を取得します。
WASM 側は `subset_julia_vm::unicode` の対応表から prefix 一致の候補を返し、補完確定時に
Unicode 文字へ置換します（例: `\alpha` → `α`）。

## 設計上の注意

### パーサーの分離

tree-sitter は C 言語実装を含むため、Rust→WASM コンパイルで ABI 非互換性問題があります。
そのため、パーサーは JS 側で web-tree-sitter を使用し、CST を JSON 化して WASM に渡します。
WASM 側で CST JSON を Lowering して Core IR を生成し、実行します。

```
Julia ソース → [JS: web-tree-sitter] → CST JSON → [WASM: JsonLowering] → Core IR → 実行結果
```

### 2つの実行モード

Playground は2つのモードでコードを実行します：

1. **プリコンパイル済みサンプル**: `samples_ir.js` に事前コンパイルされた IR を使用（高速）
2. **カスタムコード**: web-tree-sitter でパースし、CST JSON を WASM 側で Lowering

```javascript
// app.js での判定ロジック
if (sample && sample.ir) {
    // プリコンパイル済み IR を使用
    wasm.run_ir_json(sample.ir, seed);
} else if (parser) {
    // tree-sitter でパース → CST JSON を WASM へ
    const tree = parser.parse(code);
    const cstJson = serializeCst(tree.rootNode, code);
    wasm.run_from_cst_json(cstJson, code, seed);
}
```

### 機能フラグ

`subset_julia_vm` クレートの `parser` 機能を無効化して依存し、WASM 向けの機能を有効化：

```toml
[dependencies.subset_julia_vm]
path = "../subset_julia_vm"
default-features = false
features = ["wasm"]
```

## サンプルコードの更新

### samples_ir.js の構造

`../web/samples_ir.js` にはプリコンパイル済みサンプルが含まれています：

```javascript
{
    name: "Sample Name",
    code: `...Julia code...`,
    ir: `...IR JSON...`  // null の場合は JS lowering を使用
}
```

### IR JSON の生成方法

#### 方法1: Rust テストを使用

`subset_julia_vm/tests/` でテストを実行し、IR を出力：

```bash
cd subset_julia_vm

# テストコードに一時的に追加
# println!("{}", subset_julia_vm::compile_to_ir_str(code).unwrap());
cargo test -- --nocapture
```

#### 方法2: 簡単なスクリプトを作成

`subset_julia_vm/examples/gen_ir.rs` を作成：

```rust
use subset_julia_vm::compile_to_ir_str;

fn main() {
    let code = r#"
function factorial(n)
    if n <= 1
        return 1
    end
    n * factorial(n - 1)
end

factorial(10)
"#;

    if let Some(ir) = compile_to_ir_str(code) {
        println!("{}", ir);
    }
}
```

実行：

```bash
cd subset_julia_vm
cargo run --example gen_ir --features parser
```

#### 方法3: `ir: null` を使用（WASM 側 lowering）

新機能がまだ Rust parser でサポートされていない場合、`ir: null` を設定すると web-tree-sitter でパースした CST を JSON 化して WASM に渡し、WASM 側で Lowering します：

```javascript
{
    name: "New Sample",
    code: `@time some_function()`,
    ir: null  // CST JSON を WASM 側で Lowering
}
```

### 更新手順

1. **新しいサンプルを追加する場合**:
   ```bash
   # 1. コードを書いてテスト
   cd subset_julia_vm && cargo test

   # 2. IR を生成
   cargo run --example gen_ir --features parser

   # 3. samples_ir.js に追加
   ```

2. **既存サンプルを更新する場合**:
   - `code` を更新
   - 上記の方法で新しい IR を生成
   - `ir` フィールドを置き換え

3. **キャッシュ対策**:
   `app.js` のインポートバージョンを更新：
   ```javascript
   import { samplesIR } from './samples_ir.js?v=18';  // バージョンを上げる
   ```

### 注意事項

- `samples.js` は現在使用されていません（`samples_ir.js` のみ使用）
- `ir: null` のサンプルは実行が若干遅くなります（WASM 側で Lowering を行うため）
- IR JSON は1行に圧縮されるため、可読性は低いですが問題ありません

## 関連ファイル

| ファイル | 説明 |
|----------|------|
| `src/lib.rs` | wasm-bindgen エクスポート (WASM API) |
| `../web/index.html` | Playground HTML (Monaco Editor 読み込み) |
| `../web/app.js` | メインアプリケーション (実行制御) |
| `../web/lowering.js` | CST → Core IR 変換 (JavaScript 実装, 現在は未使用) |
| `../web/julia-language.js` | Monaco Editor 用 Julia 言語定義 |
| `../web/samples_ir.js` | プリコンパイル済みサンプルコード |
| `../web/tree-sitter-julia.wasm` | Julia パーサー (web-tree-sitter 用) |
| `../web/styles.css` | Playground スタイルシート |
