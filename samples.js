// Sample Julia programs for the playground
export const samples = [
    {
        name: "Hello World",
        category: "Basic",
        code: `println("Hello, World!")`
    },
    {
        name: "Sum to N",
        category: "Loops",
        code: `function sum_to_n(N)
    sum = 0
    for i in 1:N
        sum += i
    end
    sum
end

sum_to_n(100)`
    },
    {
        name: "Factorial (Recursive)",
        category: "Functions",
        code: `function factorial(n)
    if n <= 1
        return 1
    end
    n * factorial(n - 1)
end

factorial(10)`
    },
    {
        name: "Fibonacci (Recursive)",
        category: "Algorithms",
        code: `function fib(n)
    if n <= 1
        return n
    end
    fib(n - 1) + fib(n - 2)
end

fib(15)`
    },
    {
        name: "Estimate Pi (Monte Carlo)",
        category: "Monte Carlo",
        code: `function estimate_pi(N)
    inside = 0
    for i in 1:N
        x = rand()
        y = rand()
        if x^2 + y^2 < 1.0
            inside += 1
        end
    end
    4.0 * inside / N
end

estimate_pi(10000)`
    },
    {
        name: "Dot Product",
        category: "Arrays",
        code: `function dot_product(a, b)
    sum = 0.0
    for i in 1:length(a)
        sum += a[i] * b[i]
    end
    sum
end

a = [1.0, 2.0, 3.0]
b = [4.0, 5.0, 6.0]
dot_product(a, b)`
    },
    {
        name: "GCD (Euclidean)",
        category: "Algorithms",
        code: `function gcd(a, b)
    while b != 0
        r = a % b
        a = b
        b = r
    end
    a
end

gcd(48, 18)`
    },
    {
        name: "Prime Check",
        category: "Functions",
        code: `function is_prime(n)
    if n < 2
        return false
    end
    for i in 2:n-1
        if n % i == 0
            return false
        end
    end
    true
end

is_prime(17)`
    },
    {
        name: "Newton's Method (sqrt)",
        category: "Mathematics",
        code: `function newton_sqrt(x)
    guess = x / 2.0
    for i in 1:20
        guess = (guess + x / guess) / 2.0
    end
    guess
end

newton_sqrt(2.0)`
    },
    {
        name: "Complex Numbers",
        category: "Mathematics",
        code: `# Complex number operations
z1 = complex(3.0, 4.0)
z2 = complex(1.0, 2.0)

println("z1 = ", z1)
println("z2 = ", z2)
println("z1 + z2 = ", z1 + z2)
println("z1 * z2 = ", z1 * z2)
println("|z1| = ", abs(z1))

abs(z1)`
    },
    {
        name: "Array Comprehension",
        category: "Arrays",
        code: `# Squares of numbers 1 to 10
squares = [x^2 for x in 1:10]
println(squares)

# Filter even numbers
evens = [x for x in 1:20 if x % 2 == 0]
println(evens)

sum(squares)`
    },
    {
        name: "Higher-Order Functions",
        category: "Functions",
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

sum_of_squares`
    },
    {
        name: "Matrix Operations",
        category: "Arrays",
        code: `# Matrix-vector multiplication
A = [[1.0, 2.0, 3.0],
     [4.0, 5.0, 6.0],
     [7.0, 8.0, 9.0]]
v = [1.0, 0.0, 0.0]

result = A * v
println("A * v = ", result)

result[1]`
    },
    {
        name: "Sieve of Eratosthenes",
        category: "Algorithms",
        code: `function sieve(n)
    is_prime = fill(true, n)
    is_prime[1] = false

    for i in 2:n
        if is_prime[i]
            j = i * 2
            while j <= n
                is_prime[j] = false
                j += i
            end
        end
    end

    count = 0
    for i in 1:n
        if is_prime[i]
            count += 1
        end
    end
    count
end

sieve(100)`
    },
    {
        name: "Broadcast Operations",
        category: "Arrays",
        code: `# Element-wise operations with broadcast
a = [1.0, 2.0, 3.0, 4.0]
b = [5.0, 6.0, 7.0, 8.0]

println("a .+ b = ", a .+ b)
println("a .* b = ", a .* b)
println("a .^ 2 = ", a .^ 2)
println("sqrt.(a) = ", sqrt.(a))

sum(a .* b)`
    }
];
