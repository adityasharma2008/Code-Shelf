import { CurriculumLevel, ChapterLesson } from '../../types';

export const PYTHON_LEVELS: CurriculumLevel[] = [
  {
    levelNumber: 1,
    title: 'Python Foundations',
    description: 'Master core syntax, dynamic typing, variables, expressions, and input/output.',
    chapters: [
      {
        id: 'py_c1',
        number: 1,
        title: 'Introduction to Programming and Python',
        description: 'Understand how Python code executes, Python 3 architecture, and the philosophy behind clean code.',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 20,
        unlockedByDefault: true,
        lessons: [
          {
            id: 'py_c1_l1',
            chapterId: 'py_c1',
            title: 'How Python Works & The Zen of Python',
            duration: '10 min',
            summary: 'Explore byte-code compilation, the Python virtual machine, and readability principles.',
            learningObjectives: [
              'Understand the role of the Python interpreter and CPython runtime',
              'Learn the core philosophy: Beautiful is better than ugly, Simple is better than complex',
              'Write and execute your first error-free Python script'
            ],
            contentMarkdown: `### The Python Execution Model
Python is an interpreted, high-level language. When you execute a script (\`python script.py\`), the CPython interpreter first compiles the human-readable text into intermediate **bytecode** (\`.pyc\`), which is then executed by the **Python Virtual Machine (PVM)**.

\`\`\`python
# Your first Python program
print("Hello, ChulliCode Developer!")
\`\`\`

#### Key Architectural Strengths
- **Dynamic Typing:** Types are resolved at runtime rather than compile time.
- **Automatic Garbage Collection:** Reference counting with cyclic garbage detection frees memory.
- **Rich Standard Library:** "Batteries included" philosophy provides math, file I/O, json, and networking out of the box.`,
            realWorldContext: 'Python powers backend APIs at Instagram, automation workflows at Google, and deep learning models at OpenAI.',
            codeExample: `# Demonstration of Python execution and built-in info
import sys

print("Hello, World!")
print(f"Python Version: {sys.version.split()[0]}")
print(f"Byte Order: {sys.byteorder}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Python translates source code into bytecode before executing in the PVM.',
              'No main() function or semicolons are required for top-level scripts.',
              'print() is a built-in function that outputs to standard output.'
            ],
            interactivePractice: {
              instructions: 'Write a script that prints "ChulliCode: Level 1" and the answer to 6 multiplied by 7.',
              starterCode: `# Print the greeting and arithmetic product
print("ChulliCode: Level 1")
print(6 * 7)`,
              solutionCode: `print("ChulliCode: Level 1")\nprint(6 * 7)`,
              expectedOutput: 'ChulliCode: Level 1\n42'
            },
            knowledgeCheck: {
              question: 'What executes the bytecode produced by the Python compiler?',
              options: [
                'Python Virtual Machine (PVM)',
                'Direct CPU Hardware instructions',
                'WebAssembly JIT compiler',
                'Operating System Kernel thread'
              ],
              correctIndex: 0,
              explanation: 'The Python Virtual Machine (PVM) reads the compiled bytecode instructions and executes them.'
            },
            challenge: {
              title: 'First Output Challenge',
              task: 'Print three lines: your name, your favorite language, and 100 // 3.',
              hint: 'Use three separate print() calls.'
            }
          }
        ]
      },
      {
        id: 'py_c2',
        number: 2,
        title: 'Installing Python and Setting Up the Environment',
        description: 'Virtual environments, pip packages, and directory organization for production code.',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c2_l1',
            chapterId: 'py_c2',
            title: 'Virtual Environments and Package Isolation',
            duration: '12 min',
            summary: 'Learn why venvs prevent dependency conflicts and how pip manages third-party libraries.',
            learningObjectives: [
              'Create and activate isolated virtual environments with python -m venv',
              'Understand the role of requirements.txt and pip freeze',
              'Identify global vs isolated package namespaces'
            ],
            contentMarkdown: `### Isolated Environments
Python projects often depend on differing versions of libraries. A **virtual environment** is an isolated directory tree that houses a specific Python interpreter and unique set of installed packages.

\`\`\`bash
# Create a virtual environment named .venv
python -m venv .venv

# Activate on Linux/macOS
source .venv/bin/activate

# Install dependencies
pip install requests
\`\`\``,
            realWorldContext: 'Production servers run each service in its own isolated environment or container to prevent library collision.',
            codeExample: `import sys

# Checking environment path prefix
print("Python Executable:", sys.executable)
print("Is Virtual Env Active:", hasattr(sys, 'real_prefix') or sys.base_prefix != sys.prefix)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'venv keeps project dependencies self-contained.',
              'Never check the venv directory into Git; use requirements.txt instead.'
            ],
            interactivePractice: {
              instructions: 'Inspect the sys module and print sys.platform.',
              starterCode: `import sys\nprint("Platform:", sys.platform)`,
              solutionCode: `import sys\nprint("Platform:", sys.platform)`
            },
            knowledgeCheck: {
              question: 'Which command generates a standard dependency list for Python projects?',
              options: ['pip freeze > requirements.txt', 'npm install', 'python save-deps', 'pip lock --all'],
              correctIndex: 0,
              explanation: 'pip freeze outputs the exact installed packages and versions.'
            },
            challenge: {
              title: 'Dependency Verification',
              task: 'Print whether sys.version_info.major equals 3.',
              hint: 'sys.version_info.major == 3 returns True.'
            }
          }
        ]
      },
      {
        id: 'py_c3',
        number: 3,
        title: 'Python Syntax and Indentation',
        description: 'Block indentation rules, colon requirements, and PEP 8 style standards.',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c3_l1',
            chapterId: 'py_c3',
            title: 'Indentation as Scope Architecture',
            duration: '10 min',
            summary: 'Unlike C++ or Java which use curly braces {}, Python uses 4 spaces to define code blocks.',
            learningObjectives: [
              'Master Python 4-space indentation rules',
              'Avoid mixed tab and space errors (TabError)',
              'Understand line continuation and multi-line expressions'
            ],
            contentMarkdown: `### Significant Whitespace
In Python, indentation is not cosmetic; it is syntactically mandatory. A code block starts with a colon (\`:\`) and must be uniformly indented (standard: 4 spaces).

\`\`\`python
if True:
    print("This is inside the block")
    if 5 > 2:
        print("Nested indentation level 2")
print("Back to top-level scope")
\`\`\``,
            realWorldContext: 'Mandatory indentation ensures that all Python codebases maintain high visual readability without inconsistent formatting wars.',
            codeExample: `score = 92

if score >= 90:
    grade = 'A'
    status = 'Passed with honors'
else:
    grade = 'B'
    status = 'Passed'

print(f"Grade: {grade} | Status: {status}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Always use 4 spaces per indentation level.',
              'Never mix tabs and spaces.',
              'A colon : introduces a new block statement.'
            ],
            interactivePractice: {
              instructions: 'Create an indented if-statement checking if 10 > 5 and print "Valid".',
              starterCode: `if 10 > 5:\n    print("Valid")`,
              solutionCode: `if 10 > 5:\n    print("Valid")`,
              expectedOutput: 'Valid'
            },
            knowledgeCheck: {
              question: 'What happens if you inconsistently mix tabs and spaces in a Python block?',
              options: [
                'TabError or IndentationError is raised',
                'Python silently replaces tabs with 4 spaces',
                'The code executes with a warning',
                'The compiler rounds up to 8 spaces'
              ],
              correctIndex: 0,
              explanation: 'Python 3 strictly disallows mixing tabs and spaces for indentation in the same block.'
            },
            challenge: {
              title: 'Clean Block Formatting',
              task: 'Write a nested if block checking if a number is positive and even.',
              hint: 'Indent 4 spaces for the outer if and 8 spaces for the inner if.'
            }
          }
        ]
      },
      {
        id: 'py_c4',
        number: 4,
        title: 'Variables and Naming Conventions',
        description: 'Memory references, snake_case convention, and variable assignment mechanics.',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c4_l1',
            chapterId: 'py_c4',
            title: 'Variables as Named Pointers to Objects',
            duration: '10 min',
            summary: 'In Python, variables do not store values directly; they are references (labels) bound to objects in heap memory.',
            learningObjectives: [
              'Understand identity vs value (id() and is)',
              'Follow PEP 8 snake_case conventions',
              'Learn multiple and chained assignment'
            ],
            contentMarkdown: `### Variables are Labels
When you write \`x = 100\`, Python allocates an integer object \`100\` in memory and binds the label \`x\` to that address.

\`\`\`python
a = [1, 2, 3]
b = a          # b points to the exact same list object!
b.append(4)
print(a)       # Output: [1, 2, 3, 4]
\`\`\`

#### Naming Conventions (PEP 8)
- Variables & functions: \`snake_case\` (e.g. \`user_score\`, \`calculate_total\`)
- Constants: \`UPPER_SNAKE_CASE\` (e.g. \`MAX_CONNECTIONS\`, \`API_TIMEOUT\`)
- Classes: \`PascalCase\` (e.g. \`UserProfile\`, \`PaymentGateway\`)`,
            realWorldContext: 'Understanding object references prevents accidental mutations when passing data to functions.',
            codeExample: `x = 500
y = 500

print("x value:", x)
print("id of x:", id(x))
print("Are values equal (==)?", x == y)
print("Are objects identical (is)?", x is y)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Variables are reference labels bound to objects.',
              'Use snake_case for variable and function names.',
              '== compares values; is checks object identity in memory.'
            ],
            interactivePractice: {
              instructions: 'Assign 10 to a, 20 to b, and calculate their sum into total.',
              starterCode: `a = 10\nb = 20\ntotal = a + b\nprint("Total:", total)`,
              solutionCode: `a = 10\nb = 20\ntotal = a + b\nprint("Total:", total)`,
              expectedOutput: 'Total: 30'
            },
            knowledgeCheck: {
              question: 'Which of the following is the PEP 8 standard naming convention for variables?',
              options: ['user_account_id', 'userAccountId', 'UserAccountId', 'USERACCOUNTID'],
              correctIndex: 0,
              explanation: 'PEP 8 specifies lowercase words separated by underscores (snake_case) for variable names.'
            },
            challenge: {
              title: 'Swap Without Temp',
              task: 'Swap values of two variables a and b in a single Python line.',
              hint: 'Use tuple packing/unpacking: a, b = b, a.'
            }
          }
        ]
      },
      {
        id: 'py_c5',
        number: 5,
        title: 'Data Types',
        description: 'Integers, floating-point numbers, strings, booleans, and NoneType.',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c5_l1',
            chapterId: 'py_c5',
            title: 'Primitive Types and the None Singleton',
            duration: '12 min',
            summary: 'Deep dive into Python primitive data types, arbitrary precision integers, and IEEE 754 floats.',
            learningObjectives: [
              'Explore int, float, str, bool, and NoneType',
              'Understand integer arbitrary precision (no 64-bit overflow)',
              'Identify float precision characteristics'
            ],
            contentMarkdown: `### Core Primitive Types
1. **int:** Integers in Python 3 have unlimited precision (constrained only by available system RAM).
2. **float:** 64-bit double precision floating point numbers.
3. **bool:** Subclass of int with values \`True\` and \`False\`.
4. **NoneType:** Represents the absence of a value; \`None\` is a singleton object.

\`\`\`python
huge_int = 10 ** 50  # Perfectly valid without overflow!
val = None
if val is None:
    print("Value not assigned")
\`\`\``,
            realWorldContext: 'Python arbitrary precision integers make it the gold standard language for cryptography and scientific calculation.',
            codeExample: `integer_val = 42
float_val = 3.14159
bool_val = True
string_val = "Python 3"
none_val = None

types = [
    (integer_val, type(integer_val)),
    (float_val, type(float_val)),
    (bool_val, type(bool_val)),
    (string_val, type(string_val)),
    (none_val, type(none_val))
]

for val, t in types:
    print(f"Value: {repr(val):<12} Type: {t.__name__}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Python ints never overflow 32-bit or 64-bit limits.',
              'Use None to represent empty, uninitialized, or missing values.',
              'type(x) returns the class type of x.'
            ],
            interactivePractice: {
              instructions: 'Calculate 2 to the power of 16 and print its type.',
              starterCode: `result = 2 ** 16\nprint(result)\nprint(type(result).__name__)`,
              solutionCode: `result = 2 ** 16\nprint(result)\nprint(type(result).__name__)`,
              expectedOutput: '65536\nint'
            },
            knowledgeCheck: {
              question: 'What is the correct way to test if variable x has no value (is None)?',
              options: ['if x is None:', 'if x == None:', 'if x.isNone():', 'if x === null:'],
              correctIndex: 0,
              explanation: 'Because None is a singleton object, identity comparison (is None) is the canonical PEP 8 idiom.'
            },
            challenge: {
              title: 'Large Power Calculation',
              task: 'Compute 2 ** 100 and print the length of its string representation.',
              hint: 'len(str(2 ** 100)) counts the digits.'
            }
          }
        ]
      },
      {
        id: 'py_c6',
        number: 6,
        title: 'Type Conversion',
        description: 'Explicit vs implicit casting, int(), float(), str(), and type validation.',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c6_l1',
            chapterId: 'py_c6',
            title: 'Type Casting and Conversion Errors',
            duration: '10 min',
            summary: 'Learn how to convert strings to numbers, numbers to text, and safely handle ValueError exceptions.',
            learningObjectives: [
              'Convert strings to ints and floats',
              'Convert numbers to booleans (truthiness)',
              'Handle invalid format conversions gracefully'
            ],
            contentMarkdown: `### Explicit Casting
Python is strongly typed: it will not automatically convert a string to a number when performing math. You must cast explicitly:

\`\`\`python
raw_input = "250"
number = int(raw_input)     # 250 (int)
price = float("19.99")      # 19.99 (float)
text = str(100)             # "100" (str)
\`\`\`

#### Truthiness
In Python, numbers equal to \`0\`, empty strings \`""\`, empty containers \`[]\`, and \`None\` evaluate to \`False\` when converted to \`bool()\`. All other values evaluate to \`True\`.`,
            realWorldContext: 'Web forms and HTTP APIs receive all parameters as strings; type casting is mandatory before mathematical processing.',
            codeExample: `num_str = "45"
converted = int(num_str)
print("Added:", converted + 5)

# Truthiness examples
empty_text = ""
print("bool(''):", bool(empty_text))
print("bool('ChulliCode'):", bool("ChulliCode"))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'int(x) truncates floats toward zero (int(3.9) is 3).',
              'int("abc") raises ValueError.',
              '0, "", [], {}, and None are falsy.'
            ],
            interactivePractice: {
              instructions: 'Convert the string "128" to an integer and multiply it by 2.',
              starterCode: `s = "128"\nval = int(s) * 2\nprint("Result:", val)`,
              solutionCode: `s = "128"\nval = int(s) * 2\nprint("Result:", val)`,
              expectedOutput: 'Result: 256'
            },
            knowledgeCheck: {
              question: 'What is the output of int(7.8)?',
              options: ['7', '8', '7.8', 'Raises ValueError'],
              correctIndex: 0,
              explanation: 'int() truncates the decimal part toward zero without rounding.'
            },
            challenge: {
              title: 'Safe Conversion',
              task: 'Parse "99.5" into a float, then cast that float into an int.',
              hint: 'int(float("99.5")) produces 99.'
            }
          }
        ]
      },
      {
        id: 'py_c7',
        number: 7,
        title: 'Input and Output',
        description: 'Reading user input, input(), stdout formatting, print parameters (sep, end).',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c7_l1',
            chapterId: 'py_c7',
            title: 'Mastering I/O and Output Formatting',
            duration: '10 min',
            summary: 'Explore input() return types, print keyword arguments sep and end, and standard streams.',
            learningObjectives: [
              'Understand that input() always returns a string',
              'Customize output with print(sep=..., end=...)',
              'Format tabular data cleanly'
            ],
            contentMarkdown: `### print() Keyword Parameters
By default, \`print()\` separates arguments with a single space and terminates with a newline (\`\\n\`). You can customize this behavior:

\`\`\`python
# Custom separator
print("2026", "11", "02", sep="-")   # 2026-11-02

# Custom end without newline
print("Downloading...", end="")
print("Done!")                        # Downloading...Done!
\`\`\``,
            realWorldContext: 'Building CLI tools and logging utilities relies on formatted console output with precise separators.',
            codeExample: `# Demonstrating sep and end
items = ["Python", "C++", "Java", "SQL"]
print(*items, sep=" -> ")

for i in range(1, 6):
    print(i, end=" ")
print()`,
            codeLanguage: 'python',
            keyTakeaways: [
              'input() always reads input as a string.',
              'sep controls the delimiter between multiple arguments in print().',
              'end controls what gets appended at the end of print().'
            ],
            interactivePractice: {
              instructions: 'Print the numbers 1, 2, 3 separated by hyphens using sep="-".',
              starterCode: `print(1, 2, 3, sep="-")`,
              solutionCode: `print(1, 2, 3, sep="-")`,
              expectedOutput: '1-2-3'
            },
            knowledgeCheck: {
              question: 'What is the return type of Python built-in input()?',
              options: ['str', 'int', 'bytes', 'dynamic based on input'],
              correctIndex: 0,
              explanation: 'input() always returns a string (str).'
            },
            challenge: {
              title: 'Custom Delimiter Output',
              task: 'Print "A", "B", "C" separated by " | " on the same line.',
              hint: 'print("A", "B", "C", sep=" | ")'
            }
          }
        ]
      },
      {
        id: 'py_c8',
        number: 8,
        title: 'Operators',
        description: 'Arithmetic, comparison, logical, bitwise, assignment, and identity operators.',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c8_l1',
            chapterId: 'py_c8',
            title: 'Arithmetic, Floor Division and Modulo',
            duration: '12 min',
            summary: 'Learn the exact difference between / (true division) and // (floor division), exponentiation **, and modulo %.',
            learningObjectives: [
              'Distinguish true division (float) from floor division (int)',
              'Use modulo for cyclicity, even/odd, and index wrapping',
              'Understand operator precedence'
            ],
            contentMarkdown: `### Python Division Operators
- \`/\` (Float division): always returns a \`float\` (e.g. \`10 / 2\` is \`5.0\`).
- \`//\` (Floor division): rounds down to nearest integer (e.g. \`7 // 2\` is \`3\`, \`-7 // 2\` is \`-4\`).
- \`%\` (Modulo): returns remainder (e.g. \`7 % 3\` is \`1\`).
- \`**\` (Exponentiation): power operator (e.g. \`2 ** 8\` is \`256\`).`,
            realWorldContext: 'Floor division and modulo are fundamental in paging algorithms, time calculations, and grid coordinates.',
            codeExample: `a = 17
b = 5

print("True division (17 / 5):", a / b)
print("Floor division (17 // 5):", a // b)
print("Modulo (17 % 5):", a % b)
print("Power (2 ** 5):", 2 ** 5)`,
            codeLanguage: 'python',
            keyTakeaways: [
              '/ always returns a float in Python 3.',
              '// rounds toward negative infinity.',
              '** has higher precedence than multiplication and addition.'
            ],
            interactivePractice: {
              instructions: 'Compute 23 floor-divided by 4 and print the result.',
              starterCode: `result = 23 // 4\nprint("Floor division:", result)`,
              solutionCode: `result = 23 // 4\nprint("Floor division:", result)`,
              expectedOutput: 'Floor division: 5'
            },
            knowledgeCheck: {
              question: 'What is the result of 10 / 2 in Python 3?',
              options: ['5.0 (float)', '5 (int)', '5.000000', 'Raises TypeError'],
              correctIndex: 0,
              explanation: 'In Python 3, single slash / always performs true floating-point division.'
            },
            challenge: {
              title: 'Even/Odd Test',
              task: 'Check if 42 is even using the % operator and print True or False.',
              hint: '42 % 2 == 0 evaluates to True.'
            }
          }
        ]
      },
      {
        id: 'py_c9',
        number: 9,
        title: 'Expressions and Evaluation',
        description: 'Operator precedence, short-circuit boolean evaluation, and chained comparisons.',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c9_l1',
            chapterId: 'py_c9',
            title: 'Chained Comparisons and Short-Circuit Logic',
            duration: '10 min',
            summary: 'Discover Python elegant chained comparisons (0 < x < 100) and short-circuit evaluation of and/or.',
            learningObjectives: [
              'Write clean chained comparison expressions',
              'Understand how and and or short-circuit evaluation works',
              'Master operator precedence ordering'
            ],
            contentMarkdown: `### Chained Comparisons
In Python, mathematical ranges can be written naturally:
\`\`\`python
score = 85
# Clean, readable, and efficient
if 80 <= score < 90:
    print("Grade B")
\`\`\`

### Short-Circuit Evaluation
- \`x and y\`: If \`x\` is falsy, Python returns \`x\` immediately without evaluating \`y\`.
- \`x or y\`: If \`x\` is truthy, Python returns \`x\` immediately without evaluating \`y\`.`,
            realWorldContext: 'Short-circuiting protects against None pointer errors: `if user and user.is_active:` will not crash if user is None.',
            codeExample: `score = 85
print("Is 80 <= 85 < 90?", 80 <= score < 90)

# Short circuit protection
name = ""
display_name = name or "Guest Developer"
print("Display Name:", display_name)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Chained comparisons are evaluated from left to right.',
              'and and or return the operand that decided the expression, not necessarily a boolean.',
              'Use parentheses to clarify ambiguous operator precedence.'
            ],
            interactivePractice: {
              instructions: 'Test if variable x = 15 is between 10 and 20 using chained comparison.',
              starterCode: `x = 15\nprint(10 < x < 20)`,
              solutionCode: `x = 15\nprint(10 < x < 20)`,
              expectedOutput: 'True'
            },
            knowledgeCheck: {
              question: 'What does "admin" or "guest" evaluate to in Python?',
              options: ['"admin"', '"guest"', 'True', 'False'],
              correctIndex: 0,
              explanation: 'Because "admin" is truthy, the or operator short-circuits and returns "admin" immediately.'
            },
            challenge: {
              title: 'Range Boundary Test',
              task: 'Write a condition that checks if number n is non-negative and less than 100.',
              hint: '0 <= n < 100.'
            }
          }
        ]
      },
      {
        id: 'py_c10',
        number: 10,
        title: 'Comments and Documentation',
        description: 'Single-line comments, multi-line docstrings, type annotations, and help().',
        levelNumber: 1,
        levelTitle: 'Python Foundations',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c10_l1',
            chapterId: 'py_c10',
            title: 'Docstrings, PEP 257, and Introspection',
            duration: '10 min',
            summary: 'Write professional docstrings that power IDE autocompletion and built-in help().',
            learningObjectives: [
              'Use # for implementation comments',
              'Use triple quotes """ for docstrings (PEP 257)',
              'Inspect functions using .__doc__ and help()'
            ],
            contentMarkdown: `### Docstrings vs Comments
- \`# Comment\`: For developer notes about why tricky code was written.
- \`"""Docstring"""\`: The first statement inside a module, class, or function. Stored in \`__doc__\` at runtime.

\`\`\`python
def calculate_area(radius: float) -> float:
    """Calculate the area of a circle given its radius.
    
    Args:
        radius: The radius of the circle in meters.
        
    Returns:
        The total surface area.
    """
    import math
    return math.pi * (radius ** 2)
\`\`\``,
            realWorldContext: 'Docstrings are automatically compiled into official API documentation by tools like Sphinx and MkDocs.',
            codeExample: `def greet(name: str) -> str:
    """Return a personalized greeting for a developer."""
    return f"Welcome, {name}!"

print(greet("Alex"))
print("Function Docstring:", greet.__doc__)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Docstrings are accessible at runtime via func.__doc__.',
              'Explain the interface: parameters, return value, and exceptions.',
              'Keep implementation comments concise and explain "why", not "what".'
            ],
            interactivePractice: {
              instructions: 'Define a function add(a, b) with a docstring "Add two numbers" and print add.__doc__.',
              starterCode: `def add(a, b):\n    """Add two numbers"""\n    return a + b\n\nprint(add.__doc__)`,
              solutionCode: `def add(a, b):\n    """Add two numbers"""\n    return a + b\n\nprint(add.__doc__)`,
              expectedOutput: 'Add two numbers'
            },
            knowledgeCheck: {
              question: 'Where is a Python docstring stored at runtime?',
              options: [
                'In the object __doc__ attribute',
                'In the system comments cache',
                'Stripped out during compilation',
                'In a separate .pydoc file'
              ],
              correctIndex: 0,
              explanation: 'Docstrings remain attached to the compiled object and are accessible via the __doc__ attribute.'
            },
            challenge: {
              title: 'Docstring Introspection',
              task: 'Print the docstring of the built-in abs function.',
              hint: 'print(abs.__doc__)'
            }
          }
        ]
      }
    ]
  },
  {
    levelNumber: 2,
    title: 'Control Flow',
    description: 'Master conditions, while loops, for loops, nested loops, break/continue, and pattern solving.',
    chapters: [
      {
        id: 'py_c11',
        number: 1,
        title: 'Boolean Logic',
        description: 'Truth tables, logical operators (and, or, not), and boolean algebra.',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c11_l1',
            chapterId: 'py_c11',
            title: 'De Morgan’s Laws & Boolean Precedence',
            duration: '10 min',
            summary: 'Simplify complex conditions using boolean algebra and not/and/or precedence.',
            learningObjectives: [
              'Understand logical precedence: not > and > or',
              'Apply De Morgan’s laws to invert boolean conditions',
              'Avoid redundant boolean comparisons (e.g. if is_active == True)'
            ],
            contentMarkdown: `### Boolean Operators
Python provides three logical operators: \`not\`, \`and\`, and \`or\`.
Precedence order:
1. \`not\`
2. \`and\`
3. \`or\`

\`\`\`python
# Clean idiom
if is_valid and not is_expired:
    grant_access()
\`\`\``,
            realWorldContext: 'Authentication authorization guards evaluate complex boolean policies on user roles and permissions.',
            codeExample: `is_admin = True
is_verified = False

print("Admin and verified:", is_admin and is_verified)
print("Admin or verified:", is_admin or is_verified)
print("Not verified:", not is_verified)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'not has highest precedence, followed by and, then or.',
              'Never compare booleans to == True or == False; use if is_valid directly.'
            ],
            interactivePractice: {
              instructions: 'Check if age >= 18 and has_id is True for age=20, has_id=True.',
              starterCode: `age = 20\nhas_id = True\nprint(age >= 18 and has_id)`,
              solutionCode: `age = 20\nhas_id = True\nprint(age >= 18 and has_id)`,
              expectedOutput: 'True'
            },
            knowledgeCheck: {
              question: 'Which operator has the highest precedence?',
              options: ['not', 'and', 'or', '=='],
              correctIndex: 3,
              explanation: 'Comparison operators like == have higher precedence than logical operators; among logical operators, not is highest.'
            },
            challenge: {
              title: 'Access Guard',
              task: 'Write a condition that evaluates True only if role is "admin" or ("editor" and is_active).',
              hint: 'Combine parentheses appropriately.'
            }
          }
        ]
      },
      {
        id: 'py_c12',
        number: 2,
        title: 'Conditional Statements',
        description: 'if, elif, else chains, branching logic, and condition structure.',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c12_l1',
            chapterId: 'py_c12',
            title: 'Multi-branch if-elif-else Chains',
            duration: '12 min',
            summary: 'Learn how Python evaluates branching logic top-to-bottom and exits on the first true match.',
            learningObjectives: [
              'Construct mutually exclusive branches with elif',
              'Use else as a safe fallback handler',
              'Handle boundary conditions accurately'
            ],
            contentMarkdown: `### Branching Execution
Python evaluates conditional branches in top-to-bottom sequence:

\`\`\`python
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
\`\`\`
Once a condition matches, no subsequent \`elif\` or \`else\` blocks are evaluated.`,
            realWorldContext: 'Order processing pipelines use elif chains to categorize discounts based on user loyalty tier.',
            codeExample: `score = 84

if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"

print(f"Score {score} earned Grade: {grade}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'elif avoids unnecessary nested indentation.',
              'The order of conditions matters when boundaries overlap.',
              'else handles all unmatched cases.'
            ],
            interactivePractice: {
              instructions: 'Write an if-elif-else statement checking number n = 0 (print "Zero", "Positive", or "Negative").',
              starterCode: `n = 0\nif n > 0:\n    print("Positive")\nelif n < 0:\n    print("Negative")\nelse:\n    print("Zero")`,
              solutionCode: `n = 0\nif n > 0:\n    print("Positive")\nelif n < 0:\n    print("Negative")\nelse:\n    print("Zero")`,
              expectedOutput: 'Zero'
            },
            knowledgeCheck: {
              question: 'In an if-elif-else structure, how many blocks can execute at most?',
              options: ['Exactly 1', 'All that are true', 'Up to 2', 'Unlimited'],
              correctIndex: 0,
              explanation: 'At most one branch executes; as soon as a true condition is met, execution jumps to the end of the chain.'
            },
            challenge: {
              title: 'Discount Calculator',
              task: 'Calculate discount: 20% if amount > 100, 10% if amount > 50, else 0%.',
              hint: 'Structure branches from highest threshold to lowest.'
            }
          }
        ]
      },
      {
        id: 'py_c13',
        number: 3,
        title: 'Nested Conditions',
        description: 'Multi-level decision trees, guard clauses, and avoiding callback/pyramid hell.',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c13_l1',
            chapterId: 'py_c13',
            title: 'Guard Clauses vs Deep Nesting',
            duration: '10 min',
            summary: 'Refactor deeply nested if statements into flat, readable guard clauses.',
            learningObjectives: [
              'Identify the problems with deep nesting (Arrow Anti-Pattern)',
              'Apply early returns / guard clauses to flatten logic',
              'Maintain high code maintainability'
            ],
            contentMarkdown: `### The Guard Clause Pattern
Instead of wrapping logic inside multiple layers of indentation, check invalid cases early:

\`\`\`python
# Deeply nested (Hard to read)
if user is not None:
    if user.is_active:
        if user.has_permission:
            proceed()

# Refactored with guard clauses (Clean & Flat)
if user is None or not user.is_active or not user.has_permission:
    return False
proceed()
\`\`\``,
            realWorldContext: 'Production code reviews consistently require guard clauses to prevent bugs hidden inside 4+ levels of nesting.',
            codeExample: `def process_order(is_logged_in, in_stock, funds_available):
    if not is_logged_in:
        return "Error: User must be signed in."
    if not in_stock:
        return "Error: Item out of stock."
    if not funds_available:
        return "Error: Insufficient balance."
    return "Order processed successfully!"

print(process_order(True, True, True))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Flatten nested conditionals with early returns.',
              'Guard clauses place validation at the top of the function.'
            ],
            interactivePractice: {
              instructions: 'Test the process_order function with funds_available = False.',
              starterCode: `def check(valid):\n    if not valid:\n        return "Invalid"\n    return "Success"\n\nprint(check(False))`,
              solutionCode: `def check(valid):\n    if not valid:\n        return "Invalid"\n    return "Success"\n\nprint(check(False))`,
              expectedOutput: 'Invalid'
            },
            knowledgeCheck: {
              question: 'Why are guard clauses preferred over deep nesting?',
              options: [
                'They reduce indentation and keep the happy path unnested',
                'They execute 10x faster in the PVM',
                'Python enforces a maximum nesting limit of 2',
                'They eliminate all boolean operators'
              ],
              correctIndex: 0,
              explanation: 'Guard clauses improve readability by handling error conditions immediately and keeping normal execution unindented.'
            },
            challenge: {
              title: 'Flatten Nested Check',
              task: 'Refactor a 3-level check using a single combined boolean expression.',
              hint: 'if a and b and c: ...'
            }
          }
        ]
      },
      {
        id: 'py_c14',
        number: 4,
        title: 'For Loops',
        description: 'Iterating over sequences, range(), enumerate(), and zip().',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c14_l1',
            chapterId: 'py_c14',
            title: 'Iteration Idioms: range, enumerate, and zip',
            duration: '12 min',
            summary: 'Learn the Pythonic way to loop over items, indices, and parallel collections without index bookkeeping.',
            learningObjectives: [
              'Use range(start, stop, step) effectively',
              'Use enumerate() to access index and element together',
              'Use zip() to iterate through multiple sequences simultaneously'
            ],
            contentMarkdown: `### Pythonic Looping
Avoid manual counter variables like \`i = 0; while i < len(items):\`.

\`\`\`python
# 1. Direct iteration
for fruit in ["apple", "banana", "cherry"]:
    print(fruit)

# 2. enumerate() for index + item
for idx, name in enumerate(["Alex", "Sam", "Taylor"], start=1):
    print(f"#{idx}: {name}")

# 3. zip() for parallel pairing
names = ["Alice", "Bob"]
scores = [95, 88]
for name, score in zip(names, scores):
    print(f"{name}: {score}")
\`\`\``,
            realWorldContext: 'Data pipelines process rows by zipping column headers with record values into dictionaries.',
            codeExample: `languages = ["Python", "C++", "Java"]
years = [1991, 1985, 1995]

for i, (lang, year) in enumerate(zip(languages, years), start=1):
    print(f"{i}. {lang} was created in {year}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'enumerate() eliminates manual index counter variables.',
              'zip() stops when the shortest iterable is exhausted.',
              'range() generates numbers lazily without allocating a list in memory.'
            ],
            interactivePractice: {
              instructions: 'Loop through range(1, 4) and print the square of each number.',
              starterCode: `for i in range(1, 4):\n    print(i ** 2)`,
              solutionCode: `for i in range(1, 4):\n    print(i ** 2)`,
              expectedOutput: '1\n4\n9'
            },
            knowledgeCheck: {
              question: 'Which built-in function yields both index and value while looping?',
              options: ['enumerate()', 'zip()', 'index()', 'range()'],
              correctIndex: 0,
              explanation: 'enumerate(iterable) yields tuples of (index, item).'
            },
            challenge: {
              title: 'Parallel Zip',
              task: 'Zip two lists of 3 items each and print each pair separated by a colon.',
              hint: 'for a, b in zip(list1, list2): print(f"{a}: {b}")'
            }
          }
        ]
      },
      {
        id: 'py_c15',
        number: 5,
        title: 'While Loops',
        description: 'Indefinite iteration, loop conditions, infinite loop prevention, and loop state.',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c15_l1',
            chapterId: 'py_c15',
            title: 'Indefinite Iteration and Convergence',
            duration: '10 min',
            summary: 'Execute blocks until a dynamic state changes, ensuring convergence to avoid infinite loops.',
            learningObjectives: [
              'Understand when to use while vs for',
              'Ensure loop invariant progress to prevent infinite loops',
              'Implement polling and retry patterns'
            ],
            contentMarkdown: `### While Loop Mechanics
A \`while\` loop repeatedly executes as long as its condition remains truthy:

\`\`\`python
countdown = 5
while countdown > 0:
    print(countdown)
    countdown -= 1  # Invariant change!
print("Blastoff!")
\`\`\``,
            realWorldContext: 'Web servers and game engines run on continuous while loops listening for incoming socket packets or frame updates.',
            codeExample: `num = 64
steps = 0

while num > 1:
    num //= 2
    steps += 1

print(f"64 halved to 1 in {steps} steps (log2(64))")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Use while loops when the number of iterations is not known in advance.',
              'Ensure the loop variable advances toward the exit condition on every iteration.'
            ],
            interactivePractice: {
              instructions: 'Write a while loop that doubles a number starting at 1 until it exceeds 10.',
              starterCode: `val = 1\nwhile val <= 10:\n    val *= 2\nprint("Final:", val)`,
              solutionCode: `val = 1\nwhile val <= 10:\n    val *= 2\nprint("Final:", val)`,
              expectedOutput: 'Final: 16'
            },
            knowledgeCheck: {
              question: 'What is the primary cause of an infinite loop in a while construct?',
              options: [
                'The loop condition never evaluates to False',
                'Memory garbage collection fails',
                'The break keyword is omitted',
                'The while condition uses an integer'
              ],
              correctIndex: 0,
              explanation: 'An infinite loop occurs when the condition never becomes False and no break is triggered.'
            },
            challenge: {
              title: 'Collatz Conjecture Step Count',
              task: 'Compute the steps to reach 1 for n = 6 (if even n//=2, if odd n=3*n+1).',
              hint: 'Track steps with an incrementing counter.'
            }
          }
        ]
      },
      {
        id: 'py_c16',
        number: 6,
        title: 'Loop Control',
        description: 'break, continue, pass, and loop-else clauses.',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c16_l1',
            chapterId: 'py_c16',
            title: 'The Unique Python for-else / while-else Clause',
            duration: '10 min',
            summary: 'Discover how the loop else block executes ONLY if the loop finishes without hitting a break statement.',
            learningObjectives: [
              'Use break to exit early on finding a target',
              'Use continue to skip to the next iteration',
              'Use for...else for clean linear search without boolean flags'
            ],
            contentMarkdown: `### The for...else Idiom
In Python, loops can have an \`else:\` block. It runs **only if the loop completed naturally** (did not encounter a \`break\`):

\`\`\`python
target = 7
for n in [2, 4, 6, 8]:
    if n == target:
        print("Found!")
        break
else:
    # Runs ONLY if no break was hit!
    print("Target not in list.")
\`\`\``,
            realWorldContext: 'Loop-else simplifies search and validation algorithms without needing flags like `found = False`.',
            codeExample: `numbers = [2, 3, 5, 7, 11]
target = 9

for num in numbers:
    if num == target:
        print(f"Found {target}!")
        break
else:
    print(f"{target} is not in the prime list.")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'break immediately terminates the current loop.',
              'continue skips remaining statements in current iteration and moves to next.',
              'for-else runs if no break statement was encountered.'
            ],
            interactivePractice: {
              instructions: 'Loop through range(5), skip 2 with continue, and print the others.',
              starterCode: `for i in range(5):\n    if i == 2:\n        continue\n    print(i, end=" ")\nprint()`,
              solutionCode: `for i in range(5):\n    if i == 2:\n        continue\n    print(i, end=" ")\nprint()`,
              expectedOutput: '0 1 3 4 '
            },
            knowledgeCheck: {
              question: 'When does the else block attached to a for loop execute?',
              options: [
                'When the loop terminates without encountering a break',
                'Only if the iterable was initially empty',
                'On every single iteration',
                'When a break statement is executed'
              ],
              correctIndex: 0,
              explanation: 'The loop else clause runs only if the loop exhausted its iterable without being stopped by break.'
            },
            challenge: {
              title: 'Prime Check with for-else',
              task: 'Check if 13 is prime by testing divisors from 2 to 12 with for...else.',
              hint: 'If 13 % i == 0: break. else: print("Prime")'
            }
          }
        ]
      },
      {
        id: 'py_c17',
        number: 7,
        title: 'Nested Loops',
        description: '2D grid traversal, matrix processing, coordinate systems, and computational complexity.',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c17_l1',
            chapterId: 'py_c17',
            title: 'Matrix Traversal & O(N^2) Awareness',
            duration: '12 min',
            summary: 'Navigate two-dimensional arrays, nested coordinates, and understand quadratic scaling.',
            learningObjectives: [
              'Iterate through rows and columns in 2D matrices',
              'Understand the performance implications of nested loops',
              'Break out of outer loops cleanly'
            ],
            contentMarkdown: `### 2D Coordinate Grid
A nested loop runs the inner loop in its entirety for every step of the outer loop:

\`\`\`python
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

for row_idx, row in enumerate(matrix):
    for col_idx, val in enumerate(row):
        print(f"({row_idx},{col_idx})={val}", end=" ")
    print()
\`\`\``,
            realWorldContext: 'Computer vision algorithms iterate through 2D pixel grids (height x width) to apply blur, contrast, and edge detection filters.',
            codeExample: `grid_size = 3
for r in range(grid_size):
    for c in range(grid_size):
        print(f"[{r},{c}]", end=" ")
    print()`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Nested loops multiply iteration counts (N x M).',
              'Inner break only exits the innermost loop; use flags or return to exit both.'
            ],
            interactivePractice: {
              instructions: 'Print a 2x3 grid of asterisks (*) using nested loops.',
              starterCode: `for r in range(2):\n    for c in range(3):\n        print("*", end="")\n    print()`,
              solutionCode: `for r in range(2):\n    for c in range(3):\n        print("*", end="")\n    print()`,
              expectedOutput: '***\n***'
            },
            knowledgeCheck: {
              question: 'If an outer loop runs 10 times and an inner loop runs 20 times, how many total inner iterations occur?',
              options: ['200', '30', '100', '20'],
              correctIndex: 0,
              explanation: '10 outer iterations * 20 inner iterations = 200 total executions.'
            },
            challenge: {
              title: 'Multiplication Table Grid',
              task: 'Generate a 1 to 5 multiplication table grid.',
              hint: 'Print r * c with end="\\t".'
            }
          }
        ]
      },
      {
        id: 'py_c18',
        number: 8,
        title: 'Pattern Printing',
        description: 'Triangles, pyramids, diamonds, hollow rectangles, and algorithmic string multiplication.',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c18_l1',
            chapterId: 'py_c18',
            title: 'Algorithmic Pyramid & Pattern Construction',
            duration: '12 min',
            summary: 'Harness string multiplication ("*" * n) and center alignment to construct geometric patterns.',
            learningObjectives: [
              'Use string repetition operator * for instant line generation',
              'Calculate leading spaces and centering algorithms',
              'Construct pyramid, inverted triangle, and diamond patterns'
            ],
            contentMarkdown: `### Python String Repetition Magic
In C++ or Java, printing 5 stars requires an inner loop. In Python, \`"*" * 5\` produces \`"*****"\` instantly!

\`\`\`python
# Right-angled triangle
for i in range(1, 6):
    print("*" * i)

# Centered pyramid
n = 5
for i in range(1, n + 1):
    spaces = " " * (n - i)
    stars = "*" * (2 * i - 1)
    print(spaces + stars)
\`\`\``,
            realWorldContext: 'Pattern logic is frequently asked in university coding exams and technical screening rounds to test nested index comprehension.',
            codeExample: `n = 4
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'String multiplication "x" * k creates repeated strings with zero loop overhead.',
              'Pyramids have (2 * i - 1) stars on row i.'
            ],
            interactivePractice: {
              instructions: 'Print a 3-row right-angled triangle using "*".',
              starterCode: `for i in range(1, 4):\n    print("*" * i)`,
              solutionCode: `for i in range(1, 4):\n    print("*" * i)`,
              expectedOutput: '*\n**\n***'
            },
            knowledgeCheck: {
              question: 'What is the output of "AB" * 3 in Python?',
              options: ['"ABABAB"', '"AABB"', 'Raises TypeError', '["AB", "AB", "AB"]'],
              correctIndex: 0,
              explanation: 'String multiplication repeats the string sequence N times.'
            },
            challenge: {
              title: 'Inverted Triangle',
              task: 'Print an inverted triangle of 4 stars down to 1.',
              hint: 'for i in range(4, 0, -1): print("*" * i)'
            }
          }
        ]
      },
      {
        id: 'py_c19',
        number: 9,
        title: 'Basic Problem Solving',
        description: 'FizzBuzz, palindrome verification, number reversal, and Fibonacci numbers.',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 30,
        lessons: [
          {
            id: 'py_c19_l1',
            chapterId: 'py_c19',
            title: 'Classic Interview Foundations: FizzBuzz & Palindromes',
            duration: '15 min',
            summary: 'Implement canonical interview problems using clean control flow and modular logic.',
            learningObjectives: [
              'Solve FizzBuzz with clean modulo logic',
              'Check palindromes using integer math and two-pointer checks',
              'Generate Fibonacci sequences iteratively'
            ],
            contentMarkdown: `### The Canonical FizzBuzz
For numbers 1 to N:
- If divisible by both 3 and 5: print "FizzBuzz"
- If divisible by 3: print "Fizz"
- If divisible by 5: print "Buzz"
- Otherwise: print the number

\`\`\`python
for i in range(1, 16):
    if i % 15 == 0:
        print("FizzBuzz", end=" ")
    elif i % 3 == 0:
        print("Fizz", end=" ")
    elif i % 5 == 0:
        print("Buzz", end=" ")
    else:
        print(i, end=" ")
\`\`\``,
            realWorldContext: 'Interviewers use FizzBuzz to verify that candidates can order modulo boundary conditions correctly.',
            codeExample: `def fibonacci(n):
    a, b = 0, 1
    seq = []
    for _ in range(n):
        seq.append(a)
        a, b = b, a + b
    return seq

print("First 8 Fibonacci numbers:", fibonacci(8))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Check composite condition (i % 15 == 0) first in FizzBuzz.',
              'a, b = b, a + b performs simultaneous tuple assignment without temporary variables.'
            ],
            interactivePractice: {
              instructions: 'Write a loop that prints Fizz for multiples of 3, Buzz for 5, or the number from 1 to 5.',
              starterCode: `for i in range(1, 6):\n    if i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)`,
              solutionCode: `for i in range(1, 6):\n    if i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)`,
              expectedOutput: '1\n2\nFizz\n4\nBuzz'
            },
            knowledgeCheck: {
              question: 'Why must i % 15 == 0 be checked before i % 3 == 0 in FizzBuzz?',
              options: [
                'Because 15 is divisible by 3, checking 3 first would intercept 15 and print only "Fizz"',
                'Modulo 15 executes faster in CPython',
                '15 is a prime number',
                'It is an arbitrary style preference'
              ],
              correctIndex: 0,
              explanation: 'Because 15 is divisible by 3, checking 3 first would cause the first branch to execute and prevent "FizzBuzz" from ever triggering.'
            },
            challenge: {
              title: 'Sum of Digits',
              task: 'Compute the sum of digits of 1234 using integer division // and %.',
              hint: 'While n > 0: sum += n % 10; n //= 10.'
            }
          }
        ]
      },
      {
        id: 'py_c20',
        number: 10,
        title: 'Control Flow Practice Lab',
        description: 'Comprehensive milestone lab solving mixed control flow challenges.',
        levelNumber: 2,
        levelTitle: 'Control Flow',
        estimatedMinutes: 30,
        lessons: [
          {
            id: 'py_c20_l1',
            chapterId: 'py_c20',
            title: 'Control Flow Capstone: Guessing Game & Prime Sieve',
            duration: '15 min',
            summary: 'Combine conditionals, loops, break, continue, and validation into a coherent algorithm.',
            learningObjectives: [
              'Implement the Sieve of Eratosthenes prime generator',
              'Validate user input bounds within a retry loop',
              'Write resilient algorithms'
            ],
            contentMarkdown: `### Prime Sieve Algorithm
The Sieve of Eratosthenes finds all prime numbers up to N by repeatedly marking multiples of each found prime:

\`\`\`python
def find_primes(limit):
    is_prime = [True] * (limit + 1)
    is_prime[0] = is_prime[1] = False
    
    for p in range(2, int(limit ** 0.5) + 1):
        if is_prime[p]:
            for multiple in range(p * p, limit + 1, p):
                is_prime[multiple] = False
                
    return [i for i, prime in enumerate(is_prime) if prime]
\`\`\``,
            realWorldContext: 'Prime generation forms the foundation of RSA public-key cryptography and secure communication protocols.',
            codeExample: `def primes_up_to(n):
    primes = []
    for num in range(2, n + 1):
        for i in range(2, int(num ** 0.5) + 1):
            if num % i == 0:
                break
        else:
            primes.append(num)
    return primes

print("Primes <= 30:", primes_up_to(30))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Test divisibility up to sqrt(N) to optimize prime checking.',
              'Use loop-else to cleanly collect non-broken search iterations.'
            ],
            interactivePractice: {
              instructions: 'Call primes_up_to(20) and print the list.',
              starterCode: `def primes_up_to(n):\n    primes = []\n    for num in range(2, n + 1):\n        for i in range(2, int(num ** 0.5) + 1):\n            if num % i == 0:\n                break\n        else:\n            primes.append(num)\n    return primes\n\nprint(primes_up_to(20))`,
              solutionCode: `def primes_up_to(n):\n    primes = []\n    for num in range(2, n + 1):\n        for i in range(2, int(num ** 0.5) + 1):\n            if num % i == 0:\n                break\n        else:\n            primes.append(num)\n    return primes\n\nprint(primes_up_to(20))`,
              expectedOutput: '[2, 3, 5, 7, 11, 13, 17, 19]'
            },
            knowledgeCheck: {
              question: 'Why only check up to sqrt(N) when checking if N is prime?',
              options: [
                'If N has a factor greater than sqrt(N), it must also have a corresponding factor less than sqrt(N)',
                'Python math module cannot compute beyond sqrt',
                'Square root eliminates all odd numbers',
                'Memory restrictions limit factor tables'
              ],
              correctIndex: 0,
              explanation: 'Factors appear in pairs (a * b = N). If both were greater than sqrt(N), their product would exceed N.'
            },
            challenge: {
              title: 'Count Primes',
              task: 'Count how many primes exist below 50.',
              hint: 'len(primes_up_to(50)) gives 15.'
            }
          }
        ]
      }
    ]
  },
  {
    levelNumber: 3,
    title: 'Python Data Structures',
    description: 'Strings, Slicing, Lists, List Comprehensions, Tuples, Sets, Dictionaries, and Nested Data Structures.',
    chapters: [
      {
        id: 'py_c21',
        number: 1,
        title: 'Strings',
        description: 'String immutability, UTF-8 encoding, escape sequences, and raw strings.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c21_l1',
            chapterId: 'py_c21',
            title: 'String Immutability and Unicode Architecture',
            duration: '10 min',
            summary: 'Strings in Python 3 are immutable sequences of Unicode code points.',
            learningObjectives: [
              'Understand that Python strings cannot be mutated in place',
              'Use raw strings (r"...") for regular expressions and Windows file paths',
              'Explore multi-line string handling'
            ],
            contentMarkdown: `### Strings are Immutable
Once created, characters inside a string cannot be modified:

\`\`\`python
s = "Hello"
# s[0] = "J"  # Raises TypeError: 'str' object does not support item assignment!

# Correct: create a new string
s = "J" + s[1:]  # "Jello"
\`\`\`

#### Raw Strings
Prefixing a string with \`r\` disables escape character processing:
\`\`\`python
regex_pattern = r"\\d+\\.\\d+"  # Backslashes are treated as literal characters
\`\`\``,
            realWorldContext: 'String immutability allows strings to be hashed and safely used as dictionary keys and set elements.',
            codeExample: `text = "ChulliCode"
print("Length:", len(text))
print("First character:", text[0])
print("Last character:", text[-1])
print("Reversed:", text[::-1])`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Strings are immutable; modification operations return a new string.',
              'Negative indexing (-1) accesses from the end.',
              'Raw strings r"..." ignore escape sequences.'
            ],
            interactivePractice: {
              instructions: 'Reverse the string "Python" using slice notation [::-1] and print it.',
              starterCode: `word = "Python"\nprint(word[::-1])`,
              solutionCode: `word = "Python"\nprint(word[::-1])`,
              expectedOutput: 'nohtyP'
            },
            knowledgeCheck: {
              question: 'Why are Python strings immutable?',
              options: [
                'To allow strings to be hashable and used safely as dictionary keys',
                'Because CPython cannot allocate dynamic arrays',
                'To prevent memory leaks in the OS',
                'Due to 8-bit ASCII limitations'
              ],
              correctIndex: 0,
              explanation: 'Immutability guarantees that a string hash never changes, enabling O(1) dictionary key lookups.'
            },
            challenge: {
              title: 'Check Palindrome',
              task: 'Check if "radar" is equal to its reverse.',
              hint: 's == s[::-1] evaluates to True.'
            }
          }
        ]
      },
      {
        id: 'py_c22',
        number: 2,
        title: 'String Indexing and Slicing',
        description: 'Extended slicing syntax [start:stop:step], negative step reversal, and out-of-bounds safety.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c22_l1',
            chapterId: 'py_c22',
            title: 'Mastering the [start:stop:step] Slice Protocol',
            duration: '10 min',
            summary: 'Extract substrings efficiently without index errors.',
            learningObjectives: [
              'Understand half-open intervals [start, stop)',
              'Use step to extract even or odd indexed characters',
              'Safely slice without IndexError exceptions'
            ],
            contentMarkdown: `### The Slice Anatomy
\`string[start:stop:step]\`
- \`start\`: inclusive beginning index (defaults to 0).
- \`stop\`: exclusive ending index (defaults to len).
- \`step\`: stride between indices (negative reverses direction).

\`\`\`python
s = "ABCDEFGHIJ"
print(s[2:7])    # "CDEFG"
print(s[::2])    # "ACEGI" (every 2nd char)
print(s[::-1])   # "JIHGFEDCBA"
\`\`\``,
            realWorldContext: 'Slicing is heavily used in bioinformatics for DNA sequence alignment and packet header parsing in network protocols.',
            codeExample: `alphabets = "abcdefghijklmnopqrstuvwxyz"
print("First 5:", alphabets[:5])
print("Last 5:", alphabets[-5:])
print("Every 5th letter:", alphabets[::5])`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Slicing never raises IndexError even if bounds exceed length.',
              'Negative step reverses traversal.'
            ],
            interactivePractice: {
              instructions: 'Slice the first 4 characters of "Developer".',
              starterCode: `s = "Developer"\nprint(s[:4])`,
              solutionCode: `s = "Developer"\nprint(s[:4])`,
              expectedOutput: 'Deve'
            },
            knowledgeCheck: {
              question: 'What does "HelloWorld"[2:5] return?',
              options: ['"llo"', '"ello"', '"ll"', '"Hel"'],
              correctIndex: 0,
              explanation: 'Indices 2, 3, 4 correspond to "l", "l", "o". Index 5 is exclusive.'
            },
            challenge: {
              title: 'Extract Domain',
              task: 'Extract "google" from "www.google.com" using string slice.',
              hint: '"www.google.com"[4:10]'
            }
          }
        ]
      },
      {
        id: 'py_c23',
        number: 3,
        title: 'String Methods',
        description: 'split(), join(), strip(), replace(), find(), format(), and case modifications.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c23_l1',
            chapterId: 'py_c23',
            title: 'High Performance Text Transformation',
            duration: '12 min',
            summary: 'Clean, parse, and join strings using standard library methods.',
            learningObjectives: [
              'Split text into tokens with split()',
              'Join lists of strings with separator.join(list)',
              'Strip whitespace and sanitize inputs'
            ],
            contentMarkdown: `### split() and join()
- \`split(delimiter)\`: Splits a string into a list of strings.
- \`delimiter.join(iterable)\`: Joins an iterable of strings into one string.

\`\`\`python
# Splitting CSV
row = "Alex,Engineer,India"
fields = row.split(",")  # ['Alex', 'Engineer', 'India']

# Joining with custom separator
joined = " - ".join(fields)  # "Alex - Engineer - India"
\`\`\``,
            realWorldContext: 'Data cleaning pipelines rely on strip(), lower(), and replace() to normalize text before feeding into search engines or ML models.',
            codeExample: `raw = "   shakti14112008@gmail.com   "
clean = raw.strip().lower()
print("Cleaned:", clean)

words = ["Learn", "Code", "Build"]
print("Joined:", " -> ".join(words))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'separator.join() is much faster than repeated string concatenation (+).',
              'strip() removes leading and trailing whitespace.'
            ],
            interactivePractice: {
              instructions: 'Split "apple,banana,cherry" by comma and print the length of the resulting list.',
              starterCode: `fruits = "apple,banana,cherry".split(",")\nprint(len(fruits))`,
              solutionCode: `fruits = "apple,banana,cherry".split(",")\nprint(len(fruits))`,
              expectedOutput: '3'
            },
            knowledgeCheck: {
              question: 'Why is "".join(list_of_strings) preferred over string += string in a loop?',
              options: [
                'join() calculates total buffer size once (O(N)), while += reallocates memory on every step (O(N^2))',
                'join() operates on GPU threads',
                'string concatenation raises TypeError in Python 3',
                'join() automatically strips newlines'
              ],
              correctIndex: 0,
              explanation: 'String concatenation creates a new string on every addition leading to quadratic O(N^2) time, whereas join() preallocates the required buffer in O(N).'
            },
            challenge: {
              title: 'Clean and Title Case',
              task: 'Strip "   chullicode developer   " and title-case it.',
              hint: 's.strip().title()'
            }
          }
        ]
      },
      {
        id: 'py_c24',
        number: 4,
        title: 'Lists',
        description: 'Dynamic arrays, memory allocation, indexing, slicing, mutability, and list operations.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c24_l1',
            chapterId: 'py_c24',
            title: 'Dynamic Array Internals in CPython',
            duration: '12 min',
            summary: 'Understand how Python lists resize dynamically using over-allocation strategies.',
            learningObjectives: [
              'Understand list memory growth and O(1) amortized append',
              'Distinguish shallow copy vs deep copy',
              'Use list indexing, slicing, and mutation'
            ],
            contentMarkdown: `### List Internal Architecture
In CPython, a \`list\` is an array of pointers to objects. When you \`append()\`, Python uses an **over-allocation algorithm** (roughly 1.125x growth factor) so that appends achieve **amortized O(1)** time complexity.

\`\`\`python
items = [10, 20, 30]
items.append(40)      # O(1) amortized
items.insert(0, 5)    # O(N) because elements must shift right!
items.pop()           # O(1) removes from end
\`\`\``,
            realWorldContext: 'Knowing that inserting at index 0 is O(N) guides developers to use collections.deque when implementing FIFO queues.',
            codeExample: `nums = [1, 2, 3, 4]
nums.append(5)
nums[0] = 99
print("Mutated list:", nums)
print("Length:", len(nums))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Lists are mutable dynamic arrays of references.',
              'append() is O(1) amortized; insert(0, x) is O(N).',
              'Copy a list with list.copy() or slice [:] to avoid shared reference mutations.'
            ],
            interactivePractice: {
              instructions: 'Create a list [1, 2], append 3, and print the list.',
              starterCode: `l = [1, 2]\nl.append(3)\nprint(l)`,
              solutionCode: `l = [1, 2]\nl.append(3)\nprint(l)`,
              expectedOutput: '[1, 2, 3]'
            },
            knowledgeCheck: {
              question: 'What is the time complexity of appending an item to the end of a Python list?',
              options: ['O(1) amortized', 'O(N)', 'O(log N)', 'O(N^2)'],
              correctIndex: 0,
              explanation: 'Due to geometric over-allocation, list.append() runs in amortized O(1) constant time.'
            },
            challenge: {
              title: 'Remove Duplicates Preserving Order',
              task: 'Iterate through [1, 2, 2, 3, 1] and collect unique items in order.',
              hint: 'Keep a seen set and append unseen items to a new list.'
            }
          }
        ]
      },
      {
        id: 'py_c25',
        number: 5,
        title: 'List Methods',
        description: 'append(), extend(), insert(), remove(), pop(), clear(), index(), count(), sort(), reverse().',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c25_l1',
            chapterId: 'py_c25',
            title: 'In-Place Mutation vs Returning New Sequences',
            duration: '12 min',
            summary: 'Master the crucial difference between list.sort() (mutates in place, returns None) and sorted() (returns new list).',
            learningObjectives: [
              'Distinguish list.sort() from sorted(iterable)',
              'Use key=lambda functions for custom sorting criteria',
              'Understand extend() vs append()'
            ],
            contentMarkdown: `### list.sort() vs sorted()
- \`items.sort()\`: Modifies the list in place using Timsort (O(N log N)) and returns \`None\`.
- \`sorted(items)\`: Leaves the original list untouched and returns a new sorted list.

\`\`\`python
data = [5, 2, 9, 1]

# In-place sort
data.sort()
print(data)  # [1, 2, 5, 9]

# Custom sort by key
words = ["python", "c", "javascript"]
words.sort(key=len)  # Sort by string length
print(words)         # ['c', 'python', 'javascript']
\`\`\``,
            realWorldContext: 'Sorting records by timestamp, price, or priority is one of the most frequent operations in backend data endpoints.',
            codeExample: `scores = [45, 90, 78, 62, 88]
scores.sort(reverse=True)
print("Top scores (descending):", scores)

scores.pop(0)  # Removes the highest
print("After removing top:", scores)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'list.sort() returns None; assigning result = data.sort() will overwrite your list with None!',
              'extend() adds elements from another iterable, whereas append() would add the entire list as a single sublist.'
            ],
            interactivePractice: {
              instructions: 'Sort [10, 5, 20] in descending order using sort(reverse=True) and print it.',
              starterCode: `nums = [10, 5, 20]\nnums.sort(reverse=True)\nprint(nums)`,
              solutionCode: `nums = [10, 5, 20]\nnums.sort(reverse=True)\nprint(nums)`,
              expectedOutput: '[20, 10, 5]'
            },
            knowledgeCheck: {
              question: 'What is the value of x after x = [3, 1, 2].sort()?',
              options: ['None', '[1, 2, 3]', '[3, 1, 2]', 'Raises AttributeError'],
              correctIndex: 0,
              explanation: 'list.sort() performs in-place sorting and returns None. Assigning its result sets x to None.'
            },
            challenge: {
              title: 'Sort by Absolute Value',
              task: 'Sort [-10, 5, -2, 8] by magnitude using key=abs.',
              hint: 'sorted([-10, 5, -2, 8], key=abs)'
            }
          }
        ]
      },
      {
        id: 'py_c26',
        number: 6,
        title: 'List Comprehensions',
        description: 'Syntactic sugar, conditional filtering, nested comprehensions, and readability guidelines.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c26_l1',
            chapterId: 'py_c26',
            title: 'Expressive Data Transformation with Comprehensions',
            duration: '12 min',
            summary: 'Transform and filter sequences in a single readable line executed in C speed.',
            learningObjectives: [
              'Syntax: [expression for item in iterable if condition]',
              'Filter and map elements simultaneously',
              'Recognize when a comprehension is too complex and should be a standard loop'
            ],
            contentMarkdown: `### List Comprehension Formula
\`[expression for item in iterable if condition]\`

\`\`\`python
# Squares of even numbers
numbers = [1, 2, 3, 4, 5, 6, 7, 8]
even_squares = [n ** 2 for n in numbers if n % 2 == 0]
# [4, 16, 36, 64]
\`\`\`

#### Why Comprehensions are Faster
Comprehensions are optimized at the bytecode level in CPython, executing faster than manual \`.append()\` in a standard for-loop.`,
            realWorldContext: 'Extracting user emails, normalizing strings, and filtering active database IDs are all written as comprehensions.',
            codeExample: `users = [
    {"name": "Alex", "active": True},
    {"name": "Sam", "active": False},
    {"name": "Taylor", "active": True}
]

active_names = [u["name"] for u in users if u["active"]]
print("Active users:", active_names)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'List comprehensions replace map() and filter() in modern Python.',
              'Avoid nesting more than two loops inside a comprehension for readability.'
            ],
            interactivePractice: {
              instructions: 'Create a list of numbers from 0 to 4 multiplied by 10 using comprehension.',
              starterCode: `multiples = [x * 10 for x in range(5)]\nprint(multiples)`,
              solutionCode: `multiples = [x * 10 for x in range(5)]\nprint(multiples)`,
              expectedOutput: '[0, 10, 20, 30, 40]'
            },
            knowledgeCheck: {
              question: 'What is the output of [x for x in range(6) if x % 2 != 0]?',
              options: ['[1, 3, 5]', '[0, 2, 4]', '[1, 2, 3, 4, 5]', '[2, 4, 6]'],
              correctIndex: 0,
              explanation: 'range(6) produces 0, 1, 2, 3, 4, 5. Filtering for odd numbers (x % 2 != 0) yields [1, 3, 5].'
            },
            challenge: {
              title: 'Flatten 2D Matrix',
              task: 'Flatten [[1, 2], [3, 4]] into [1, 2, 3, 4] with a comprehension.',
              hint: '[x for row in matrix for x in row]'
            }
          }
        ]
      },
      {
        id: 'py_c27',
        number: 7,
        title: 'Tuples',
        description: 'Immutability, tuple packing/unpacking, named tuples, and dictionary key compatibility.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c27_l1',
            chapterId: 'py_c27',
            title: 'Tuples as Fixed Records and Heterogeneous Structs',
            duration: '10 min',
            summary: 'While lists represent homogeneous dynamic collections, tuples represent immutable heterogeneous records.',
            learningObjectives: [
              'Understand tuple packing and unpacking with *',
              'Use tuples as hashable dictionary keys',
              'Use namedtuple for structured data'
            ],
            contentMarkdown: `### Tuple Unpacking
\`\`\`python
point = (10, 20, 30)
x, y, z = point  # x=10, y=20, z=30

# Star unpacking
first, *middle, last = [1, 2, 3, 4, 5]
# first=1, middle=[2, 3, 4], last=5
\`\`\`

#### Single Element Tuple
A single element tuple requires a trailing comma: \`single = (42,)\`. Without the comma, \`(42)\` is just an integer inside parentheses!`,
            realWorldContext: 'Database queries return rows as tuples because row schemas have fixed columns that should never be mutated.',
            codeExample: `from collections import namedtuple

Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 25)
print(f"Point coordinates: x={p.x}, y={p.y}")

# Tuple as dictionary key
grid = {(0, 0): "Origin", (1, 2): "Player"}
print("Origin value:", grid[(0, 0)])`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Tuples are immutable; they cannot be changed after creation.',
              'Tuples can be used as dictionary keys if all their elements are hashable.',
              'A single-item tuple must include a trailing comma (x,).'
            ],
            interactivePractice: {
              instructions: 'Create a tuple (100, 200), unpack it into a and b, and print their sum.',
              starterCode: `pair = (100, 200)\na, b = pair\nprint("Sum:", a + b)`,
              solutionCode: `pair = (100, 200)\na, b = pair\nprint("Sum:", a + b)`,
              expectedOutput: 'Sum: 300'
            },
            knowledgeCheck: {
              question: 'Which syntax creates a valid single-item tuple?',
              options: ['(5,)', '(5)', 'tuple.single(5)', '[5,]'],
              correctIndex: 0,
              explanation: 'A comma is mandatory to distinguish a single-element tuple from parenthesized arithmetic expressions.'
            },
            challenge: {
              title: 'Star Unpacking',
              task: 'Unpack a, *b, c = [10, 20, 30, 40] and print b.',
              hint: 'b will capture the inner elements as [20, 30].'
            }
          }
        ]
      },
      {
        id: 'py_c28',
        number: 8,
        title: 'Sets',
        description: 'Hash tables, O(1) membership testing, union, intersection, difference, and symmetric difference.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c28_l1',
            chapterId: 'py_c28',
            title: 'Set Algebra & O(1) Lookups',
            duration: '10 min',
            summary: 'Utilize hash sets to achieve constant-time lookups and perform mathematical set operations.',
            learningObjectives: [
              'Understand set hashing and why elements must be immutable',
              'Perform union (|), intersection (&), and difference (-)',
              'Deduplicate sequences in O(N) time'
            ],
            contentMarkdown: `### Set Algebra Operators
\`\`\`python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)  # Union: {1, 2, 3, 4, 5, 6}
print(a & b)  # Intersection: {3, 4}
print(a - b)  # Difference: {1, 2}
print(a ^ b)  # Symmetric Difference: {1, 2, 5, 6}
\`\`\``,
            realWorldContext: 'Permission systems compute effective user abilities using set intersection between user roles and granted scopes.',
            codeExample: `admins = {"alex", "priya", "sam"}
online = {"sam", "taylor", "alex"}

# Set intersection
online_admins = admins & online
print("Online admins:", online_admins)

# O(1) lookup
print("Is alex admin?", "alex" in admins)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'in operator on sets is O(1) average time compared to O(N) on lists.',
              'Sets only contain unique elements.',
              'Empty set must be created with set(), since {} creates an empty dict.'
            ],
            interactivePractice: {
              instructions: 'Deduplicate [1, 2, 2, 3, 3, 4] using set() and print sorted list.',
              starterCode: `nums = [1, 2, 2, 3, 3, 4]\nunique = sorted(list(set(nums)))\nprint(unique)`,
              solutionCode: `nums = [1, 2, 2, 3, 3, 4]\nunique = sorted(list(set(nums)))\nprint(unique)`,
              expectedOutput: '[1, 2, 3, 4]'
            },
            knowledgeCheck: {
              question: 'How do you initialize an empty set in Python?',
              options: ['set()', '{}', 'set([])', 'new Set()'],
              correctIndex: 0,
              explanation: '{} creates an empty dictionary in Python. An empty set must be instantiated using set().'
            },
            challenge: {
              title: 'Common Elements',
              task: 'Find the common characters between "developer" and "coder" using set intersection.',
              hint: 'set("developer") & set("coder")'
            }
          }
        ]
      },
      {
        id: 'py_c29',
        number: 9,
        title: 'Dictionaries',
        description: 'Key-value hash maps, insertion order preservation, dict methods, and get() fallbacks.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c29_l1',
            chapterId: 'py_c29',
            title: 'Modern Dictionary Mechanics & Safe Lookups',
            duration: '12 min',
            summary: 'Master key-value storage, insertion ordering guarantee in Python 3.7+, and the safe get() method.',
            learningObjectives: [
              'Understand compact dict hash table memory layout',
              'Use dict.get(key, default) to prevent KeyError crashes',
              'Iterate over keys(), values(), and items()'
            ],
            contentMarkdown: `### Safe Dictionary Access
Accessing a missing key with square brackets \`d["missing"]\` raises a \`KeyError\`. The \`.get()\` method returns a default fallback instead:

\`\`\`python
user = {"name": "Alex", "role": "admin"}

# Safe retrieval with fallback
timeout = user.get("timeout_seconds", 30)  # Returns 30

# Iterating over items
for key, value in user.items():
    print(f"{key}: {value}")
\`\`\``,
            realWorldContext: 'JSON objects from REST APIs deserialize directly into Python dictionaries; safe access via get() is standard industry practice.',
            codeExample: `config = {
    "host": "localhost",
    "port": 8080,
    "debug": True
}

port = config.get("port", 3000)
ssl = config.get("ssl", False)
print(f"Connecting to port {port} with SSL={ssl}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Python 3.7+ guarantees dictionaries preserve insertion order.',
              'dict.get(k, default) prevents KeyError exceptions.',
              'Keys must be immutable (hashable) objects.'
            ],
            interactivePractice: {
              instructions: 'Retrieve "theme" from {"lang": "py"} with fallback "dark".',
              starterCode: `d = {"lang": "py"}\nprint(d.get("theme", "dark"))`,
              solutionCode: `d = {"lang": "py"}\nprint(d.get("theme", "dark"))`,
              expectedOutput: 'dark'
            },
            knowledgeCheck: {
              question: 'What occurs if you access a missing key using d["nonexistent"]?',
              options: ['KeyError is raised', 'Returns None silently', 'Returns False', 'Adds the key with value None'],
              correctIndex: 0,
              explanation: 'Bracket access on a missing dictionary key raises a KeyError. Use d.get("key") for safe fallback.'
            },
            challenge: {
              title: 'Word Frequency Counter',
              task: 'Count occurrences of words in ["a", "b", "a"] using a dictionary.',
              hint: 'counts[w] = counts.get(w, 0) + 1.'
            }
          }
        ]
      },
      {
        id: 'py_c30',
        number: 10,
        title: 'Dictionary Comprehensions',
        description: 'Mapping, swapping keys/values, filtering records, and conditional transformations.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 20,
        lessons: [
          {
            id: 'py_c30_l1',
            chapterId: 'py_c30',
            title: 'Inverting Mappings and Constructing Hash Maps',
            duration: '10 min',
            summary: 'Construct dictionaries declaratively using {key_expr: val_expr for item in iterable}.',
            learningObjectives: [
              'Syntax: {k: v for item in iterable}',
              'Invert dictionaries (swap keys and values)',
              'Filter dictionary contents conditionally'
            ],
            contentMarkdown: `### Dict Comprehension Syntax
\`\`\`python
# Square mapping
squares = {x: x ** 2 for x in range(1, 5)}
# {1: 1, 2: 4, 3: 9, 4: 16}

# Inverting a lookup map
roles = {"alex": "admin", "sam": "editor"}
inverted = {role: user for user, role in roles.items()}
# {'admin': 'alex', 'editor': 'sam'}
\`\`\``,
            realWorldContext: 'Building fast reverse lookups and caching layers from database rows is cleanly done with dict comprehensions.',
            codeExample: `scores = {"Math": 92, "History": 68, "Physics": 85, "Art": 74}
passing = {subject: score for subject, score in scores.items() if score >= 75}
print("Passing subjects:", passing)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Dict comprehensions create new dictionaries in a single expression.',
              'Ensure inverted values are unique and hashable when swapping keys and values.'
            ],
            interactivePractice: {
              instructions: 'Create a dictionary mapping numbers 1, 2, 3 to their cubes using comprehension.',
              starterCode: `cubes = {x: x ** 3 for x in range(1, 4)}\nprint(cubes)`,
              solutionCode: `cubes = {x: x ** 3 for x in range(1, 4)}\nprint(cubes)`,
              expectedOutput: '{1: 1, 2: 8, 3: 27}'
            },
            knowledgeCheck: {
              question: 'Which syntax creates a dictionary mapping each string to its length?',
              options: [
                '{s: len(s) for s in words}',
                '[s: len(s) for s in words]',
                '{s -> len(s) for s in words}',
                'dict(s = len(s) for s in words)'
              ],
              correctIndex: 0,
              explanation: '{k: v for item in iterable} is the standard dictionary comprehension syntax.'
            },
            challenge: {
              title: 'Filter Dictionary',
              task: 'Filter {"a": 10, "b": 5, "c": 20} keeping only values > 8.',
              hint: '{k: v for k, v in d.items() if v > 8}'
            }
          }
        ]
      },
      {
        id: 'py_c31',
        number: 11,
        title: 'Nested Data Structures',
        description: 'Lists of dictionaries, dictionaries of lists, deep copying, and tree/graph structures.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c31_l1',
            chapterId: 'py_c31',
            title: 'Modeling Complex Real-World Data & copy.deepcopy',
            duration: '12 min',
            summary: 'Navigate nested data representations and prevent shallow copy mutation bugs.',
            learningObjectives: [
              'Navigate nested JSON-like lists and dictionaries',
              'Understand why shallow copy (.copy()) fails on nested mutables',
              'Use copy.deepcopy() when true independence is required'
            ],
            contentMarkdown: `### The Deep Copy Trap
A shallow copy \`a.copy()\` duplicates only the top-level container; inner nested lists or dictionaries remain shared references!

\`\`\`python
import copy

original = {"users": [{"name": "Alex"}]}

# Shallow copy shares nested objects:
shallow = original.copy()
shallow["users"][0]["name"] = "MUTATED"
print(original["users"][0]["name"])  # "MUTATED" - Unexpected bug!

# Deep copy creates completely independent copies:
deep = copy.deepcopy(original)
\`\`\``,
            realWorldContext: 'Cloning configuration objects or state snapshots in redux/event-driven architectures requires deepcopy.',
            codeExample: `company = {
    "name": "ChulliCode",
    "departments": {
        "engineering": {"head": "Shakti", "size": 12},
        "design": {"head": "Priya", "size": 4}
    }
}

eng_head = company["departments"]["engineering"]["head"]
print("Engineering Head:", eng_head)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Chaining brackets d[k1][k2] traverses nested structures.',
              'Use copy.deepcopy() when cloning nested mutable data.'
            ],
            interactivePractice: {
              instructions: 'Access the second hobby from user = {"hobbies": ["coding", "chess"]}.',
              starterCode: `user = {"hobbies": ["coding", "chess"]}\nprint(user["hobbies"][1])`,
              solutionCode: `user = {"hobbies": ["coding", "chess"]}\nprint(user["hobbies"][1])`,
              expectedOutput: 'chess'
            },
            knowledgeCheck: {
              question: 'Why does shallow copy fail to protect nested lists from mutation?',
              options: [
                'It copies only the references to inner nested objects, not the objects themselves',
                'CPython disables cloning for security',
                'Nested objects are converted to tuples',
                'It causes a RecursionError'
              ],
              correctIndex: 0,
              explanation: 'A shallow copy duplicates the outer container, but its elements still point to the same inner heap objects.'
            },
            challenge: {
              title: 'Nested Record Extraction',
              task: 'Extract all student names from a school dictionary containing classrooms.',
              hint: '[student for classroom in school.values() for student in classroom]'
            }
          }
        ]
      },
      {
        id: 'py_c32',
        number: 12,
        title: 'Data Structure Problem Solving',
        description: 'Two-Sum, anagram validation, frequency maps, and parenthetical matching using stacks.',
        levelNumber: 3,
        levelTitle: 'Python Data Structures',
        estimatedMinutes: 30,
        lessons: [
          {
            id: 'py_c32_l1',
            chapterId: 'py_c32',
            title: 'Algorithmic Mastery: Two-Sum & Valid Parentheses',
            duration: '15 min',
            summary: 'Implement optimal O(N) hash map solutions for canonical data structure problems.',
            learningObjectives: [
              'Solve Two-Sum in O(N) using a complement hash map',
              'Validate nested bracket matching using a stack (list append/pop)',
              'Analyze time and space tradeoffs'
            ],
            contentMarkdown: `### The Two-Sum O(N) Hash Map Technique
Instead of checking all pairs in O(N^2), record seen numbers in a dictionary to find the complement in O(1):

\`\`\`python
def two_sum(nums, target):
    seen = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
\`\`\``,
            realWorldContext: 'Two-Sum and bracket validation are the two most frequently tested algorithm questions in tech interviews worldwide.',
            codeExample: `def is_valid_parentheses(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return len(stack) == 0

print("Is '({[]})' valid?", is_valid_parentheses("({[]})"))
print("Is '([)]' valid?", is_valid_parentheses("([)]"))`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Hash maps trade O(N) memory for O(1) lookups, reducing O(N^2) algorithms to O(N).',
              'Python lists work as stacks via append() and pop().'
            ],
            interactivePractice: {
              instructions: 'Test two_sum([2, 7, 11, 15], 9) and print the indices.',
              starterCode: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
              solutionCode: `def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
              expectedOutput: '[0, 1]'
            },
            knowledgeCheck: {
              question: 'What data structure enables O(N) validation of balanced parentheses?',
              options: ['Stack (LIFO)', 'Queue (FIFO)', 'Binary Heap', 'Linked List'],
              correctIndex: 0,
              explanation: 'A stack ensures that the most recently opened bracket is closed first (Last-In, First-Out).'
            },
            challenge: {
              title: 'Anagram Detection',
              task: 'Check if two strings "listen" and "silent" are anagrams using sorted() or collections.Counter.',
              hint: 'sorted("listen") == sorted("silent")'
            }
          }
        ]
      }
    ]
  }
];
