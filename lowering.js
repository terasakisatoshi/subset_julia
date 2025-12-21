// Julia to Core IR Lowering in JavaScript
// This is a simplified port of the Rust lowering code for web playground use

export class Lowering {
    constructor(source) {
        this.source = source;
        this.functions = [];
        this.lambdaCounter = 0;
    }

    lower(tree) {
        if (!tree || !tree.rootNode) {
            throw new Error('Parsing failed');
        }

        const program = {
            structs: [],
            functions: [],
            modules: [],
            main: { stmts: [], span: this.nodeSpan(tree.rootNode) }
        };

        this.lowerSourceFile(tree.rootNode, program);
        program.functions = this.functions;
        return program;
    }

    lowerSourceFile(node, program) {
        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child.type === 'function_definition') {
                const func = this.lowerFunction(child);
                if (func) this.functions.push(func);
            } else if (!this.isTrivia(child)) {
                const stmt = this.lowerStmt(child);
                if (stmt) program.main.stmts.push(stmt);
            }
        }
    }

    lowerFunction(node) {
        // Tree structure:
        // function_definition > [function, signature, block, end]
        // Child 0: function keyword
        // Child 1: signature (e.g., gcd(a, b))
        // Child 2: block (function body)
        // Child 3: end keyword
        const sig = node.child(1);
        let body = null;

        // Find the block child for the function body
        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child.type === 'block') {
                body = child;
                break;
            }
        }

        let name = '';
        let params = [];

        if (sig) {
            if (sig.type === 'signature') {
                // signature may contain call_expression OR directly contain identifier + argument_list
                // Iterate through children to find name and params
                for (let i = 0; i < sig.childCount; i++) {
                    const child = sig.child(i);
                    if (child.type === 'call_expression') {
                        const funcName = child.child(0);
                        name = this.getText(funcName);
                        const argList = child.child(1);
                        if (argList && argList.type === 'argument_list') {
                            params = this.lowerParams(argList);
                        }
                        break;
                    } else if (child.type === 'identifier' && !name) {
                        name = this.getText(child);
                    } else if (child.type === 'argument_list' || child.type === 'tuple_expression') {
                        params = this.lowerParams(child);
                    }
                }
            } else if (sig.type === 'call_expression') {
                const funcName = sig.child(0);
                name = this.getText(funcName);
                const argList = sig.child(1);
                if (argList && argList.type === 'argument_list') {
                    params = this.lowerParams(argList);
                }
            } else if (sig.type === 'identifier') {
                name = this.getText(sig);
            }
        }

        const stmts = body ? this.lowerBlock(body) : [];

        return {
            name,
            params,
            kwparams: [],
            body: { stmts, span: body ? this.nodeSpan(body) : this.nodeSpan(node) },
            span: this.nodeSpan(node)
        };
    }

    lowerParams(argList) {
        const params = [];
        for (let i = 0; i < argList.childCount; i++) {
            const child = argList.child(i);
            if (child.type === 'identifier') {
                params.push({
                    name: this.getText(child),
                    type_annotation: null,
                    span: this.nodeSpan(child)
                });
            } else if (child.type === 'typed_parameter' || child.type === 'typed_expression') {
                // typed_parameter/typed_expression has structure: [identifier, ::, type]
                // Need to find the first identifier among named children
                for (let j = 0; j < child.childCount; j++) {
                    const subchild = child.child(j);
                    if (subchild.type === 'identifier') {
                        params.push({
                            name: this.getText(subchild),
                            type_annotation: null,
                            span: this.nodeSpan(child)
                        });
                        break;
                    }
                }
            }
        }
        return params;
    }

    lowerBlock(node) {
        const stmts = [];
        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (!this.isTrivia(child)) {
                const stmt = this.lowerStmt(child);
                if (stmt) stmts.push(stmt);
            }
        }
        return stmts;
    }

    lowerStmt(node) {
        const span = this.nodeSpan(node);

        switch (node.type) {
            case 'assignment':
                return this.lowerAssignment(node);
            case 'compound_assignment':
            case 'compound_assignment_expression':
                return this.lowerCompoundAssignment(node);
            case 'for_statement':
                return this.lowerFor(node);
            case 'while_statement':
                return this.lowerWhile(node);
            case 'if_statement':
                return this.lowerIf(node);
            case 'return_statement':
                return this.lowerReturn(node);
            case 'break_statement':
                return { Break: { span } };
            case 'continue_statement':
                return { Continue: { span } };
            case 'macrocall_expression':
            case 'macro_expression':
                return this.lowerMacroStmt(node);
            case 'compound_statement':
                // Handle semicolon-separated statements: a = 1; b = 2
                return this.lowerCompoundStatement(node);
            default:
                // Treat as expression statement
                const expr = this.lowerExpr(node);
                if (expr) {
                    return { Expr: { expr, span } };
                }
                return null;
        }
    }

    lowerCompoundStatement(node) {
        // Compound statements contain multiple statements separated by semicolons
        // Return a Block containing all the statements
        const span = this.nodeSpan(node);
        const stmts = [];
        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (!this.isTrivia(child) && child.type !== ';') {
                const stmt = this.lowerStmt(child);
                if (stmt) stmts.push(stmt);
            }
        }
        // If only one statement, return it directly
        if (stmts.length === 1) return stmts[0];
        // Otherwise return a Block
        return { Block: { stmts, span } };
    }

    lowerAssignment(node) {
        const left = node.child(0);
        const right = node.child(2);
        const span = this.nodeSpan(node);

        // Check if right side is @time macro - wrap assignment in Timed node
        if (right.type === 'macrocall_expression' || right.type === 'macro_expression') {
            let macroName = '';
            for (let i = 0; i < right.childCount; i++) {
                const child = right.child(i);
                if (child.type === 'macro_identifier') {
                    macroName = this.getText(child);
                    break;
                }
            }

            if (macroName === '@time' && left.type === 'identifier') {
                // Get the actual expression inside @time
                let args = [];
                for (let i = 0; i < right.childCount; i++) {
                    const child = right.child(i);
                    if (!this.isTrivia(child) && child.type !== 'macro_identifier' && child.type !== '(' && child.type !== ')') {
                        args.push(child);
                    }
                }

                if (args.length > 0) {
                    let exprNode = args[0];
                    if (exprNode.type === 'macro_argument_list') {
                        for (let i = 0; i < exprNode.childCount; i++) {
                            const child = exprNode.child(i);
                            if (!this.isTrivia(child) && child.type !== '(' && child.type !== ')') {
                                exprNode = child;
                                break;
                            }
                        }
                    }

                    // Create Assign statement with the inner expression
                    const innerExpr = this.lowerExpr(exprNode);
                    const assignStmt = {
                        Assign: {
                            var: this.getText(left),
                            value: innerExpr,
                            span
                        }
                    };

                    // Wrap in Timed
                    return {
                        Timed: {
                            body: {
                                stmts: [assignStmt],
                                span
                            },
                            span
                        }
                    };
                }
            }
        }

        if (left.type === 'identifier') {
            return {
                Assign: {
                    var: this.getText(left),
                    value: this.lowerExpr(right),
                    span
                }
            };
        } else if (left.type === 'index_expression') {
            const array = left.child(0);
            const bracket = left.child(1);
            const indices = this.lowerIndexArgs(bracket);
            return {
                IndexAssign: {
                    array: this.getText(array),
                    indices,
                    value: this.lowerExpr(right),
                    span
                }
            };
        }

        // Fallback: treat as expression
        return { Expr: { expr: this.lowerExpr(node), span } };
    }

    lowerCompoundAssignment(node) {
        const left = node.child(0);
        const op = node.child(1);
        const right = node.child(2);
        const span = this.nodeSpan(node);

        if (left.type === 'identifier' && this.getText(op) === '+=') {
            return {
                AddAssign: {
                    var: this.getText(left),
                    value: this.lowerExpr(right),
                    span
                }
            };
        }

        // Convert other compound assignments to regular assignment
        const opText = this.getText(op).replace('=', '');
        const binaryOp = this.mapBinaryOp(opText);
        return {
            Assign: {
                var: this.getText(left),
                value: {
                    BinaryOp: {
                        op: binaryOp,
                        left: this.lowerExpr(left),
                        right: this.lowerExpr(right),
                        span
                    }
                },
                span
            }
        };
    }

    lowerFor(node) {
        const span = this.nodeSpan(node);
        let varName = '';
        let start = null;
        let end = null;
        const bodyStmts = [];

        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child.type === 'for_binding') {
                const binding = child;
                const varNode = binding.child(0);
                varName = this.getText(varNode);

                const rangeNode = binding.child(2);
                if (rangeNode && rangeNode.type === 'range_expression') {
                    start = this.lowerExpr(rangeNode.child(0));
                    end = this.lowerExpr(rangeNode.child(2));
                } else if (rangeNode) {
                    // Handle 1:N case
                    start = { Literal: [{ Int: 1 }, this.nodeSpan(rangeNode)] };
                    end = this.lowerExpr(rangeNode);
                }
            } else if (child.type === 'block') {
                // Handle block node
                bodyStmts.push(...this.lowerBlock(child));
            } else if (!this.isTrivia(child) && child.type !== 'for' && child.type !== 'end') {
                // Accumulate body statements
                const stmt = this.lowerStmt(child);
                if (stmt) bodyStmts.push(stmt);
            }
        }

        const body = { stmts: bodyStmts, span };
        return { For: { var: varName, start, end, body, span } };
    }

    lowerWhile(node) {
        const span = this.nodeSpan(node);
        let condition = null;
        const bodyStmts = [];

        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child.type === 'while') continue;
            if (child.type === 'end') continue;
            if (this.isTrivia(child)) continue;

            if (!condition) {
                // First non-trivial child is the condition
                condition = this.lowerExpr(child);
            } else if (child.type === 'block') {
                // Handle block node by lowering all its statements
                bodyStmts.push(...this.lowerBlock(child));
            } else {
                // Accumulate body statements
                const stmt = this.lowerStmt(child);
                if (stmt) bodyStmts.push(stmt);
            }
        }

        const body = { stmts: bodyStmts, span };
        return { While: { condition, body, span } };
    }

    lowerIf(node) {
        const span = this.nodeSpan(node);
        let condition = null;
        let thenBranch = { stmts: [], span };
        let elseBranch = null;

        // Collect all elseif and else clauses
        const elseClauses = [];

        let phase = 'condition';
        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child.type === 'if' || child.type === 'end') continue;
            if (this.isTrivia(child)) continue;

            if (child.type === 'elseif_clause' || child.type === 'else_clause') {
                elseClauses.push(child);
                continue;
            }

            if (phase === 'condition') {
                condition = this.lowerExpr(child);
                phase = 'then';
            } else if (phase === 'then') {
                if (child.type === 'block') {
                    thenBranch.stmts = this.lowerBlock(child);
                } else {
                    const stmt = this.lowerStmt(child);
                    if (stmt) thenBranch.stmts.push(stmt);
                }
            }
        }

        // Process elseif/else chain from last to first (to build nested structure)
        if (elseClauses.length > 0) {
            elseBranch = this.lowerElseChain(elseClauses);
        }

        return { If: { condition, then_branch: thenBranch, else_branch: elseBranch, span } };
    }

    // Process chain of elseif/else clauses into nested If statements
    lowerElseChain(clauses) {
        if (clauses.length === 0) return null;

        const clause = clauses[0];
        const span = this.nodeSpan(clause);

        if (clause.type === 'else_clause') {
            // Final else - just return the body
            const stmts = [];
            for (let i = 0; i < clause.childCount; i++) {
                const child = clause.child(i);
                if (child.type === 'else' || this.isTrivia(child)) continue;
                if (child.type === 'block') {
                    stmts.push(...this.lowerBlock(child));
                } else {
                    const stmt = this.lowerStmt(child);
                    if (stmt) stmts.push(stmt);
                }
            }
            return { stmts, span };
        }

        // elseif_clause - extract condition and body, then chain remaining
        let condition = null;
        const bodyStmts = [];
        let foundCondition = false;

        for (let i = 0; i < clause.childCount; i++) {
            const child = clause.child(i);
            if (child.type === 'elseif' || this.isTrivia(child)) continue;

            // Handle nested elseif/else within this clause (tree-sitter nesting)
            if (child.type === 'elseif_clause' || child.type === 'else_clause') {
                // This is a nested clause within the current elseif
                const nestedClauses = [child];
                // Collect any remaining sibling clauses
                for (let j = i + 1; j < clause.childCount; j++) {
                    const sibling = clause.child(j);
                    if (sibling.type === 'elseif_clause' || sibling.type === 'else_clause') {
                        nestedClauses.push(sibling);
                    }
                }
                // Process nested chain
                const nestedElse = this.lowerElseChain(nestedClauses);
                // Return If with nested else
                return {
                    stmts: [{
                        If: {
                            condition,
                            then_branch: { stmts: bodyStmts, span },
                            else_branch: nestedElse,
                            span
                        }
                    }],
                    span
                };
            }

            if (!foundCondition) {
                condition = this.lowerExpr(child);
                foundCondition = true;
            } else {
                if (child.type === 'block') {
                    bodyStmts.push(...this.lowerBlock(child));
                } else {
                    const stmt = this.lowerStmt(child);
                    if (stmt) bodyStmts.push(stmt);
                }
            }
        }

        // Chain remaining clauses
        const remainingElse = clauses.length > 1 ? this.lowerElseChain(clauses.slice(1)) : null;

        return {
            stmts: [{
                If: {
                    condition,
                    then_branch: { stmts: bodyStmts, span },
                    else_branch: remainingElse,
                    span
                }
            }],
            span
        };
    }

    lowerElseClause(node) {
        // This is kept for backward compatibility but lowerElseChain is preferred
        return this.lowerElseChain([node]);
    }

    lowerReturn(node) {
        const span = this.nodeSpan(node);
        let value = null;

        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child.type !== 'return' && !this.isTrivia(child)) {
                value = this.lowerExpr(child);
                break;
            }
        }

        return { Return: { value, span } };
    }

    lowerExpr(node) {
        const span = this.nodeSpan(node);

        switch (node.type) {
            case 'integer_literal':
                return { Literal: [{ Int: parseInt(this.getText(node)) }, span] };
            case 'float_literal':
                return { Literal: [{ Float: parseFloat(this.getText(node)) }, span] };
            case 'string_literal':
                const strText = this.getText(node);
                // Remove quotes
                const strContent = strText.slice(1, -1);
                return { Literal: [{ Str: strContent }, span] };
            case 'boolean_literal':
                return { Literal: [{ Bool: this.getText(node) === 'true' }, span] };
            case 'identifier':
                const idName = this.getText(node);
                // Handle special constant 'im' for imaginary unit
                if (idName === 'im') {
                    return { Literal: [{ Complex: [0.0, 1.0] }, span] };
                }
                return { Var: [idName, span] };
            case 'coefficient_expression':
                // Handle complex literals like 1.0im, 2im, etc.
                return this.lowerCoefficientExpr(node);
            case 'binary_expression':
                return this.lowerBinaryExpr(node);
            case 'unary_expression':
                return this.lowerUnaryExpr(node);
            case 'call_expression':
                return this.lowerCall(node);
            case 'parenthesized_expression':
                return this.lowerExpr(node.child(1));
            case 'array_expression':
                return this.lowerArray(node);
            case 'index_expression':
                return this.lowerIndex(node);
            case 'range_expression':
                return this.lowerRange(node);
            case 'macrocall_expression':
            case 'macro_expression':
                return this.lowerMacro(node);
            default:
                // Try to find meaningful child
                for (let i = 0; i < node.childCount; i++) {
                    const child = node.child(i);
                    if (!this.isTrivia(child)) {
                        return this.lowerExpr(child);
                    }
                }
                return { Literal: [{ Unit: null }, span] };
        }
    }

    // lowerMacroStmt - returns statement IR nodes for macros
    lowerMacroStmt(node) {
        const span = this.nodeSpan(node);

        // Get macro name (e.g., @show, @time, @assert)
        let macroName = '';
        let args = [];

        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child.type === 'macro_identifier') {
                macroName = this.getText(child);  // e.g., "@show"
            } else if (!this.isTrivia(child) && child.type !== '(' && child.type !== ')') {
                args.push(child);
            }
        }

        // Handle @show macro: emit Show IR node
        if (macroName === '@show') {
            if (args.length > 0) {
                const exprNode = args[0];
                const exprText = this.getText(exprNode);
                const exprValue = this.lowerExpr(exprNode);

                return {
                    Show: {
                        expr: exprValue,
                        expr_text: exprText,
                        span
                    }
                };
            }
        }

        // Handle @time macro: emit Timed IR node
        // Uses js_sys::Date::now() in WASM for timing
        if (macroName === '@time') {
            if (args.length > 0) {
                let exprNode = args[0];

                // If the argument is a macro_argument_list, find the actual statement inside
                if (exprNode.type === 'macro_argument_list') {
                    for (let i = 0; i < exprNode.childCount; i++) {
                        const child = exprNode.child(i);
                        if (!this.isTrivia(child) && child.type !== '(' && child.type !== ')') {
                            exprNode = child;
                            break;
                        }
                    }
                }

                const bodyStmt = this.lowerStmt(exprNode);
                if (bodyStmt) {
                    return {
                        Timed: {
                            body: {
                                stmts: [bodyStmt],
                                span
                            },
                            span
                        }
                    };
                }
            }
        }

        // Handle @assert macro: emit Assert IR node
        if (macroName === '@assert') {
            if (args.length > 0) {
                const condNode = args[0];
                const condExpr = this.lowerExpr(condNode);
                const message = args.length > 1 ? this.getText(args[1]) : null;

                return {
                    Assert: {
                        condition: condExpr,
                        message,
                        span
                    }
                };
            }
        }

        // Fallback: just evaluate the first argument as expression statement
        if (args.length > 0) {
            const expr = this.lowerExpr(args[0]);
            return { Expr: { expr, span } };
        }

        return null;
    }

    // lowerMacro - returns expression IR nodes for macros used in expression context
    lowerMacro(node) {
        const span = this.nodeSpan(node);

        // Get macro name and args
        let macroName = '';
        let args = [];

        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (child.type === 'macro_identifier') {
                macroName = this.getText(child);
            } else if (!this.isTrivia(child) && child.type !== '(' && child.type !== ')') {
                args.push(child);
            }
        }

        // For expression context, just evaluate the argument
        // (macros like @show, @time are typically statements)
        if (args.length > 0) {
            return this.lowerExpr(args[0]);
        }

        return { Literal: [{ Unit: null }, span] };
    }

    lowerBinaryExpr(node) {
        const span = this.nodeSpan(node);
        const left = node.child(0);
        const opNode = node.child(1);
        const right = node.child(2);

        const op = this.mapBinaryOp(this.getText(opNode));

        return {
            BinaryOp: {
                op,
                left: this.lowerExpr(left),
                right: this.lowerExpr(right),
                span
            }
        };
    }

    lowerUnaryExpr(node) {
        const span = this.nodeSpan(node);
        const opNode = node.child(0);
        const operand = node.child(1);

        const opText = this.getText(opNode);
        const op = opText === '-' ? 'Neg' : 'Not';

        return {
            UnaryOp: {
                op,
                operand: this.lowerExpr(operand),
                span
            }
        };
    }

    lowerCall(node) {
        const span = this.nodeSpan(node);
        const funcNode = node.child(0);
        const argList = node.child(1);

        const funcName = this.getText(funcNode);
        const args = [];

        if (argList && argList.type === 'argument_list') {
            for (let i = 0; i < argList.childCount; i++) {
                const child = argList.child(i);
                if (!this.isTrivia(child) && child.type !== '(' && child.type !== ')' && child.type !== ',') {
                    args.push(this.lowerExpr(child));
                }
            }
        }

        // Check for builtin functions
        const builtins = {
            'length': 'Length',
            'size': 'Size',
            'zeros': 'Zeros',
            'ones': 'Ones',
            'fill': 'Fill',
            'trues': 'Trues',
            'falses': 'Falses',
            'push!': 'Push',
            'pop!': 'Pop',
            'rand': 'Rand',
            'sqrt': 'Sqrt',
            'abs': 'Abs',
            'abs2': 'Abs2',
            'sum': 'Sum',
            'real': 'Real',
            'imag': 'Imag',
            'conj': 'Conj',
            'complex': 'ComplexCtor',
            'ifelse': 'IfElse',
        };

        if (builtins[funcName]) {
            return { Builtin: { name: builtins[funcName], args, span } };
        }

        return { Call: { function: funcName, args, kwargs: [], span } };
    }

    lowerArray(node) {
        const span = this.nodeSpan(node);
        const elements = [];

        for (let i = 0; i < node.childCount; i++) {
            const child = node.child(i);
            if (!this.isTrivia(child) && child.type !== '[' && child.type !== ']' && child.type !== ',') {
                elements.push(this.lowerExpr(child));
            }
        }

        return { ArrayLiteral: { elements, shape: [elements.length], span } };
    }

    lowerIndex(node) {
        const span = this.nodeSpan(node);
        const array = node.child(0);
        const bracket = node.child(1);

        const indices = this.lowerIndexArgs(bracket);

        return {
            Index: {
                array: this.lowerExpr(array),
                indices,
                span
            }
        };
    }

    lowerIndexArgs(bracket) {
        const indices = [];
        for (let i = 0; i < bracket.childCount; i++) {
            const child = bracket.child(i);
            if (!this.isTrivia(child) && child.type !== '[' && child.type !== ']' && child.type !== ',') {
                indices.push(this.lowerExpr(child));
            }
        }
        return indices;
    }

    lowerRange(node) {
        const span = this.nodeSpan(node);
        const start = node.child(0);
        const end = node.child(2);

        return {
            Range: {
                start: this.lowerExpr(start),
                step: null,
                stop: this.lowerExpr(end),
                span
            }
        };
    }

    lowerCoefficientExpr(node) {
        // Handle coefficient expressions like 2im, 1.0im, 2x, etc.
        const span = this.nodeSpan(node);
        const text = this.getText(node);

        // Check if it ends with 'im' for complex literal
        if (text.endsWith('im')) {
            const coeffStr = text.slice(0, -2);
            const coeff = coeffStr === '' ? 1.0 : parseFloat(coeffStr);
            return { Literal: [{ Complex: [0.0, coeff] }, span] };
        }

        // Generic coefficient expression (e.g., 2x means 2 * x)
        // First child is coefficient, second is the variable/expression
        if (node.childCount >= 2) {
            const coeff = node.child(0);
            const expr = node.child(1);
            return {
                BinaryOp: {
                    op: 'Mul',
                    left: this.lowerExpr(coeff),
                    right: this.lowerExpr(expr),
                    span
                }
            };
        }

        // Fallback
        return { Literal: [{ Float: parseFloat(text) }, span] };
    }

    mapBinaryOp(op) {
        const ops = {
            '+': 'Add', '-': 'Sub', '*': 'Mul', '/': 'Div',
            '%': 'Mod', '^': 'Pow',
            '<': 'Lt', '>': 'Gt', '<=': 'Le', '>=': 'Ge',
            '==': 'Eq', '!=': 'Ne',
            '&&': 'And', '||': 'Or'
        };
        return ops[op] || 'Add';
    }

    nodeSpan(node) {
        return {
            start: node.startIndex,
            end: node.endIndex,
            start_line: node.startPosition.row + 1,
            end_line: node.endPosition.row + 1,
            start_column: node.startPosition.column + 1,
            end_column: node.endPosition.column + 1
        };
    }

    getText(node) {
        return this.source.slice(node.startIndex, node.endIndex);
    }

    isTrivia(node) {
        return node.type === 'comment' || node.type === 'line_comment' ||
               node.type === 'block_comment' || !node.isNamed;
    }
}
