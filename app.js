// SubsetJuliaVM Playground - Main Application (Monaco Editor version)
// Uses run_from_source() for native parity - pure Rust parser, no tree-sitter dependency
import { samplesIR } from './samples_ir.js?v=27';
import { registerJuliaLanguage, setWasmModule } from './julia-language.js?v=4';

// Elements
const sampleSelect = document.getElementById('sample-select');
const runBtn = document.getElementById('run-btn');
const shareBtn = document.getElementById('share-btn');
const copySourceBtn = document.getElementById('copy-source-btn');
const output = document.getElementById('output');
const result = document.getElementById('result');
const errorDiv = document.getElementById('error');
const versionSpan = document.getElementById('version');
const copyBtn = document.getElementById('copy-btn');
const clearOutputBtn = document.getElementById('clear-output-btn');
const plotOutput = document.getElementById('plot-output');
const tutorialPanel = document.getElementById('tutorial-panel');
const tutorialProgress = document.getElementById('tutorial-progress');
const tutorialTitle = document.getElementById('tutorial-title');
const tutorialConcept = document.getElementById('tutorial-concept');
const tutorialTask = document.getElementById('tutorial-task');
const tutorialChecks = document.getElementById('tutorial-checks');
const tutorialPrevBtn = document.getElementById('tutorial-prev-btn');
const tutorialNextBtn = document.getElementById('tutorial-next-btn');

// ============================================================
// URL Sharing Functions
// ============================================================

/**
 * Get code from URL hash
 * @returns {string | null} Decoded code or null if not present/invalid
 */
function getCodeFromHash() {
    const hash = window.location.hash;
    if (!hash || hash.length < 3) return null;

    // Parse hash parameters (e.g., #c=encoded_code)
    const params = new URLSearchParams(hash.substring(1));
    const encoded = params.get('c');
    if (!encoded) return null;

    try {
        const decoded = LZString.decompressFromEncodedURIComponent(encoded);
        if (!decoded) {
            throw new Error('Decompression returned null');
        }
        return decoded;
    } catch (e) {
        console.error('Failed to decode code from URL:', e);
        return null;
    }
}

/**
 * Set code to URL hash using history.replaceState (doesn't pollute history)
 * @param {string} code - Code to encode into URL
 * @returns {string} The full shareable URL
 */
function setCodeToHash(code) {
    const encoded = LZString.compressToEncodedURIComponent(code);
    const newHash = `#c=${encoded}`;

    // Use replaceState to avoid polluting browser history
    const newUrl = `${window.location.origin}${window.location.pathname}${newHash}`;
    history.replaceState(null, '', newUrl);

    return newUrl;
}

/**
 * Copy shareable URL to clipboard
 * @param {string} code - Code to share
 * @returns {Promise<string>} The generated URL
 */
async function copyShareUrl(code) {
    const url = setCodeToHash(code);

    try {
        await navigator.clipboard.writeText(url);
        return url;
    } catch (e) {
        console.error('Clipboard API failed:', e);
        // Fallback for older browsers or when clipboard API is not available
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (e2) {
            console.error('Fallback copy failed:', e2);
            // If all copy methods fail, show the URL so user can copy manually
            throw new Error(`Could not copy automatically. URL: ${url}`);
        } finally {
            document.body.removeChild(textArea);
        }
        return url;
    }
}

/**
 * Restore code from URL hash if present
 * @returns {boolean} True if code was restored from hash
 */
function restoreCodeFromHash() {
    const code = getCodeFromHash();
    if (code !== null && editor) {
        editor.setValue(code);
        sampleSelect.value = ''; // Clear sample selection
        currentSampleIndex = -1;
        renderTutorialPanel(null);
        return true;
    }
    return false;
}

// State
let wasm = null;
let editor = null;
let currentSampleIndex = -1;
let warmupPromise = null;
let warmupHandle = null;
let warmupHandleType = null;
let warmupScheduled = false;
const tutorialSampleIndexes = samplesIR
    .map((sample, idx) => sample.tutorial ? idx : -1)
    .filter((idx) => idx >= 0);

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
    runBtn.disabled = true;
    runBtn.textContent = 'Loading...';

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

    // Try to restore code from URL hash first
    const hash = window.location.hash;
    let restoredFromHash = false;

    if (hash && hash.includes('c=')) {
        const code = getCodeFromHash();
        if (code !== null && editor) {
            editor.setValue(code);
            sampleSelect.value = ''; // Clear sample selection
            currentSampleIndex = -1;
            renderTutorialPanel(null);
            restoredFromHash = true;
        } else if (hash.includes('c=')) {
            // Hash exists but decoding failed - show error
            showError('Failed to decode shared code from URL. The link may be corrupted.');
        }
    }

    // Load first sample only if not restored from hash
    if (!restoredFromHash && samplesIR.length > 0 && editor) {
        loadSample(0);
    } else if (restoredFromHash) {
        renderTutorialPanel(null);
    }

    runBtn.disabled = false;
    runBtn.textContent = runButtonText;

    if (wasm) {
        scheduleWarmup();
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
    const tutorialGroup = document.createElement('optgroup');
    tutorialGroup.label = 'Tutorial';
    const sampleGroup = document.createElement('optgroup');
    sampleGroup.label = 'Samples';

    samplesIR.forEach((sample, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = sample.name;
        if (sample.tutorial) {
            tutorialGroup.appendChild(option);
        } else {
            sampleGroup.appendChild(option);
        }
    });

    if (tutorialGroup.children.length > 0) {
        sampleSelect.appendChild(tutorialGroup);
    }
    if (sampleGroup.children.length > 0) {
        sampleSelect.appendChild(sampleGroup);
    }
}

function loadSample(idx) {
    const sample = samplesIR[idx];
    if (!sample || !editor) return;

    editor.setValue(sample.code);
    currentSampleIndex = idx;
    sampleSelect.value = String(idx);
    hideError();
    result.textContent = '';
    renderTutorialPanel(sample);
}

function setupEventListeners() {
    // Sample selection
    sampleSelect.addEventListener('change', (e) => {
        const idx = parseInt(e.target.value);
        if (!isNaN(idx)) {
            loadSample(idx);
        } else {
            currentSampleIndex = -1;
            renderTutorialPanel(null);
        }
    });

    // Run button
    runBtn.addEventListener('click', run);

    // Share URL button
    shareBtn.addEventListener('click', shareCode);

    // Copy source button
    copySourceBtn.addEventListener('click', copySource);

    // Copy button
    copyBtn.addEventListener('click', copyOutput);

    // Clear output button
    clearOutputBtn.addEventListener('click', () => {
        output.textContent = '';
        output.classList.remove('hidden');
        if (typeof Plotly !== 'undefined') {
            try { Plotly.purge(plotOutput); } catch (_) {}
        }
        plotOutput.innerHTML = '';
        plotOutput.classList.add('hidden');
        result.textContent = '';
        hideError();
        renderTutorialPanel(samplesIR[currentSampleIndex]);
    });

    tutorialPrevBtn.addEventListener('click', () => {
        const tutorialPos = tutorialSampleIndexes.indexOf(currentSampleIndex);
        if (tutorialPos > 0) {
            loadSample(tutorialSampleIndexes[tutorialPos - 1]);
        }
    });

    tutorialNextBtn.addEventListener('click', () => {
        const tutorialPos = tutorialSampleIndexes.indexOf(currentSampleIndex);
        if (tutorialPos >= 0 && tutorialPos < tutorialSampleIndexes.length - 1) {
            loadSample(tutorialSampleIndexes[tutorialPos + 1]);
        }
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

async function shareCode() {
    if (!editor) return;
    const code = editor.getValue();
    if (!code) {
        showError('No code to share.');
        return;
    }

    try {
        await copyShareUrl(code);
        shareBtn.textContent = 'Copied!';
        shareBtn.classList.add('copied');
        setTimeout(() => {
            shareBtn.textContent = 'Share URL';
            shareBtn.classList.remove('copied');
        }, 1500);
    } catch (e) {
        // Show error message with URL if clipboard failed
        showError(e.message);
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

function renderTutorialPanel(sample, evaluatedChecks = null) {
    if (!sample || !sample.tutorial) {
        tutorialPanel.classList.add('hidden');
        tutorialChecks.innerHTML = '';
        tutorialPrevBtn.disabled = true;
        tutorialNextBtn.disabled = true;
        return;
    }

    const tutorial = sample.tutorial;
    const tutorialPos = tutorialSampleIndexes.indexOf(currentSampleIndex);
    tutorialPanel.classList.remove('hidden');
    tutorialProgress.textContent = `Lesson ${tutorial.lesson} of ${tutorialSampleIndexes.length}`;
    tutorialTitle.textContent = tutorial.title;
    tutorialConcept.textContent = tutorial.concept;
    tutorialTask.textContent = tutorial.task;

    tutorialChecks.innerHTML = '';
    const checks = evaluatedChecks || tutorial.checks.map((check) => ({
        ...check,
        state: 'pending'
    }));

    checks.forEach((check) => {
        const row = document.createElement('div');
        row.className = `tutorial-check tutorial-check-${check.state}`;

        const state = document.createElement('span');
        state.className = 'tutorial-check-state';
        state.textContent = check.state === 'pass'
            ? 'Pass'
            : check.state === 'fail'
                ? 'Fail'
                : 'Pending';

        const label = document.createElement('span');
        label.className = 'tutorial-check-label';
        label.textContent = check.label;

        row.appendChild(state);
        row.appendChild(label);
        tutorialChecks.appendChild(row);
    });

    tutorialPrevBtn.disabled = tutorialPos <= 0;
    tutorialNextBtn.disabled = tutorialPos < 0 || tutorialPos >= tutorialSampleIndexes.length - 1;
}

function evaluateTutorialChecks(execResult) {
    const sample = samplesIR[currentSampleIndex];
    if (!sample || !sample.tutorial) return;

    const checks = sample.tutorial.checks.map((check) => {
        let passed = Boolean(execResult.success);
        if (passed && check.outputIncludes) {
            passed = (execResult.output || '').includes(check.outputIncludes);
        }
        if (passed && check.artifactMime) {
            passed = execResult.artifact_mime === check.artifactMime && Boolean(execResult.artifact_data);
        }
        if (passed && Object.prototype.hasOwnProperty.call(check, 'value')) {
            passed = execResult.value === check.value;
        }
        return {
            ...check,
            state: passed ? 'pass' : 'fail'
        };
    });

    renderTutorialPanel(sample, checks);
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

    cancelScheduledWarmup();

    // Update URL hash with current code for reproducibility
    setCodeToHash(code);

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
        await displayResult(execResult);
        evaluateTutorialChecks(execResult);
    } catch (e) {
        showError(e.message || 'Execution failed');
        evaluateTutorialChecks({
            success: false,
            output: '',
            artifact_mime: '',
            artifact_data: '',
            value: NaN
        });
    } finally {
        runBtn.disabled = false;
        runBtn.textContent = runButtonText;
        scheduleWarmup();
    }
}

async function displayResult(execResult) {
    // Reset both output areas on every run
    plotOutput.innerHTML = '';
    plotOutput.classList.add('hidden');
    output.textContent = '';
    output.classList.remove('hidden');

    if (execResult.success) {
        const mime = execResult.artifact_mime;
        const data = execResult.artifact_data;
        if (mime === 'application/vnd.plotly+json' && data) {
            // Plotly plot (2D and 3D both render through Plotly — Issue #5283).
            plotOutput.classList.remove('hidden');
            plotOutput.style.height = '450px';
            try {
                const parsed = JSON.parse(data);
                if (typeof Plotly !== 'undefined') {
                    const traces = parsed.traces || [];
                    const layout = themedPlotlyLayout(parsed.layout || {});
                    await Plotly.newPlot(plotOutput, traces, layout, { responsive: true });
                    Plotly.Plots.resize(plotOutput);
                    if (plotOutput.children.length === 0) {
                        plotOutput.textContent = '[Plotly rendered no visible output]';
                    } else {
                        result.textContent = 'Rendered plot';
                    }
                } else {
                    plotOutput.textContent = '[Plotly.js not loaded - cannot render plot]';
                }
            } catch (e) {
                plotOutput.textContent = `[Plotly render error: ${e.message}]`;
            }
            if (execResult.output) {
                output.textContent = execResult.output;
            } else {
                output.classList.add('hidden');
            }
        } else {
            // Normal text output
            if (execResult.output) {
                output.textContent += execResult.output;
            }
            if (execResult.value !== 0 && !isNaN(execResult.value)) {
                result.textContent = `Result: ${execResult.value}`;
            } else if (!execResult.output) {
                result.textContent = 'Completed';
            }
        }
    } else {
        // Show partial output even on error
        if (execResult.output) {
            output.textContent += execResult.output;
        }
        showError(execResult.error_message || 'Execution failed');
    }
}

function themedPlotlyLayout(layout) {
    const themed = {
        ...layout,
        paper_bgcolor: layout.paper_bgcolor || '#1e1f1c',
        plot_bgcolor: layout.plot_bgcolor || '#272822',
        font: { color: '#f8f8f2', ...(layout.font || {}) },
        margin: { l: 48, r: 20, t: 24, b: 48, ...(layout.margin || {}) }
    };

    themed.xaxis = themedAxis(layout.xaxis);
    themed.yaxis = themedAxis(layout.yaxis);
    if (layout.scene) {
        themed.scene = {
            ...layout.scene,
            xaxis: themedAxis(layout.scene.xaxis),
            yaxis: themedAxis(layout.scene.yaxis),
            zaxis: themedAxis(layout.scene.zaxis)
        };
    }
    return themed;
}

function themedAxis(axis = {}) {
    return {
        ...axis,
        color: axis.color || '#f8f8f2',
        gridcolor: axis.gridcolor || '#4a4a40',
        zerolinecolor: axis.zerolinecolor || '#75715e',
        linecolor: axis.linecolor || '#75715e'
    };
}

function warmupWasm() {
    if (!wasm) {
        return Promise.resolve();
    }
    if (warmupPromise) {
        return warmupPromise;
    }
    warmupPromise = new Promise((resolve) => {
        try {
            // Warm the same web execution path used by the first plot run (Issue #6022).
            wasm.run_from_source('using Plots\nplot(sin)\n', BigInt(42));
            console.log('WASM plot warmup completed');
        } catch (e) {
            console.warn('WASM plot warmup failed:', e);
        } finally {
            resolve();
        }
    });

    return warmupPromise;
}

function scheduleWarmup() {
    if (!wasm || warmupPromise || warmupScheduled) {
        return;
    }

    warmupScheduled = true;
    const startWarmup = () => {
        warmupHandle = null;
        warmupHandleType = null;
        warmupScheduled = false;
        warmupWasm();
    };

    warmupHandle = window.setTimeout(() => {
        warmupHandle = null;
        warmupHandleType = null;
        if ('requestIdleCallback' in window) {
            warmupHandle = window.requestIdleCallback(startWarmup, { timeout: 3000 });
            warmupHandleType = 'idle';
        } else {
            startWarmup();
        }
    }, 2000);
    warmupHandleType = 'timeout';
}

function cancelScheduledWarmup() {
    if (!warmupScheduled || warmupHandle === null) {
        return;
    }

    if (warmupHandleType === 'idle' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(warmupHandle);
    } else {
        window.clearTimeout(warmupHandle);
    }
    warmupHandle = null;
    warmupHandleType = null;
    warmupScheduled = false;
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
