import { CourseTrack, Language } from '../types';
import { LANGUAGE_QUIZZES } from './quizzes';

export const COURSES: CourseTrack[] = [
  {
    id: 'course_python',
    language: 'python',
    title: 'Python Mastery from Scratch',
    tagline: 'Master Python 3 from basics to advanced data structures, OOP & clean code.',
    level: 'Beginner',
    description: 'Learn modern Python with step-by-step interactive lessons. Discover variables, list comprehensions, functional lambda patterns, object-oriented programming, and file operations with live running examples.',
    iconName: 'python',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    modules: [
      {
        id: 'py_mod_1',
        title: 'Module 1: Syntax, Variables & Types',
        description: 'Understand Python dynamic typing, numeric operations, and string formatting.',
        lessons: [
          {
            id: 'py_l1',
            title: '1. Python Fundamentals & Dynamic Typing',
            duration: '10 min',
            summary: 'Learn how Python assigns types dynamically, performs arithmetic, and formats text with f-strings.',
            contentMarkdown: `### Welcome to Python!

Python is a high-level, interpreted programming language celebrated for its clear syntax and developer productivity.

#### Variables & Types
In Python, you do not declare variable types explicitly. The interpreter infers types at runtime:

\`\`\`python
# Numbers
age = 25              # int
pi = 3.14159          # float

# Strings & Booleans
name = "CodeSelf"     # str
is_active = True      # bool
\`\`\`

#### Modern f-string Interpolation
Introduced in Python 3.6, **f-strings** are the cleanest, fastest way to format text:

\`\`\`python
user = "Shakti"
score = 98
print(f"Developer {user} scored {score}% on the algorithm test!")
\`\`\`

#### Type Checking & Casting
You can check types with \`type()\` and cast values using \`int()\`, \`str()\`, and \`float()\`.`,
            codeExample: `# Python Basics Demonstration
name = "Alex"
age = 22
gpa = 3.85
is_graduated = False

print(f"Student: {name}, Age: {age}")
print(f"GPA: {gpa} | Graduated: {is_graduated}")

# Basic arithmetic
square = age ** 2
print(f"Age squared: {square}")`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Python is dynamically and strongly typed.',
              'f-strings provide formatted output with {expression} interpolation.',
              'No semicolons or braces needed for basic statements.'
            ],
            practiceQuestion: {
              question: 'Which syntax correctly formats variable `count` into the string "Total: 10"?',
              options: ['f"Total: {count}"', '"Total: " + count', '"Total: $count"', 'format("Total: %d", count)'],
              correctIndex: 0,
              explanation: 'f-strings with `f"..."` evaluate expressions inside `{}`.'
            }
          },
          {
            id: 'py_l2',
            title: '2. Lists, Tuples & Slicing Magic',
            duration: '15 min',
            summary: 'Deep dive into mutable lists, immutable tuples, and powerful slicing patterns.',
            contentMarkdown: `### Python Sequences: Lists & Tuples

Sequences are ordered collections of items.

#### Lists (Mutable)
Lists are dynamic arrays that can hold any data type:

\`\`\`python
items = ["apple", "banana", "cherry"]
items.append("date")          # Add to end
items.insert(0, "avocado")    # Insert at index 0
items.pop()                   # Remove last item
\`\`\`

#### Slicing Patterns (\`[start:stop:step]\`)
Python slicing is expressive:
- \`items[1:3]\`: elements from index 1 up to (excluding) 3.
- \`items[:2]\`: first 2 elements.
- \`items[::2]\`: every second element.
- \`items[::-1]\`: reverse the entire sequence!`,
            codeExample: `# Sequence Slicing Demo
numbers = [10, 20, 30, 40, 50, 60]

print("First three:", numbers[:3])
print("Middle two:", numbers[2:4])
print("Every second item:", numbers[::2])
print("Reversed list:", numbers[::-1])`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Lists are mutable; tuples are immutable.',
              'Slicing uses [start:stop:step] with 0-based indexing.',
              'Negative step [::-1] reverses sequences in-place in O(N) time.'
            ],
            practiceQuestion: {
              question: 'What does `[1, 2, 3, 4, 5][1:4]` produce?',
              options: ['[2, 3, 4]', '[1, 2, 3]', '[2, 3, 4, 5]', '[1, 4]'],
              correctIndex: 0,
              explanation: 'Index 1 is 2, index 2 is 3, index 3 is 4. Stop index 4 is excluded.'
            }
          }
        ]
      },
      {
        id: 'py_mod_2',
        title: 'Module 2: Control Flow & Comprehensions',
        description: 'Conditionals, for/while loops, and idiomatic Python comprehensions.',
        lessons: [
          {
            id: 'py_l3',
            title: '3. List, Dict & Set Comprehensions',
            duration: '15 min',
            summary: 'Write elegant, idiomatic, high-performance one-liner transformations in Python.',
            contentMarkdown: `### Python Comprehensions

Comprehensions replace verbose \`for\` loops with clean, readable declarations.

#### Syntax
\`\`\`python
[expression for item in iterable if condition]
\`\`\`

#### Real-world Examples:
\`\`\`python
# Filtering and squaring numbers
numbers = range(1, 11)
even_squares = [x**2 for x in numbers if x % 2 == 0]

# Dictionary Comprehension
words = ["python", "code", "self"]
word_lengths = {w: len(w) for w in words}
\`\`\``,
            codeExample: `# Comprehensions in Action
grades = {'Alice': 88, 'Bob': 95, 'Charlie': 70, 'Diana': 92}

# Filter honors students (grade >= 90)
honors = {student: grade for student, grade in grades.items() if grade >= 90}
print("Honors Students:", honors)

# List comprehension with transformation
shout_names = [name.upper() for name in grades.keys()]
print("Uppercase Names:", shout_names)`,
            codeLanguage: 'python',
            keyTakeaways: [
              'Comprehensions are faster than manual .append() loops in Python.',
              'Dict comprehensions map keys to values using {k: v for ...}.',
              'Keep comprehensions readable; avoid nesting more than 2 loops.'
            ],
            practiceQuestion: {
              question: 'Which comprehension filters strings longer than 3 characters?',
              options: [
                '[w for w in words if len(w) > 3]',
                '[w if len(w) > 3 for w in words]',
                '{w for len(w) > 3 in words}',
                'filter(w > 3, words)'
              ],
              correctIndex: 0,
              explanation: 'The `if condition` goes at the end of the comprehension.'
            }
          }
        ]
      },
      {
        id: 'py_mod_3',
        title: 'Module 3: Object-Oriented Programming (OOP)',
        description: 'Classes, constructors (__init__), encapsulation, and inheritance.',
        lessons: [
          {
            id: 'py_l4',
            title: '4. Classes, Inheritance & Polymorphism',
            duration: '20 min',
            summary: 'Structure real-world software using clean object-oriented architecture in Python.',
            contentMarkdown: `### Object-Oriented Programming in Python

Python is thoroughly object-oriented—everything in Python is an object, including numbers, functions, and modules!

#### Defining a Class
\`\`\`python
class BankAccount:
    def __init__(self, owner: str, balance: float = 0.0):
        self.owner = owner
        self._balance = balance    # Protected attribute convention

    def deposit(self, amount: float):
        if amount > 0:
            self._balance += amount
            return True
        return False

    @property
    def balance(self):
        return self._balance
\`\`\`

#### Inheritance & super()
Subclasses inherit attributes and methods from parent classes:
\`\`\`python
class SavingsAccount(BankAccount):
    def __init__(self, owner: str, balance: float, interest_rate: float):
        super().__init__(owner, balance)
        self.interest_rate = interest_rate
\`\`\``,
            codeExample: `class Developer:
    def __init__(self, name: str, primary_lang: str):
        self.name = name
        self.primary_lang = primary_lang
        self.xp = 0

    def solve_challenge(self, points: int):
        self.xp += points
        return f"{self.name} earned +{points} XP! Total XP: {self.xp}"

# Instantiate
dev = Developer("Shakti", "Python")
print(dev.solve_challenge(50))
print(dev.solve_challenge(100))`,
            codeLanguage: 'python',
            keyTakeaways: [
              '__init__ is the constructor method in Python.',
              'self refers to the current instance of the class.',
              'super() calls methods on the parent class in the MRO.'
            ],
            practiceQuestion: {
              question: 'What does the `self` parameter represent in Python class methods?',
              options: [
                'The specific instance of the object calling the method.',
                'The global Python module.',
                'A static class reference.',
                'A pointer to system memory.'
              ],
              correctIndex: 0,
              explanation: '`self` explicitly represents the instance being manipulated by the method.'
            }
          }
        ]
      }
    ],
    quiz: LANGUAGE_QUIZZES.python
  },

  {
    id: 'course_sql',
    language: 'sql',
    title: 'Relational Database & SQL Engineering',
    tagline: 'Master queries, table design, joins, aggregations, subqueries & relational schema.',
    level: 'Beginner',
    description: 'Learn SQL from zero to production queries. Write lightning-fast SELECT queries, join multi-table databases, group data with aggregations, and understand database indexing.',
    iconName: 'sql',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    modules: [
      {
        id: 'sql_mod_1',
        title: 'Module 1: Querying, Filtering & Sorting',
        description: 'SELECT, WHERE clauses, operators, pattern matching, and sorting.',
        lessons: [
          {
            id: 'sql_l1',
            title: '1. SELECT, WHERE & Logical Operators',
            duration: '10 min',
            summary: 'Learn how to retrieve and filter rows from relational tables with precision.',
            contentMarkdown: `### The Power of SQL

SQL (Structured Query Language) is the standard declarative language for relational database management systems like PostgreSQL, MySQL, and SQLite.

#### The Core SELECT Statement
\`\`\`sql
SELECT column1, column2 FROM table_name;
\`\`\`

#### Filtering Rows with WHERE
You can filter data using comparison operators (\`=\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`) and logical operators (\`AND\`, \`OR\`, \`NOT\`):

\`\`\`sql
SELECT name, salary
FROM employees
WHERE department = 'Engineering' AND salary >= 75000;
\`\`\`

#### Sorting with ORDER BY
\`\`\`sql
SELECT title, views
FROM snippets
ORDER BY views DESC, title ASC;
\`\`\``,
            codeExample: `-- SQL Querying Demo
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT,
    price REAL
);

INSERT INTO products VALUES 
(1, 'Mechanical Keyboard', 'Hardware', 89.99),
(2, 'Noise Cancelling Headphones', 'Audio', 199.50),
(3, 'USB-C Dock', 'Hardware', 45.00),
(4, 'Studio Microphone', 'Audio', 129.00);

-- Query expensive hardware products
SELECT name, price
FROM products
WHERE category = 'Hardware' AND price > 50.00
ORDER BY price DESC;`,
            codeLanguage: 'sql',
            keyTakeaways: [
              'SQL is declarative: you describe what data you want, not how to loop over it.',
              'WHERE filters rows before grouping or projection.',
              'ORDER BY defaults to ASC (ascending); specify DESC for highest-to-lowest.'
            ],
            practiceQuestion: {
              question: 'Which clause sorts query results in descending order?',
              options: ['ORDER BY column DESC', 'SORT BY column DOWN', 'GROUP BY column DESC', 'WHERE column DESC'],
              correctIndex: 0,
              explanation: '`ORDER BY ... DESC` sorts records from greatest to smallest.'
            }
          }
        ]
      },
      {
        id: 'sql_mod_2',
        title: 'Module 2: Table Joins (INNER, LEFT, RIGHT)',
        description: 'Connecting related data across multiple relational tables.',
        lessons: [
          {
            id: 'sql_l2',
            title: '2. Multi-table Relational Joins',
            duration: '18 min',
            summary: 'Connect users to snippets, orders to customers, and departments to employees.',
            contentMarkdown: `### Understanding SQL Joins

Relational databases normalize data into separate tables to eliminate redundancy. **Joins** connect these tables at query time.

#### 1. INNER JOIN
Returns only records where there is a match in **both** tables:
\`\`\`sql
SELECT users.name, snippets.title
FROM users
INNER JOIN snippets ON users.id = snippets.user_id;
\`\`\`

#### 2. LEFT OUTER JOIN
Returns all records from the left table, and matched records from the right table (unmatched columns are \`NULL\`):
\`\`\`sql
SELECT users.name, COUNT(snippets.id) as snippet_count
FROM users
LEFT JOIN snippets ON users.id = snippets.user_id
GROUP BY users.id;
\`\`\``,
            codeExample: `-- Multi-Table Join Demonstration
CREATE TABLE authors (
    id INTEGER PRIMARY KEY,
    name TEXT
);

CREATE TABLE articles (
    id INTEGER PRIMARY KEY,
    author_id INTEGER,
    title TEXT
);

INSERT INTO authors VALUES (1, 'Ada Lovelace'), (2, 'Alan Turing'), (3, 'Grace Hopper');
INSERT INTO articles VALUES (101, 1, 'First Algorithm'), (102, 1, 'Analytical Engine'), (103, 2, 'Turing Machines');

-- Left join to include authors even without articles
SELECT authors.name, articles.title
FROM authors
LEFT JOIN articles ON authors.id = articles.author_id;`,
            codeLanguage: 'sql',
            keyTakeaways: [
              'INNER JOIN only keeps matched rows.',
              'LEFT JOIN retains all left rows, filling missing right data with NULL.',
              'Join conditions are defined using ON tableA.col = tableB.col.'
            ],
            practiceQuestion: {
              question: 'What appears in right-table columns when a LEFT JOIN finds no match?',
              options: ['NULL', '0', 'Empty string', 'The query fails'],
              correctIndex: 0,
              explanation: 'Unmatched right columns are populated with NULL values.'
            }
          }
        ]
      }
    ],
    quiz: LANGUAGE_QUIZZES.sql
  },

  {
    id: 'course_cpp',
    language: 'cpp',
    title: 'Modern C++ & Systems Programming',
    tagline: 'High-performance computing, pointers, memory, references, and the STL.',
    level: 'Intermediate',
    description: 'Learn modern C++ systems engineering. Master pointers, references, memory allocation, RAII, STL vectors and maps, templates, and performance optimization.',
    iconName: 'cpp',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    modules: [
      {
        id: 'cpp_mod_1',
        title: 'Module 1: Pointers, Memory & References',
        description: 'Direct memory addressing, dereferencing, and reference aliases.',
        lessons: [
          {
            id: 'cpp_l1',
            title: '1. Pointers vs References Explained',
            duration: '15 min',
            summary: 'Master raw memory addresses, the & and * operators, and how references prevent null errors.',
            contentMarkdown: `### Pointers & References in C++

C++ gives you direct control over hardware memory.

#### Pointers (\`T*\`)
A pointer is a variable that stores the memory address of another variable:
\`\`\`cpp
int x = 42;
int* ptr = &x;     // & = address-of operator
*ptr = 100;        // * = dereference operator (modifies x!)
\`\`\`

#### References (\`T&\`)
A reference is an immutable alias to an already-existing object:
\`\`\`cpp
int a = 10;
int& ref = a;      // ref IS a!
ref = 20;          // a is now 20!
\`\`\`

#### Pass by Const Reference
\`\`\`cpp
void printData(const std::string& hugeText) {
    // Zero copying overhead, read-only safety!
    std::cout << hugeText << std::endl;
}
\`\`\``,
            codeExample: `#include <iostream>

void swapNumbers(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}

int main() {
    int x = 10;
    int y = 99;
    std::cout << "Before swap: x=" << x << ", y=" << y << std::endl;
    swapNumbers(x, y);
    std::cout << "After swap:  x=" << x << ", y=" << y << std::endl;
    return 0;
}`,
            codeLanguage: 'cpp',
            keyTakeaways: [
              'Pointers hold memory addresses and can be nullptr or reassigned.',
              'References must be initialized and cannot be reseated.',
              'Passing large objects by const T& prevents costly copies.'
            ],
            practiceQuestion: {
              question: 'Which operator retrieves the memory address of a variable in C++?',
              options: ['&', '*', '->', '::'],
              correctIndex: 0,
              explanation: 'The `&` (address-of) operator yields the pointer to that variable.'
            }
          }
        ]
      }
    ],
    quiz: LANGUAGE_QUIZZES.cpp
  },

  {
    id: 'course_java',
    language: 'java',
    title: 'Java Enterprise & Core Architecture',
    tagline: 'Enterprise OOP, JVM mechanics, Collections framework, and robust APIs.',
    level: 'Intermediate',
    description: 'Learn modern Java development. Master classes, interfaces, abstract types, the Collections framework (HashMap, ArrayList), and exception handling.',
    iconName: 'java',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    modules: [
      {
        id: 'java_mod_1',
        title: 'Module 1: Core OOP & Java Collections',
        description: 'Class hierarchies, interfaces, and high-performance collection data structures.',
        lessons: [
          {
            id: 'java_l1',
            title: '1. OOP Principles & The Collections Framework',
            duration: '15 min',
            summary: 'Learn ArrayList, HashMap, interface contracts, and equals/hashCode correctness.',
            contentMarkdown: `### Welcome to Java!

Java is a strongly typed, object-oriented language that compiles to bytecode executed on the Java Virtual Machine (JVM).

#### Core Collections:
- **\`ArrayList<T>\`**: Dynamic resizable array with O(1) random access.
- **\`HashMap<K, V>\`**: Key-value hash table providing average O(1) lookups.
- **\`HashSet<T>\`**: Set of unique elements backed by a hash map.

\`\`\`java
Map<String, Integer> scores = new HashMap<>();
scores.put("Shakti", 100);
scores.put("Alex", 95);

if (scores.containsKey("Shakti")) {
    System.out.println("Score: " + scores.get("Shakti"));
}
\`\`\``,
            codeExample: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> languages = new ArrayList<>(Arrays.asList("Java", "Python", "C++", "SQL"));
        languages.add("JavaScript");

        System.out.println("Languages to learn: " + languages.size());
        for (String lang : languages) {
            System.out.println("-> " + lang);
        }
    }
}`,
            codeLanguage: 'java',
            keyTakeaways: [
              'Java compiles to JVM bytecode ("Write Once, Run Anywhere").',
              'HashMap provides O(1) key lookups; ArrayList provides O(1) index access.',
              'String instances are immutable in Java.'
            ],
            practiceQuestion: {
              question: 'Which collection guarantees constant O(1) average lookup time by key?',
              options: ['HashMap', 'TreeMap', 'LinkedList', 'Vector'],
              correctIndex: 0,
              explanation: 'HashMap uses hashing to locate bucket indices in O(1) time.'
            }
          }
        ]
      }
    ],
    quiz: LANGUAGE_QUIZZES.java
  },

  {
    id: 'course_javascript',
    language: 'javascript',
    title: 'Modern JavaScript & Async Web Engineering',
    tagline: 'Closures, Promises, Event Loop, ES6+ array methods, and modern architecture.',
    level: 'Beginner',
    description: 'Master JavaScript from core language mechanics to modern async programming. Learn how the event loop, closures, destructuring, and Promises power modern web apps.',
    iconName: 'javascript',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    modules: [
      {
        id: 'js_mod_1',
        title: 'Module 1: Functional JS & Asynchronous Code',
        description: 'Closures, array transformations, Promises, and async/await.',
        lessons: [
          {
            id: 'js_l1',
            title: '1. Closures & The Event Loop',
            duration: '15 min',
            summary: 'Understand lexical scoping, function closures, and how asynchronous callbacks execute.',
            contentMarkdown: `### The Core of JavaScript

JavaScript is a single-threaded, non-blocking language powered by an **Event Loop**.

#### Closures
A **closure** is a function bundled together with references to its surrounding lexical state:

\`\`\`javascript
function createGreeter(greeting) {
    return function(name) {
        return \`\${greeting}, \${name}!\`;
    };
}

const sayHello = createGreeter("Hello");
console.log(sayHello("Developer")); // Hello, Developer!
\`\`\`

#### Async/Await
\`\`\`javascript
async function fetchCodeSnippet(id) {
    try {
        const response = await fetch(\`/api/snippets/\${id}\`);
        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}
\`\`\``,
            codeExample: `// Modern JavaScript Demo
const snippets = [
  { id: 1, lang: 'python', views: 120 },
  { id: 2, lang: 'javascript', views: 340 },
  { id: 3, lang: 'sql', views: 85 }
];

// Calculate total views using reduce
const totalViews = snippets.reduce((acc, s) => acc + s.views, 0);
console.log("Total platform views:", totalViews);

// Filter popular snippets (> 100 views)
const popular = snippets.filter(s => s.views > 100).map(s => s.lang);
console.log("Popular languages:", popular);`,
            codeLanguage: 'javascript',
            keyTakeaways: [
              'Closures retain access to their outer scope variables even after outer function exits.',
              'Promises handle async operations cleanly; async/await is modern syntactic sugar.',
              'Array methods (.map, .filter, .reduce) avoid manual loop mutation.'
            ],
            practiceQuestion: {
              question: 'What does `Array.prototype.filter()` return?',
              options: [
                'A new array containing only elements that pass the predicate test.',
                'A single boolean value.',
                'The index of the first match.',
                'Undefined.'
              ],
              correctIndex: 0,
              explanation: '`filter` produces a new array of matching items.'
            }
          }
        ]
      }
    ],
    quiz: LANGUAGE_QUIZZES.javascript
  }
];
