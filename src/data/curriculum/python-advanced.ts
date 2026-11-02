import { CurriculumLevel } from '../../types';

export const PYTHON_ADVANCED_LEVELS: CurriculumLevel[] = [
  {
    levelNumber: 4,
    title: 'Functions',
    description: 'Parameters, Return Values, Scope, *args/**kwargs, Lambda functions, Higher-Order Functions, and Recursion.',
    chapters: [
      {
        id: 'py_c33',
        number: 1,
        title: 'Defining Functions',
        description: 'def syntax, return values, docstrings, and call-by-object-reference mechanics.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c33_l1',
            chapterId: 'py_c33',
            title: 'Call-by-Object-Reference in Python',
            duration: '10 min',
            summary: 'Understand how arguments are passed into functions via object reference binding.',
            learningObjectives: [
              'Define functions with def and return',
              'Understand how immutable vs mutable parameters behave when passed to functions',
              'Prevent accidental list mutation inside helper routines'
            ],
            contentMarkdown: `### Call by Object Reference
In Python, variables are passed by object reference.
- If you pass an immutable object (\`int\`, \`str\`, \`tuple\`), modifications inside the function create a new local object; the caller’s value remains unchanged.
- If you pass a mutable object (\`list\`, \`dict\`, \`set\`), mutating it in-place modifies the caller’s object!

\`\`\`python
def append_item(target_list, item):
    target_list.append(item)  # Modifies caller's list!

my_data = [1, 2]
append_item(my_data, 3)
print(my_data)  # [1, 2, 3]
\`\`\``,
            realWorldContext: 'Knowing object reference semantics prevents hard-to-find side effect bugs in shared service caches.',
            codeExample: `def square(n: int) -> int:
    """Return the square of an integer."""
    return n * n

print("Square of 9:", square(9))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Functions without explicit return return None by default.',
              'Passing mutable containers allows functions to mutate caller state.'
            ],
            interactivePractice: {
              instructions: 'Define a function cube(x) that returns x ** 3 and print cube(4).',
              starterCode: `def cube(x):\n    return x ** 3\n\nprint(cube(4))`,
              solutionCode: `def cube(x):\n    return x ** 3\n\nprint(cube(4))`,
              expectedOutput: '64'
            },
            knowledgeCheck: {
              question: 'What does a Python function return if it contains no return statement?',
              options: ['None', '0', 'False', 'Raises SyntaxError'],
              correctIndex: 0,
              explanation: 'In Python, falling off the end of a function without return yields None.'
            },
            challenge: {
              title: 'Pure Function',
              task: 'Write a pure function that returns a new list without mutating the input list.',
              hint: 'return list(input_list) + [new_item]'
            }
          }
        ]
      },
      {
        id: 'py_c34',
        number: 2,
        title: 'Parameters and Arguments',
        description: 'Positional arguments, keyword arguments, and position-only parameters (/).',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c34_l1',
            chapterId: 'py_c34',
            title: 'Positional vs Keyword Arguments & PEP 570',
            duration: '10 min',
            summary: 'Learn positional vs named arguments, and how / enforces positional parameters in modern APIs.',
            learningObjectives: [
              'Combine positional and keyword arguments correctly',
              'Use / to enforce positional-only arguments',
              'Use * to enforce keyword-only arguments'
            ],
            contentMarkdown: `### Keyword-Only and Positional-Only Syntax
\`\`\`python
# / forces positional-only before it
# * forces keyword-only after it
def configure(host, port, /, *, timeout=30, debug=False):
    return f"{host}:{port} (timeout={timeout}, debug={debug})"

# Valid:
configure("localhost", 8080, timeout=10)
# configure(host="localhost", port=8080) -> Raises TypeError!
\`\`\``,
            realWorldContext: 'Standard library modules (like math.pow) use positional-only arguments to match high-performance C implementations.',
            codeExample: `def format_currency(amount, currency="$", decimals=2):
    return f"{currency}{amount:.{decimals}f}"

print(format_currency(1234.5678))
print(format_currency(1234.5678, currency="€", decimals=1))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Positional arguments must appear before keyword arguments in the call signature.',
              'Use keyword-only arguments after * for boolean flags to avoid ambiguity.'
            ],
            interactivePractice: {
              instructions: 'Call format_currency(50, currency="₹", decimals=0) and print output.',
              starterCode: `def format_currency(amount, currency="$", decimals=2):\n    return f"{currency}{amount:.{decimals}f}"\n\nprint(format_currency(50, currency="₹", decimals=0))`,
              solutionCode: `def format_currency(amount, currency="$", decimals=2):\n    return f"{currency}{amount:.{decimals}f}"\n\nprint(format_currency(50, currency="₹", decimals=0))`,
              expectedOutput: '₹50'
            },
            knowledgeCheck: {
              question: 'What does an asterisk * alone in a function signature indicate?',
              options: [
                'All subsequent parameters must be passed as keyword arguments',
                'The function accepts infinite arguments',
                'The function is a generator',
                'Multiplication operator'
              ],
              correctIndex: 0,
              explanation: 'A bare * in the parameter list forces all following parameters to be keyword-only.'
            },
            challenge: {
              title: 'Keyword-Only API',
              task: 'Define a function with a bare * ensuring a flag must be named explicitly.',
              hint: 'def save_file(path, *, overwrite=False): ...'
            }
          }
        ]
      },
      {
        id: 'py_c35',
        number: 3,
        title: 'Return Values',
        description: 'Single, multiple return values via tuple packing, and early returns.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c35_l1',
            chapterId: 'py_c35',
            title: 'Multiple Return Values and Tuple Packing',
            duration: '10 min',
            summary: 'Returning comma-separated values automatically packs a tuple that can be unpacked at the call site.',
            learningObjectives: [
              'Return multiple values cleanly via tuple packing',
              'Use early returns for error handling',
              'Unpack function results directly into variables'
            ],
            contentMarkdown: `### Returning Multiple Values
\`\`\`python
def min_and_max(numbers):
    return min(numbers), max(numbers)  # Returns a tuple!

lowest, highest = min_and_max([12, 5, 87, 43])
print(f"Min: {lowest}, Max: {highest}")
\`\`\``,
            realWorldContext: 'Functions that query remote microservices return status code and response payload as a pair `return status_code, data`.',
            codeExample: `def divide_with_remainder(dividend, divisor):
    quotient = dividend // divisor
    remainder = dividend % divisor
    return quotient, remainder

q, r = divide_with_remainder(27, 4)
print(f"27 / 4 = {q} R {r}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Comma-separated returns return a single tuple object.',
              'Caller can unpack results directly.'
            ],
            interactivePractice: {
              instructions: 'Write a function bounds(l) returning min(l) and max(l) for [4, 9, 1].',
              starterCode: `def bounds(l):\n    return min(l), max(l)\n\nlo, hi = bounds([4, 9, 1])\nprint(f"Lo: {lo}, Hi: {hi}")`,
              solutionCode: `def bounds(l):\n    return min(l), max(l)\n\nlo, hi = bounds([4, 9, 1])\nprint(f"Lo: {lo}, Hi: {hi}")`,
              expectedOutput: 'Lo: 1, Hi: 9'
            },
            knowledgeCheck: {
              question: 'What is the actual type of result in: result = func() when func returns 1, 2, 3?',
              options: ['tuple', 'list', 'set', 'generator'],
              correctIndex: 0,
              explanation: 'Comma-separated values without brackets are packed into an immutable tuple.'
            },
            challenge: {
              title: 'Stats Returner',
              task: 'Return count, sum, and average of a list from one function.',
              hint: 'return len(l), sum(l), sum(l)/len(l)'
            }
          }
        ]
      },
      {
        id: 'py_c36',
        number: 4,
        title: 'Scope',
        description: 'LEGB rule (Local, Enclosing, Global, Built-in), global and nonlocal keywords.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c36_l1',
            chapterId: 'py_c36',
            title: 'The LEGB Scope Resolution Hierarchy',
            duration: '12 min',
            summary: 'Learn the exact order Python uses to resolve names and when to use nonlocal vs global.',
            learningObjectives: [
              'Master the LEGB search order',
              'Use nonlocal to modify variables in enclosing closure scope',
              'Avoid global variables that pollute module namespace'
            ],
            contentMarkdown: `### LEGB Resolution Order
1. **L (Local):** Names assigned inside the function.
2. **E (Enclosing):** Names in enclosing outer functions (closures).
3. **G (Global):** Names defined at module top-level.
4. **B (Built-in):** Predefined names in Python (\`len\`, \`range\`, \`print\`).

\`\`\`python
count = 0  # Global

def outer():
    x = 10  # Enclosing
    def inner():
        nonlocal x
        x += 5  # Modifies enclosing x!
        return x
    return inner
\`\`\``,
            realWorldContext: 'Closures with nonlocal enable encapsulated state tracking in decorators and event listeners.',
            codeExample: `def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

c = make_counter()
print("Counter 1:", c())
print("Counter 2:", c())`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Python searches Local -> Enclosing -> Global -> Built-in.',
              'nonlocal allows inner functions to rebind variables in outer scopes without using globals.'
            ],
            interactivePractice: {
              instructions: 'Test the counter closure and print its third count.',
              starterCode: `def make_counter():\n    count = 0\n    def inc():\n        nonlocal count\n        count += 1\n        return count\n    return inc\n\nc = make_counter()\nc(); c()\nprint("Count:", c())`,
              solutionCode: `def make_counter():\n    count = 0\n    def inc():\n        nonlocal count\n        count += 1\n        return count\n    return inc\n\nc = make_counter()\nc(); c()\nprint("Count:", c())`,
              expectedOutput: 'Count: 3'
            },
            knowledgeCheck: {
              question: 'Which keyword allows modifying a variable in an enclosing (non-global) function scope?',
              options: ['nonlocal', 'global', 'outer', 'closure'],
              correctIndex: 0,
              explanation: 'nonlocal tells Python to bind to the variable in the nearest enclosing non-global scope.'
            },
            challenge: {
              title: 'Running Average Closure',
              task: 'Create a closure that accepts numbers and returns the running cumulative average.',
              hint: 'Track total and count inside the enclosing scope.'
            }
          }
        ]
      },
      {
        id: 'py_c37',
        number: 5,
        title: 'Default Arguments',
        description: 'Default values, evaluation at definition time, and the mutable default argument trap.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c37_l1',
            chapterId: 'py_c37',
            title: 'The Dangerous Mutable Default Argument Trap',
            duration: '10 min',
            summary: 'Default arguments are evaluated once when the function is defined, NOT on each call.',
            learningObjectives: [
              'Understand why def f(items=[]) shares state between calls',
              'Use None as the default sentinel pattern',
              'Write idempotent function signatures'
            ],
            contentMarkdown: `### The Classic Trap
\`\`\`python
# DANGEROUS: list created once at module load!
def add_item(item, basket=[]):
    basket.append(item)
    return basket

print(add_item("apple"))  # ['apple']
print(add_item("banana")) # ['apple', 'banana'] - ACCIDENTAL SHARING!

# THE CORRECT IDIOM: Sentinel None
def add_item_safe(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket
\`\`\``,
            realWorldContext: 'This is the #1 caught bug in Python code reviews; always use None for mutable defaults.',
            codeExample: `def safe_append(val, target=None):
    if target is None:
        target = []
    target.append(val)
    return target

print("Call 1:", safe_append("A"))
print("Call 2:", safe_append("B"))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Default parameter values are evaluated once when def is executed.',
              'Never use mutable objects ([], {}) as default argument values; use None instead.'
            ],
            interactivePractice: {
              instructions: 'Implement safe_append for "X" and print the result.',
              starterCode: `def safe_append(v, l=None):\n    if l is None:\n        l = []\n    l.append(v)\n    return l\n\nprint(safe_append("X"))`,
              solutionCode: `def safe_append(v, l=None):\n    if l is None:\n        l = []\n    l.append(v)\n    return l\n\nprint(safe_append("X"))`,
              expectedOutput: "['X']"
            },
            knowledgeCheck: {
              question: 'When are default parameter values in a Python function evaluated?',
              options: [
                'Once, at function definition time',
                'Every time the function is called',
                'Only when the parameter is omitted',
                'At garbage collection'
              ],
              correctIndex: 0,
              explanation: 'Python evaluates default parameter expressions once when the function definition is executed.'
            },
            challenge: {
              title: 'Default Dict Sentinel',
              task: 'Implement a function get_or_default(key, mapping=None) safely using the None sentinel.',
              hint: 'if mapping is None: mapping = {}'
            }
          }
        ]
      },
      {
        id: 'py_c38',
        number: 6,
        title: 'Keyword Arguments',
        description: 'Named parameters, readability benefits, and API design clarity.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c38_l1',
            chapterId: 'py_c38',
            title: 'Self-Documenting Code with Named Arguments',
            duration: '10 min',
            summary: 'Eliminate mystery parameters like do_task(True, False, 10) by passing explicit keyword arguments.',
            learningObjectives: [
              'Pass arguments by name regardless of parameter order',
              'Enhance readability of boolean flags at the call site',
              'Design resilient APIs that tolerate new optional parameters'
            ],
            contentMarkdown: `### Call-Site Clarity
\`\`\`python
# Ambiguous: What do True and False mean?
process_payment(100.0, True, False, 5)

# Self-documenting with keyword arguments:
process_payment(
    amount=100.0,
    send_receipt=True,
    is_recurring=False,
    max_retries=5
)
\`\`\``,
            realWorldContext: 'Database ORM queries and machine learning hyperparameters rely heavily on explicit keyword arguments.',
            codeExample: `def create_user(username, email, role="Member", is_active=True):
    return {"user": username, "email": email, "role": role, "active": is_active}

user = create_user(
    username="alex_dev",
    email="alex@chullicode.dev",
    is_active=True
)
print("Created:", user)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Keyword arguments make function calls self-documenting.',
              'Keyword arguments can be supplied in any order after positional arguments.'
            ],
            interactivePractice: {
              instructions: 'Call create_user with username="shakti", email="shakti@test.com", and role="Admin".',
              starterCode: `def create_user(username, email, role="Member"):\n    return f"{username} ({role})"\n\nprint(create_user(role="Admin", username="shakti", email="s@test.com"))`,
              solutionCode: `def create_user(username, email, role="Member"):\n    return f"{username} ({role})"\n\nprint(create_user(role="Admin", username="shakti", email="s@test.com"))`,
              expectedOutput: 'shakti (Admin)'
            },
            knowledgeCheck: {
              question: 'Can keyword arguments be passed in a different order than their parameter definitions?',
              options: [
                'Yes, named arguments match by name regardless of order',
                'No, arguments must always strictly match positional order',
                'Only if type hints are present',
                'Only in Python 3.10+'
              ],
              correctIndex: 0,
              explanation: 'Keyword arguments are bound to parameters by their names, so order does not matter.'
            },
            challenge: {
              title: 'API Config Call',
              task: 'Call a multi-arg config function specifying only non-default options by name.',
              hint: 'f(a=1, c=3)'
            }
          }
        ]
      },
      {
        id: 'py_c39',
        number: 7,
        title: '*args and **kwargs',
        description: 'Variadic positional arguments (*args), keyword arguments (**kwargs), and argument forwarding.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c39_l1',
            chapterId: 'py_c39',
            title: 'Variadic Argument Forwarding & Wrapper Decorators',
            duration: '12 min',
            summary: 'Capture arbitrary numbers of positional and keyword arguments for flexible wrappers and decorators.',
            learningObjectives: [
              'Capture excess positional arguments into a tuple via *args',
              'Capture excess keyword arguments into a dict via **kwargs',
              'Forward arguments transparently using func(*args, **kwargs)'
            ],
            contentMarkdown: `### The Variadic Protocol
- \`*args\`: packs excess positional parameters into a \`tuple\`.
- \`**kwargs\`: packs excess keyword arguments into a \`dict\`.

\`\`\`python
def log_and_call(func, *args, **kwargs):
    print(f"Calling {func.__name__} with args={args}, kwargs={kwargs}")
    return func(*args, **kwargs)  # Unpacks and forwards!
\`\`\``,
            realWorldContext: 'Web frameworks (FastAPI, Flask, Django) use *args and **kwargs in route decorators and middleware.',
            codeExample: `def total_sum(*numbers):
    # numbers is a tuple
    return sum(numbers)

print("Sum of 3 numbers:", total_sum(10, 20, 30))
print("Sum of 5 numbers:", total_sum(1, 2, 3, 4, 5))`,
            codeLanguage: 'python',
            keyTakeaways: [
              '*args collects positional arguments into a tuple.',
              '**kwargs collects keyword arguments into a dictionary.',
              'Unpack collections into calls using func(*my_list, **my_dict).'
            ],
            interactivePractice: {
              instructions: 'Write a function multiply_all(*nums) that multiplies all numbers and print multiply_all(2, 3, 4).',
              starterCode: `def multiply_all(*nums):\n    res = 1\n    for n in nums:\n        res *= n\n    return res\n\nprint(multiply_all(2, 3, 4))`,
              solutionCode: `def multiply_all(*nums):\n    res = 1\n    for n in nums:\n        res *= n\n    return res\n\nprint(multiply_all(2, 3, 4))`,
              expectedOutput: '24'
            },
            knowledgeCheck: {
              question: 'Inside a function signature def f(*args, **kwargs): what are the types of args and kwargs?',
              options: [
                'args is a tuple, kwargs is a dict',
                'args is a list, kwargs is a dict',
                'Both are lists',
                'Both are dictionaries'
              ],
              correctIndex: 0,
              explanation: '*args is packed as an immutable tuple, while **kwargs is packed as a dictionary.'
            },
            challenge: {
              title: 'Wrapper Function',
              task: 'Write a wrapper that adds 10 to whatever an arbitrary single-arg function returns.',
              hint: 'def wrap(f, x): return f(x) + 10'
            }
          }
        ]
      },
      {
        id: 'py_c40',
        number: 8,
        title: 'Lambda Functions',
        description: 'Anonymous single-expression functions, sorting keys, and functional paradigms.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c40_l1',
            chapterId: 'py_c40',
            title: 'Anonymous Expressions with lambda',
            duration: '10 min',
            summary: 'Construct lightweight inline functions for sorting and mapping.',
            learningObjectives: [
              'Understand lambda arguments: expression syntax',
              'Use lambdas as sorting key functions',
              'Recognize when a def function is better than a complex lambda'
            ],
            contentMarkdown: `### Lambda Syntax
\`lambda param1, param2: single_expression\`

\`\`\`python
# Anonymous squaring function
square = lambda x: x ** 2
print(square(6))  # 36

# Sorting complex records by price
products = [("Pen", 1.5), ("Notebook", 4.0), ("Eraser", 0.75)]
products.sort(key=lambda item: item[1])
# [('Eraser', 0.75), ('Pen', 1.5), ('Notebook', 4.0)]
\`\`\``,
            realWorldContext: 'Sorting database results or Pandas DataFrame columns by computed scores commonly uses lambda key extractors.',
            codeExample: `pairs = [(1, 'one'), (3, 'three'), (2, 'two'), (4, 'four')]
pairs.sort(key=lambda pair: pair[0])
print("Sorted by number:", pairs)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Lambdas can only contain a single expression whose result is implicitly returned.',
              'Statements (if/else blocks, loops, assignments) cannot exist inside a lambda.'
            ],
            interactivePractice: {
              instructions: 'Sort words = ["elephant", "cat", "dog"] by length using key=lambda w: len(w).',
              starterCode: `words = ["elephant", "cat", "dog"]\nwords.sort(key=lambda w: len(w))\nprint(words)`,
              solutionCode: `words = ["elephant", "cat", "dog"]\nwords.sort(key=lambda w: len(w))\nprint(words)`,
              expectedOutput: "['cat', 'dog', 'elephant']"
            },
            knowledgeCheck: {
              question: 'Can a Python lambda function contain multiple statements or assignments?',
              options: [
                'No, lambdas are syntactically restricted to a single expression',
                'Yes, using semicolons',
                'Yes, if wrapped in parentheses',
                'Only in async functions'
              ],
              correctIndex: 0,
              explanation: 'Python lambdas can only contain a single expression; for statements or multiple lines, define a standard def function.'
            },
            challenge: {
              title: 'Multi-criteria Sort',
              task: 'Sort list of tuples by second element descending using a lambda.',
              hint: 'key=lambda x: -x[1]'
            }
          }
        ]
      },
      {
        id: 'py_c41',
        number: 9,
        title: 'Higher-Order Functions',
        description: 'Functions as first-class citizens, map(), filter(), functools.reduce(), and closures.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c41_l1',
            chapterId: 'py_c41',
            title: 'First-Class Functions and Functional Transformers',
            duration: '12 min',
            summary: 'Pass functions as arguments and return functions from functions.',
            learningObjectives: [
              'Understand first-class functions in Python',
              'Use map() and filter() with lambdas',
              'Use functools.reduce() for iterative aggregation'
            ],
            contentMarkdown: `### Functions are First-Class Objects
In Python, functions can be assigned to variables, stored in dictionaries, passed to other functions, and returned from functions:

\`\`\`python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

# map: applies function to all items
doubled = list(map(lambda x: x * 2, numbers))

# filter: keeps items where function returns True
evens = list(filter(lambda x: x % 2 == 0, numbers))

# reduce: accumulates values
product = reduce(lambda acc, x: acc * x, numbers, 1)  # 120
\`\`\``,
            realWorldContext: 'Map-Reduce is the architectural blueprint behind big-data processing clusters like Apache Spark and Hadoop.',
            codeExample: `from functools import reduce

nums = [1, 2, 3, 4]
total = reduce(lambda a, b: a + b, nums)
print("Accumulated sum via reduce:", total)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Functions are first-class objects in Python.',
              'map and filter return lazy iterators; wrap in list() if you need a materialized list.'
            ],
            interactivePractice: {
              instructions: 'Use map with lambda x: x * 2 on [5, 10, 15] and print as list.',
              starterCode: `res = list(map(lambda x: x * 2, [5, 10, 15]))\nprint(res)`,
              solutionCode: `res = list(map(lambda x: x * 2, [5, 10, 15]))\nprint(res)`,
              expectedOutput: '[10, 20, 30]'
            },
            knowledgeCheck: {
              question: 'What does map() return in Python 3?',
              options: [
                'A lazy map iterator',
                'A materialized list',
                'A tuple',
                'A generator function'
              ],
              correctIndex: 0,
              explanation: 'In Python 3, map() produces an iterator rather than a list, conserving memory until consumed.'
            },
            challenge: {
              title: 'Factorial with Reduce',
              task: 'Compute 5! (factorial of 5) using reduce and range(1, 6).',
              hint: 'reduce(lambda a, b: a * b, range(1, 6))'
            }
          }
        ]
      },
      {
        id: 'py_c42',
        number: 10,
        title: 'Recursion',
        description: 'Base cases, recursive call stack, recursion depth limit, and memoization.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c42_l1',
            chapterId: 'py_c42',
            title: 'Base Case Verification and Call Stack Mechanics',
            duration: '12 min',
            summary: 'Learn how the runtime stack manages recursive frames and why base cases are required.',
            learningObjectives: [
              'Identify and construct solid base cases',
              'Understand sys.getrecursionlimit() (default ~1000)',
              'Apply functools.lru_cache for O(1) memoization'
            ],
            contentMarkdown: `### Anatomy of a Recursive Function
Every recursive function requires:
1. **Base Case:** Condition that stops recursion and returns directly.
2. **Recursive Step:** Subdivides problem toward the base case.

\`\`\`python
from functools import lru_cache

# Without cache: O(2^N) exponential time!
# With lru_cache: O(N) linear time!
@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
\`\`\``,
            realWorldContext: 'File systems (nested directories) and DOM trees are recursively structured and best traversed using recursive algorithms.',
            codeExample: `def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print("5! =", factorial(5))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Without a base case, recursion raises RecursionError: maximum recursion depth exceeded.',
              'Use @lru_cache to eliminate redundant recalculation in tree recursion.'
            ],
            interactivePractice: {
              instructions: 'Compute factorial(4) and print the result.',
              starterCode: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(4))`,
              solutionCode: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(4))`,
              expectedOutput: '24'
            },
            knowledgeCheck: {
              question: 'What exception is thrown when a recursive function fails to hit its base case?',
              options: [
                'RecursionError',
                'StackOverflowException',
                'MemoryError',
                'SystemError'
              ],
              correctIndex: 0,
              explanation: 'Python raises RecursionError when the call stack exceeds sys.getrecursionlimit().'
            },
            challenge: {
              title: 'Recursive Sum of List',
              task: 'Compute the sum of [1, 2, 3, 4] using recursion.',
              hint: 'return l[0] + rec_sum(l[1:]) if l else 0'
            }
          }
        ]
      },
      {
        id: 'py_c43',
        number: 11,
        title: 'Function Design',
        description: 'Single Responsibility Principle (SRP), pure functions, type hinting, and error raising.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c43_l1',
            chapterId: 'py_c43',
            title: 'Clean Architecture: Pure Functions & Type Hints',
            duration: '10 min',
            summary: 'Write maintainable, predictable functions with clear contracts and no hidden side effects.',
            learningObjectives: [
              'Design pure functions with predictable input-to-output mapping',
              'Use Python typing annotations (Union, Optional, Callable)',
              'Follow the Single Responsibility Principle'
            ],
            contentMarkdown: `### Pure Functions
A function is **pure** if:
1. Given the same arguments, it always returns the same result.
2. It produces no observable side effects (no global mutations, no disk writes, no network calls).

\`\`\`python
# Pure & Typed
def calculate_tax(subtotal: float, rate: float = 0.08) -> float:
    """Calculate tax for an order without mutating external state."""
    if subtotal < 0 or rate < 0:
        raise ValueError("Subtotal and rate must be non-negative.")
    return round(subtotal * rate, 2)
\`\`\``,
            realWorldContext: 'Pure functions are trivially testable in unit test suites because they do not require database mocks or external stubs.',
            codeExample: `def format_user_badge(name: str, level: int) -> str:
    return f"[{level}] {name.upper()}"

print(format_user_badge("alex", 5))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Pure functions are easy to test and parallelize.',
              'Type annotations make code self-documenting and verifiable with mypy.'
            ],
            interactivePractice: {
              instructions: 'Write a typed function is_even(n: int) -> bool and print is_even(4).',
              starterCode: `def is_even(n: int) -> bool:\n    return n % 2 == 0\n\nprint(is_even(4))`,
              solutionCode: `def is_even(n: int) -> bool:\n    return n % 2 == 0\n\nprint(is_even(4))`,
              expectedOutput: 'True'
            },
            knowledgeCheck: {
              question: 'Which property characterizes a pure function?',
              options: [
                'Same inputs always produce same output with zero side effects',
                'It uses global variables for memory savings',
                'It contains at least 3 yield statements',
                'It executes in O(1) time'
              ],
              correctIndex: 0,
              explanation: 'Pure functions are deterministic and produce no side effects, guaranteeing predictability.'
            },
            challenge: {
              title: 'Input Validator',
              task: 'Raise ValueError if input string is empty in a clean function.',
              hint: 'if not text.strip(): raise ValueError("Cannot be empty")'
            }
          }
        ]
      },
      {
        id: 'py_c44',
        number: 12,
        title: 'Function Practice Lab',
        description: 'Comprehensive milestone lab solving higher-order transformations and function composition.',
        levelNumber: 4,
        levelTitle: 'Functions',
        estimatedMinutes: 30,
        lessons: [
          {
            id: 'py_c44_l1',
            chapterId: 'py_c44',
            title: 'Functions Capstone: Pipeline Composition & Retry Decorator',
            duration: '15 min',
            summary: 'Build a flexible functional data transformation pipeline.',
            learningObjectives: [
              'Compose multiple functions sequentially: f(g(h(x)))',
              'Implement a pipeline processor',
              'Test with real data records'
            ],
            contentMarkdown: `### Function Pipeline Composition
\`\`\`python
def compose(*funcs):
    """Compose multiple unary functions from left to right."""
    def pipeline(data):
        result = data
        for f in funcs:
            result = f(result)
        return result
    return pipeline

# Processing steps:
clean = lambda s: s.strip()
upper = lambda s: s.upper()
tag = lambda s: f"<tag>{s}</tag>"

processor = compose(clean, upper, tag)
print(processor("  hello world  "))  # "<tag>HELLO WORLD</tag>"
\`\`\``,
            realWorldContext: 'Data transformation pipelines (like scikit-learn Pipelines or PyTorch Transforms) use functional composition.',
            codeExample: `def compose(*funcs):
    def inner(data):
        for f in funcs:
            data = f(data)
        return data
    return inner

pipe = compose(str.strip, str.capitalize, lambda s: s + "!")
print(pipe("  developer  "))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Function composition decouples individual steps into reusable micro-functions.',
              'Pipelines make complex data cleaning steps easy to trace and maintain.'
            ],
            interactivePractice: {
              instructions: 'Test the pipe composition on "  chullicode  " and print the result.',
              starterCode: `def compose(*funcs):\n    def inner(data):\n        for f in funcs:\n            data = f(data)\n        return data\n    return inner\n\npipe = compose(str.strip, str.upper)\nprint(pipe("  chullicode  "))`,
              solutionCode: `def compose(*funcs):\n    def inner(data):\n        for f in funcs:\n            data = f(data)\n        return data\n    return inner\n\npipe = compose(str.strip, str.upper)\nprint(pipe("  chullicode  "))`,
              expectedOutput: 'CHULLICODE'
            },
            knowledgeCheck: {
              question: 'What is the primary benefit of composing functions into a pipeline?',
              options: [
                'Each function focuses on one clear task and steps can be reordered easily',
                'It bypasses the Python GIL',
                'It automatically compiles to WebAssembly',
                'It disables type checking'
              ],
              correctIndex: 0,
              explanation: 'Pipelines adhere to modular design: individual transformations remain simple, testable, and reusable.'
            },
            challenge: {
              title: 'Math Pipeline',
              task: 'Compose functions that double a number then add 5 to it for input 10.',
              hint: 'double = lambda x: x * 2; add5 = lambda x: x + 5'
            }
          }
        ]
      }
    ]
  },
  {
    levelNumber: 5,
    title: 'Object-Oriented Programming',
    description: 'Classes, Objects, Constructors, Encapsulation, Inheritance, Polymorphism, Abstraction, Composition, and Special Methods.',
    chapters: [
      {
        id: 'py_c45',
        number: 1,
        title: 'Classes and Objects',
        description: 'class keyword, instantiation, self reference, and object namespaces.',
        levelNumber: 5,
        levelTitle: 'Object-Oriented Programming',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c45_l1',
            chapterId: 'py_c45',
            title: 'The Blueprint and Instance Architecture',
            duration: '10 min',
            summary: 'Classes act as blueprints that define state and behavior; instances are unique objects created from that blueprint.',
            learningObjectives: [
              'Define classes and instantiate objects',
              'Understand the role of the self argument',
              'Access instance attributes and methods'
            ],
            contentMarkdown: `### The self Parameter
In Python, \`self\` refers to the specific instance calling the method. When you write \`user.greet()\`, Python automatically converts it to \`User.greet(user)\`:

\`\`\`python
class Developer:
    def __init__(self, name: str, role: str):
        self.name = name  # Instance attribute
        self.role = role

    def introduce(self) -> str:
        return f"{self.name} works as a {self.role}."

dev1 = Developer("Alex", "Full-Stack Engineer")
print(dev1.introduce())
\`\`\``,
            realWorldContext: 'Almost all modern libraries (e.g. PyTorch nn.Module, Django Models, FastAPI Dependency Injection) are structured as classes.',
            codeExample: `class Rectangle:
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height

    def area(self) -> float:
        return self.width * self.height

r = Rectangle(10, 5)
print("Rectangle Area:", r.area())`,
            codeLanguage: 'python',
            keyTakeaways: [
              'self represents the calling instance.',
              'Attributes bound to self are unique to each instance.'
            ],
            interactivePractice: {
              instructions: 'Instantiate Rectangle(4, 6) and print its area.',
              starterCode: `class Rectangle:\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\nprint(Rectangle(4, 6).area())`,
              solutionCode: `class Rectangle:\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\nprint(Rectangle(4, 6).area())`,
              expectedOutput: '24'
            },
            knowledgeCheck: {
              question: 'Why must instance methods in Python declare self as their first parameter?',
              options: [
                'Python passes the instance object as the first positional argument automatically',
                'It is required by the OS allocator',
                'To distinguish from static functions',
                'To prevent circular imports'
              ],
              correctIndex: 0,
              explanation: 'When calling obj.method(), Python desugars the call to Class.method(obj), passing the instance as the first argument (self).'
            },
            challenge: {
              title: 'Circle Class',
              task: 'Create a Circle class with radius r and circumference() method.',
              hint: '2 * 3.14159 * self.r'
            }
          }
        ]
      },
      {
        id: 'py_c46',
        number: 2,
        title: 'Constructors and Attributes',
        description: '__init__, __new__, instance attributes vs class attributes.',
        levelNumber: 5,
        levelTitle: 'Object-Oriented Programming',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c46_l1',
            chapterId: 'py_c46',
            title: '__init__ Initializer vs Class Variables',
            duration: '10 min',
            summary: 'Understand how class-level variables are shared across all instances, whereas self attributes are isolated.',
            learningObjectives: [
              'Distinguish class variables (shared) from instance variables (unique)',
              'Avoid mutable class variable pitfalls',
              'Understand __new__ vs __init__'
            ],
            contentMarkdown: `### Class Variables vs Instance Variables
- **Class Variable:** Declared directly inside the class body; shared by all instances.
- **Instance Variable:** Bound to \`self\` inside \`__init__\`; isolated per object.

\`\`\`python
class BankAccount:
    bank_name = "ChulliBank"  # Shared class variable!

    def __init__(self, account_holder: str, balance: float):
        self.holder = account_holder  # Instance variable
        self.balance = balance
\`\`\``,
            realWorldContext: 'Class variables are often used for instance counters or global configuration defaults across all database connections.',
            codeExample: `class User:
    user_count = 0  # Class variable

    def __init__(self, username):
        self.username = username
        User.user_count += 1

u1 = User("Alice")
u2 = User("Bob")
print(f"Total Users Registered: {User.user_count}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Class variables are shared across every instance.',
              'Modifying a class variable via an instance (self.bank_name = "X") creates an instance shadow without modifying the class.'
            ],
            interactivePractice: {
              instructions: 'Create two instances of User and print User.user_count.',
              starterCode: `class User:\n    count = 0\n    def __init__(self):\n        User.count += 1\n\nUser(); User()\nprint(User.count)`,
              solutionCode: `class User:\n    count = 0\n    def __init__(self):\n        User.count += 1\n\nUser(); User()\nprint(User.count)`,
              expectedOutput: '2'
            },
            knowledgeCheck: {
              question: 'What happens if you define a mutable list as a class variable?',
              options: [
                'All instances share that exact same list in memory',
                'Python clones it per instance automatically',
                'Raises a TypeError',
                'The list is marked read-only'
              ],
              correctIndex: 0,
              explanation: 'A class variable is created once when the class is defined; mutable objects like lists are shared among all instances.'
            },
            challenge: {
              title: 'Instance ID Generator',
              task: 'Use a class variable to automatically assign incrementing IDs (1, 2, 3) to new instances.',
              hint: 'self.id = Class.counter; Class.counter += 1'
            }
          }
        ]
      },
      {
        id: 'py_c47',
        number: 3,
        title: 'Encapsulation and Properties',
        description: 'Private attributes (__name), protected conventions (_name), and @property getters/setters.',
        levelNumber: 5,
        levelTitle: 'Object-Oriented Programming',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c47_l1',
            chapterId: 'py_c47',
            title: 'The @property Decorator & Pythonic Encapsulation',
            duration: '12 min',
            summary: 'Expose attributes cleanly while validating assignments with getter and setter properties.',
            learningObjectives: [
              'Understand Python naming convention for private variables (_single, __double)',
              'Use @property to turn methods into readable attributes',
              'Add validation logic to setters'
            ],
            contentMarkdown: `### The Pythonic Property Protocol
Instead of writing Java-style \`get_balance()\` and \`set_balance(x)\`, use \`@property\`:

\`\`\`python
class Temperature:
    def __init__(self, celsius: float):
        self._celsius = celsius

    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float):
        if value < -273.15:
            raise ValueError("Temperature below absolute zero is impossible!")
        self._celsius = value
\`\`\``,
            realWorldContext: 'Database models use properties to encrypt passwords before saving or compute full names on the fly.',
            codeExample: `class Student:
    def __init__(self, first, last):
        self.first = first
        self.last = last

    @property
    def full_name(self):
        return f"{self.first} {self.last}"

s = Student("Alex", "Chen")
print("Full Name:", s.full_name)`,
            codeLanguage: 'python',
            keyTakeaways: [
              '_attribute indicates an internal private implementation detail by convention.',
              '@property allows accessing a method like a normal attribute without calling ().',
              '@prop.setter encapsulates validation logic.'
            ],
            interactivePractice: {
              instructions: 'Create a property for Kelvin that converts Celsius (C + 273.15).',
              starterCode: `class Temp:\n    def __init__(self, c):\n        self.c = c\n    @property\n    def kelvin(self):\n        return self.c + 273.15\n\nprint(Temp(0).kelvin)`,
              solutionCode: `class Temp:\n    def __init__(self, c):\n        self.c = c\n    @property\n    def kelvin(self):\n        return self.c + 273.15\n\nprint(Temp(0).kelvin)`,
              expectedOutput: '273.15'
            },
            knowledgeCheck: {
              question: 'How do you call a property method decorated with @property?',
              options: [
                'Access it like an attribute without parentheses: obj.full_name',
                'Call it with parentheses: obj.full_name()',
                'Using obj.get_full_name()',
                'Via reflection'
              ],
              correctIndex: 0,
              explanation: '@property transforms a method into a managed attribute accessed without parentheses.'
            },
            challenge: {
              title: 'Validated Balance Setter',
              task: 'Create a property for balance that rejects negative deposits.',
              hint: 'if val < 0: raise ValueError()'
            }
          }
        ]
      },
      {
        id: 'py_c48',
        number: 4,
        title: 'Inheritance and super()',
        description: 'Single inheritance, Method Resolution Order (MRO), and cooperative super() calls.',
        levelNumber: 5,
        levelTitle: 'Object-Oriented Programming',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c48_l1',
            chapterId: 'py_c48',
            title: 'Subclassing and super() Initialization',
            duration: '12 min',
            summary: 'Extend existing classes without code duplication using super().',
            learningObjectives: [
              'Inherit methods and attributes from a parent class',
              'Call parent constructors using super().__init__()',
              'Inspect class inheritance with issubclass() and isinstance()'
            ],
            contentMarkdown: `### The super() Protocol
\`\`\`python
class User:
    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email

class Admin(User):
    def __init__(self, name: str, email: str, access_level: int):
        super().__init__(name, email)  # Delegate to parent!
        self.access_level = access_level
\`\`\``,
            realWorldContext: 'Creating custom exception classes (\`class ValidationError(Exception):\`) relies on simple inheritance.',
            codeExample: `class Vehicle:
    def __init__(self, brand):
        self.brand = brand

class Car(Vehicle):
    def __init__(self, brand, doors=4):
        super().__init__(brand)
        self.doors = doors

c = Car("Tesla", 4)
print(f"Vehicle Brand: {c.brand}, Doors: {c.doors}")
print("Is Car a Vehicle?", isinstance(c, Vehicle))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'super() delegates calls to the parent class following the C3 MRO.',
              'isinstance(obj, Class) checks class and inheritance hierarchies.'
            ],
            interactivePractice: {
              instructions: 'Create a Dog class that inherits from Animal(name) and prints its sound.',
              starterCode: `class Animal:\n    def __init__(self, name):\n        self.name = name\nclass Dog(Animal):\n    def bark(self):\n        return f"{self.name} says Woof!"\n\nprint(Dog("Buddy").bark())`,
              solutionCode: `class Animal:\n    def __init__(self, name):\n        self.name = name\nclass Dog(Animal):\n    def bark(self):\n        return f"{self.name} says Woof!"\n\nprint(Dog("Buddy").bark())`,
              expectedOutput: 'Buddy says Woof!'
            },
            knowledgeCheck: {
              question: 'Why is super().__init__(*args) preferred over ParentClass.__init__(self, *args)?',
              options: [
                'It enables cooperative multiple inheritance according to the Method Resolution Order (MRO)',
                'It runs in native C code',
                'It prevents memory leaks in Python 3',
                'It automatically binds all kwargs'
              ],
              correctIndex: 0,
              explanation: 'super() adheres to C3 linearization (MRO), which is necessary for safe, cooperative multiple inheritance.'
            },
            challenge: {
              title: 'Custom Exception',
              task: 'Create an InsufficientFundsError subclassing ValueError and raise it.',
              hint: 'class InsufficientFundsError(ValueError): pass'
            }
          }
        ]
      },
      {
        id: 'py_c49',
        number: 5,
        title: 'Polymorphism and Duck Typing',
        description: 'Dynamic dispatch, "If it walks like a duck", and protocol-based interfaces.',
        levelNumber: 5,
        levelTitle: 'Object-Oriented Programming',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c49_l1',
            chapterId: 'py_c49',
            title: 'Duck Typing: Behavior Over Strict Types',
            duration: '10 min',
            summary: '"If it walks like a duck and quacks like a duck, it is a duck." Python code inspects what an object can do, not its inheritance tree.',
            learningObjectives: [
              'Embrace dynamic polymorphism via method signatures',
              'Design functions that work with any compatible protocol',
              'Understand EAFP (Easier to Ask Forgiveness than Permission)'
            ],
            contentMarkdown: `### Duck Typing in Action
Notice that \`render_ui()\` does not care if the object is a \`Button\`, \`Image\`, or \`Text\`; it only cares that it implements \`.render()\`:

\`\`\`python
class Button:
    def render(self): return "<Button />"

class Text:
    def render(self): return "<span>Hello</span>"

def render_ui(components):
    for c in components:
        print(c.render())
\`\`\``,
            realWorldContext: 'Python file interfaces work with file objects, StringIO, and network streams interchangeably because all implement .read() and .write().',
            codeExample: `class PDFExporter:
    def export(self): return "Exported PDF"

class CSVExporter:
    def export(self): return "Exported CSV"

for exp in [PDFExporter(), CSVExporter()]:
    print(exp.export())`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Duck typing eliminates rigid interface hierarchies.',
              'Focus on method interfaces rather than strict class types.'
            ],
            interactivePractice: {
              instructions: 'Iterate over two objects with .speak() and print their outputs.',
              starterCode: `class Cat:\n    def speak(self): return "Meow"\nclass Cow:\n    def speak(self): return "Moo"\n\nfor a in [Cat(), Cow()]:\n    print(a.speak())`,
              solutionCode: `class Cat:\n    def speak(self): return "Meow"\nclass Cow:\n    def speak(self): return "Moo"\n\nfor a in [Cat(), Cow()]:\n    print(a.speak())`,
              expectedOutput: 'Meow\nMoo'
            },
            knowledgeCheck: {
              question: 'What is the core principle of Python duck typing?',
              options: [
                'An object suitability is determined by its methods and attributes, not its explicit inheritance type',
                'All classes must inherit from DuckBase',
                'Functions must check type(obj) == TargetClass',
                'Subclasses must override all parent methods'
              ],
              correctIndex: 0,
              explanation: 'Duck typing means you check if an object satisfies the required interface rather than requiring strict inheritance.'
            },
            challenge: {
              title: 'Custom File-like Object',
              task: 'Create a class with a write(msg) method and pass it to print(..., file=obj).',
              hint: 'def write(self, s): ...'
            }
          }
        ]
      },
      {
        id: 'py_c50',
        number: 6,
        title: 'Special Dunder Methods',
        description: '__str__, __repr__, __len__, __getitem__, __eq__, and operator overloading.',
        levelNumber: 5,
        levelTitle: 'Object-Oriented Programming',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c50_l1',
            chapterId: 'py_c50',
            title: 'Operator Overloading and Python Data Model Protocols',
            duration: '12 min',
            summary: 'Make your custom objects feel like native Python types by implementing magic (dunder) methods.',
            learningObjectives: [
              'Implement __repr__ (for developers) and __str__ (for users)',
              'Implement __eq__ and __hash__ for set/dict compatibility',
              'Implement __len__ and __getitem__ for sequence indexing'
            ],
            contentMarkdown: `### The Python Data Model
Implementing dunder methods wires your class into Python built-in syntax:
- \`__repr__(self)\`: Unambiguous developer representation (e.g. \`Point(x=1, y=2)\`).
- \`__str__(self)\`: User-friendly string (used by \`print()\`).
- \`__len__(self)\`: Enables \`len(obj)\`.
- \`__getitem__(self, i)\`: Enables \`obj[i]\`.
- \`__add__(self, other)\`: Enables \`+\` operator.

\`\`\`python
class Vector:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

v1 = Vector(2, 4)
v2 = Vector(3, 1)
print(v1 + v2)  # Vector(5, 5)
\`\`\``,
            realWorldContext: 'NumPy arrays and Pandas DataFrames feel completely native because they overload __add__, __getitem__, and __repr__.',
            codeExample: `class Cart:
    def __init__(self):
        self.items = []

    def add(self, item):
        self.items.append(item)

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        return self.items[idx]

c = Cart()
c.add("Book")
c.add("Laptop")
print("Cart item count:", len(c))
print("First item:", c[0])`,
            codeLanguage: 'python',
            keyTakeaways: [
              '__repr__ should ideally return a string that could recreate the object.',
              'Implementing __len__ and __getitem__ enables slicing and for-loop iteration automatically.'
            ],
            interactivePractice: {
              instructions: 'Implement __len__ in a Box class holding items and print len(Box(["a", "b"])).',
              starterCode: `class Box:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)\n\nprint(len(Box(["a", "b"])))`,
              solutionCode: `class Box:\n    def __init__(self, items):\n        self.items = items\n    def __len__(self):\n        return len(self.items)\n\nprint(len(Box(["a", "b"])))`,
              expectedOutput: '2'
            },
            knowledgeCheck: {
              question: 'Which method is called when evaluating len(my_object)?',
              options: ['__len__', '__count__', '__size__', '__length__'],
              correctIndex: 0,
              explanation: 'len() calls the internal __len__() dunder method on the object.'
            },
            challenge: {
              title: 'Vector Equality',
              task: 'Implement __eq__ for Vector(x, y) so v1 == v2 compares their coordinates.',
              hint: 'def __eq__(self, o): return (self.x, self.y) == (o.x, o.y)'
            }
          }
        ]
      }
    ]
  }
];
