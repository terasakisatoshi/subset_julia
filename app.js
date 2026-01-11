// SubsetJuliaVM Playground - Main Application (Monaco Editor version)
// Uses run_from_source() for native parity - pure Rust parser, no tree-sitter dependency
import { samplesIR } from './samples_ir.js?v=24';
import { registerJuliaLanguage, setWasmModule } from './julia-language.js?v=4';

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
let editor = null;
let currentSampleIndex = 0;

// Detect macOS
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const runShortcut = isMac ? '⌘+Enter' : 'Ctrl+Enter';
const runButtonText = `Run (${runShortcut})`;

// Initialize Split.js for resizable panels
function initSplit() {
    const isNarrow = window.innerWidth <= 900;
    const direction = isNarrow ? 'vertical' : 'horizontal';

    // Destroy existing split if any
    if (window.splitInstance) {
        window.splitInstance.destroy();
    }

    const minSize = isNarrow ? [100, 100] : [200, 150];

    window.splitInstance = Split(['.editor-container', '.output-container'], {
        sizes: [50, 50],
        minSize: minSize,
        gutterSize: 8,
        direction: direction,
        cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
        onDragEnd: function() {
            // Trigger Monaco editor resize
            if (editor) {
                editor.layout();
            }
        }
    });
}

// Initialize the application
async function init() {
    // Set button text with platform-appropriate shortcut
    runBtn.textContent = runButtonText;

    // Initialize Split.js
    initSplit();

    // Re-initialize on window resize to switch direction
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initSplit();
            if (editor) {
                editor.layout();
            }
        }, 100);
    });

    // Populate sample selector
    populateSamples();

    // Set up event listeners
    setupEventListeners();

    // Load WASM module and Monaco in parallel
    await Promise.all([loadWasm(), loadMonaco()]);

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
                },
                // Enable code completion
                quickSuggestions: true,
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                wordBasedSuggestions: 'off',
                suggest: {
                    snippetsPreventQuickSuggestions: false,
                    showKeywords: true,
                    showFunctions: true,
                    showVariables: true,
                    showConstants: true
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
        // Use run_from_source for all code (native parity - uses pure Rust parser)
        console.log('Executing with run_from_source (native parity)...');
        const execResult = wasm.run_from_source(code, BigInt(seed));
        displayResult(execResult);
    } catch (e) {
        showError(e.message || 'Execution failed');
    } finally {
        runBtn.disabled = false;
        runBtn.textContent = runButtonText;
    }
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

// Debug function exposed to window for console debugging
window.debugRun = function(code) {
    if (!wasm) {
        console.error('WASM not loaded');
        return null;
    }
    const result = wasm.run_from_source(code, BigInt(42));
    console.log('Result:', result);
    return result;
};
