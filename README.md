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
│             │ Julia Source         │  - エラーメッセージ         │   │
│             ▼                      └──────────────▲──────────────┘   │
│  ┌────────────────────────────────────────────────┴──────────────┐   │
│  │                    subset_julia_vm_web.wasm                    │   │
│  │   - Pure Rust Parser (ネイティブと同一)                        │   │
│  │   - Lowering (CST → Core IR)                                   │   │
│  │   - Compiler (Core IR → Bytecode)                              │   │
│  │   - VM (Bytecode 実行)                                         │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Native と WASM の同一パイプライン

`run_from_source()` を使用することで、WASM とネイティブ実行で同一の実行パイプラインを使用：

```
Julia Source → Pure Rust Parser → JsonLowering → Compiler → VM → Result
```

これにより:
- **完全な動作の一致**: ネイティブとWASMで同じ結果が保証される
- **シンプルな構成**: web-tree-sitter 不要、JavaScript 側のパース処理不要
- **高速な起動**: tree-sitter WASM のロード時間が不要

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

## API

### `run_from_source(source: string, seed: bigint): ExecutionResult`

Julia ソースコードを直接実行します。Pure Rust パーサーを使用し、ネイティブと同一のパイプラインで実行されます。

```javascript
const result = wasm.run_from_source('println("Hello, World!")', BigInt(42));
console.log(result.output);  // "Hello, World!\n"
console.log(result.success); // true
```

### `run_ir_json(ir_json: string, seed: bigint): ExecutionResult`

プリコンパイル済み IR JSON を実行します（高速起動が必要な場合）。

### ExecutionResult

```typescript
interface ExecutionResult {
    success: boolean;
    value: number;
    output: string;
    error_message?: string;
}
```

## Unicode 補完 API

LaTeX 記号の Unicode 変換をサポートしています。

```javascript
// LaTeX → Unicode
wasm.unicode_lookup("\\alpha")  // "α"

// Unicode → LaTeX
wasm.unicode_reverse_lookup("α")  // "\\alpha"

// プレフィックスで補完候補を取得
wasm.unicode_completions("\\alp")  // [["\\alpha", "α"], ["\\Alpha", "Α"]]

// 文字列内の LaTeX をすべて展開
wasm.unicode_expand("f(\\alpha, \\beta)")  // "f(α, β)"
```

## ファイル構成

```
web/
├── index.html              # メインページ
├── app.js                  # アプリケーション（run_from_source を使用）
├── julia-language.js       # Monaco Editor の Julia 言語定義
├── samples_ir.js           # サンプルコード（プリコンパイル IR 付き）
├── styles.css              # スタイル
└── pkg/                    # wasm-pack で生成（要ビルド）
    ├── subset_julia_vm_web.js
    ├── subset_julia_vm_web_bg.wasm
    └── ...
```

## サンプルの追加方法

`samples_ir.js` にサンプルを追加：

```javascript
export const samplesIR = [
    {
        name: "Hello World",
        code: `println("Hello, World!")`,
        // ir は不要（run_from_source で直接実行）
    },
    // ...
];
```

## トラブルシューティング

### WASM モジュールがロードされない

```bash
# 1. WASM を再ビルド
cd subset_julia_vm_web
wasm-pack build --target web --out-dir ../web/pkg

# 2. ブラウザのキャッシュをクリア
# 3. ページをリロード
```

### パースエラーが発生する

Pure Rust パーサー（subset_julia_vm_parser）でサポートされていない構文の可能性があります。
サポートされている構文は `subset_julia_vm_parser/src/` を参照してください。
