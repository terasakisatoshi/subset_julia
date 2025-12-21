// IR JSON for web playground samples
// Samples with ir: null use JavaScript lowering
export const samplesIR = [
  {
    name: "Hello World",
    code: `println("Hello, World!")`,
    ir: `{"structs":[],"functions":[],"modules":[],"main":{"stmts":[{"Expr":{"expr":{"Call":{"function":"println","args":[{"Literal":[{"Str":"Hello, World!"},{"start":8,"end":23,"start_line":1,"end_line":1,"start_column":9,"end_column":24}]}],"kwargs":[],"span":{"start":0,"end":24,"start_line":1,"end_line":1,"start_column":1,"end_column":25}}},"span":{"start":0,"end":24,"start_line":1,"end_line":1,"start_column":1,"end_column":25}}}],"span":{"start":0,"end":24,"start_line":1,"end_line":1,"start_column":1,"end_column":25}}}`
  },
  {
    name: "Sum to N",
    code: `function sum_to_n(N)
    sum = 0
    for i in 1:N
        sum += i
    end
    sum
end

result = sum_to_n(100)
println("Sum 1 to 100 = ", result)`,
    ir: `{"structs":[],"functions":[{"name":"sum_to_n","params":[{"name":"N","type_annotation":null,"span":{"start":18,"end":19,"start_line":1,"end_line":1,"start_column":19,"end_column":20}}],"kwparams":[],"body":{"stmts":[{"Assign":{"var":"sum","value":{"Literal":[{"Int":0},{"start":31,"end":32,"start_line":2,"end_line":2,"start_column":11,"end_column":12}]},"span":{"start":25,"end":32,"start_line":2,"end_line":2,"start_column":5,"end_column":12}}},{"For":{"var":"i","start":{"Literal":[{"Int":1},{"start":46,"end":47,"start_line":3,"end_line":3,"start_column":14,"end_column":15}]},"end":{"Var":["N",{"start":48,"end":49,"start_line":3,"end_line":3,"start_column":16,"end_column":17}]},"body":{"stmts":[{"Assign":{"var":"sum","value":{"BinaryOp":{"op":"Add","left":{"Var":["sum",{"start":58,"end":66,"start_line":4,"end_line":4,"start_column":9,"end_column":17}]},"right":{"Var":["i",{"start":65,"end":66,"start_line":4,"end_line":4,"start_column":16,"end_column":17}]},"span":{"start":58,"end":66,"start_line":4,"end_line":4,"start_column":9,"end_column":17}}},"span":{"start":58,"end":66,"start_line":4,"end_line":4,"start_column":9,"end_column":17}}}],"span":{"start":58,"end":67,"start_line":4,"end_line":5,"start_column":9,"end_column":1}},"span":{"start":37,"end":74,"start_line":3,"end_line":5,"start_column":5,"end_column":8}}},{"Expr":{"expr":{"Var":["sum",{"start":79,"end":82,"start_line":6,"end_line":6,"start_column":5,"end_column":8}]},"span":{"start":79,"end":82,"start_line":6,"end_line":6,"start_column":5,"end_column":8}}}],"span":{"start":25,"end":83,"start_line":2,"end_line":7,"start_column":5,"end_column":1}},"span":{"start":0,"end":86,"start_line":1,"end_line":7,"start_column":1,"end_column":4}}],"modules":[],"main":{"stmts":[{"Assign":{"var":"result","value":{"Call":{"function":"sum_to_n","args":[{"Literal":[{"Int":100},{"start":106,"end":109,"start_line":9,"end_line":9,"start_column":19,"end_column":22}]}],"kwargs":[],"span":{"start":97,"end":110,"start_line":9,"end_line":9,"start_column":10,"end_column":23}}},"span":{"start":88,"end":110,"start_line":9,"end_line":9,"start_column":1,"end_column":23}}},{"Expr":{"expr":{"Call":{"function":"println","args":[{"Literal":[{"Str":"Sum 1 to 100 = "},{"start":119,"end":136,"start_line":10,"end_line":10,"start_column":9,"end_column":26}]},{"Var":["result",{"start":138,"end":144,"start_line":10,"end_line":10,"start_column":28,"end_column":34}]}],"kwargs":[],"span":{"start":111,"end":145,"start_line":10,"end_line":10,"start_column":1,"end_column":35}}},"span":{"start":111,"end":145,"start_line":10,"end_line":10,"start_column":1,"end_column":35}}}],"span":{"start":0,"end":145,"start_line":1,"end_line":10,"start_column":1,"end_column":35}}}`
  },
  {
    name: "Factorial (Recursive)",
    code: `function factorial(n)
    if n <= 1
        return 1
    end
    n * factorial(n - 1)
end

result = factorial(10)
println("10! = ", result)`,
    ir: `{"structs":[],"functions":[{"name":"factorial","params":[{"name":"n","type_annotation":null,"span":{"start":19,"end":20,"start_line":1,"end_line":1,"start_column":20,"end_column":21}}],"kwparams":[],"body":{"stmts":[{"If":{"condition":{"BinaryOp":{"op":"Le","left":{"Var":["n",{"start":29,"end":30,"start_line":2,"end_line":2,"start_column":8,"end_column":9}]},"right":{"Literal":[{"Int":1},{"start":34,"end":35,"start_line":2,"end_line":2,"start_column":13,"end_column":14}]},"span":{"start":29,"end":35,"start_line":2,"end_line":2,"start_column":8,"end_column":14}}},"then_branch":{"stmts":[{"Return":{"value":{"Literal":[{"Int":1},{"start":51,"end":52,"start_line":3,"end_line":3,"start_column":16,"end_column":17}]},"span":{"start":44,"end":52,"start_line":3,"end_line":3,"start_column":9,"end_column":17}}}],"span":{"start":44,"end":53,"start_line":3,"end_line":4,"start_column":9,"end_column":1}},"else_branch":null,"span":{"start":26,"end":60,"start_line":2,"end_line":4,"start_column":5,"end_column":8}}},{"Expr":{"expr":{"BinaryOp":{"op":"Mul","left":{"Var":["n",{"start":65,"end":66,"start_line":5,"end_line":5,"start_column":5,"end_column":6}]},"right":{"Call":{"function":"factorial","args":[{"BinaryOp":{"op":"Sub","left":{"Var":["n",{"start":79,"end":80,"start_line":5,"end_line":5,"start_column":19,"end_column":20}]},"right":{"Literal":[{"Int":1},{"start":83,"end":84,"start_line":5,"end_line":5,"start_column":23,"end_column":24}]},"span":{"start":79,"end":84,"start_line":5,"end_line":5,"start_column":19,"end_column":24}}}],"kwargs":[],"span":{"start":69,"end":85,"start_line":5,"end_line":5,"start_column":9,"end_column":25}}},"span":{"start":65,"end":85,"start_line":5,"end_line":5,"start_column":5,"end_column":25}}},"span":{"start":65,"end":85,"start_line":5,"end_line":5,"start_column":5,"end_column":25}}}],"span":{"start":26,"end":86,"start_line":2,"end_line":6,"start_column":5,"end_column":1}},"span":{"start":0,"end":89,"start_line":1,"end_line":6,"start_column":1,"end_column":4}}],"modules":[],"main":{"stmts":[{"Assign":{"var":"result","value":{"Call":{"function":"factorial","args":[{"Literal":[{"Int":10},{"start":110,"end":112,"start_line":8,"end_line":8,"start_column":20,"end_column":22}]}],"kwargs":[],"span":{"start":100,"end":113,"start_line":8,"end_line":8,"start_column":10,"end_column":23}}},"span":{"start":91,"end":113,"start_line":8,"end_line":8,"start_column":1,"end_column":23}}},{"Expr":{"expr":{"Call":{"function":"println","args":[{"Literal":[{"Str":"10! = "},{"start":122,"end":130,"start_line":9,"end_line":9,"start_column":9,"end_column":17}]},{"Var":["result",{"start":132,"end":138,"start_line":9,"end_line":9,"start_column":19,"end_column":25}]}],"kwargs":[],"span":{"start":114,"end":139,"start_line":9,"end_line":9,"start_column":1,"end_column":26}}},"span":{"start":114,"end":139,"start_line":9,"end_line":9,"start_column":1,"end_column":26}}}],"span":{"start":0,"end":139,"start_line":1,"end_line":9,"start_column":1,"end_column":26}}}`
  },
  {
    name: "Fibonacci (Recursive)",
    code: `function fib(n)
    if n <= 1
        return n
    end
    fib(n - 1) + fib(n - 2)
end

result = fib(15)
println("fib(15) = ", result)`,
    ir: `{"structs":[],"functions":[{"name":"fib","params":[{"name":"n","type_annotation":null,"span":{"start":13,"end":14,"start_line":1,"end_line":1,"start_column":14,"end_column":15}}],"kwparams":[],"body":{"stmts":[{"If":{"condition":{"BinaryOp":{"op":"Le","left":{"Var":["n",{"start":23,"end":24,"start_line":2,"end_line":2,"start_column":8,"end_column":9}]},"right":{"Literal":[{"Int":1},{"start":28,"end":29,"start_line":2,"end_line":2,"start_column":13,"end_column":14}]},"span":{"start":23,"end":29,"start_line":2,"end_line":2,"start_column":8,"end_column":14}}},"then_branch":{"stmts":[{"Return":{"value":{"Var":["n",{"start":45,"end":46,"start_line":3,"end_line":3,"start_column":16,"end_column":17}]},"span":{"start":38,"end":46,"start_line":3,"end_line":3,"start_column":9,"end_column":17}}}],"span":{"start":38,"end":47,"start_line":3,"end_line":4,"start_column":9,"end_column":1}},"else_branch":null,"span":{"start":20,"end":54,"start_line":2,"end_line":4,"start_column":5,"end_column":8}}},{"Expr":{"expr":{"BinaryOp":{"op":"Add","left":{"Call":{"function":"fib","args":[{"BinaryOp":{"op":"Sub","left":{"Var":["n",{"start":63,"end":64,"start_line":5,"end_line":5,"start_column":9,"end_column":10}]},"right":{"Literal":[{"Int":1},{"start":67,"end":68,"start_line":5,"end_line":5,"start_column":13,"end_column":14}]},"span":{"start":63,"end":68,"start_line":5,"end_line":5,"start_column":9,"end_column":14}}}],"kwargs":[],"span":{"start":59,"end":69,"start_line":5,"end_line":5,"start_column":5,"end_column":15}}},"right":{"Call":{"function":"fib","args":[{"BinaryOp":{"op":"Sub","left":{"Var":["n",{"start":76,"end":77,"start_line":5,"end_line":5,"start_column":22,"end_column":23}]},"right":{"Literal":[{"Int":2},{"start":80,"end":81,"start_line":5,"end_line":5,"start_column":26,"end_column":27}]},"span":{"start":76,"end":81,"start_line":5,"end_line":5,"start_column":22,"end_column":27}}}],"kwargs":[],"span":{"start":72,"end":82,"start_line":5,"end_line":5,"start_column":18,"end_column":28}}},"span":{"start":59,"end":82,"start_line":5,"end_line":5,"start_column":5,"end_column":28}}},"span":{"start":59,"end":82,"start_line":5,"end_line":5,"start_column":5,"end_column":28}}}],"span":{"start":20,"end":83,"start_line":2,"end_line":6,"start_column":5,"end_column":1}},"span":{"start":0,"end":86,"start_line":1,"end_line":6,"start_column":1,"end_column":4}}],"modules":[],"main":{"stmts":[{"Assign":{"var":"result","value":{"Call":{"function":"fib","args":[{"Literal":[{"Int":15},{"start":101,"end":103,"start_line":8,"end_line":8,"start_column":14,"end_column":16}]}],"kwargs":[],"span":{"start":97,"end":104,"start_line":8,"end_line":8,"start_column":10,"end_column":17}}},"span":{"start":88,"end":104,"start_line":8,"end_line":8,"start_column":1,"end_column":17}}},{"Expr":{"expr":{"Call":{"function":"println","args":[{"Literal":[{"Str":"fib(15) = "},{"start":113,"end":125,"start_line":9,"end_line":9,"start_column":9,"end_column":21}]},{"Var":["result",{"start":127,"end":133,"start_line":9,"end_line":9,"start_column":23,"end_column":29}]}],"kwargs":[],"span":{"start":105,"end":134,"start_line":9,"end_line":9,"start_column":1,"end_column":30}}},"span":{"start":105,"end":134,"start_line":9,"end_line":9,"start_column":1,"end_column":30}}}],"span":{"start":0,"end":134,"start_line":1,"end_line":9,"start_column":1,"end_column":30}}}`
  },
  {
    name: "Dot Product",
    code: `function dot_product(a, b)
    sum = 0.0
    for i in 1:length(a)
        sum += a[i] * b[i]
    end
    sum
end

a = [1.0, 2.0, 3.0]
b = [4.0, 5.0, 6.0]
result = dot_product(a, b)
println("dot([1,2,3], [4,5,6]) = ", result)`,
    ir: `{"structs":[],"functions":[{"name":"dot_product","params":[{"name":"a","type_annotation":null,"span":{"start":21,"end":22,"start_line":1,"end_line":1,"start_column":22,"end_column":23}},{"name":"b","type_annotation":null,"span":{"start":24,"end":25,"start_line":1,"end_line":1,"start_column":25,"end_column":26}}],"kwparams":[],"body":{"stmts":[{"Assign":{"var":"sum","value":{"Literal":[{"Float":0.0},{"start":37,"end":40,"start_line":2,"end_line":2,"start_column":11,"end_column":14}]},"span":{"start":31,"end":40,"start_line":2,"end_line":2,"start_column":5,"end_column":14}}},{"For":{"var":"i","start":{"Literal":[{"Int":1},{"start":54,"end":55,"start_line":3,"end_line":3,"start_column":14,"end_column":15}]},"end":{"Builtin":{"name":"Length","args":[{"Var":["a",{"start":63,"end":64,"start_line":3,"end_line":3,"start_column":23,"end_column":24}]}],"span":{"start":56,"end":65,"start_line":3,"end_line":3,"start_column":16,"end_column":25}}},"body":{"stmts":[{"Assign":{"var":"sum","value":{"BinaryOp":{"op":"Add","left":{"Var":["sum",{"start":74,"end":92,"start_line":4,"end_line":4,"start_column":9,"end_column":27}]},"right":{"BinaryOp":{"op":"Mul","left":{"Index":{"array":{"Var":["a",{"start":81,"end":82,"start_line":4,"end_line":4,"start_column":16,"end_column":17}]},"indices":[{"Var":["i",{"start":83,"end":84,"start_line":4,"end_line":4,"start_column":18,"end_column":19}]}],"span":{"start":81,"end":85,"start_line":4,"end_line":4,"start_column":16,"end_column":20}}},"right":{"Index":{"array":{"Var":["b",{"start":88,"end":89,"start_line":4,"end_line":4,"start_column":23,"end_column":24}]},"indices":[{"Var":["i",{"start":90,"end":91,"start_line":4,"end_line":4,"start_column":25,"end_column":26}]}],"span":{"start":88,"end":92,"start_line":4,"end_line":4,"start_column":23,"end_column":27}}},"span":{"start":81,"end":92,"start_line":4,"end_line":4,"start_column":16,"end_column":27}}},"span":{"start":74,"end":92,"start_line":4,"end_line":4,"start_column":9,"end_column":27}}},"span":{"start":74,"end":92,"start_line":4,"end_line":4,"start_column":9,"end_column":27}}}],"span":{"start":74,"end":93,"start_line":4,"end_line":5,"start_column":9,"end_column":1}},"span":{"start":45,"end":100,"start_line":3,"end_line":5,"start_column":5,"end_column":8}}},{"Expr":{"expr":{"Var":["sum",{"start":105,"end":108,"start_line":6,"end_line":6,"start_column":5,"end_column":8}]},"span":{"start":105,"end":108,"start_line":6,"end_line":6,"start_column":5,"end_column":8}}}],"span":{"start":31,"end":109,"start_line":2,"end_line":7,"start_column":5,"end_column":1}},"span":{"start":0,"end":112,"start_line":1,"end_line":7,"start_column":1,"end_column":4}}],"modules":[],"main":{"stmts":[{"Assign":{"var":"a","value":{"ArrayLiteral":{"elements":[{"Literal":[{"Float":1.0},{"start":119,"end":122,"start_line":9,"end_line":9,"start_column":6,"end_column":9}]},{"Literal":[{"Float":2.0},{"start":124,"end":127,"start_line":9,"end_line":9,"start_column":11,"end_column":14}]},{"Literal":[{"Float":3.0},{"start":129,"end":132,"start_line":9,"end_line":9,"start_column":16,"end_column":19}]}],"shape":[3],"span":{"start":118,"end":133,"start_line":9,"end_line":9,"start_column":5,"end_column":20}}},"span":{"start":114,"end":133,"start_line":9,"end_line":9,"start_column":1,"end_column":20}}},{"Assign":{"var":"b","value":{"ArrayLiteral":{"elements":[{"Literal":[{"Float":4.0},{"start":139,"end":142,"start_line":10,"end_line":10,"start_column":6,"end_column":9}]},{"Literal":[{"Float":5.0},{"start":144,"end":147,"start_line":10,"end_line":10,"start_column":11,"end_column":14}]},{"Literal":[{"Float":6.0},{"start":149,"end":152,"start_line":10,"end_line":10,"start_column":16,"end_column":19}]}],"shape":[3],"span":{"start":138,"end":153,"start_line":10,"end_line":10,"start_column":5,"end_column":20}}},"span":{"start":134,"end":153,"start_line":10,"end_line":10,"start_column":1,"end_column":20}}},{"Assign":{"var":"result","value":{"Call":{"function":"dot_product","args":[{"Var":["a",{"start":175,"end":176,"start_line":11,"end_line":11,"start_column":22,"end_column":23}]},{"Var":["b",{"start":178,"end":179,"start_line":11,"end_line":11,"start_column":25,"end_column":26}]}],"kwargs":[],"span":{"start":163,"end":180,"start_line":11,"end_line":11,"start_column":10,"end_column":27}}},"span":{"start":154,"end":180,"start_line":11,"end_line":11,"start_column":1,"end_column":27}}},{"Expr":{"expr":{"Call":{"function":"println","args":[{"Literal":[{"Str":"dot([1,2,3], [4,5,6]) = "},{"start":189,"end":215,"start_line":12,"end_line":12,"start_column":9,"end_column":35}]},{"Var":["result",{"start":217,"end":223,"start_line":12,"end_line":12,"start_column":37,"end_column":43}]}],"kwargs":[],"span":{"start":181,"end":224,"start_line":12,"end_line":12,"start_column":1,"end_column":44}}},"span":{"start":181,"end":224,"start_line":12,"end_line":12,"start_column":1,"end_column":44}}}],"span":{"start":0,"end":224,"start_line":1,"end_line":12,"start_column":1,"end_column":44}}}`
  },
  {
    name: "GCD (Euclidean)",
    code: `function gcd(a, b)
    while b != 0
        r = a % b
        a = b
        b = r
    end
    a
end

result = gcd(48, 18)
println("gcd(48, 18) = ", result)`,
    ir: `{"structs":[],"functions":[{"name":"gcd","params":[{"name":"a","type_annotation":null,"span":{"start":13,"end":14,"start_line":1,"end_line":1,"start_column":14,"end_column":15}},{"name":"b","type_annotation":null,"span":{"start":16,"end":17,"start_line":1,"end_line":1,"start_column":17,"end_column":18}}],"kwparams":[],"body":{"stmts":[{"While":{"condition":{"BinaryOp":{"op":"Ne","left":{"Var":["b",{"start":29,"end":30,"start_line":2,"end_line":2,"start_column":11,"end_column":12}]},"right":{"Literal":[{"Int":0},{"start":34,"end":35,"start_line":2,"end_line":2,"start_column":16,"end_column":17}]},"span":{"start":29,"end":35,"start_line":2,"end_line":2,"start_column":11,"end_column":17}}},"body":{"stmts":[{"Assign":{"var":"r","value":{"BinaryOp":{"op":"Mod","left":{"Var":["a",{"start":48,"end":49,"start_line":3,"end_line":3,"start_column":13,"end_column":14}]},"right":{"Var":["b",{"start":52,"end":53,"start_line":3,"end_line":3,"start_column":17,"end_column":18}]},"span":{"start":48,"end":53,"start_line":3,"end_line":3,"start_column":13,"end_column":18}}},"span":{"start":44,"end":53,"start_line":3,"end_line":3,"start_column":9,"end_column":18}}},{"Assign":{"var":"a","value":{"Var":["b",{"start":66,"end":67,"start_line":4,"end_line":4,"start_column":13,"end_column":14}]},"span":{"start":62,"end":67,"start_line":4,"end_line":4,"start_column":9,"end_column":14}}},{"Assign":{"var":"b","value":{"Var":["r",{"start":80,"end":81,"start_line":5,"end_line":5,"start_column":13,"end_column":14}]},"span":{"start":76,"end":81,"start_line":5,"end_line":5,"start_column":9,"end_column":14}}}],"span":{"start":44,"end":82,"start_line":3,"end_line":6,"start_column":9,"end_column":1}},"span":{"start":23,"end":89,"start_line":2,"end_line":6,"start_column":5,"end_column":8}}},{"Expr":{"expr":{"Var":["a",{"start":94,"end":95,"start_line":7,"end_line":7,"start_column":5,"end_column":6}]},"span":{"start":94,"end":95,"start_line":7,"end_line":7,"start_column":5,"end_column":6}}}],"span":{"start":23,"end":96,"start_line":2,"end_line":8,"start_column":5,"end_column":1}},"span":{"start":0,"end":99,"start_line":1,"end_line":8,"start_column":1,"end_column":4}}],"modules":[],"main":{"stmts":[{"Assign":{"var":"result","value":{"Call":{"function":"gcd","args":[{"Literal":[{"Int":48},{"start":114,"end":116,"start_line":10,"end_line":10,"start_column":14,"end_column":16}]},{"Literal":[{"Int":18},{"start":118,"end":120,"start_line":10,"end_line":10,"start_column":18,"end_column":20}]}],"kwargs":[],"span":{"start":110,"end":121,"start_line":10,"end_line":10,"start_column":10,"end_column":21}}},"span":{"start":101,"end":121,"start_line":10,"end_line":10,"start_column":1,"end_column":21}}},{"Expr":{"expr":{"Call":{"function":"println","args":[{"Literal":[{"Str":"gcd(48, 18) = "},{"start":130,"end":146,"start_line":11,"end_line":11,"start_column":9,"end_column":25}]},{"Var":["result",{"start":148,"end":154,"start_line":11,"end_line":11,"start_column":27,"end_column":33}]}],"kwargs":[],"span":{"start":122,"end":155,"start_line":11,"end_line":11,"start_column":1,"end_column":34}}},"span":{"start":122,"end":155,"start_line":11,"end_line":11,"start_column":1,"end_column":34}}}],"span":{"start":0,"end":155,"start_line":1,"end_line":11,"start_column":1,"end_column":34}}}`
  },
  {
    name: "Newton's Method (sqrt)",
    code: `function newton_sqrt(x)
    guess = x / 2.0
    for i in 1:20
        guess = (guess + x / guess) / 2.0
    end
    guess
end

result = newton_sqrt(2.0)
println("sqrt(2) = ", result)`,
    ir: `{"structs":[],"functions":[{"name":"newton_sqrt","params":[{"name":"x","type_annotation":null,"span":{"start":21,"end":22,"start_line":1,"end_line":1,"start_column":22,"end_column":23}}],"kwparams":[],"body":{"stmts":[{"Assign":{"var":"guess","value":{"BinaryOp":{"op":"Div","left":{"Var":["x",{"start":36,"end":37,"start_line":2,"end_line":2,"start_column":13,"end_column":14}]},"right":{"Literal":[{"Float":2.0},{"start":40,"end":43,"start_line":2,"end_line":2,"start_column":17,"end_column":20}]},"span":{"start":36,"end":43,"start_line":2,"end_line":2,"start_column":13,"end_column":20}}},"span":{"start":28,"end":43,"start_line":2,"end_line":2,"start_column":5,"end_column":20}}},{"For":{"var":"i","start":{"Literal":[{"Int":1},{"start":57,"end":58,"start_line":3,"end_line":3,"start_column":14,"end_column":15}]},"end":{"Literal":[{"Int":20},{"start":59,"end":61,"start_line":3,"end_line":3,"start_column":16,"end_column":18}]},"body":{"stmts":[{"Assign":{"var":"guess","value":{"BinaryOp":{"op":"Div","left":{"BinaryOp":{"op":"Add","left":{"Var":["guess",{"start":79,"end":84,"start_line":4,"end_line":4,"start_column":18,"end_column":23}]},"right":{"BinaryOp":{"op":"Div","left":{"Var":["x",{"start":87,"end":88,"start_line":4,"end_line":4,"start_column":26,"end_column":27}]},"right":{"Var":["guess",{"start":91,"end":96,"start_line":4,"end_line":4,"start_column":30,"end_column":35}]},"span":{"start":87,"end":96,"start_line":4,"end_line":4,"start_column":26,"end_column":35}}},"span":{"start":79,"end":96,"start_line":4,"end_line":4,"start_column":18,"end_column":35}}},"right":{"Literal":[{"Float":2.0},{"start":100,"end":103,"start_line":4,"end_line":4,"start_column":39,"end_column":42}]},"span":{"start":78,"end":103,"start_line":4,"end_line":4,"start_column":17,"end_column":42}}},"span":{"start":70,"end":103,"start_line":4,"end_line":4,"start_column":9,"end_column":42}}}],"span":{"start":70,"end":104,"start_line":4,"end_line":5,"start_column":9,"end_column":1}},"span":{"start":48,"end":111,"start_line":3,"end_line":5,"start_column":5,"end_column":8}}},{"Expr":{"expr":{"Var":["guess",{"start":116,"end":121,"start_line":6,"end_line":6,"start_column":5,"end_column":10}]},"span":{"start":116,"end":121,"start_line":6,"end_line":6,"start_column":5,"end_column":10}}}],"span":{"start":28,"end":122,"start_line":2,"end_line":7,"start_column":5,"end_column":1}},"span":{"start":0,"end":125,"start_line":1,"end_line":7,"start_column":1,"end_column":4}}],"modules":[],"main":{"stmts":[{"Assign":{"var":"result","value":{"Call":{"function":"newton_sqrt","args":[{"Literal":[{"Float":2.0},{"start":148,"end":151,"start_line":9,"end_line":9,"start_column":22,"end_column":25}]}],"kwargs":[],"span":{"start":136,"end":152,"start_line":9,"end_line":9,"start_column":10,"end_column":26}}},"span":{"start":127,"end":152,"start_line":9,"end_line":9,"start_column":1,"end_column":26}}},{"Expr":{"expr":{"Call":{"function":"println","args":[{"Literal":[{"Str":"sqrt(2) = "},{"start":161,"end":173,"start_line":10,"end_line":10,"start_column":9,"end_column":21}]},{"Var":["result",{"start":175,"end":181,"start_line":10,"end_line":10,"start_column":23,"end_column":29}]}],"kwargs":[],"span":{"start":153,"end":182,"start_line":10,"end_line":10,"start_column":1,"end_column":30}}},"span":{"start":153,"end":182,"start_line":10,"end_line":10,"start_column":1,"end_column":30}}}],"span":{"start":0,"end":182,"start_line":1,"end_line":10,"start_column":1,"end_column":30}}}`
  },
  {
    name: "Coprime π Estimation",
    code: `# Estimate π using coprime probability: P(gcd(a,b)=1) = 6/π²
# Using VM's built-in rand() for better randomness

function mygcd(a, b)
    while b != 0
        r = a % b
        a = b
        b = r
    end
    a
end

function estimate_pi(N)
    cnt = 0
    for a in 1:N
        for b in 1:N
            cnt += ifelse(mygcd(a, b) == 1, 1, 0)
        end
    end
    sqrt(6.0 * N * N / cnt)
end

result = @time estimate_pi(30)
println("N=30:  π ≈ ", result)

result = @time estimate_pi(100)
println("N=100: π ≈ ", result)

result = @time estimate_pi(300)
println("N=300: π ≈ ", result)`,
    ir: null
  },
  {
    name: "Mandelbrot ASCII Art",
    code: `# Mandelbrot escape time algorithm
function mandelbrot_escape(c, maxiter)
    z = 0.0 + 0.0im
    for k in 1:maxiter
        if abs2(z) > 4.0
            return k
        end
        z = z^2 + c
    end
    return maxiter
end

# Compute grid of escape times
function mandelbrot_grid(width, height, maxiter)
    xmin = -2.0; xmax = 1.0
    ymin = -1.2; ymax = 1.2
    grid = zeros(height, width)

    for row in 1:height
        ci = ymax - (row - 1) * (ymax - ymin) / (height - 1)
        for col in 1:width
            cr = xmin + (col - 1) * (xmax - xmin) / (width - 1)
            c = cr + ci * im
            grid[row, col] = mandelbrot_escape(c, maxiter)
        end
    end
    grid
end

# ASCII visualization
@time grid = mandelbrot_grid(50, 25, 50)
println("Mandelbrot Set (50x25):")
for row in 1:25
    for col in 1:50
        n = grid[row, col]
        if n == 50
            print("#")
        elseif n > 25
            print("+")
        elseif n > 10
            print(".")
        else
            print(" ")
        end
    end
    println("")
end

println(grid[12, 25])`,
    ir: `{"structs":[],"functions":[{"name":"mandelbrot_escape","params":[{"name":"c","type_annotation":null,"span":{"start":62,"end":63,"start_line":2,"end_line":2,"start_column":28,"end_column":29}},{"name":"maxiter","type_annotation":null,"span":{"start":65,"end":72,"start_line":2,"end_line":2,"start_column":31,"end_column":38}}],"kwparams":[],"body":{"stmts":[{"Assign":{"var":"z","value":{"BinaryOp":{"op":"Add","left":{"Literal":[{"Float":0.0},{"start":82,"end":85,"start_line":3,"end_line":3,"start_column":9,"end_column":12}]},"right":{"BinaryOp":{"op":"Mul","left":{"Literal":[{"Float":0.0},{"start":88,"end":91,"start_line":3,"end_line":3,"start_column":15,"end_column":18}]},"right":{"Literal":[{"Complex":[0.0,1.0]},{"start":91,"end":93,"start_line":3,"end_line":3,"start_column":18,"end_column":20}]},"span":{"start":88,"end":93,"start_line":3,"end_line":3,"start_column":15,"end_column":20}}},"span":{"start":82,"end":93,"start_line":3,"end_line":3,"start_column":9,"end_column":20}}},"span":{"start":78,"end":93,"start_line":3,"end_line":3,"start_column":5,"end_column":20}}},{"For":{"var":"k","start":{"Literal":[{"Int":1},{"start":107,"end":108,"start_line":4,"end_line":4,"start_column":14,"end_column":15}]},"end":{"Var":["maxiter",{"start":109,"end":116,"start_line":4,"end_line":4,"start_column":16,"end_column":23}]},"step":null,"body":{"stmts":[{"If":{"condition":{"BinaryOp":{"op":"Gt","left":{"Builtin":{"name":"Abs2","args":[{"Var":["z",{"start":133,"end":134,"start_line":5,"end_line":5,"start_column":17,"end_column":18}]}],"span":{"start":128,"end":135,"start_line":5,"end_line":5,"start_column":12,"end_column":19}}},"right":{"Literal":[{"Float":4.0},{"start":138,"end":141,"start_line":5,"end_line":5,"start_column":22,"end_column":25}]},"span":{"start":128,"end":141,"start_line":5,"end_line":5,"start_column":12,"end_column":25}}},"then_branch":{"stmts":[{"Return":{"value":{"Var":["k",{"start":161,"end":162,"start_line":6,"end_line":6,"start_column":20,"end_column":21}]},"span":{"start":154,"end":162,"start_line":6,"end_line":6,"start_column":13,"end_column":21}}}],"span":{"start":154,"end":163,"start_line":6,"end_line":7,"start_column":13,"end_column":1}},"else_branch":null,"span":{"start":125,"end":174,"start_line":5,"end_line":7,"start_column":9,"end_column":12}}},{"Assign":{"var":"z","value":{"BinaryOp":{"op":"Add","left":{"BinaryOp":{"op":"Pow","left":{"Var":["z",{"start":187,"end":188,"start_line":8,"end_line":8,"start_column":13,"end_column":14}]},"right":{"Literal":[{"Int":2},{"start":189,"end":190,"start_line":8,"end_line":8,"start_column":15,"end_column":16}]},"span":{"start":187,"end":190,"start_line":8,"end_line":8,"start_column":13,"end_column":16}}},"right":{"Var":["c",{"start":193,"end":194,"start_line":8,"end_line":8,"start_column":19,"end_column":20}]},"span":{"start":187,"end":194,"start_line":8,"end_line":8,"start_column":13,"end_column":20}}},"span":{"start":183,"end":194,"start_line":8,"end_line":8,"start_column":9,"end_column":20}}}],"span":{"start":125,"end":195,"start_line":5,"end_line":9,"start_column":9,"end_column":1}},"span":{"start":98,"end":202,"start_line":4,"end_line":9,"start_column":5,"end_column":8}}},{"Return":{"value":{"Var":["maxiter",{"start":214,"end":221,"start_line":10,"end_line":10,"start_column":12,"end_column":19}]},"span":{"start":207,"end":221,"start_line":10,"end_line":10,"start_column":5,"end_column":19}}}],"span":{"start":78,"end":222,"start_line":3,"end_line":11,"start_column":5,"end_column":1}},"span":{"start":35,"end":225,"start_line":2,"end_line":11,"start_column":1,"end_column":4}},{"name":"mandelbrot_grid","params":[{"name":"width","type_annotation":null,"span":{"start":283,"end":288,"start_line":14,"end_line":14,"start_column":26,"end_column":31}},{"name":"height","type_annotation":null,"span":{"start":290,"end":296,"start_line":14,"end_line":14,"start_column":33,"end_column":39}},{"name":"maxiter","type_annotation":null,"span":{"start":298,"end":305,"start_line":14,"end_line":14,"start_column":41,"end_column":48}}],"kwparams":[],"body":{"stmts":[{"Assign":{"var":"xmin","value":{"UnaryOp":{"op":"Neg","operand":{"Literal":[{"Float":2.0},{"start":319,"end":322,"start_line":15,"end_line":15,"start_column":13,"end_column":16}]},"span":{"start":318,"end":322,"start_line":15,"end_line":15,"start_column":12,"end_column":16}}},"span":{"start":311,"end":322,"start_line":15,"end_line":15,"start_column":5,"end_column":16}}},{"Assign":{"var":"xmax","value":{"Literal":[{"Float":1.0},{"start":331,"end":334,"start_line":15,"end_line":15,"start_column":25,"end_column":28}]},"span":{"start":324,"end":334,"start_line":15,"end_line":15,"start_column":18,"end_column":28}}},{"Assign":{"var":"ymin","value":{"UnaryOp":{"op":"Neg","operand":{"Literal":[{"Float":1.2},{"start":347,"end":350,"start_line":16,"end_line":16,"start_column":13,"end_column":16}]},"span":{"start":346,"end":350,"start_line":16,"end_line":16,"start_column":12,"end_column":16}}},"span":{"start":339,"end":350,"start_line":16,"end_line":16,"start_column":5,"end_column":16}}},{"Assign":{"var":"ymax","value":{"Literal":[{"Float":1.2},{"start":359,"end":362,"start_line":16,"end_line":16,"start_column":25,"end_column":28}]},"span":{"start":352,"end":362,"start_line":16,"end_line":16,"start_column":18,"end_column":28}}},{"Assign":{"var":"grid","value":{"Builtin":{"name":"Zeros","args":[{"Var":["height",{"start":380,"end":386,"start_line":17,"end_line":17,"start_column":18,"end_column":24}]},{"Var":["width",{"start":388,"end":393,"start_line":17,"end_line":17,"start_column":26,"end_column":31}]}],"span":{"start":374,"end":394,"start_line":17,"end_line":17,"start_column":12,"end_column":32}}},"span":{"start":367,"end":394,"start_line":17,"end_line":17,"start_column":5,"end_column":32}}},{"For":{"var":"row","start":{"Literal":[{"Int":1},{"start":411,"end":412,"start_line":19,"end_line":19,"start_column":16,"end_column":17}]},"end":{"Var":["height",{"start":413,"end":419,"start_line":19,"end_line":19,"start_column":18,"end_column":24}]},"step":null,"body":{"stmts":[{"Assign":{"var":"ci","value":{"BinaryOp":{"op":"Sub","left":{"Var":["ymax",{"start":433,"end":437,"start_line":20,"end_line":20,"start_column":14,"end_column":18}]},"right":{"BinaryOp":{"op":"Div","left":{"BinaryOp":{"op":"Mul","left":{"BinaryOp":{"op":"Sub","left":{"Var":["row",{"start":441,"end":444,"start_line":20,"end_line":20,"start_column":22,"end_column":25}]},"right":{"Literal":[{"Int":1},{"start":447,"end":448,"start_line":20,"end_line":20,"start_column":28,"end_column":29}]},"span":{"start":441,"end":448,"start_line":20,"end_line":20,"start_column":22,"end_column":29}}},"right":{"BinaryOp":{"op":"Sub","left":{"Var":["ymax",{"start":453,"end":457,"start_line":20,"end_line":20,"start_column":34,"end_column":38}]},"right":{"Var":["ymin",{"start":460,"end":464,"start_line":20,"end_line":20,"start_column":41,"end_column":45}]},"span":{"start":453,"end":464,"start_line":20,"end_line":20,"start_column":34,"end_column":45}}},"span":{"start":440,"end":465,"start_line":20,"end_line":20,"start_column":21,"end_column":46}}},"right":{"BinaryOp":{"op":"Sub","left":{"Var":["height",{"start":469,"end":475,"start_line":20,"end_line":20,"start_column":50,"end_column":56}]},"right":{"Literal":[{"Int":1},{"start":478,"end":479,"start_line":20,"end_line":20,"start_column":59,"end_column":60}]},"span":{"start":469,"end":479,"start_line":20,"end_line":20,"start_column":50,"end_column":60}}},"span":{"start":440,"end":480,"start_line":20,"end_line":20,"start_column":21,"end_column":61}}},"span":{"start":433,"end":480,"start_line":20,"end_line":20,"start_column":14,"end_column":61}}},"span":{"start":428,"end":480,"start_line":20,"end_line":20,"start_column":9,"end_column":61}}},{"For":{"var":"col","start":{"Literal":[{"Int":1},{"start":500,"end":501,"start_line":21,"end_line":21,"start_column":20,"end_column":21}]},"end":{"Var":["width",{"start":502,"end":507,"start_line":21,"end_line":21,"start_column":22,"end_column":27}]},"step":null,"body":{"stmts":[{"Assign":{"var":"cr","value":{"BinaryOp":{"op":"Add","left":{"Var":["xmin",{"start":525,"end":529,"start_line":22,"end_line":22,"start_column":18,"end_column":22}]},"right":{"BinaryOp":{"op":"Div","left":{"BinaryOp":{"op":"Mul","left":{"BinaryOp":{"op":"Sub","left":{"Var":["col",{"start":533,"end":536,"start_line":22,"end_line":22,"start_column":26,"end_column":29}]},"right":{"Literal":[{"Int":1},{"start":539,"end":540,"start_line":22,"end_line":22,"start_column":32,"end_column":33}]},"span":{"start":533,"end":540,"start_line":22,"end_line":22,"start_column":26,"end_column":33}}},"right":{"BinaryOp":{"op":"Sub","left":{"Var":["xmax",{"start":545,"end":549,"start_line":22,"end_line":22,"start_column":38,"end_column":42}]},"right":{"Var":["xmin",{"start":552,"end":556,"start_line":22,"end_line":22,"start_column":45,"end_column":49}]},"span":{"start":545,"end":556,"start_line":22,"end_line":22,"start_column":38,"end_column":49}}},"span":{"start":532,"end":557,"start_line":22,"end_line":22,"start_column":25,"end_column":50}}},"right":{"BinaryOp":{"op":"Sub","left":{"Var":["width",{"start":561,"end":566,"start_line":22,"end_line":22,"start_column":54,"end_column":59}]},"right":{"Literal":[{"Int":1},{"start":569,"end":570,"start_line":22,"end_line":22,"start_column":62,"end_column":63}]},"span":{"start":561,"end":570,"start_line":22,"end_line":22,"start_column":54,"end_column":63}}},"span":{"start":532,"end":571,"start_line":22,"end_line":22,"start_column":25,"end_column":64}}},"span":{"start":525,"end":571,"start_line":22,"end_line":22,"start_column":18,"end_column":64}}},"span":{"start":520,"end":571,"start_line":22,"end_line":22,"start_column":13,"end_column":64}}},{"Assign":{"var":"c","value":{"BinaryOp":{"op":"Add","left":{"Var":["cr",{"start":588,"end":590,"start_line":23,"end_line":23,"start_column":17,"end_column":19}]},"right":{"BinaryOp":{"op":"Mul","left":{"Var":["ci",{"start":593,"end":595,"start_line":23,"end_line":23,"start_column":22,"end_column":24}]},"right":{"Literal":[{"Complex":[0.0,1.0]},{"start":598,"end":600,"start_line":23,"end_line":23,"start_column":27,"end_column":29}]},"span":{"start":593,"end":600,"start_line":23,"end_line":23,"start_column":22,"end_column":29}}},"span":{"start":588,"end":600,"start_line":23,"end_line":23,"start_column":17,"end_column":29}}},"span":{"start":584,"end":600,"start_line":23,"end_line":23,"start_column":13,"end_column":29}}},{"IndexAssign":{"array":"grid","indices":[{"Var":["row",{"start":618,"end":621,"start_line":24,"end_line":24,"start_column":18,"end_column":21}]},{"Var":["col",{"start":623,"end":626,"start_line":24,"end_line":24,"start_column":23,"end_column":26}]}],"value":{"Call":{"function":"mandelbrot_escape","args":[{"Var":["c",{"start":648,"end":649,"start_line":24,"end_line":24,"start_column":48,"end_column":49}]},{"Var":["maxiter",{"start":651,"end":658,"start_line":24,"end_line":24,"start_column":51,"end_column":58}]}],"kwargs":[],"span":{"start":630,"end":659,"start_line":24,"end_line":24,"start_column":30,"end_column":59}}},"span":{"start":613,"end":659,"start_line":24,"end_line":24,"start_column":13,"end_column":59}}}],"span":{"start":520,"end":660,"start_line":22,"end_line":25,"start_column":13,"end_column":1}},"span":{"start":489,"end":671,"start_line":21,"end_line":25,"start_column":9,"end_column":12}}}],"span":{"start":428,"end":672,"start_line":20,"end_line":26,"start_column":9,"end_column":1}},"span":{"start":400,"end":679,"start_line":19,"end_line":26,"start_column":5,"end_column":8}}},{"Expr":{"expr":{"Var":["grid",{"start":684,"end":688,"start_line":27,"end_line":27,"start_column":5,"end_column":9}]},"span":{"start":684,"end":688,"start_line":27,"end_line":27,"start_column":5,"end_column":9}}}],"span":{"start":311,"end":689,"start_line":15,"end_line":28,"start_column":5,"end_column":1}},"span":{"start":258,"end":692,"start_line":14,"end_line":28,"start_column":1,"end_column":4}}],"modules":[],"main":{"stmts":[{"Timed":{"body":{"stmts":[{"Assign":{"var":"grid","value":{"Call":{"function":"mandelbrot_grid","args":[{"Literal":[{"Int":50},{"start":745,"end":747,"start_line":31,"end_line":31,"start_column":30,"end_column":32}]},{"Literal":[{"Int":25},{"start":749,"end":751,"start_line":31,"end_line":31,"start_column":34,"end_column":36}]},{"Literal":[{"Int":50},{"start":753,"end":755,"start_line":31,"end_line":31,"start_column":38,"end_column":40}]}],"kwargs":[],"span":{"start":729,"end":756,"start_line":31,"end_line":31,"start_column":14,"end_column":41}}},"span":{"start":722,"end":756,"start_line":31,"end_line":31,"start_column":7,"end_column":41}}}],"span":{"start":716,"end":756,"start_line":31,"end_line":31,"start_column":1,"end_column":41}},"span":{"start":716,"end":756,"start_line":31,"end_line":31,"start_column":1,"end_column":41}}},{"Expr":{"expr":{"Call":{"function":"println","args":[{"Literal":[{"Str":"Mandelbrot Set (50x25):"},{"start":765,"end":790,"start_line":32,"end_line":32,"start_column":9,"end_column":34}]}],"kwargs":[],"span":{"start":757,"end":791,"start_line":32,"end_line":32,"start_column":1,"end_column":35}}},"span":{"start":757,"end":791,"start_line":32,"end_line":32,"start_column":1,"end_column":35}}},{"For":{"var":"row","start":{"Literal":[{"Int":1},{"start":803,"end":804,"start_line":33,"end_line":33,"start_column":12,"end_column":13}]},"end":{"Literal":[{"Int":25},{"start":805,"end":807,"start_line":33,"end_line":33,"start_column":14,"end_column":16}]},"step":null,"body":{"stmts":[{"For":{"var":"col","start":{"Literal":[{"Int":1},{"start":823,"end":824,"start_line":34,"end_line":34,"start_column":16,"end_column":17}]},"end":{"Literal":[{"Int":50},{"start":825,"end":827,"start_line":34,"end_line":34,"start_column":18,"end_column":20}]},"step":null,"body":{"stmts":[{"Assign":{"var":"n","value":{"Index":{"array":{"Var":["grid",{"start":840,"end":844,"start_line":35,"end_line":35,"start_column":13,"end_column":17}]},"indices":[{"Var":["row",{"start":845,"end":848,"start_line":35,"end_line":35,"start_column":18,"end_column":21}]},{"Var":["col",{"start":850,"end":853,"start_line":35,"end_line":35,"start_column":23,"end_column":26}]}],"span":{"start":840,"end":854,"start_line":35,"end_line":35,"start_column":13,"end_column":27}}},"span":{"start":836,"end":854,"start_line":35,"end_line":35,"start_column":9,"end_column":27}}},{"If":{"condition":{"BinaryOp":{"op":"Eq","left":{"Var":["n",{"start":866,"end":867,"start_line":36,"end_line":36,"start_column":12,"end_column":13}]},"right":{"Literal":[{"Int":50},{"start":871,"end":873,"start_line":36,"end_line":36,"start_column":17,"end_column":19}]},"span":{"start":866,"end":873,"start_line":36,"end_line":36,"start_column":12,"end_column":19}}},"then_branch":{"stmts":[{"Expr":{"expr":{"Call":{"function":"print","args":[{"Literal":[{"Str":"#"},{"start":892,"end":895,"start_line":37,"end_line":37,"start_column":19,"end_column":22}]}],"kwargs":[],"span":{"start":886,"end":896,"start_line":37,"end_line":37,"start_column":13,"end_column":23}}},"span":{"start":886,"end":896,"start_line":37,"end_line":37,"start_column":13,"end_column":23}}}],"span":{"start":886,"end":897,"start_line":37,"end_line":38,"start_column":13,"end_column":1}},"else_branch":{"stmts":[{"If":{"condition":{"BinaryOp":{"op":"Gt","left":{"Var":["n",{"start":912,"end":913,"start_line":38,"end_line":38,"start_column":16,"end_column":17}]},"right":{"Literal":[{"Int":25},{"start":916,"end":918,"start_line":38,"end_line":38,"start_column":20,"end_column":22}]},"span":{"start":912,"end":918,"start_line":38,"end_line":38,"start_column":16,"end_column":22}}},"then_branch":{"stmts":[{"Expr":{"expr":{"Call":{"function":"print","args":[{"Literal":[{"Str":"+"},{"start":937,"end":940,"start_line":39,"end_line":39,"start_column":19,"end_column":22}]}],"kwargs":[],"span":{"start":931,"end":941,"start_line":39,"end_line":39,"start_column":13,"end_column":23}}},"span":{"start":931,"end":941,"start_line":39,"end_line":39,"start_column":13,"end_column":23}}}],"span":{"start":931,"end":942,"start_line":39,"end_line":40,"start_column":13,"end_column":1}},"else_branch":{"stmts":[{"If":{"condition":{"BinaryOp":{"op":"Gt","left":{"Var":["n",{"start":957,"end":958,"start_line":40,"end_line":40,"start_column":16,"end_column":17}]},"right":{"Literal":[{"Int":10},{"start":961,"end":963,"start_line":40,"end_line":40,"start_column":20,"end_column":22}]},"span":{"start":957,"end":963,"start_line":40,"end_line":40,"start_column":16,"end_column":22}}},"then_branch":{"stmts":[{"Expr":{"expr":{"Call":{"function":"print","args":[{"Literal":[{"Str":"."},{"start":982,"end":985,"start_line":41,"end_line":41,"start_column":19,"end_column":22}]}],"kwargs":[],"span":{"start":976,"end":986,"start_line":41,"end_line":41,"start_column":13,"end_column":23}}},"span":{"start":976,"end":986,"start_line":41,"end_line":41,"start_column":13,"end_column":23}}}],"span":{"start":976,"end":987,"start_line":41,"end_line":42,"start_column":13,"end_column":1}},"else_branch":{"stmts":[{"Expr":{"expr":{"Call":{"function":"print","args":[{"Literal":[{"Str":" "},{"start":1018,"end":1021,"start_line":43,"end_line":43,"start_column":19,"end_column":22}]}],"kwargs":[],"span":{"start":1012,"end":1022,"start_line":43,"end_line":43,"start_column":13,"end_column":23}}},"span":{"start":1012,"end":1022,"start_line":43,"end_line":43,"start_column":13,"end_column":23}}}],"span":{"start":1012,"end":1023,"start_line":43,"end_line":44,"start_column":13,"end_column":1}},"span":{"start":950,"end":987,"start_line":40,"end_line":42,"start_column":9,"end_column":1}}}],"span":{"start":950,"end":987,"start_line":40,"end_line":42,"start_column":9,"end_column":1}},"span":{"start":905,"end":942,"start_line":38,"end_line":40,"start_column":9,"end_column":1}}}],"span":{"start":905,"end":942,"start_line":38,"end_line":40,"start_column":9,"end_column":1}},"span":{"start":863,"end":1034,"start_line":36,"end_line":44,"start_column":9,"end_column":12}}}],"span":{"start":836,"end":1035,"start_line":35,"end_line":45,"start_column":9,"end_column":1}},"span":{"start":812,"end":1042,"start_line":34,"end_line":45,"start_column":5,"end_column":8}}},{"Expr":{"expr":{"Call":{"function":"println","args":[{"Literal":[{"Str":""},{"start":1055,"end":1057,"start_line":46,"end_line":46,"start_column":13,"end_column":15}]}],"kwargs":[],"span":{"start":1047,"end":1058,"start_line":46,"end_line":46,"start_column":5,"end_column":16}}},"span":{"start":1047,"end":1058,"start_line":46,"end_line":46,"start_column":5,"end_column":16}}}],"span":{"start":812,"end":1059,"start_line":34,"end_line":47,"start_column":5,"end_column":1}},"span":{"start":792,"end":1062,"start_line":33,"end_line":47,"start_column":1,"end_column":4}}},{"Expr":{"expr":{"Call":{"function":"println","args":[{"Index":{"array":{"Var":["grid",{"start":1072,"end":1076,"start_line":49,"end_line":49,"start_column":9,"end_column":13}]},"indices":[{"Literal":[{"Int":12},{"start":1077,"end":1079,"start_line":49,"end_line":49,"start_column":14,"end_column":16}]},{"Literal":[{"Int":25},{"start":1081,"end":1083,"start_line":49,"end_line":49,"start_column":18,"end_column":20}]}],"span":{"start":1072,"end":1084,"start_line":49,"end_line":49,"start_column":9,"end_column":21}}}],"kwargs":[],"span":{"start":1064,"end":1085,"start_line":49,"end_line":49,"start_column":1,"end_column":22}}},"span":{"start":1064,"end":1085,"start_line":49,"end_line":49,"start_column":1,"end_column":22}}}],"span":{"start":0,"end":1085,"start_line":1,"end_line":49,"start_column":1,"end_column":22}}}`
  },
  {
    name: "FizzBuzz",
    code: `function fizzbuzz(n)
    for i in 1:n
        if i % 15 == 0
            println("FizzBuzz")
        elseif i % 3 == 0
            println("Fizz")
        elseif i % 5 == 0
            println("Buzz")
        else
            println(i)
        end
    end
end

fizzbuzz(30)`,
    ir: null
  },
  {
    name: "Fibonacci (Iterative)",
    code: `function fib_fast(n)
    if n <= 1
        return n
    end
    a = 0
    b = 1
    for i in 2:n
        c = a + b
        a = b
        b = c
    end
    b
end

for i in 1:20
    println("fib(", i, ") = ", fib_fast(i))
end

println(fib_fast(30))`,
    ir: null
  },
  {
    name: "Higher-Order Functions",
    code: `# map, filter, reduce, sum
arr = [1, 2, 3, 4, 5]

# Square each element
function square(x)
    x * x
end
squared = map(square, arr)
println("squared: ", squared)

# Filter even numbers
function is_even(x)
    x % 2 == 0
end
evens = filter(is_even, arr)
println("evens: ", evens)

# Sum all elements (direct)
total = sum(arr)
println("sum(arr): ", total)

# Sum with transformation: sum(f, arr)
sum_of_squares = sum(square, arr)
println("sum(square, arr): ", sum_of_squares)

# Reduce with binary function
function add(a, b)
    a + b
end
reduced = reduce(add, arr)
println("reduce(add, arr): ", reduced)

sum_of_squares`,
    ir: null
  }
];
