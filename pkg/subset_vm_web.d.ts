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

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly get_supported_features: () => any;
  readonly get_unsupported_features: () => any;
  readonly get_version: () => [number, number];
  readonly init: () => void;
  readonly run_ir_json: (a: number, b: number, c: bigint) => any;
  readonly run_ir_simple: (a: number, b: number, c: bigint) => number;
  readonly free_execution_result: (a: number) => void;
  readonly free_string: (a: number) => void;
  readonly run_ir_json_f64: (a: number) => number;
  readonly run_ir_json_f64_N_seed: (a: number, b: bigint, c: bigint) => number;
  readonly run_ir_json_f_N_seed: (a: number, b: bigint, c: bigint) => bigint;
  readonly subset_vm_demo: () => void;
  readonly vm_request_cancel: () => void;
  readonly vm_reset_cancel: () => void;
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
