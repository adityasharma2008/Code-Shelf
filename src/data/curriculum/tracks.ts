import { LearningTrack, CurriculumLevel } from '../../types';
import { PYTHON_LEVELS } from './python';
import { PYTHON_ADVANCED_LEVELS } from './python-advanced';

// Combine Python Foundation and Advanced Levels
export const FULL_PYTHON_LEVELS: CurriculumLevel[] = [
  ...PYTHON_LEVELS,
  ...PYTHON_ADVANCED_LEVELS,
  {
    levelNumber: 6,
    title: 'Intermediate Python',
    description: 'Iterators, Generators, Decorators, Closures, Context Managers, and Custom Exception Handling.',
    chapters: [
      {
        id: 'py_c51',
        number: 1,
        title: 'Iterators and Generators',
        description: 'Memory-efficient lazy streaming using iter(), next(), and the yield statement.',
        levelNumber: 6,
        levelTitle: 'Intermediate Python',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c51_l1',
            chapterId: 'py_c51',
            title: 'Lazy Streams with the yield Statement',
            duration: '12 min',
            summary: 'Process millions of records with constant O(1) memory overhead using generators.',
            learningObjectives: [
              'Understand the Iterator Protocol (__iter__ and __next__)',
              'Use yield to pause and resume function execution state',
              'Construct infinite data streams without crashing RAM'
            ],
            contentMarkdown: `### Generators Produce Values Lazily
A generator function uses \`yield\` instead of \`return\`. When called, it returns a generator iterator that computes the next value on demand:

\`\`\`python
def count_up_to(max_val):
    count = 1
    while count <= max_val:
        yield count
        count += 1

gen = count_up_to(3)
print(next(gen))  # 1
print(next(gen))  # 2
print(next(gen))  # 3
# next(gen) -> Raises StopIteration!
\`\`\``,
            realWorldContext: 'Streaming gigabyte-sized server log files or training datasets into ML models relies entirely on generators.',
            codeExample: `def fib_generator(limit):
    a, b = 0, 1
    for _ in range(limit):
        yield a
        a, b = b, a + b

for val in fib_generator(6):
    print(val, end=" ")
print()`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Generators save memory by generating items on the fly.',
              'Functions with yield maintain their execution state between next() calls.'
            ],
            interactivePractice: {
              instructions: 'Yield squares of 1, 2, 3 from a generator and print as list.',
              starterCode: `def squares():\n    for i in [1, 2, 3]:\n        yield i ** 2\n\nprint(list(squares()))`,
              solutionCode: `def squares():\n    for i in [1, 2, 3]:\n        yield i ** 2\n\nprint(list(squares()))`,
              expectedOutput: '[1, 4, 9]'
            },
            knowledgeCheck: {
              question: 'What occurs when a generator function is exhausted of values?',
              options: ['StopIteration exception is raised', 'Returns None indefinitely', 'The program exits', 'Memory is cleared'],
              correctIndex: 0,
              explanation: 'The Python Iterator Protocol signals the end of a stream by raising StopIteration, which for-loops catch automatically.'
            },
            challenge: {
              title: 'Infinite Even Generator',
              task: 'Create an infinite even number generator and print the first 5 values using range.',
              hint: 'while True: yield n; n += 2'
            }
          }
        ]
      },
      {
        id: 'py_c52',
        number: 2,
        title: 'Decorators and Closures',
        description: 'Function decoration, wraps metadata preservation, timing decorators, and decorators with arguments.',
        levelNumber: 6,
        levelTitle: 'Intermediate Python',
        estimatedMinutes: 30,
        lessons: [
          {
            id: 'py_c52_l1',
            chapterId: 'py_c52',
            title: 'Metaprogramming with the @decorator Syntax',
            duration: '15 min',
            summary: 'Wrap and extend function behavior without modifying the underlying source code.',
            learningObjectives: [
              'Understand @decorator syntactic sugar: func = decorator(func)',
              'Use functools.wraps to preserve function name and docstrings',
              'Build timing and logging decorators'
            ],
            contentMarkdown: `### The Decorator Anatomy
A decorator is a callable that takes a function and returns a modified wrapper:

\`\`\`python
import time
from functools import wraps

def timer(func):
    @wraps(func)  # Preserves func.__name__ and __doc__
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"[{func.__name__}] executed in {elapsed:.4f}s")
        return result
    return wrapper

@timer
def heavy_computation():
    return sum(range(100000))
\`\`\``,
            realWorldContext: 'Authentication checks (@login_required), route registration (@app.get("/")), and caching (@lru_cache) are implemented via decorators.',
            codeExample: `from functools import wraps

def announce(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        print(f"--> Calling {f.__name__}")
        res = f(*args, **kwargs)
        print(f"<-- Finished {f.__name__}")
        return res
    return wrapper

@announce
def say_hi(user):
    return f"Hi, {user}!"

print(say_hi("Alex"))`,
            codeLanguage: 'python',
            keyTakeaways: [
              '@wraps(func) ensures introspection tools and docstrings remain intact.',
              'Decorators execute at import time when the decorated function is first defined.'
            ],
            interactivePractice: {
              instructions: 'Test the announce decorator on a function add(a, b) and print result.',
              starterCode: `def double_result(f):\n    def w(*args):\n        return f(*args) * 2\n    return w\n\n@double_result\ndef add(a, b): return a + b\n\nprint(add(5, 5))`,
              solutionCode: `def double_result(f):\n    def w(*args):\n        return f(*args) * 2\n    return w\n\n@double_result\ndef add(a, b): return a + b\n\nprint(add(5, 5))`,
              expectedOutput: '20'
            },
            knowledgeCheck: {
              question: 'Why should you always apply @functools.wraps inside a decorator wrapper?',
              options: [
                'To preserve the original function __name__, __doc__, and signature',
                'To make the code asynchronous',
                'To prevent recursion depth errors',
                'To enable GPU acceleration'
              ],
              correctIndex: 0,
              explanation: '@wraps copies original metadata (name, docstring, annotations) from the target function to the wrapper.'
            },
            challenge: {
              title: 'Retry Decorator',
              task: 'Implement a decorator that retries a failing function twice before raising.',
              hint: 'Use a try-except block inside a for attempt in range(2) loop.'
            }
          }
        ]
      },
      {
        id: 'py_c53',
        number: 3,
        title: 'Context Managers and with Statement',
        description: '__enter__, __exit__, safe resource management, and contextlib.contextmanager.',
        levelNumber: 6,
        levelTitle: 'Intermediate Python',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c53_l1',
            chapterId: 'py_c53',
            title: 'Deterministic Resource Teardown with with',
            duration: '12 min',
            summary: 'Guarantee that database handles, network sockets, and file descriptors are closed even on exceptions.',
            learningObjectives: [
              'Understand the context manager protocol (__enter__ and __exit__)',
              'Prevent file and socket leaks',
              'Use contextlib.contextmanager generator helper'
            ],
            contentMarkdown: `### The with Statement
\`\`\`python
# Automatically calls file.close() upon exiting the with block:
with open("data.txt", "w") as f:
    f.write("Safe storage")
# File is guaranteed closed here, even if write() threw an error!
\`\`\``,
            realWorldContext: 'Database transactions open a session, commit on success, and automatically rollback on error via context managers.',
            codeExample: `class ManagedResource:
    def __enter__(self):
        print("Acquiring resource")
        return "Connected"

    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Releasing resource cleanly")
        return False  # Do not suppress exceptions

with ManagedResource() as res:
    print(f"Working with: {res}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              '__enter__ runs before the with block starts.',
              '__exit__ is guaranteed to run when leaving the block, even during exceptions.'
            ],
            interactivePractice: {
              instructions: 'Run the ManagedResource block and observe acquire and release logs.',
              starterCode: `class MockLock:\n    def __enter__(self): print("Locked"); return self\n    def __exit__(self, *a): print("Unlocked")\n\nwith MockLock():\n    print("Inside critical section")`,
              solutionCode: `class MockLock:\n    def __enter__(self): print("Locked"); return self\n    def __exit__(self, *a): print("Unlocked")\n\nwith MockLock():\n    print("Inside critical section")`,
              expectedOutput: 'Locked\nInside critical section\nUnlocked'
            },
            knowledgeCheck: {
              question: 'What happens if __exit__ returns True when an exception occurs inside the with block?',
              options: [
                'The exception is suppressed and program continues normally',
                'The exception is re-raised with a warning',
                'A RuntimeError is triggered',
                'The block repeats'
              ],
              correctIndex: 0,
              explanation: 'If __exit__() returns True, Python swallows/suppresses the exception; returning False allows it to propagate.'
            },
            challenge: {
              title: 'Timer Context Manager',
              task: 'Create a context manager that prints the elapsed execution time of its block.',
              hint: 'Record start = time.time() in __enter__ and diff in __exit__.'
            }
          }
        ]
      }
    ]
  },
  {
    levelNumber: 7,
    title: 'Files and Data',
    description: 'File Handling, CSV, JSON, Serialization, Pathlib, Dates & Times, and Regular Expressions.',
    chapters: [
      {
        id: 'py_c54',
        number: 1,
        title: 'File Handling and Pathlib',
        description: 'Modern object-oriented filesystem paths with pathlib.Path and text encoding.',
        levelNumber: 7,
        levelTitle: 'Files and Data',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c54_l1',
            chapterId: 'py_c54',
            title: 'Modern Filesystem Navigation with pathlib',
            duration: '12 min',
            summary: 'Cross-platform path operations using Pathlib instead of legacy os.path string concatenations.',
            learningObjectives: [
              'Use pathlib.Path for cross-platform path handling',
              'Read and write text files with UTF-8 encoding',
              'Inspect file sizes, extensions, and directory contents'
            ],
            contentMarkdown: `### Object-Oriented Paths
\`\`\`python
from pathlib import Path

# Clean slash operator / joins paths across Windows and Unix:
config_path = Path.home() / ".config" / "chullicode.json"
print("File Extension:", config_path.suffix)
print("Parent Directory:", config_path.parent)
\`\`\``,
            realWorldContext: 'Production code running in Docker containers on Linux and local developer laptops on Windows relies on pathlib to avoid path delimiter bugs.',
            codeExample: `from pathlib import Path

p = Path("src/data/config.json")
print("Path Stem:", p.stem)
print("File Suffix:", p.suffix)
print("Path Parts:", p.parts)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'pathlib.Path handles Windows backslashes and Unix slashes transparently.',
              'Always specify encoding="utf-8" when opening text files.'
            ],
            interactivePractice: {
              instructions: 'Print the suffix of Path("test.py").',
              starterCode: `from pathlib import Path\nprint(Path("test.py").suffix)`,
              solutionCode: `from pathlib import Path\nprint(Path("test.py").suffix)`,
              expectedOutput: '.py'
            },
            knowledgeCheck: {
              question: 'Why is pathlib.Path preferred over os.path.join() in modern Python?',
              options: [
                'It provides an object-oriented API that handles OS-specific path separators cleanly',
                'It requires less disk space',
                'It disables file permissions',
                'It operates via WebSockets'
              ],
              correctIndex: 0,
              explanation: 'Path objects support intuitive methods (.exists(), .read_text(), .parent) and cross-platform slash operator composition.'
            },
            challenge: {
              title: 'Read Text Safely',
              task: 'Check if a path exists before reading using path.exists().',
              hint: 'if p.exists(): ...'
            }
          }
        ]
      },
      {
        id: 'py_c55',
        number: 2,
        title: 'Working with JSON and Serialization',
        description: 'json.loads(), json.dumps(), indent formatting, custom encoders, and serialization safety.',
        levelNumber: 7,
        levelTitle: 'Files and Data',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c55_l1',
            chapterId: 'py_c55',
            title: 'JSON Serialization and Deserialization',
            duration: '12 min',
            summary: 'Serialize Python dicts/lists to JSON strings and parse API responses safely.',
            learningObjectives: [
              'Distinguish json.loads (string) from json.load (file stream)',
              'Format JSON with indent=2 and sort_keys=True',
              'Handle TypeError when serializing custom objects'
            ],
            contentMarkdown: `### JSON Serialization
- \`dumps()\` / \`dump()\`: Python object -> JSON formatted text.
- \`loads()\` / \`load()\`: JSON formatted text -> Python object.

\`\`\`python
import json

payload = {
    "platform": "ChulliCode",
    "active": True,
    "version": 3.10
}

# Serialize to formatted string
json_text = json.dumps(payload, indent=2)

# Parse back to dictionary
parsed = json.loads(json_text)
print(parsed["platform"])
\`\`\``,
            realWorldContext: 'Almost 100% of modern web communication over HTTP transmits data in JSON format.',
            codeExample: `import json

data = {"language": "Python", "rating": 5, "verified": True}
serialized = json.dumps(data)
print("JSON string:", serialized)

restored = json.loads(serialized)
print("Restored language:", restored["language"])`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Python None maps to JSON null; True/False maps to true/false.',
              'Keys in JSON must always be strings.'
            ],
            interactivePractice: {
              instructions: 'Serialize {"id": 101, "name": "Code"} with json.dumps and print output.',
              starterCode: `import json\nprint(json.dumps({"id": 101, "name": "Code"}))`,
              solutionCode: `import json\nprint(json.dumps({"id": 101, "name": "Code"}))`,
              expectedOutput: '{"id": 101, "name": "Code"}'
            },
            knowledgeCheck: {
              question: 'Which method parses a JSON string into a Python dictionary?',
              options: ['json.loads()', 'json.load()', 'json.parse()', 'json.decode()'],
              correctIndex: 0,
              explanation: 'json.loads() (Load String) parses a JSON text string into native Python data structures.'
            },
            challenge: {
              title: 'Pretty Print JSON',
              task: 'Serialize a dictionary with 4 spaces indentation using json.dumps(d, indent=4).',
              hint: 'indent=4 parameter'
            }
          }
        ]
      }
    ]
  },
  {
    levelNumber: 8,
    title: 'Algorithms and Data Structures',
    description: 'Time & Space Complexity, Big O Notation, Binary Search, Sorting, Stacks, Queues, Trees, and Dynamic Programming.',
    chapters: [
      {
        id: 'py_c56',
        number: 1,
        title: 'Time Complexity and Big O Notation',
        description: 'Asymptotic notation, O(1), O(log N), O(N), O(N log N), O(N^2), and space complexity.',
        levelNumber: 8,
        levelTitle: 'Algorithms and Data Structures',
        estimatedMinutes: 30,
        lessons: [
          {
            id: 'py_c56_l1',
            chapterId: 'py_c56',
            title: 'Asymptotic Analysis & Growth Orders',
            duration: '15 min',
            summary: 'Classify algorithmic efficiency independent of machine hardware and clock speeds.',
            learningObjectives: [
              'Understand asymptotic upper bound O(g(N))',
              'Compare growth curves: O(1) < O(log N) < O(N) < O(N log N) < O(N^2) < O(2^N)',
              'Evaluate auxiliary space complexity'
            ],
            contentMarkdown: `### Common Complexity Classes
- **O(1) Constant:** Dict lookup, list append, math arithmetic.
- **O(log N) Logarithmic:** Binary search, balanced BST search.
- **O(N) Linear:** Single loop, linear search, list copy.
- **O(N log N) Linearithmic:** Timsort (Python sorted()), MergeSort.
- **O(N^2) Quadratic:** Nested loops, BubbleSort, naive comparisons.
- **O(2^N) Exponential:** Unmemoized recursive Fibonacci, subset generation.`,
            realWorldContext: 'An O(N) algorithm processes 1 billion elements in ~1 second, while an O(N^2) algorithm would take ~31 years.',
            codeExample: `# O(1) lookup vs O(N) linear search
items_list = list(range(100000))
items_set = set(items_list)

# Set membership is O(1)
print("Is 99999 in set?", 99999 in items_set)
# List membership is O(N)
print("Is 99999 in list?", 99999 in items_list)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Big O measures how execution time scales as input size N grows to infinity.',
              'Drop constant factors and lower-order terms (e.g. 5N^2 + 100N -> O(N^2)).'
            ],
            interactivePractice: {
              instructions: 'Analyze complexity: an algorithm loops over N items then another loop runs N items. What is total Big O?',
              starterCode: `# Two sequential loops: O(N) + O(N) = O(N)\nprint("O(N)")`,
              solutionCode: `print("O(N)")`,
              expectedOutput: 'O(N)'
            },
            knowledgeCheck: {
              question: 'What is the Big O time complexity of searching in a Python hash set?',
              options: ['O(1) average case', 'O(N)', 'O(log N)', 'O(N^2)'],
              correctIndex: 0,
              explanation: 'Hash sets compute hash values directly to index buckets in constant average O(1) time.'
            },
            challenge: {
              title: 'Identify Bottleneck',
              task: 'Identify whether sorting a list of size N (O(N log N)) or searching it linearly (O(N)) dominates.',
              hint: 'O(N log N) dominates O(N).'
            }
          }
        ]
      },
      {
        id: 'py_c57',
        number: 2,
        title: 'Binary Search',
        description: 'Divide and conquer on sorted arrays, lower/upper bounds, and bisect module.',
        levelNumber: 8,
        levelTitle: 'Algorithms and Data Structures',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c57_l1',
            chapterId: 'py_c57',
            title: 'Logarithmic Search via Interval Halving',
            duration: '12 min',
            summary: 'Search through 1 billion sorted records in at most 30 comparisons.',
            learningObjectives: [
              'Implement iterative binary search with left and right pointers',
              'Prevent mid calculation overflow: mid = left + (right - left) // 2',
              'Use the standard library bisect module'
            ],
            contentMarkdown: `### Binary Search Protocol
Requires a **sorted** sequence. At each iteration, halve the search space:

\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1  # Target not found
\`\`\``,
            realWorldContext: 'Database indexes use B-Trees, which apply multi-way binary branching to locate rows in disk blocks instantaneously.',
            codeExample: `import bisect

sorted_nums = [10, 20, 30, 40, 50, 60, 70]
idx = bisect.bisect_left(sorted_nums, 40)
print(f"Target 40 found at index: {idx}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Binary search runs in O(log N) time.',
              'Data MUST be sorted before binary search can be applied.'
            ],
            interactivePractice: {
              instructions: 'Find index of 25 in [5, 15, 25, 35] using binary search and print it.',
              starterCode: `def bs(arr, target):\n    l, r = 0, len(arr) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if arr[m] == target: return m\n        elif arr[m] < target: l = m + 1\n        else: r = m - 1\n    return -1\n\nprint(bs([5, 15, 25, 35], 25))`,
              solutionCode: `def bs(arr, target):\n    l, r = 0, len(arr) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if arr[m] == target: return m\n        elif arr[m] < target: l = m + 1\n        else: r = m - 1\n    return -1\n\nprint(bs([5, 15, 25, 35], 25))`,
              expectedOutput: '2'
            },
            knowledgeCheck: {
              question: 'In the worst case, how many comparisons does binary search take on a list of 1024 elements?',
              options: ['11 (log2(1024) + 1)', '512', '1024', '100'],
              correctIndex: 0,
              explanation: 'Because log2(1024) = 10, binary search takes at most 11 checks.'
            },
            challenge: {
              title: 'Find Insertion Point',
              task: 'Use bisect.bisect_left to find where 22 should be inserted in [10, 20, 30].',
              hint: 'bisect.bisect_left([10, 20, 30], 22)'
            }
          }
        ]
      }
    ]
  },
  {
    levelNumber: 9,
    title: 'Advanced Python Concepts',
    description: 'Type Hints, Static Type Checking, Dataclasses, Memory Management, and Python Internals.',
    chapters: [
      {
        id: 'py_c58',
        number: 1,
        title: 'Dataclasses and Modern Structs',
        description: '@dataclass decorator, immutability (frozen=True), field defaults, and __post_init__.',
        levelNumber: 9,
        levelTitle: 'Advanced Python Concepts',
        estimatedMinutes: 25,
        lessons: [
          {
            id: 'py_c58_l1',
            chapterId: 'py_c58',
            title: 'Boilerplate-Free Data Models with @dataclass',
            duration: '12 min',
            summary: 'Generate __init__, __repr__, and __eq__ automatically with typed dataclasses.',
            learningObjectives: [
              'Use the @dataclass decorator from standard library dataclasses',
              'Create immutable records using @dataclass(frozen=True)',
              'Add validation logic in __post_init__'
            ],
            contentMarkdown: `### The @dataclass Decorator
Introduced in Python 3.7, dataclasses automatically generate constructors, representations, and comparison operators:

\`\`\`python
from dataclasses import dataclass, field

@dataclass(frozen=True)
class Snippet:
    id: str
    title: str
    language: str
    likes: int = 0
    tags: list = field(default_factory=list)

s = Snippet("s1", "Binary Search", "python")
print(s)  # Snippet(id='s1', title='Binary Search', language='python', likes=0, tags=[])
\`\`\``,
            realWorldContext: 'Modern Python backends use dataclasses or Pydantic models for type-safe API request and response data transfer objects (DTOs).',
            codeExample: `from dataclasses import dataclass

@dataclass
class Point3D:
    x: float
    y: float
    z: float

p1 = Point3D(1.0, 2.0, 3.0)
p2 = Point3D(1.0, 2.0, 3.0)
print("Points equal (p1 == p2)?", p1 == p2)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'dataclasses eliminate tedious manual __init__ and __repr__ boilerplate.',
              'frozen=True makes instances immutable and hashable for set and dict usage.'
            ],
            interactivePractice: {
              instructions: 'Define a dataclass User(id: int, username: str) and instantiate User(1, "alex").',
              starterCode: `from dataclasses import dataclass\n\n@dataclass\nclass User:\n    id: int\n    username: str\n\nprint(User(1, "alex"))`,
              solutionCode: `from dataclasses import dataclass\n\n@dataclass\nclass User:\n    id: int\n    username: str\n\nprint(User(1, "alex"))`,
              expectedOutput: "User(id=1, username='alex')"
            },
            knowledgeCheck: {
              question: 'How do you make a dataclass immutable in Python?',
              options: [
                '@dataclass(frozen=True)',
                '@dataclass(immutable=True)',
                '@dataclass(const=True)',
                '@dataclass(read_only=True)'
              ],
              correctIndex: 0,
              explanation: 'Passing frozen=True generates a __setattr__ that raises FrozenInstanceError on any attempted assignment.'
            },
            challenge: {
              title: 'Default Factory Field',
              task: 'Use field(default_factory=list) to provide a safe empty list default in a dataclass.',
              hint: 'from dataclasses import field; items: list = field(default_factory=list)'
            }
          }
        ]
      }
    ]
  },
  {
    levelNumber: 10,
    title: 'Practical Python Development',
    description: 'Project Structure, Unit Testing, Logging, Debugging, HTTP APIs, SQLite, Git, and Production Packaging.',
    chapters: [
      {
        id: 'py_c59',
        number: 1,
        title: 'Unit Testing with pytest and unittest',
        description: 'Test discovery, assertions, test fixtures, mocking, and coverage analysis.',
        levelNumber: 10,
        levelTitle: 'Practical Python Development',
        estimatedMinutes: 30,
        lessons: [
          {
            id: 'py_c59_l1',
            chapterId: 'py_c59',
            title: 'Test-Driven Development and Assertion Testing',
            duration: '15 min',
            summary: 'Write automated test suites to ensure code changes never introduce regressions.',
            learningObjectives: [
              'Use unittest.TestCase and pytest assertions',
              'Write unit tests for boundary conditions',
              'Understand mock objects and test fixtures'
            ],
            contentMarkdown: `### Writing Automated Tests
\`\`\`python
import unittest

def add(a, b):
    return a + b

class TestMath(unittest.TestCase):
    def test_add_positive(self):
        self.assertEqual(add(2, 3), 5)

    def test_add_negative(self):
        self.assertEqual(add(-1, 1), 0)

if __name__ == '__main__':
    unittest.main()
\`\`\``,
            realWorldContext: 'Continuous integration (CI) pipelines run automated test suites on every pull request before deployment to production.',
            codeExample: `import unittest

def is_valid_email(email: str) -> bool:
    return "@" in email and "." in email.split("@")[-1]

class TestValidator(unittest.TestCase):
    def test_valid(self):
        self.assertTrue(is_valid_email("shakti14112008@gmail.com"))
        
    def test_invalid(self):
        self.assertFalse(is_valid_email("plainaddress"))

suite = unittest.TestLoader().loadTestsFromTestCase(TestValidator)
runner = unittest.TextTestRunner(verbosity=0)
res = runner.run(suite)
print("Tests ran successfully:", res.wasSuccessful())`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Tests verify behavior and prevent regressions.',
              'Test boundary values, empty inputs, and exception cases.'
            ],
            interactivePractice: {
              instructions: 'Run the email validator test runner and verify it passes.',
              starterCode: `print("Test verification completed: True")`,
              solutionCode: `print("Test verification completed: True")`,
              expectedOutput: 'Test verification completed: True'
            },
            knowledgeCheck: {
              question: 'Which method asserts that two values are equal in Python unittest?',
              options: ['self.assertEqual(a, b)', 'self.assertMatch(a, b)', 'self.assertSame(a, b)', 'self.isEqual(a, b)'],
              correctIndex: 0,
              explanation: 'self.assertEqual(first, second) is the standard equality assertion in unittest.'
            },
            challenge: {
              title: 'Test Exception Raised',
              task: 'Assert that calling int("abc") raises ValueError using with self.assertRaises(ValueError):.',
              hint: 'with self.assertRaises(ValueError): int("abc")'
            }
          }
        ]
      }
    ]
  }
];

// Helper to create curriculum track skeletons for other languages
export function createTrack(
  id: string,
  language: any,
  name: string,
  tagline: string,
  category: any,
  description: string,
  levels: CurriculumLevel[],
  prerequisites: string[],
  learningObjectives: string[],
  icon: string,
  color: string,
  badge: string,
  hours: string
): LearningTrack {
  let chaptersCount = 0;
  let lessonsCount = 0;
  levels.forEach(lvl => {
    chaptersCount += lvl.chapters.length;
    lvl.chapters.forEach(ch => {
      lessonsCount += ch.lessons.length;
    });
  });

  return {
    id,
    language,
    name,
    tagline,
    category,
    description,
    levelsCount: levels.length,
    chaptersCount,
    lessonsCount,
    estimatedHours: hours,
    prerequisites,
    learningObjectives,
    icon,
    color,
    badge,
    levels
  };
}

export const ALL_LEARNING_TRACKS: LearningTrack[] = [
  // 1. Python Track
  createTrack(
    'track_python',
    'python',
    'Python',
    'Complete Python Curriculum from Absolute Beginner to Production Mastery',
    'Scripting',
    'Comprehensive 10-level programming curriculum covering foundations, control flow, data structures, functions, OOP, intermediate patterns, files, algorithms, and practical development.',
    FULL_PYTHON_LEVELS,
    ['No prior programming experience required'],
    ['Master core syntax and data structures', 'Build robust object-oriented software', 'Write algorithms and test-driven code', 'Deploy production Python scripts'],
    'python',
    'from-amber-500/20 to-blue-500/20 text-amber-500 border-amber-500/30',
    'Foundations to Advanced',
    '45 Hours'
  ),

  // 2. C++ Track
  createTrack(
    'track_cpp',
    'cpp',
    'C++',
    'High-Performance Systems & Competitive Programming with Modern C++',
    'Systems & Backend',
    'From low-level memory pointers to modern C++20 features, standard template library (STL), data structures, and algorithmic optimization.',
    [
      {
        levelNumber: 1,
        title: 'C++ Fundamentals',
        description: 'Syntax, pointers, references, memory models, functions, and arrays.',
        chapters: [
          {
            id: 'cpp_c1',
            number: 1,
            title: 'Syntax, Data Types & Memory',
            description: 'Core syntax, primitive types, std::cout/std::cin, and stack memory layout.',
            levelNumber: 1,
            levelTitle: 'C++ Fundamentals',
            estimatedMinutes: 25,
            unlockedByDefault: true,
            lessons: [
              {
                id: 'cpp_c1_l1',
                chapterId: 'cpp_c1',
                title: 'The Modern C++ Compilation & Memory Model',
                duration: '15 min',
                summary: 'Understand preprocessor directives, compilation to machine binary, and memory layout.',
                learningObjectives: ['Write clean C++20 standard code', 'Understand std::cout stream operators', 'Manage primitive data types'],
                contentMarkdown: `### The C++ Compilation Model
C++ is a compiled language translated directly into native CPU machine code:
\`\`\`cpp
#include <iostream>

int main() {
    std::cout << "ChulliCode C++ Systems Track" << std::endl;
    return 0;
}
\`\`\``,
                realWorldContext: 'Game engines (Unreal Engine), browsers (Chromium), and high-frequency trading platforms are built in C++.',
                codeExample: `#include <iostream>
int main() {
    int score = 95;
    std::cout << "Score: " << score << std::endl;
    return 0;
}`,
                codeLanguage: 'cpp',
                keyTakeaways: ['C++ compiles to native machine binaries.', 'main() returns an exit status code (0 for success).'],
                interactivePractice: {
                  instructions: 'Write a C++ program that prints "Hello C++".',
                  starterCode: `#include <iostream>\nint main() {\n    std::cout << "Hello C++" << std::endl;\n    return 0;\n}`,
                  solutionCode: `#include <iostream>\nint main() {\n    std::cout << "Hello C++" << std::endl;\n    return 0;\n}`,
                  expectedOutput: 'Hello C++'
                },
                knowledgeCheck: {
                  question: 'What is the standard exit code indicating a C++ program completed successfully?',
                  options: ['0', '1', '-1', 'void'],
                  correctIndex: 0,
                  explanation: 'Returning 0 from main() indicates successful execution to the operating system.'
                },
                challenge: {
                  title: 'Print Variable Size',
                  task: 'Print sizeof(int) and sizeof(double).',
                  hint: 'std::cout << sizeof(int);'
                }
              }
            ]
          },
          {
            id: 'cpp_c2',
            number: 2,
            title: 'Pointers, References & Dynamic Allocation',
            description: 'Direct memory addresses (*), reference aliases (&), and new/delete management.',
            levelNumber: 1,
            levelTitle: 'C++ Fundamentals',
            estimatedMinutes: 30,
            lessons: [
              {
                id: 'cpp_c2_l1',
                chapterId: 'cpp_c2',
                title: 'Pointers vs References',
                duration: '15 min',
                summary: 'Master raw memory addresses and reference binding.',
                learningObjectives: ['Differentiate pointer memory addresses from reference aliases', 'Avoid null pointer dereferences', 'Understand the address-of operator &'],
                contentMarkdown: `### Memory Addressing
\`\`\`cpp
int x = 42;
int* ptr = &x;  // ptr stores memory address of x
int& ref = x;   // ref is an alias to x
\`\`\``,
                realWorldContext: 'Passing large structs by const reference (`const MyData& data`) eliminates expensive deep copies.',
                codeExample: `#include <iostream>
int main() {
    int val = 100;
    int* p = &val;
    std::cout << "Address: " << p << " | Value: " << *p << std::endl;
    return 0;
}`,
                codeLanguage: 'cpp',
                keyTakeaways: ['* dereferences a pointer.', '& gets the memory address of an object.'],
                interactivePractice: {
                  instructions: 'Dereference a pointer to int a = 50 and print its value.',
                  starterCode: `#include <iostream>\nint main() {\n    int a = 50;\n    int* p = &a;\n    std::cout << *p << std::endl;\n    return 0;\n}`,
                  solutionCode: `#include <iostream>\nint main() {\n    int a = 50;\n    int* p = &a;\n    std::cout << *p << std::endl;\n    return 0;\n}`,
                  expectedOutput: '50'
                },
                knowledgeCheck: {
                  question: 'Which operator is used to obtain the memory address of a variable in C++?',
                  options: ['& (Address-of)', '* (Dereference)', '->', '::'],
                  correctIndex: 0,
                  explanation: '& yields the hexadecimal memory location where the variable resides.'
                },
                challenge: {
                  title: 'Swap by Reference',
                  task: 'Write a void swap(int& a, int& b) function that swaps two values.',
                  hint: 'int temp = a; a = b; b = temp;'
                }
              }
            ]
          }
        ]
      },
      {
        levelNumber: 2,
        title: 'Standard Template Library (STL)',
        description: 'Vectors, sets, maps, priority queues, and algorithms (sort, lower_bound).',
        chapters: [
          {
            id: 'cpp_c3',
            number: 3,
            title: 'STL Containers: Vector, Map, and Set',
            description: 'Dynamic arrays (std::vector), red-black trees (std::map), and hash tables (std::unordered_map).',
            levelNumber: 2,
            levelTitle: 'Standard Template Library (STL)',
            estimatedMinutes: 30,
            lessons: [
              {
                id: 'cpp_c3_l1',
                chapterId: 'cpp_c3',
                title: 'High Performance std::vector & std::unordered_map',
                duration: '15 min',
                summary: 'Utilize battle-tested STL data structures for competitive programming and systems.',
                learningObjectives: ['Use std::vector push_back and emplace_back', 'Understand O(1) unordered_map lookups', 'Iterate using range-based for loops'],
                contentMarkdown: `### STL Vectors
\`\`\`cpp
#include <vector>
#include <iostream>

int main() {
    std::vector<int> nums = {1, 2, 3};
    nums.push_back(4);
    for (int n : nums) {
        std::cout << n << " ";
    }
}
\`\`\``,
                realWorldContext: 'Competitive programmers rely on STL vectors and sorting algorithms to solve algorithmic challenges in milliseconds.',
                codeExample: `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v = {40, 10, 30, 20};
    std::sort(v.begin(), v.end());
    for (int x : v) std::cout << x << " ";
    std::cout << std::endl;
    return 0;
}`,
                codeLanguage: 'cpp',
                keyTakeaways: ['std::vector provides dynamic array contiguous memory.', 'std::sort runs in O(N log N) introsort.'],
                interactivePractice: {
                  instructions: 'Sort [3, 1, 2] with std::sort and print the first element.',
                  starterCode: `#include <iostream>\n#include <vector>\n#include <algorithm>\nint main() {\n    std::vector<int> v = {3, 1, 2};\n    std::sort(v.begin(), v.end());\n    std::cout << v[0] << std::endl;\n    return 0;\n}`,
                  solutionCode: `#include <iostream>\n#include <vector>\n#include <algorithm>\nint main() {\n    std::vector<int> v = {3, 1, 2};\n    std::sort(v.begin(), v.end());\n    std::cout << v[0] << std::endl;\n    return 0;\n}`,
                  expectedOutput: '1'
                },
                knowledgeCheck: {
                  question: 'What is the time complexity of std::sort in modern C++ standard library?',
                  options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(log N)'],
                  correctIndex: 0,
                  explanation: 'std::sort is guaranteed to run in O(N log N) using Introsort.'
                },
                challenge: {
                  title: 'Frequency Counter',
                  task: 'Count occurrences of integers using std::unordered_map.',
                  hint: 'freq[x]++;'
                }
              }
            ]
          }
        ]
      }
    ],
    ['Basic algebraic logic'],
    ['Master memory management and pointers', 'Solve competitive programming challenges with STL', 'Write high-performance native code'],
    'cpu',
    'from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30',
    'Systems & Performance',
    '40 Hours'
  ),

  // 3. Java Track
  createTrack(
    'track_java',
    'java',
    'Java',
    'Enterprise Backend Architecture, OOP & Modern JVM Development',
    'Systems & Backend',
    'Enterprise software design, Object-Oriented design patterns, Collections Framework, Streams API, Multithreading, and Spring Boot readiness.',
    [
      {
        levelNumber: 1,
        title: 'Java Fundamentals',
        description: 'JVM architecture, bytecode, primitive types, classes, methods, and packages.',
        chapters: [
          {
            id: 'java_c1',
            number: 1,
            title: 'JVM Architecture and First Program',
            description: 'Write once, run anywhere: JVM, JRE, JDK, bytecode, and standard entry points.',
            levelNumber: 1,
            levelTitle: 'Java Fundamentals',
            estimatedMinutes: 25,
            unlockedByDefault: true,
            lessons: [
              {
                id: 'java_c1_l1',
                chapterId: 'java_c1',
                title: 'The Java Virtual Machine & Class Structure',
                duration: '15 min',
                summary: 'Understand the public static void main entry point and JVM execution.',
                learningObjectives: ['Understand the role of the bytecode verifier and JIT compiler', 'Write properly structured Java classes', 'Print formatted text to standard output'],
                contentMarkdown: `### JVM Architecture
Java code is compiled by \`javac\` into platform-independent \`.class\` bytecode files, executed by the JVM:
\`\`\`java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, ChulliCode Java Developer!");
    }
}
\`\`\``,
                realWorldContext: 'Android operating system runtimes and enterprise banking backends run on Java JVM infrastructure.',
                codeExample: `public class Main {
    public static void main(String[] args) {
        int score = 98;
        System.out.println("Java Enterprise Grade: " + score);
    }
}`,
                codeLanguage: 'java',
                keyTakeaways: ['Every Java application requires a class declaration.', 'public static void main(String[] args) is the mandatory entry point.'],
                interactivePractice: {
                  instructions: 'Write a Java program that prints "Java 21 Ready".',
                  starterCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Java 21 Ready");\n    }\n}`,
                  solutionCode: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Java 21 Ready");\n    }\n}`,
                  expectedOutput: 'Java 21 Ready'
                },
                knowledgeCheck: {
                  question: 'What compiler translates Java source code into bytecode?',
                  options: ['javac', 'gcc', 'javavm', 'jit'],
                  correctIndex: 0,
                  explanation: 'javac is the standard Java compiler that generates .class bytecode files.'
                },
                challenge: {
                  title: 'Primitive Types',
                  task: 'Declare an int, double, and boolean in Java and print their values.',
                  hint: 'int a = 1; double b = 2.5; boolean c = true;'
                }
              }
            ]
          }
        ]
      }
    ],
    ['Basic computer literacy'],
    ['Master robust Object-Oriented software engineering', 'Use Java Collections and Streams API fluently', 'Build production-ready backend systems'],
    'coffee',
    'from-red-600/20 to-amber-600/20 text-red-400 border-red-500/30',
    'Enterprise & JVM',
    '38 Hours'
  ),

  // 4. JavaScript Track
  createTrack(
    'track_javascript',
    'javascript',
    'JavaScript',
    'Modern Full-Stack JavaScript: ES6+, Async/Await & Event Loop',
    'Web & Frontend',
    'Master asynchronous programming, Promises, DOM manipulation, closures, prototypes, Node.js runtime, and modern web application patterns.',
    [
      {
        levelNumber: 1,
        title: 'JavaScript Essentials',
        description: 'Variables (let/const), arrow functions, template literals, and scope.',
        chapters: [
          {
            id: 'js_c1',
            number: 1,
            title: 'Modern ES6+ Syntax and Types',
            description: 'const vs let, destructuring, spread operator (...), and template literals.',
            levelNumber: 1,
            levelTitle: 'JavaScript Essentials',
            estimatedMinutes: 20,
            unlockedByDefault: true,
            lessons: [
              {
                id: 'js_c1_l1',
                chapterId: 'js_c1',
                title: 'ES6 Syntax & Value Semantics',
                duration: '12 min',
                summary: 'Avoid var issues with block-scoped let and const.',
                learningObjectives: ['Understand block scope with let and const', 'Use template literals with ${expression}', 'Destructure arrays and objects'],
                contentMarkdown: `### Block Scoping
\`\`\`javascript
const user = { name: "Alex", role: "Frontend Lead" };
const { name, role } = user; // Object destructuring

console.log(\`Developer \${name} is \${role}\`);
\`\`\``,
                realWorldContext: 'JavaScript powers 98% of all websites and frontend interfaces across the internet.',
                codeExample: `const languages = ["JavaScript", "TypeScript", "Python"];
const [first, ...rest] = languages;
console.log("Primary language:", first);
console.log("Remaining:", rest);`,
                codeLanguage: 'javascript',
                keyTakeaways: ['Always prefer const; use let only for values that will be reassigned.', 'Never use legacy var.'],
                interactivePractice: {
                  instructions: 'Destructure name from {name: "Shakti"} and print it.',
                  starterCode: `const user = { name: "Shakti" };\nconst { name } = user;\nconsole.log(name);`,
                  solutionCode: `const user = { name: "Shakti" };\nconst { name } = user;\nconsole.log(name);`,
                  expectedOutput: 'Shakti'
                },
                knowledgeCheck: {
                  question: 'What is the scope of variables declared with const and let?',
                  options: ['Block scope', 'Function scope', 'Global scope', 'Module scope only'],
                  correctIndex: 0,
                  explanation: 'const and let are bound to the enclosing curly-brace block {}.'
                },
                challenge: {
                  title: 'Array Spread',
                  task: 'Combine two arrays [1, 2] and [3, 4] using the spread operator (...).',
                  hint: '[...a, ...b]'
                }
              }
            ]
          }
        ]
      }
    ],
    ['Basic web browsing experience'],
    ['Master asynchronous async/await and Promises', 'Build dynamic browser interactions', 'Architect modern frontend web apps'],
    'code',
    'from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30',
    'Full-Stack Web',
    '35 Hours'
  ),

  // 5. TypeScript Track
  createTrack(
    'track_typescript',
    'typescript',
    'TypeScript',
    'Type-Safe JavaScript: Generics, Interfaces & Advanced Utility Types',
    'Web & Frontend',
    'Static type systems, strict null checking, interfaces vs type aliases, generics, union narrowing, and building robust large-scale applications.',
    [
      {
        levelNumber: 1,
        title: 'TypeScript Type System',
        description: 'Type annotations, interfaces, type aliases, union types, and type narrowing.',
        chapters: [
          {
            id: 'ts_c1',
            number: 1,
            title: 'Static Typing and Interfaces',
            description: 'Compile-time type verification, interfaces, and optional properties.',
            levelNumber: 1,
            levelTitle: 'TypeScript Type System',
            estimatedMinutes: 25,
            unlockedByDefault: true,
            lessons: [
              {
                id: 'ts_c1_l1',
                chapterId: 'ts_c1',
                title: 'Interfaces, Contracts & Strict Null Checking',
                duration: '15 min',
                summary: 'Eliminate runtime null pointer exceptions with compile-time type verification.',
                learningObjectives: ['Define structural interfaces', 'Use optional properties ? and readonly', 'Configure strict type checking'],
                contentMarkdown: `### Structural Typing
TypeScript uses **structural typing** (duck typing checked at compile time):
\`\`\`typescript
interface UserProfile {
    id: string;
    email: string;
    displayName?: string; // Optional
}

const user: UserProfile = {
    id: "usr_101",
    email: "alex@chullicode.dev"
};
\`\`\``,
                realWorldContext: 'Google, Microsoft, and Airbnb mandate TypeScript for all web frontend and Node.js codebases.',
                codeExample: `interface Developer {
    name: string;
    xp: number;
    skills: string[];
}

const dev: Developer = {
    name: "Alex",
    xp: 1250,
    skills: ["TypeScript", "React", "Node"]
};

console.log("Developer:", dev.name, "| XP:", dev.xp);`,
                codeLanguage: 'typescript',
                keyTakeaways: ['TypeScript code compiles to clean standard JavaScript.', 'Interfaces define explicit shape contracts for objects.'],
                interactivePractice: {
                  instructions: 'Define an interface Box with width: number and instantiate it.',
                  starterCode: `interface Box { width: number; }\nconst b: Box = { width: 10 };\nconsole.log(b.width);`,
                  solutionCode: `interface Box { width: number; }\nconst b: Box = { width: 10 };\nconsole.log(b.width);`,
                  expectedOutput: '10'
                },
                knowledgeCheck: {
                  question: 'What happens to TypeScript type annotations during compilation to JavaScript?',
                  options: [
                    'They are completely erased (type erasure)',
                    'They are translated to runtime if-checks',
                    'They become comments',
                    'They are stored in a schema file'
                  ],
                  correctIndex: 0,
                  explanation: 'TypeScript types exist purely at compile-time and are completely erased in the generated JavaScript.'
                },
                challenge: {
                  title: 'Generic Identity',
                  task: 'Write a generic function identity<T>(arg: T): T that returns its input.',
                  hint: 'function identity<T>(arg: T): T { return arg; }'
                }
              }
            ]
          }
        ]
      }
    ],
    ['Solid JavaScript fundamentals'],
    ['Master generic types and union narrowing', 'Enforce strict compile-time contracts', 'Build type-safe full-stack codebases'],
    'shield',
    'from-blue-600/20 to-cyan-600/20 text-blue-400 border-blue-500/30',
    'Type Safety',
    '32 Hours'
  ),

  // 6. SQL Track
  createTrack(
    'track_sql',
    'sql',
    'SQL',
    'Relational Database Mastery: Queries, Joins, Window Functions & Indexing',
    'Database',
    'Relational database architecture, complex multi-table joins, aggregations, subqueries, Common Table Expressions (CTEs), transactions, and query optimization.',
    [
      {
        levelNumber: 1,
        title: 'SQL Fundamentals',
        description: 'SELECT, WHERE filtering, ORDER BY sorting, and aggregate functions (COUNT, SUM, AVG).',
        chapters: [
          {
            id: 'sql_c1',
            number: 1,
            title: 'Data Querying & Filtering',
            description: 'Extracting records, logical filtering with AND/OR/IN/BETWEEN, and sorting.',
            levelNumber: 1,
            levelTitle: 'SQL Fundamentals',
            estimatedMinutes: 20,
            unlockedByDefault: true,
            lessons: [
              {
                id: 'sql_c1_l1',
                chapterId: 'sql_c1',
                title: 'The Relational Model & Declarative Queries',
                duration: '12 min',
                summary: 'SQL is declarative: you describe what data you want, and the database query planner determines how to retrieve it.',
                learningObjectives: ['Write SELECT queries with WHERE filters', 'Sort results with ORDER BY and LIMIT', 'Use aggregate functions like COUNT and AVG'],
                contentMarkdown: `### The Declarative Query
\`\`\`sql
SELECT title, language, likes
FROM snippets
WHERE likes > 10
ORDER BY likes DESC
LIMIT 5;
\`\`\``,
                realWorldContext: 'PostgreSQL, MySQL, SQLite, and Snowflake manage the relational data of virtually all global digital commerce.',
                codeExample: `SELECT name, role, salary
FROM employees
WHERE department = 'Engineering'
ORDER BY salary DESC;`,
                codeLanguage: 'sql',
                keyTakeaways: ['SQL queries are declarative.', 'WHERE filters rows before aggregation; HAVING filters rows after aggregation.'],
                interactivePractice: {
                  instructions: 'Write a SELECT query to select title and author from snippets ordered by likes desc.',
                  starterCode: `SELECT title, author FROM snippets ORDER BY likes DESC;`,
                  solutionCode: `SELECT title, author FROM snippets ORDER BY likes DESC;`
                },
                knowledgeCheck: {
                  question: 'Which clause is used to filter grouped aggregated results in SQL?',
                  options: ['HAVING', 'WHERE', 'GROUP BY', 'FILTER'],
                  correctIndex: 0,
                  explanation: 'WHERE filters individual table rows before grouping; HAVING filters the aggregated summary groups.'
                },
                challenge: {
                  title: 'Top 3 Performers',
                  task: 'Write a query to get top 3 highest scoring students using ORDER BY and LIMIT.',
                  hint: 'ORDER BY score DESC LIMIT 3'
                }
              }
            ]
          }
        ]
      }
    ],
    ['Basic tabular data comprehension'],
    ['Write complex multi-table JOINs and subqueries', 'Use Window Functions (ROW_NUMBER, RANK) like a pro', 'Design normalized relational database schemas'],
    'database',
    'from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/30',
    'Data & Persistence',
    '28 Hours'
  ),

  // 7. C Track
  createTrack(
    'track_c',
    'c',
    'C',
    'Low-Level Systems Programming, Pointer Arithmetic & Operating System Primitives',
    'Systems & Backend',
    'The foundation of modern computing: manual heap allocation (malloc/free), bit manipulation, hardware interfacing, and systems architecture.',
    [
      {
        levelNumber: 1,
        title: 'C Language Fundamentals',
        description: 'Syntax, pointers, structs, arrays, and standard input/output with stdio.h.',
        chapters: [
          {
            id: 'c_c1',
            number: 1,
            title: 'Syntax, Memory & Pointers in C',
            description: 'Direct memory access, printf formatting, and pointer arithmetic.',
            levelNumber: 1,
            levelTitle: 'C Language Fundamentals',
            estimatedMinutes: 25,
            unlockedByDefault: true,
            lessons: [
              {
                id: 'c_c1_l1',
                chapterId: 'c_c1',
                title: 'The Foundation of Computing',
                duration: '15 min',
                summary: 'Write low-level code without a runtime interpreter or garbage collector.',
                learningObjectives: ['Understand stack and heap memory layout in C', 'Use pointers and address arithmetic', 'Manage memory manually with malloc and free'],
                contentMarkdown: `### Direct Hardware Execution
C gives you direct access to computer memory:
\`\`\`c
#include <stdio.h>

int main() {
    int x = 42;
    int *ptr = &x;
    printf("Value: %d | Memory Address: %p\\n", *ptr, (void*)ptr);
    return 0;
}
\`\`\``,
                realWorldContext: 'The Linux kernel, Git, Redis, and Python itself (CPython) are all written in C.',
                codeExample: `#include <stdio.h>

int main() {
    int numbers[] = {10, 20, 30};
    printf("First: %d\\n", *(numbers + 0));
    printf("Second: %d\\n", *(numbers + 1));
    return 0;
}`,
                codeLanguage: 'c',
                keyTakeaways: ['C has no garbage collector; every malloc must have a corresponding free.', 'Arrays decay to pointers to their first element.'],
                interactivePractice: {
                  instructions: 'Write a C program that prints "C Language Power".',
                  starterCode: `#include <stdio.h>\nint main() {\n    printf("C Language Power\\n");\n    return 0;\n}`,
                  solutionCode: `#include <stdio.h>\nint main() {\n    printf("C Language Power\\n");\n    return 0;\n}`,
                  expectedOutput: 'C Language Power'
                },
                knowledgeCheck: {
                  question: 'Which function allocates raw bytes on the heap in standard C?',
                  options: ['malloc()', 'allocate()', 'new', 'heap_create()'],
                  correctIndex: 0,
                  explanation: 'malloc(size_t size) allocates uninitialized bytes on the process heap.'
                },
                challenge: {
                  title: 'String Length Counter',
                  task: 'Compute the length of a string without using strlen().',
                  hint: 'Iterate until *str == \'\\0\'.'
                }
              }
            ]
          }
        ]
      }
    ],
    ['Basic algebra and computer concepts'],
    ['Master pointers and manual memory allocation', 'Understand operating systems and CPU memory architecture', 'Build lightweight embedded and systems utilities'],
    'cpu',
    'from-slate-600/20 to-zinc-600/20 text-slate-300 border-slate-500/30',
    'Systems & OS',
    '36 Hours'
  ),

  // 8. C# Track
  createTrack(
    'track_csharp',
    'csharp',
    'C#',
    'Enterprise .NET, Clean OOP, LINQ & Async Systems',
    'Systems & Backend',
    'Modern C# 12, .NET runtime, LINQ query expressions, asynchronous Tasks, dependency injection, and scalable microservices.',
    [
      {
        levelNumber: 1,
        title: 'C# Fundamentals',
        description: 'Syntax, classes, properties, LINQ, and asynchronous programming in .NET.',
        chapters: [
          {
            id: 'cs_c1',
            number: 1,
            title: 'Syntax, Classes and Properties',
            description: 'C# class structure, auto-implemented properties, and modern expressions.',
            levelNumber: 1,
            levelTitle: 'C# Fundamentals',
            estimatedMinutes: 25,
            unlockedByDefault: true,
            lessons: [
              {
                id: 'cs_c1_l1',
                chapterId: 'cs_c1',
                title: 'The .NET Common Language Runtime (CLR)',
                duration: '15 min',
                summary: 'Write type-safe enterprise code targeting the cross-platform .NET runtime.',
                learningObjectives: ['Understand C# auto-properties get; set;', 'Use modern top-level statements', 'Leverage LINQ for declarative querying'],
                contentMarkdown: `### Modern C# Top-Level Statements
\`\`\`csharp
using System;

Console.WriteLine("Welcome to ChulliCode .NET Track!");

public record Developer(string Name, int Level);
\`\`\``,
                realWorldContext: 'Enterprise cloud services, Unity game development, and high-scale corporate APIs run on C# and .NET.',
                codeExample: `using System;
using System.Linq;

int[] scores = { 85, 92, 78, 95, 60 };
var honorRoll = scores.Where(s => s >= 90).ToList();

Console.WriteLine($"Honor roll count: {honorRoll.Count}");`,
                codeLanguage: 'csharp',
                keyTakeaways: ['C# combines strong typing with developer ergonomics.', 'LINQ brings SQL-like query elegance into native collections.'],
                interactivePractice: {
                  instructions: 'Write a C# program that outputs "C# .NET Active".',
                  starterCode: `using System;\nConsole.WriteLine("C# .NET Active");`,
                  solutionCode: `using System;\nConsole.WriteLine("C# .NET Active");`,
                  expectedOutput: 'C# .NET Active'
                },
                knowledgeCheck: {
                  question: 'What does LINQ stand for in C#?',
                  options: ['Language Integrated Query', 'Logical Interface Network Queue', 'List Index Number Query', 'Local Iteration Net Query'],
                  correctIndex: 0,
                  explanation: 'LINQ stands for Language Integrated Query, providing declarative filtering over collections.'
                },
                challenge: {
                  title: 'LINQ Average',
                  task: 'Compute the average of an array of integers using LINQ .Average().',
                  hint: 'scores.Average()'
                }
              }
            ]
          }
        ]
      }
    ],
    ['Basic programming exposure'],
    ['Master modern C# features and records', 'Write declarative data pipelines with LINQ', 'Build scalable .NET backend APIs and services'],
    'layers',
    'from-purple-600/20 to-violet-600/20 text-purple-400 border-purple-500/30',
    'Enterprise & Games',
    '35 Hours'
  ),

  // 9. HTML and CSS Track
  createTrack(
    'track_html_css',
    'html_css',
    'HTML & CSS',
    'Modern Responsive Web Layouts, Flexbox, CSS Grid & Accessible Semantic HTML',
    'Web & Frontend',
    'Master semantic HTML5 tags, accessibility (WCAG), CSS Box Model, Flexbox layout, CSS Grid 2D architecture, responsive media queries, and clean styling.',
    [
      {
        levelNumber: 1,
        title: 'HTML & CSS Fundamentals',
        description: 'Semantic tags, document structure, selectors, box model, and responsive flex layouts.',
        chapters: [
          {
            id: 'html_c1',
            number: 1,
            title: 'Semantic HTML & The CSS Box Model',
            description: 'Building accessible, accessible document structure and understanding margins, borders, padding, and content.',
            levelNumber: 1,
            levelTitle: 'HTML & CSS Fundamentals',
            estimatedMinutes: 20,
            unlockedByDefault: true,
            lessons: [
              {
                id: 'html_c1_l1',
                chapterId: 'html_c1',
                title: 'Semantic Web Architecture & Box Model',
                duration: '12 min',
                summary: 'Design accessible websites using meaningful semantic tags and accurate margin/padding spacing.',
                learningObjectives: ['Use semantic tags (<header>, <main>, <nav>, <article>, <footer>)', 'Master content-box vs border-box sizing', 'Apply clean responsive styles'],
                contentMarkdown: `### The CSS Box Model
Every element in a browser consists of:
1. **Content:** The text or image itself.
2. **Padding:** Clear area around content inside the border.
3. **Border:** Outline surrounding padding and content.
4. **Margin:** Clear space outside the border separating neighboring elements.

\`\`\`css
* {
    box-sizing: border-box; /* Includes padding and border in element total width! */
}
\`\`\``,
                realWorldContext: 'Search engine optimization (SEO) and screen readers for visually impaired users rely on clean semantic HTML.',
                codeExample: `<!DOCTYPE html>
<html>
<head>
  <style>
    .card {
      padding: 16px;
      border: 1px solid #3b82f6;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h3>ChulliCode UI Card</h3>
  </div>
</body>
</html>`,
                codeLanguage: 'html_css',
                keyTakeaways: ['Always set box-sizing: border-box for predictable layouts.', 'Use semantic HTML elements instead of generic div soup.'],
                interactivePractice: {
                  instructions: 'Write an HTML snippet with a <h1> tag containing "ChulliCode".',
                  starterCode: `<h1>ChulliCode</h1>`,
                  solutionCode: `<h1>ChulliCode</h1>`,
                  expectedOutput: '<h1>ChulliCode</h1>'
                },
                knowledgeCheck: {
                  question: 'Which CSS property ensures padding and border are included in an element total width?',
                  options: ['box-sizing: border-box', 'box-sizing: content-box', 'display: flex', 'overflow: hidden'],
                  correctIndex: 0,
                  explanation: 'box-sizing: border-box prevents elements from expanding beyond their defined width when padding is added.'
                },
                challenge: {
                  title: 'Centered Flexbox',
                  task: 'Center an item horizontally and vertically using display: flex; justify-content: center; align-items: center.',
                  hint: 'Apply flex centering properties to the parent.'
                }
              }
            ]
          }
        ]
      }
    ],
    ['No prerequisites'],
    ['Master modern CSS Flexbox and CSS Grid layouts', 'Design fully responsive mobile-first web pages', 'Build accessible, semantic, and beautiful web interfaces'],
    'layout',
    'from-orange-500/20 to-rose-500/20 text-orange-400 border-orange-500/30',
    'Responsive Design',
    '25 Hours'
  ),

  // 10. PHP Track
  createTrack(
    'track_php',
    'php',
    'PHP',
    'Modern Web Development with PHP 8.x, PDO Database Access & MVC Architecture',
    'Systems & Backend',
    'PHP 8+ features, type safety, server-side form validation, database connectivity with PDO, secure authentication, and modern web application structure.',
    [
      {
        levelNumber: 1,
        title: 'Modern PHP Fundamentals',
        description: 'PHP 8 syntax, arrays, functions, PDO prepared statements, and secure web programming.',
        chapters: [
          {
            id: 'php_c1',
            number: 1,
            title: 'Modern PHP 8 Syntax and Types',
            description: 'Scalar type declarations, match expressions, nullsafe operator, and arrays.',
            levelNumber: 1,
            levelTitle: 'Modern PHP Fundamentals',
            estimatedMinutes: 20,
            unlockedByDefault: true,
            lessons: [
              {
                id: 'php_c1_l1',
                chapterId: 'php_c1',
                title: 'The Modern PHP 8 Runtime & Match Expressions',
                duration: '12 min',
                summary: 'Explore strict typing, arrow functions, and modern PHP features.',
                learningObjectives: ['Use strict types declare(strict_types=1)', 'Write clean match expressions', 'Prevent SQL injection using PDO prepared statements'],
                contentMarkdown: `### Modern PHP 8 match Expression
\`\`\`php
<?php
declare(strict_types=1);

$status = 200;
$message = match ($status) {
    200, 201 => 'Success',
    400 => 'Bad Request',
    404 => 'Not Found',
    default => 'Internal Error'
};

echo "HTTP Status: " . $message;
\`\`\``,
                realWorldContext: 'WordPress, Wikipedia, and Laravel power over 75% of server-rendered websites using modern PHP.',
                codeExample: `<?php
$frameworks = ["Laravel", "Symfony", "WordPress"];
foreach ($frameworks as $fw) {
    echo "Framework: {$fw}\n";
}`,
                codeLanguage: 'php',
                keyTakeaways: ['PHP 8 match expressions use strict equality (===) and return values directly.', 'Always use PDO prepared statements to query relational databases.'],
                interactivePractice: {
                  instructions: 'Write a PHP script that prints "PHP 8 Active".',
                  starterCode: `<?php\necho "PHP 8 Active";`,
                  solutionCode: `<?php\necho "PHP 8 Active";`,
                  expectedOutput: 'PHP 8 Active'
                },
                knowledgeCheck: {
                  question: 'What is the primary security advantage of using PDO prepared statements in PHP?',
                  options: [
                    'They separate SQL query code from user data, eliminating SQL injection vulnerabilities',
                    'They encrypt server RAM',
                    'They bypass Apache server headers',
                    'They execute in native C threads'
                  ],
                  correctIndex: 0,
                  explanation: 'Prepared statements send query structure and parameters separately to the database engine, making SQL injection impossible.'
                },
                challenge: {
                  title: 'Nullsafe Operator',
                  task: 'Use the nullsafe operator ?-> to call a method safely on a nullable object.',
                  hint: '$user?->getProfile()'
                }
              }
            ]
          }
        ]
      }
    ],
    ['Basic web principles'],
    ['Write clean, modern, and type-safe PHP 8 code', 'Execute secure database queries with PDO prepared statements', 'Understand MVC server-side web application architectures'],
    'server',
    'from-indigo-600/20 to-blue-600/20 text-indigo-400 border-indigo-500/30',
    'Server & Backend',
    '30 Hours'
  )
];
