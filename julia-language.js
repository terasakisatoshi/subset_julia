// Julia language definition for Monaco Editor
// Based on Monokai theme colors

// Store wasm module reference for completion provider
let wasmModule = null;

export function setWasmModule(wasm) {
    wasmModule = wasm;
}

export function registerJuliaLanguage(monaco) {
    // Register Julia language
    monaco.languages.register({ id: 'julia' });

    // Define tokenizer
    monaco.languages.setMonarchTokensProvider('julia', {
        keywords: [
            'end', 'if', 'elseif', 'else', 'for', 'while',
            'return', 'break', 'continue', 'let', 'in', 'do', 'begin',
            'try', 'catch', 'finally', 'throw',
            'struct', 'mutable', 'abstract', 'primitive', 'type',
            'module', 'baremodule', 'using', 'import', 'export',
            'const', 'global', 'local', 'where'
        ],

        builtins: [
            'println', 'print', 'sqrt', 'abs', 'sin', 'cos', 'tan',
            'exp', 'log', 'log10', 'floor', 'ceil', 'round',
            'min', 'max', 'sum', 'prod', 'length', 'size',
            'push!', 'pop!', 'append!', 'sort!', 'reverse!',
            'zeros', 'ones', 'fill', 'rand', 'randn',
            'map', 'filter', 'reduce', 'foreach',
            'typeof', 'isa', 'convert', 'collect', 'range',
            'ifelse', 'gcd', 'lcm'
        ],

        constants: ['true', 'false', 'nothing', 'missing', 'Inf', 'NaN', 'pi'],

        operators: [
            '=', '>', '<', '!', '~', '?', ':',
            '==', '<=', '>=', '!=', '===', '!==',
            '&&', '||', '++', '--',
            '+', '-', '*', '/', '&', '|', '^', '%',
            '<<', '>>', '>>>',
            '+=', '-=', '*=', '/=', '&=', '|=', '^=',
            '%=', '<<=', '>>=', '>>>=',
            '.+', '.-', '.*', './', '.^', '.%',
            '->', '=>', '::', '.', '...'
        ],

        symbols: /[=><!~?:&|+\-*\/\^%]+/,

        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        tokenizer: {
            root: [
                // Whitespace
                { include: '@whitespace' },

                // Macros
                [/@[a-zA-Z_]\w*/, 'annotation'],

                // Function definition: function name(
                [/(function)(\s+)([a-zA-Z_]\w*)(\s*)(\()/, ['keyword', 'white', 'function.definition', 'white', 'delimiter.parenthesis']],

                // Short function definition: name(args) = expr
                [/([a-zA-Z_]\w*)(\s*\([^)]*\)\s*=)/, ['function.definition', 'operator']],

                // Function call: name( - but not after 'function' keyword
                [/([a-zA-Z_]\w*!)(\()/, ['function.call', 'delimiter.parenthesis']],  // mutating functions like push!
                [/([a-zA-Z_]\w*)(\()/, {
                    cases: {
                        '$1@builtins': ['builtin.function', 'delimiter.parenthesis'],
                        '@default': ['function.call', 'delimiter.parenthesis']
                    }
                }],

                // Keywords (standalone, not followed by parenthesis)
                [/\b(function)\b/, 'keyword'],
                [/[a-zA-Z_]\w*/, {
                    cases: {
                        '@keywords': 'keyword',
                        '@constants': 'constant',
                        '@default': 'identifier'
                    }
                }],

                // Delimiters and operators
                [/[{}()\[\]]/, '@brackets'],
                [/@symbols/, {
                    cases: {
                        '@operators': 'operator',
                        '@default': ''
                    }
                }],

                // Numbers
                [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
                [/0[xX][0-9a-fA-F]+/, 'number.hex'],
                [/0[oO][0-7]+/, 'number.octal'],
                [/0[bB][01]+/, 'number.binary'],
                [/\d+/, 'number'],

                // Delimiter
                [/[;,.]/, 'delimiter'],

                // Strings
                [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-terminated string
                [/"/, 'string', '@string_double'],
                [/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-terminated char
                [/'/, 'string', '@string_single'],

                // Raw strings
                [/raw"/, 'string', '@string_raw'],
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/#=/, 'comment', '@comment_block'],
                [/#.*$/, 'comment'],
            ],

            comment_block: [
                [/[^#=]+/, 'comment'],
                [/=#/, 'comment', '@pop'],
                [/[#=]/, 'comment']
            ],

            string_double: [
                [/[^\\"$]+/, 'string'],
                [/\$\(/, 'string.interpolation', '@interpolation'],
                [/\$[a-zA-Z_]\w*/, 'string.interpolation'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/"/, 'string', '@pop']
            ],

            string_single: [
                [/[^\\']+/, 'string'],
                [/@escapes/, 'string.escape'],
                [/\\./, 'string.escape.invalid'],
                [/'/, 'string', '@pop']
            ],

            string_raw: [
                [/[^"]+/, 'string'],
                [/"/, 'string', '@pop']
            ],

            interpolation: [
                [/[^()]+/, 'string.interpolation'],
                [/\(/, 'string.interpolation', '@interpolation_nested'],
                [/\)/, 'string.interpolation', '@pop']
            ],

            interpolation_nested: [
                [/[^()]+/, 'string.interpolation'],
                [/\(/, 'string.interpolation', '@push'],
                [/\)/, 'string.interpolation', '@pop']
            ]
        }
    });

    // Define Monokai-inspired theme for Julia
    monaco.editor.defineTheme('julia-monokai', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: 'F92672', fontStyle: 'bold' },
            { token: 'function.definition', foreground: 'A6E22E' },  // Green for function definitions
            { token: 'function.call', foreground: '66D9EF' },        // Blue/cyan for function calls
            { token: 'builtin.function', foreground: '66D9EF' },     // Blue/cyan for builtin functions
            { token: 'constant', foreground: 'AE81FF' },
            { token: 'identifier', foreground: 'F8F8F2' },
            { token: 'number', foreground: 'AE81FF' },
            { token: 'number.float', foreground: 'AE81FF' },
            { token: 'number.hex', foreground: 'AE81FF' },
            { token: 'string', foreground: 'E6DB74' },
            { token: 'string.escape', foreground: 'AE81FF' },
            { token: 'string.interpolation', foreground: 'F8F8F2' },
            { token: 'comment', foreground: '75715E', fontStyle: 'italic' },
            { token: 'operator', foreground: 'F92672' },
            { token: 'annotation', foreground: 'A6E22E' },
            { token: 'delimiter', foreground: 'F8F8F2' },
            { token: 'delimiter.parenthesis', foreground: 'F8F8F2' },
            { token: '@brackets', foreground: 'F8F8F2' },
        ],
        colors: {
            'editor.background': '#272822',
            'editor.foreground': '#F8F8F2',
            'editorLineNumber.foreground': '#75715E',
            'editorLineNumber.activeForeground': '#F8F8F2',
            'editor.selectionBackground': '#49483E',
            'editor.lineHighlightBackground': '#3E3D32',
            'editorCursor.foreground': '#F8F8F0',
            'editorWhitespace.foreground': '#3B3A32',
            'editorIndentGuide.background': '#3B3A32',
            'editorIndentGuide.activeBackground': '#767166',
        }
    });

    // Language configuration for brackets, comments, etc.
    monaco.languages.setLanguageConfiguration('julia', {
        comments: {
            lineComment: '#',
            blockComment: ['#=', '=#']
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ],
        indentationRules: {
            increaseIndentPattern: /^\s*(function|if|elseif|else|for|while|try|catch|finally|let|do|begin|struct|mutable|module|baremodule)\b.*$/,
            decreaseIndentPattern: /^\s*(end|else|elseif|catch|finally)\b.*$/
        }
    });

    // Register Unicode completion provider for LaTeX sequences
    monaco.languages.registerCompletionItemProvider('julia', {
        triggerCharacters: ['\\'],
        provideCompletionItems: (model, position) => {
            if (!wasmModule) {
                return { suggestions: [] };
            }

            // Get text before cursor on current line
            const lineContent = model.getLineContent(position.lineNumber);
            const textBeforeCursor = lineContent.substring(0, position.column - 1);

            // Find the last backslash
            const backslashIndex = textBeforeCursor.lastIndexOf('\\');
            if (backslashIndex === -1) {
                return { suggestions: [] };
            }

            // Extract the LaTeX prefix (including backslash)
            const prefix = textBeforeCursor.substring(backslashIndex);

            // Get completions from WASM module
            let completions;
            try {
                completions = wasmModule.unicode_completions(prefix);
            } catch (e) {
                console.error('Unicode completions error:', e);
                return { suggestions: [] };
            }

            if (!completions || !Array.isArray(completions)) {
                return { suggestions: [] };
            }

            // Calculate the range to replace (from backslash to cursor)
            const range = {
                startLineNumber: position.lineNumber,
                startColumn: backslashIndex + 1, // +1 for 1-based indexing
                endLineNumber: position.lineNumber,
                endColumn: position.column
            };

            // Convert to Monaco completion items
            const suggestions = completions.map(([latex, unicode], index) => ({
                label: `${unicode} ${latex}`,
                kind: monaco.languages.CompletionItemKind.Text,
                insertText: unicode,
                range: range,
                detail: latex,
                sortText: String(index).padStart(5, '0'), // Preserve order from WASM
                filterText: latex // Allow filtering by LaTeX command
            }));

            return { suggestions };
        }
    });
}
