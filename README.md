# Web Playground

`web/` は SubsetJuliaVM の静的ブラウザ Playground です。`web/pkg` の WASM package を読み込み、Julia source を編集し、`run_from_source` で実行し、VM が返した Plotly artifact を描画します。

## ファイル

```text
web/
  index.html          page shell と script 読み込み順
  app.js              Playground state、Run、Share、出力描画、サンプル選択 dropdown
  julia-language.js   Monaco Editor 用 Julia syntax 定義・補完
  samples_ir.js       sample source。iOS アプリのサンプルと同一内容
  styles.css          layout / theme（モバイルファースト）
  plotly.min.js       2D/3D plot 用の local Plotly bundle
  jsxgraph.min.js     JSXGraph board 描画用の local bundle（iOS と同一 1.12.2, Issue #7286）
  server.py           WASM MIME type 対応の local static server
  test.html           browser sample runner
  test-runner.js      test.html 用 Playwright wrapper
  pkg/                wasm-pack 生成物
```

Rust や WASM API を変更したら `pkg/` を再生成します。

## ビルドと起動

リポジトリルートから:

```bash
scripts/wasm_build_with_cache.sh --out-dir ./web/pkg
cd web
python3 server.py
```

`--out-dir` を省略すると wasm-pack のデフォルト (`subset_julia_vm_web/pkg/`) に
出力され、`web/pkg` は更新されません。相対パスはスクリプト呼び出し時の
カレントディレクトリ基準で解決されます。

起動後:

```text
http://localhost:8080
```

Base cache を埋め込まない通常 build:

```bash
cd subset_julia_vm_web
wasm-pack build --target web --profile web-release --out-dir ../web/pkg
cd ../web
python3 server.py
```

## 実行時の挙動

Playground は editor 内容を常に次で実行します。

```javascript
wasm.run_from_source(code, BigInt(42));
```

結果は text output、numeric result、error、Plotly graph、または JSXGraph board として表示します。`using Plots; plot(sin)` は `artifact_mime = "application/vnd.plotly+json"` を返し `plotly.min.js` で描画されます。`using JSXGraph; html(board)` は `artifact_mime = "application/vnd.jsxgraph+json"` を返し、`app.js::renderJsxgraph` が `jsxgraph.min.js` でインタラクティブな board を描画します(Issue #7286)。

startup 中、`app.js` は 2 段階の warmup を実行します。どちらも画面の出力は更新しません。

1. **Base warmup** — `1 + 1` を一度実行し、embedded Base bytecode cache の
   deserialize/restore(初回 `run_from_source` の一回限りのコスト)を先に払います。
   Run button はこれが完了した時点で有効になるため、`println` だけの user は
   Plots warmup を待ちません。
2. **Plot warmup** — `using Plots; plot(sin)` を idle callback 経由で
   critical path の外で実行し、Plots package の compile path を温めます
   (Issue #6127)。Run はこれをブロックしません。

## モバイル UI

- 狭い画面では **Edit / Output** のタブ切り替えになります。
- エディタは Monaco Editor（CDN の loader 経由で読み込み、`julia-language.js` で Julia syntax を登録）です。
- サンプル選択は画面上部の dropdown（`<select>`、カテゴリ別 optgroup）です。
- デスクトップではエディタと出力が左右に並びます（768px 以上）。

## Samples

sample は iOS アプリ (`SubsetJuliaVMApp/SubsetJuliaVMApp/Resources/Samples/`) と同一の `samples.json` + `.jl` ファイルから `web/samples_ir.js` に変換されます。

```javascript
{
  id: "hello_world",
  name: "Hello World",
  category: "Basic",
  description: "The classic first program...",
  difficulty: "Beginner",
  tags: ["print", "string"],
  folder: "beginner",
  code: `...`,
  ir: null,
  webUnsupported: false
}
```

Playground は `code` field を使います。`ir` field は historical な名前の残りです。bundled package に依存する sample(Primes、Symbolics、Distributions、JSXGraph、Plots/Interact)も含め、現在は全 sample が web build で end-to-end に実行できるため、すべて `webUnsupported: false` です(Issue #7286 / #7310)。web build で本当に実行できない sample を追加する場合のみ `true` にします。

`samples_ir.js` を変更したら、`app.js` の import query を上げます(現在 `?v=2`)。

```javascript
import { samplesIR } from './samples_ir.js?v=2';
```

## Plotly / JSXGraph

plot/board 描画は local file の `plotly.min.js` と `jsxgraph.min.js` に依存します(CDN 非依存)。

どちらも UMD ラッパを持ち、Monaco の RequireJS loader(`define.amd` を定義)が**先に**読み込まれると、グローバル `Plotly` / `JXG` を設定せず AMD module として登録してしまい、プロット/ボードが無言で描画されなくなります(Issue #7286)。そのため `index.html` では両スクリプトを **Monaco loader より前**(`<head>` 内)に読み込みます。順序を変えないでください。

Plotly version を変える場合:

1. `web/plotly.min.js` を置き換える。
2. `index.html` の `plotly.min.js?v=...` query を更新する。
3. browser で `using Plots; plot(sin)` と 3D sample を確認する。

JSXGraph version を変える場合:

1. `web/jsxgraph.min.js` を置き換える(iOS の `SubsetJuliaVMApp/.../Resources/jsxgraph.min.js` と揃える)。
2. `index.html` の `jsxgraph.min.js?v=...` query を更新する。
3. browser で `jsxgraph_demo` / `apollonian_gasket` sample を確認する。

## 検証

Rust 側の WASM binding test:

```bash
timeout 1800 cargo nextest run --release -p subset_julia_vm_web
```

browser sample runner:

```bash
cd web
python3 server.py
node test-runner.js --server-url=http://localhost:8080
```

Playwright runner にはローカル環境で使える browser installation が必要です。

## よくある失敗

`WASM module not loaded` は `web/pkg` がない、または古い状態です。`wasm-pack` で再ビルドします。

`Plotly.js not loaded` は `app.js` が artifact を描画する前に `plotly.min.js` が実行されていない状態です。`index.html` の script order と browser console を確認します。

初回実行が遅い場合は、embedded Base cache が使われていないか、startup warmup が失敗している可能性があります。`scripts/wasm_build_with_cache.sh` は Base compile cost を避けるための helper で、`run_from_source` の cold path 全体を単独で消すものではありません。
