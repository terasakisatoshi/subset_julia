// SubsetJuliaVM Playground - Main Application (Monaco Editor version)
import { samplesIR } from './samples_ir.js?v=23';
import { registerJuliaLanguage, setWasmModule } from './julia-language.js?v=3';

// Note: lowering.js is no longer needed - we use Rust-based lowering via run_from_cst_json

// TreeSitter will be loaded dynamically
let TreeSitter = null;

// Elements
const sampleSelect = document.getElementById('sample-select');
const runBtn = document.getElementById('run-btn');
const copySourceBtn = document.getElementById('copy-source-btn');
const output = document.getElementById('output');
const result = document.getElementById('result');
const errorDiv = document.getElementById('error');
const versionSpan = document.getElementById('version');
const copyBtn = document.getElementById('copy-btn');
const clearOutputBtn = document.getElementById('clear-output-btn');

// State
let wasm = null;
let parser = null;
let editor = null;
let currentSampleIndex = 0;

// Detect macOS
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const runShortcut = isMac ? '⌘+Enter' : 'Ctrl+Enter';
const runButtonText = `Run (${runShortcut})`;

// Initialize the application
async function init() {
    // Set button text with platform-appropriate shortcut
    runBtn.textContent = runButtonText;

    // Populate sample selector
    populateSamples();

    // Set up event listeners
    setupEventListeners();

    // Load WASM module, parser, and Monaco in parallel
    await Promise.all([loadWasm(), loadParser(), loadMonaco()]);

    // Set WASM module for Unicode completion provider
    if (wasm) {
        setWasmModule(wasm);
    }

    // Display version
    if (wasm) {
        versionSpan.textContent = `SubsetJuliaVM v${wasm.get_version()}`;
    }

    // Load first sample
    if (samplesIR.length > 0 && editor) {
        editor.setValue(samplesIR[0].code);
        currentSampleIndex = 0;
    }
}

async function loadMonaco() {
    return new Promise((resolve) => {
        require.config({
            paths: {
                'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
            }
        });

        require(['vs/editor/editor.main'], function(monaco) {
            // Register Julia language
            registerJuliaLanguage(monaco);

            // Create editor instance
            editor = monaco.editor.create(document.getElementById('monaco-container'), {
                value: 'println("Hello, World!")',
                language: 'julia',
                theme: 'julia-monokai',
                fontSize: 14,
                fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                fontLigatures: true,
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'off',
                renderWhitespace: 'none',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 10, bottom: 10 },
                lineHeight: 21,
                renderLineHighlight: 'line',
                scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    useShadows: false,
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10
                }
            });

            // Add keyboard shortcut for running code
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, function() {
                run();
            });

            resolve();
        });
    });
}

async function loadParser() {
    try {
        // Dynamically import TreeSitter (v0.25.x uses named exports)
        console.log('Loading TreeSitter module...');
        const { Parser: TSParser, Language } = await import('https://cdn.jsdelivr.net/npm/web-tree-sitter@0.25.3/tree-sitter.js');
        TreeSitter = { Parser: TSParser, Language };
        console.log('TreeSitter module loaded');

        console.log('Initializing Parser...');
        await TSParser.init();
        console.log('Parser initialized');

        parser = new TSParser();
        console.log('Loading Julia language WASM...');
        const Julia = await Language.load('./tree-sitter-julia.wasm');
        parser.setLanguage(Julia);
        console.log('Parser loaded successfully');
    } catch (e) {
        console.error('Parser loading failed:', e);
    }
}

function populateSamples() {
    samplesIR.forEach((sample, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = sample.name;
        sampleSelect.appendChild(option);
    });
}

function setupEventListeners() {
    // Sample selection
    sampleSelect.addEventListener('change', (e) => {
        const idx = parseInt(e.target.value);
        if (!isNaN(idx) && samplesIR[idx] && editor) {
            editor.setValue(samplesIR[idx].code);
            currentSampleIndex = idx;
            hideError();
        }
    });

    // Run button
    runBtn.addEventListener('click', run);

    // Copy source button
    copySourceBtn.addEventListener('click', copySource);

    // Copy button
    copyBtn.addEventListener('click', copyOutput);

    // Clear output button
    clearOutputBtn.addEventListener('click', () => {
        output.textContent = '';
        result.textContent = '';
        hideError();
    });
}

async function copySource() {
    if (!editor) return;
    const text = editor.getValue();
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
        copySourceBtn.textContent = 'Copied!';
        copySourceBtn.classList.add('copied');
        setTimeout(() => {
            copySourceBtn.textContent = 'Copy';
            copySourceBtn.classList.remove('copied');
        }, 1500);
    } catch (e) {
        console.error('Failed to copy:', e);
    }
}

async function copyOutput() {
    const text = output.textContent;
    if (!text) {
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        // Show visual feedback
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 1500);
    } catch (e) {
        console.error('Failed to copy:', e);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 1500);
        } catch (e2) {
            console.error('Fallback copy failed:', e2);
        }
        document.body.removeChild(textArea);
    }
}

async function loadWasm() {
    try {
        // Try to load the WASM module
        const module = await import('./pkg/subset_julia_vm_web.js');
        await module.default();
        wasm = module;
        console.log('WASM module loaded successfully');
    } catch (e) {
        console.warn('WASM module not available:', e);
        output.textContent = 'WASM module not loaded. Please run:\n\n' +
            '  cd subset_julia_vm_web\n' +
            '  wasm-pack build --target web --out-dir ../web/pkg\n\n' +
            'Then refresh this page.';
    }
}

async function run() {
    if (!wasm) {
        showError('WASM module not loaded. Build it first with wasm-pack.');
        return;
    }

    if (!editor) {
        showError('Editor not loaded yet.');
        return;
    }

    const code = editor.getValue();
    const seed = 42;

    // Hide previous errors (but keep output for accumulation)
    hideError();
    result.textContent = '';

    // Disable run button while executing
    runBtn.disabled = true;
    runBtn.textContent = 'Running...';

    try {
        // First, check if this matches a pre-compiled sample (with normalized whitespace)
        const normalizedCode = code.trim();
        console.log('Looking for pre-compiled sample...');
        console.log('Code length:', normalizedCode.length);
        const sample = samplesIR.find(s => s.code.trim() === normalizedCode);
        console.log('Found sample:', sample ? sample.name : 'none');

        if (sample && sample.ir) {
            // Execute using pre-compiled IR
            console.log('Using pre-compiled IR for:', sample.name);
            const execResult = wasm.run_ir_json(sample.ir, BigInt(seed));
            displayResult(execResult);
        } else if (parser) {
            // Parse and compile custom code
            console.log('Using WASM-side lowering for custom code');
            await runCustomCode(code, seed);
        } else {
            showError('Parser not loaded. Custom code execution requires the Julia parser.');
        }

    } catch (e) {
        showError(e.message || 'Execution failed');
    } finally {
        runBtn.disabled = false;
        runBtn.textContent = runButtonText;
    }
}

async function runCustomCode(code, seed) {
    try {
        // Parse with tree-sitter
        console.log('Parsing code...');
        const tree = parser.parse(code);
        console.log('Parse tree:', tree.rootNode.toString());

        // Check for parse errors
        if (tree.rootNode.hasError) {
            // Find error nodes
            const errors = findErrors(tree.rootNode);
            if (errors.length > 0) {
                showError(`Parse error at line ${errors[0].startPosition.row + 1}: unexpected syntax`);
                return;
            }
        }

        // Serialize CST to JSON (for Rust-based lowering)
        console.log('Serializing CST to JSON...');
        const cstJson = serializeCst(tree.rootNode, code);
        console.log('CST JSON length:', cstJson.length);

        // Execute using Rust-based lowering
        console.log('Executing with Rust-based lowering...');
        const execResult = wasm.run_from_cst_json(cstJson, code, BigInt(seed));

        displayResult(execResult);

    } catch (e) {
        console.error('Error:', e);
        showError(`Compilation error: ${e.message}`);
    }
}

// Serialize a tree-sitter node to JSON format expected by JsonCstNode
function serializeCst(node, source) {
    return JSON.stringify(serializeNode(node, source));
}

// Recursively serialize a tree-sitter node
function serializeNode(node, source) {
    // Extract text from source using byte indices
    // This is more reliable than node.text which may not always be available
    const text = source.substring(node.startIndex, node.endIndex);

    const result = {
        type: node.type,
        start: node.startIndex,
        end: node.endIndex,
        start_line: node.startPosition.row + 1, // 1-indexed
        end_line: node.endPosition.row + 1,     // 1-indexed
        start_column: node.startPosition.column + 1, // 1-indexed
        end_column: node.endPosition.column + 1,     // 1-indexed
        is_named: node.isNamed,
        text: text,
        children: []
    };

    // Serialize all children
    for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) {
            result.children.push(serializeNode(child, source));
        }
    }

    return result;
}

function findErrors(node, errors = []) {
    if (node.type === 'ERROR' || node.isMissing) {
        errors.push(node);
    }
    for (let i = 0; i < node.childCount; i++) {
        findErrors(node.child(i), errors);
    }
    return errors;
}

function displayResult(execResult) {
    if (execResult.success) {
        // Accumulate output (like iOS app)
        if (execResult.output) {
            output.textContent += execResult.output;
        }
        if (execResult.value !== 0 && !isNaN(execResult.value)) {
            result.textContent = `Result: ${execResult.value}`;
        } else if (!execResult.output) {
            result.textContent = 'Completed';
        }
    } else {
        // Show partial output even on error
        if (execResult.output) {
            output.textContent += execResult.output;
        }
        showError(execResult.error_message || 'Execution failed');
    }
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

// Start the application
init();
