# Web Playground

`web/` は SubsetJuliaVM の静的ブラウザ Playground です。`web/pkg` の WASM package を読み込み、Monaco で Julia source を編集し、`run_from_source` で実行し、VM が返した Plotly artifact を描画します。

## ファイル

```text
web/
  index.html          page shell と script 読み込み順
  app.js              Playground state、Run、Share、出力描画
  julia-language.js   Monaco Julia syntax と Unicode 補完
  samples_ir.js       sample source。名前は historical
  styles.css          layout / theme
  plotly.min.js       2D/3D plot 用の local Plotly bundle
  server.py           WASM MIME type 対応の local static server
  test.html           browser sample runner
  test-runner.js      test.html 用 Playwright wrapper
  pkg/                wasm-pack 生成物
```

Rust や WASM API を変更したら `pkg/` を再生成します。

## ビルドと起動

リポジトリルートから:

```bash
scripts/wasm_build_with_cache.sh
cd web
python3 server.py
```

起動後:

```text
http://localhost:8080
```

Base cache を埋め込まない通常 build:

```bash
cd subset_julia_vm_web
wasm-pack build --target web --out-dir ../web/pkg
cd ../web
python3 server.py
```

## 実行時の挙動

Playground は editor 内容を常に次で実行します。

```javascript
wasm.run_from_source(code, BigInt(42));
```

結果は text output、numeric result、error、または Plotly graph として表示します。`using Plots; plot(sin)` は `artifact_mime = "application/vnd.plotly+json"` を返し、`plotly.min.js` で描画されます。

startup 後、`app.js` は warmup として次を一度実行します。warmup が終わるまで Run button は無効です。

```julia
using Plots
plot(sin)
```

これは初回の user plot 実行と同じ WASM compile path を温めるためです。画面の出力は更新しません。

## Samples

sample は `samples_ir.js` に定義します。

```javascript
{
  name: "Plot - sin curve",
  code: `using Plots
plot(sin)`,
  ir: null
}
```

Playground は `code` field を使います。`ir` field は古い test path との互換用なので、通常は `null` のままにします。

チュートリアル lesson は同じ配列に `tutorial` metadata を足します。実行後の軽い達成判定は browser 側で `success`、stdout の部分一致、または Plotly artifact の有無を見ます。

```javascript
{
  name: "Tutorial 1 - Values and output",
  code: `x = 41
println("x + 1 = ", x + 1)`,
  ir: null,
  tutorial: {
    lesson: 1,
    title: "Values and output",
    concept: "Names bind values, and println writes each result to stdout.",
    task: "Change x and run the code.",
    checks: [{ label: "prints the computed expression", outputIncludes: "x + 1 = 42" }]
  }
}
```

`samples_ir.js` を変更したら、`app.js` の import query を上げます。

```javascript
import { samplesIR } from './samples_ir.js?v=27';
```

## Plotly

plot 描画は local file の `plotly.min.js` に依存します。CDN に依存しないことと、Monaco の AMD loader が Plotly の UMD registration を横取りしないことが目的です。

Plotly version を変える場合:

1. `web/plotly.min.js` を置き換える。
2. `index.html` の `plotly.min.js?v=...` query を更新する。
3. browser で `using Plots; plot(sin)` と 3D sample を確認する。

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

初回実行が遅い場合は、embedded Base cache が使われていないか、startup warmup がまだ終わっていない可能性があります。`scripts/wasm_build_with_cache.sh` は Base compile cost を避けるための helper で、`run_from_source` の cold path 全体を単独で消すものではありません。
