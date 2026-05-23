/* tslint:disable */
/* eslint-disable */

/**
 * List of supported Julia subset features
 */
export function get_supported_features(): any;

/**
 * List of unsupported features
 */
export function get_unsupported_features(): any;

/**
 * Get the version of the VM
 */
export function get_version(): string;

export function init(): void;

/**
 * Run Julia source code directly using the pure Rust parser.
 *
 * This is the recommended entry point for running Julia code in WASM.
 * It uses subset_julia_vm_parser which is a pure Rust parser that works
 * natively in WASM without requiring web-tree-sitter.
 *
 * # Arguments
 * * `source` - Julia source code to execute
 * * `seed` - Random seed for deterministic execution
 *
 * # Returns
 * An ExecutionResult object containing success status, value, output, and error message
 */
export function run_from_source(source: string, seed: bigint): any;

/**
 * Run a Core IR JSON program and return the result.
 *
 * This function takes a JSON-serialized Core IR program and executes it.
 * The IR should be generated from Julia source code using the lowering pipeline.
 *
 * # Arguments
 * * `ir_json` - JSON string representing the Core IR program
 * * `seed` - Random seed for deterministic execution
 *
 * # Returns
 * An ExecutionResult object containing success status, value, output, and error message
 */
export function run_ir_json(ir_json: string, seed: bigint): any;

/**
 * Run IR JSON and return just the numeric result.
 * Returns NaN on error.
 */
export function run_ir_simple(ir_json: string, seed: bigint): number;

/**
 * Get completions for a LaTeX prefix.
 * Returns a JSON array of [latex, unicode] pairs.
 */
export function unicode_completions(prefix: string): any;

/**
 * Expand all LaTeX sequences in a string to their Unicode equivalents.
 */
export function unicode_expand(input: string): string;

/**
 * Look up a LaTeX command and return its Unicode representation.
 * Returns null if not found.
 */
export function unicode_lookup(latex: string): string | undefined;

/**
 * Reverse lookup: get LaTeX for a Unicode character.
 * Returns null if not found.
 */
export function unicode_reverse_lookup(unicode_char: string): string | undefined;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly get_supported_features: () => any;
    readonly get_unsupported_features: () => any;
    readonly get_version: () => [number, number];
    readonly run_from_source: (a: number, b: number, c: bigint) => any;
    readonly run_ir_json: (a: number, b: number, c: bigint) => any;
    readonly run_ir_simple: (a: number, b: number, c: bigint) => number;
    readonly unicode_completions: (a: number, b: number) => any;
    readonly unicode_expand: (a: number, b: number) => [number, number];
    readonly unicode_lookup: (a: number, b: number) => [number, number];
    readonly unicode_reverse_lookup: (a: number, b: number) => [number, number];
    readonly init: () => void;
    readonly compile_and_run: (a: number, b: bigint) => number;
    readonly compile_and_run_auto: (a: number, b: bigint) => number;
    readonly compile_and_run_detailed: (a: number, b: bigint) => number;
    readonly compile_and_run_streaming: (a: number, b: bigint, c: number, d: number) => number;
    readonly compile_and_run_with_output: (a: number, b: bigint) => number;
    readonly compile_to_ir: (a: number) => number;
    readonly free_string: (a: number) => void;
    readonly run_ir_json_f64: (a: number) => number;
    readonly run_ir_json_f64_N_seed: (a: number, b: bigint, c: bigint) => number;
    readonly run_ir_json_f_N_seed: (a: number, b: bigint, c: bigint) => bigint;
    readonly vm_request_cancel: () => void;
    readonly vm_reset_cancel: () => void;
    readonly free_execution_result: (a: number) => void;
    readonly free_repl_result: (a: number) => void;
    readonly is_expression_complete: (a: number) => number;
    readonly repl_session_eval: (a: number, b: number) => number;
    readonly repl_session_free: (a: number) => void;
    readonly repl_session_new: (a: bigint) => number;
    readonly repl_session_reset: (a: number) => void;
    readonly split_expressions: (a: number) => number;
    readonly subset_julia_vm_demo: () => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
