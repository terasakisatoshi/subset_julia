/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const get_supported_features: () => any;
export const get_unsupported_features: () => any;
export const get_version: () => [number, number];
export const init: () => void;
export const run_from_source: (a: number, b: number, c: bigint) => any;
export const run_ir_json: (a: number, b: number, c: bigint) => any;
export const run_ir_simple: (a: number, b: number, c: bigint) => number;
export const unicode_completions: (a: number, b: number) => any;
export const unicode_expand: (a: number, b: number) => [number, number];
export const unicode_lookup: (a: number, b: number) => [number, number];
export const unicode_reverse_lookup: (a: number, b: number) => [number, number];
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_start: () => void;
