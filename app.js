// SubsetVM Playground - Main Application (Monaco Editor version)
import { samplesIR } from './samples_ir.js?v=20';
import { Lowering } from './lowering.js?v=6';
import { registerJuliaLanguage } from './julia-language.js?v=2';

// TreeSitter will be loaded dynamically
let TreeSitter = null;

// Elements
const sampleSelect = document.getElementById('sample-select');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const output = document.getElementById('output');
const result = document.getElementById('result');
const errorDiv = document.getElementById('error');
const versionSpan = document.getElementById('version');

// State
let wasm = null;
let parser = null;
let editor = null;
let currentSampleIndex = 0;

// Initialize the application
async function init() {
    // Populate sample selector
    populateSamples();

    // Set up event listeners
    setupEventListeners();

    // Load WASM module, parser, and Monaco in parallel
    await Promise.all([loadWasm(), loadParser(), loadMonaco()]);

    // Display version
    if (wasm) {
        versionSpan.textContent = `SubsetVM v${wasm.get_version()}`;
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

    // Clear button
    clearBtn.addEventListener('click', () => {
        output.textContent = '';
        result.textContent = '';
        hideError();
    });
}

async function loadWasm() {
    try {
        // Try to load the WASM module
        const module = await import('./pkg/subset_vm_web.js');
        await module.default();
        wasm = module;
        console.log('WASM module loaded successfully');
    } catch (e) {
        console.warn('WASM module not available:', e);
        output.textContent = 'WASM module not loaded. Please run:\n\n' +
            '  cd subset_vm_web\n' +
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
            console.log('Using JavaScript lowering for custom code');
            await runCustomCode(code, seed);
        } else {
            showError('Parser not loaded. Custom code execution requires the Julia parser.');
        }

    } catch (e) {
        showError(e.message || 'Execution failed');
    } finally {
        runBtn.disabled = false;
        runBtn.textContent = 'Run (Ctrl+Enter)';
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

        // Lower to Core IR
        console.log('Lowering to IR...');
        const lowering = new Lowering(code);
        const program = lowering.lower(tree);
        console.log('IR program:', JSON.stringify(program, null, 2));

        // Convert to JSON and execute
        const irJson = JSON.stringify(program);
        console.log('Executing IR...');
        const execResult = wasm.run_ir_json(irJson, BigInt(seed));

        displayResult(execResult);

    } catch (e) {
        console.error('Error:', e);
        showError(`Compilation error: ${e.message}`);
    }
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
