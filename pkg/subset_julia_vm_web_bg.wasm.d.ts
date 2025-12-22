/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const get_supported_features: () => any;
export const get_unsupported_features: () => any;
export const get_version: () => [number, number];
export const init: () => void;
export const run_from_cst_json: (a: number, b: number, c: number, d: number, e: bigint) => any;
export const run_ir_json: (a: number, b: number, c: bigint) => any;
export const run_ir_simple: (a: number, b: number, c: bigint) => number;
export const unicode_completions: (a: number, b: number) => any;
export const unicode_expand: (a: number, b: number) => [number, number];
export const unicode_lookup: (a: number, b: number) => [number, number];
export const unicode_reverse_lookup: (a: number, b: number) => [number, number];
export const free_execution_result: (a: number) => void;
export const free_string: (a: number) => void;
export const run_ir_json_f64: (a: number) => number;
export const run_ir_json_f64_N_seed: (a: number, b: bigint, c: bigint) => number;
export const run_ir_json_f_N_seed: (a: number, b: bigint, c: bigint) => bigint;
export const subset_julia_vm_demo: () => void;
export const vm_request_cancel: () => void;
export const vm_reset_cancel: () => void;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_start: () => void;
