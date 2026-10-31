import { LanguageQuiz, Language } from '../types';

export const LANGUAGE_QUIZZES: Record<Language, LanguageQuiz> = {
  python: {
    language: 'python',
    languageName: 'Python',
    title: 'Python Core & Algorithm Certification Quiz',
    description: '10 comprehensive questions testing syntax, list comprehensions, slicing, functions, mutable defaults, decorators, and OOP.',
    totalQuestions: 10,
    pointsPerCorrect: 15,
    completionBonus: 50,
    questions: [
      {
        id: 'py_1',
        topic: 'List Comprehensions',
        difficulty: 'Beginner',
        question: 'What is the exact output of this Python code snippet?',
        codeSnippet: `nums = [1, 2, 3, 4, 5]
evens_squared = [x**2 for x in nums if x % 2 == 0]
print(evens_squared)`,
        options: ['[4, 16]', '[1, 9, 25]', '[2, 4]', '[4, 8, 12]'],
        correctIndex: 0,
        explanation: 'Only even numbers (2 and 4) satisfy `x % 2 == 0`. Squaring them gives 2**2 = 4 and 4**2 = 16, resulting in [4, 16].'
      },
      {
        id: 'py_2',
        topic: 'Mutable Default Arguments',
        difficulty: 'Intermediate',
        question: 'What does this function print across consecutive invocations?',
        codeSnippet: `def append_item(val, item_list=[]):
    item_list.append(val)
    return item_list

print(append_item(1))
print(append_item(2))`,
        options: ['[1] then [2]', '[1] then [1, 2]', '[1, 2] then [1, 2]', 'TypeError: mutable default forbidden'],
        correctIndex: 1,
        explanation: 'Default arguments in Python are evaluated once at function definition time, so the list persists across multiple function calls.'
      },
      {
        id: 'py_3',
        topic: 'String Slicing',
        difficulty: 'Beginner',
        question: 'What is the result of using slice step -1 on this string?',
        codeSnippet: `s = "CodeSelf"
print(s[::-1])`,
        options: ['fleSedoC', 'CodeSelf', 'C', 'IndexError'],
        correctIndex: 0,
        explanation: '`s[::-1]` reverses the string completely from the last character to the first, producing "fleSedoC".'
      },
      {
        id: 'py_4',
        topic: 'Dictionary Unpacking & Merging',
        difficulty: 'Intermediate',
        question: 'What does the union/unpacking of these two dictionaries output in modern Python?',
        codeSnippet: `a = {'x': 1, 'y': 2}
b = {'y': 99, 'z': 3}
merged = {**a, **b}
print(merged['y'])`,
        options: ['2', '99', 'None', 'KeyError'],
        correctIndex: 1,
        explanation: 'When unpacking dictionaries, duplicate keys in latter dictionaries overwrite earlier ones. Therefore `merged[\'y\']` is 99.'
      },
      {
        id: 'py_5',
        topic: 'Scope & Global Keywords',
        difficulty: 'Intermediate',
        question: 'What happens when executing this code?',
        codeSnippet: `x = 10
def modify():
    print(x)
    x = 20
modify()`,
        options: ['Prints 10 then terminates', 'UnboundLocalError: local variable referenced before assignment', 'Prints 20', 'Returns None'],
        correctIndex: 1,
        explanation: 'Python detects assignment `x = 20` inside `modify()`, making `x` a local variable for the entire scope. Referencing `print(x)` before assignment raises UnboundLocalError.'
      },
      {
        id: 'py_6',
        topic: 'Generators & Memory',
        difficulty: 'Advanced',
        question: 'How do generator expressions behave compared to list comprehensions?',
        codeSnippet: `gen = (x * 2 for x in range(3))
print(type(gen))`,
        options: ['<class \'generator\'>', '<class \'tuple\'>', '<class \'list\'>', '<class \'iterator\'>'],
        correctIndex: 0,
        explanation: 'Parentheses around a comprehension create a lazy generator object, which yields values on demand rather than storing everything in memory.'
      },
      {
        id: 'py_7',
        topic: 'Lambda & Higher-Order Functions',
        difficulty: 'Beginner',
        question: 'What is the output of `list(map(...))` here?',
        codeSnippet: `res = list(map(lambda x: x.upper(), ['py', 'sql']))
print(res)`,
        options: ['[\'PY\', \'SQL\']', '[\'py\', \'sql\']', '[\'P\', \'S\']', 'None'],
        correctIndex: 0,
        explanation: '`map` applies the uppercase lambda to every item in the list, producing [\'PY\', \'SQL\'].'
      },
      {
        id: 'py_8',
        topic: 'OOP Inheritance & super()',
        difficulty: 'Intermediate',
        question: 'What does calling `super().__init__()` accomplish in a child class?',
        options: [
          'It executes the constructor of the parent class, ensuring inherited attributes are initialized.',
          'It deletes the parent class instance.',
          'It creates a static singleton instance of the subclass.',
          'It forces private member variables to become global.'
        ],
        correctIndex: 0,
        explanation: '`super().__init__()` delegates initialization to the superclass in the Method Resolution Order (MRO).'
      },
      {
        id: 'py_9',
        topic: 'is vs == Identity vs Equality',
        difficulty: 'Intermediate',
        question: 'What does `a == b` vs `a is b` evaluate to for these two lists?',
        codeSnippet: `a = [1, 2, 3]
b = [1, 2, 3]
print(a == b, a is b)`,
        options: ['True False', 'True True', 'False False', 'False True'],
        correctIndex: 0,
        explanation: '`==` checks for value equality (both contain 1, 2, 3 -> True). `is` checks memory identity (they are distinct list objects in heap memory -> False).'
      },
      {
        id: 'py_10',
        topic: 'Exception Handling finally',
        difficulty: 'Beginner',
        question: 'Will the `finally` block execute if an exception occurs?',
        codeSnippet: `try:
    val = 1 / 0
except ZeroDivisionError:
    val = 0
finally:
    print("Cleanup Done")`,
        options: [
          'Yes, the finally block ALWAYS executes regardless of exceptions.',
          'No, finally only runs if no exception occurred.',
          'Only if val is greater than 0.',
          'No, ZeroDivisionError crashes the interpreter immediately.'
        ],
        correctIndex: 0,
        explanation: 'The `finally` block in Python is guaranteed to execute whether an exception was raised, caught, or not caught.'
      }
    ]
  },

  sql: {
    language: 'sql',
    languageName: 'SQL',
    title: 'SQL Relational Queries & Database Mastery Quiz',
    description: '10 questions covering SELECT, JOIN types, GROUP BY, HAVING, subqueries, NULL handling, and aggregate functions.',
    totalQuestions: 10,
    pointsPerCorrect: 15,
    completionBonus: 50,
    questions: [
      {
        id: 'sql_1',
        topic: 'WHERE vs HAVING',
        difficulty: 'Intermediate',
        question: 'What is the primary difference between WHERE and HAVING clauses in SQL?',
        options: [
          'WHERE filters individual rows before grouping; HAVING filters aggregated groups after GROUP BY.',
          'WHERE can only be used with numbers, while HAVING works on text.',
          'HAVING is executed before FROM, whereas WHERE is executed after ORDER BY.',
          'There is no difference; they are interchangeable aliases.'
        ],
        correctIndex: 0,
        explanation: '`WHERE` filters records before aggregation. `HAVING` filters group rows that were created by `GROUP BY` using aggregate functions like COUNT(), SUM(), AVG().'
      },
      {
        id: 'sql_2',
        topic: 'JOIN Types',
        difficulty: 'Beginner',
        question: 'Which JOIN returns all rows from the left table even if there is no match in the right table?',
        options: ['LEFT OUTER JOIN', 'INNER JOIN', 'CROSS JOIN', 'RIGHT JOIN'],
        correctIndex: 0,
        explanation: 'A LEFT JOIN returns all records from the left table and matched records from the right table; unmatched right table columns contain NULL.'
      },
      {
        id: 'sql_3',
        topic: 'NULL Comparison',
        difficulty: 'Intermediate',
        question: 'What is the correct way to filter for rows where `email` has no value?',
        options: ['WHERE email IS NULL', 'WHERE email = NULL', 'WHERE email == NULL', 'WHERE email IS NOT DEFINED'],
        correctIndex: 0,
        explanation: 'In SQL three-valued logic, `email = NULL` always evaluates to UNKNOWN. You must use `IS NULL`.'
      },
      {
        id: 'sql_4',
        topic: 'COUNT(*) vs COUNT(column)',
        difficulty: 'Intermediate',
        question: 'How does COUNT(bonus) differ from COUNT(*)?',
        options: [
          'COUNT(bonus) ignores NULL values in the bonus column, while COUNT(*) counts all rows.',
          'COUNT(bonus) only counts unique bonus values.',
          'COUNT(*) only counts primary keys.',
          'They produce identical results in every scenario.'
        ],
        correctIndex: 0,
        explanation: '`COUNT(column)` excludes NULL entries in that specific column, whereas `COUNT(*)` counts all rows regardless of NULL values.'
      },
      {
        id: 'sql_5',
        topic: 'ORDER BY Multi-column',
        difficulty: 'Beginner',
        question: 'What does `ORDER BY department ASC, salary DESC` do?',
        options: [
          'Sorts department alphabetically A-Z, and within each department sorts salary highest to lowest.',
          'Sorts department Z-A and salary lowest to highest.',
          'Sorts only by salary.',
          'Produces a syntax error.'
        ],
        correctIndex: 0,
        explanation: 'SQL sorts by primary column first (department ASC), and breaks ties using the second criterion (salary DESC).'
      },
      {
        id: 'sql_6',
        topic: 'Aggregation & GROUP BY',
        difficulty: 'Beginner',
        question: 'Which query correctly finds the average salary per department for departments with more than 5 employees?',
        options: [
          'SELECT dept, AVG(sal) FROM emp GROUP BY dept HAVING COUNT(*) > 5;',
          'SELECT dept, AVG(sal) FROM emp WHERE COUNT(*) > 5 GROUP BY dept;',
          'SELECT dept, AVG(sal) FROM emp GROUP BY dept WHERE COUNT(*) > 5;',
          'SELECT dept, AVG(sal) FROM emp HAVING dept > 5;'
        ],
        correctIndex: 0,
        explanation: 'Filtering aggregated counts (`COUNT(*) > 5`) requires the `HAVING` clause placed after `GROUP BY`.'
      },
      {
        id: 'sql_7',
        topic: 'Subqueries with IN',
        difficulty: 'Intermediate',
        question: 'What does `WHERE dept_id IN (SELECT id FROM depts WHERE active = 1)` achieve?',
        options: [
          'Filters rows whose dept_id matches any id returned by the subquery.',
          'Updates all inactive departments to 1.',
          'Joins tables without a foreign key.',
          'Returns a single boolean scalar value.'
        ],
        correctIndex: 0,
        explanation: 'The `IN` operator compares a scalar column value against a list or single-column subquery set.'
      },
      {
        id: 'sql_8',
        topic: 'Primary Key & Unique Constraints',
        difficulty: 'Beginner',
        question: 'Can a relational database table have multiple PRIMARY KEY constraints?',
        options: [
          'No, a table can have only one PRIMARY KEY (which may be composite), but multiple UNIQUE constraints.',
          'Yes, any number of PRIMARY KEYs are allowed.',
          'Only if the table has no foreign keys.',
          'Only SQLite allows multiple primary keys.'
        ],
        correctIndex: 0,
        explanation: 'Each table can have at most one PRIMARY KEY constraint. If multiple columns form the identity, it is a single composite primary key.'
      },
      {
        id: 'sql_9',
        topic: 'LIKE Pattern Matching',
        difficulty: 'Beginner',
        question: 'Which SQL wildcard matches any string of zero or more characters?',
        options: ['%', '_', '*', '?'],
        correctIndex: 0,
        explanation: '`%` matches zero or more characters in standard SQL. `_` matches exactly one character.'
      },
      {
        id: 'sql_10',
        topic: 'Transactions & ACID',
        difficulty: 'Advanced',
        question: 'What does the ROLLBACK command do in a SQL transaction?',
        options: [
          'Undoes all DML changes made since the transaction started or the last savepoint.',
          'Permanently writes data to the disk.',
          'Re-executes the last query.',
          'Deletes all tables from the database.'
        ],
        correctIndex: 0,
        explanation: '`ROLLBACK` aborts the current transaction and reverts all modifications, ensuring Atomicity in ACID transactions.'
      }
    ]
  },

  cpp: {
    language: 'cpp',
    languageName: 'C++',
    title: 'C++ Systems & STL Engineering Quiz',
    description: '10 in-depth questions testing pointers, memory, references, vectors, RAII, const correctness, and object-oriented features.',
    totalQuestions: 10,
    pointsPerCorrect: 15,
    completionBonus: 50,
    questions: [
      {
        id: 'cpp_1',
        topic: 'Pointers vs References',
        difficulty: 'Beginner',
        question: 'What is the key difference between a reference `int& ref = x;` and a pointer `int* ptr = &x;` in C++?',
        options: [
          'A reference must be initialized when declared and cannot be reseated or null.',
          'A reference requires manual delete, while a pointer does not.',
          'Pointers cannot access member methods with ->.',
          'References can be reassigned to point to different memory addresses at runtime.'
        ],
        correctIndex: 0,
        explanation: 'In C++, references act as immutable aliases to existing objects. They cannot be null and cannot be re-bound to another object after initialization.'
      },
      {
        id: 'cpp_2',
        topic: 'Pointer Dereferencing',
        difficulty: 'Beginner',
        question: 'What is the output of this code snippet?',
        codeSnippet: `int a = 10;
int* p = &a;
*p = 25;
std::cout << a;`,
        options: ['25', '10', 'Memory address of a', 'Compilation error'],
        correctIndex: 0,
        explanation: 'Dereferencing `*p = 25` directly modifies the value stored in variable `a`, so `a` becomes 25.'
      },
      {
        id: 'cpp_3',
        topic: 'STL Vector Operations',
        difficulty: 'Beginner',
        question: 'What does `vec.push_back(42)` do on `std::vector<int> vec;`?',
        options: [
          'Appends 42 to the end of the dynamic array, automatically reallocating capacity if needed.',
          'Inserts 42 at index 0.',
          'Removes 42 from the vector.',
          'Sorts the vector in ascending order.'
        ],
        correctIndex: 0,
        explanation: '`push_back` appends an element to the back of the vector in amortized O(1) time.'
      },
      {
        id: 'cpp_4',
        topic: 'Memory Management RAII',
        difficulty: 'Intermediate',
        question: 'Which modern C++ smart pointer provides exclusive ownership of dynamically allocated memory?',
        options: ['std::unique_ptr', 'std::shared_ptr', 'std::weak_ptr', 'std::auto_ptr'],
        correctIndex: 0,
        explanation: '`std::unique_ptr` owns and manages another object through a pointer and disposes of that object when the `unique_ptr` goes out of scope with zero overhead.'
      },
      {
        id: 'cpp_5',
        topic: 'Virtual Functions & Polymorphism',
        difficulty: 'Intermediate',
        question: 'Why should a base class with virtual functions declare a virtual destructor?',
        options: [
          'To ensure the derived class destructor is called when deleting an object through a base class pointer, preventing resource leaks.',
          'To make the class abstract.',
          'Because C++ syntax errors occur without it.',
          'To double the speed of object creation.'
        ],
        correctIndex: 0,
        explanation: 'Deleting a derived class instance via a `Base*` pointer when the base destructor is non-virtual results in undefined behavior and leaks derived resources.'
      },
      {
        id: 'cpp_6',
        topic: 'Const Correctness',
        difficulty: 'Intermediate',
        question: 'What does `const` at the end of a member function declaration mean, e.g. `int getVal() const;`?',
        options: [
          'The function promises not to modify any non-mutable member variables of the calling object.',
          'The return value cannot be modified.',
          'The function can only be called once.',
          'The function runs at compile time.'
        ],
        correctIndex: 0,
        explanation: 'A const member function treats `this` as a pointer to const object, preventing mutation of member variables.'
      },
      {
        id: 'cpp_7',
        topic: 'Pass by Reference vs Pass by Value',
        difficulty: 'Beginner',
        question: 'Why is `const std::string& str` preferred over `std::string str` as a function parameter?',
        options: [
          'It avoids an expensive deep copy of the string contents while preventing accidental modification.',
          'It allows changing the original string.',
          'It converts the string to a C-style array.',
          'It is required by the C++ compiler.'
        ],
        correctIndex: 0,
        explanation: 'Passing large objects by `const &` passes their address without copying, giving both high performance and read-only safety.'
      },
      {
        id: 'cpp_8',
        topic: 'Operator Overloading',
        difficulty: 'Intermediate',
        question: 'Can you overload the scope resolution operator `::` in C++?',
        options: ['No, :: cannot be overloaded.', 'Yes, using operator::().', 'Only inside templates.', 'Only for structs.'],
        correctIndex: 0,
        explanation: 'In C++, operators `::`, `.`, `.*`, and `?:` cannot be overloaded.'
      },
      {
        id: 'cpp_9',
        topic: 'Struct vs Class',
        difficulty: 'Beginner',
        question: 'What is the only default difference between `struct` and `class` in C++?',
        options: [
          'Members and base inheritance in struct are public by default; in class they are private by default.',
          'struct cannot have member functions.',
          'class cannot have constructors.',
          'struct is allocated on stack, class is allocated on heap.'
        ],
        correctIndex: 0,
        explanation: 'The only difference is default access specifiers: `public` for structs and `private` for classes.'
      },
      {
        id: 'cpp_10',
        topic: 'Undefined Behavior',
        difficulty: 'Advanced',
        question: 'What happens when accessing an array index out of bounds in raw C++?',
        options: [
          'Undefined Behavior (UB); it may read garbage, crash with segmentation fault, or corrupt memory.',
          'Throws an automatic IndexOutOfBoundsException.',
          'Returns 0 by default.',
          'Expands the array dynamically.'
        ],
        correctIndex: 0,
        explanation: 'Raw C++ arrays do not perform runtime bounds checks. Accessing out of bounds causes Undefined Behavior.'
      }
    ]
  },

  java: {
    language: 'java',
    languageName: 'Java',
    title: 'Java OOP & Enterprise Architecture Quiz',
    description: '10 questions covering JVM memory, garbage collection, String immutability, collections, inheritance, interfaces, and exceptions.',
    totalQuestions: 10,
    pointsPerCorrect: 15,
    completionBonus: 50,
    questions: [
      {
        id: 'java_1',
        topic: 'String Immutability',
        difficulty: 'Beginner',
        question: 'What does this Java snippet print?',
        codeSnippet: `String s = "Hello";
s.concat(" World");
System.out.println(s);`,
        options: ['Hello', 'Hello World', 'World', 'NullPointerException'],
        correctIndex: 0,
        explanation: '`String` objects in Java are immutable. `s.concat(...)` returns a new string, leaving `s` unchanged because the result was not reassigned.'
      },
      {
        id: 'java_2',
        topic: '== vs equals()',
        difficulty: 'Beginner',
        question: 'What is printed by this comparison?',
        codeSnippet: `String s1 = new String("Java");
String s2 = new String("Java");
System.out.println(s1 == s2);
System.out.println(s1.equals(s2));`,
        options: ['false then true', 'true then true', 'false then false', 'true then false'],
        correctIndex: 0,
        explanation: '`==` compares object reference identity in heap memory (different objects -> false). `.equals()` compares content characters ("Java" == "Java" -> true).'
      },
      {
        id: 'java_3',
        topic: 'Collections Framework',
        difficulty: 'Intermediate',
        question: 'Which Java Collection implementation guarantees O(1) average time complexity for get() and put()?',
        options: ['HashMap', 'TreeMap', 'LinkedList', 'Vector'],
        correctIndex: 0,
        explanation: '`HashMap` uses hashing and bucket array distribution to provide O(1) average lookup and insertion.'
      },
      {
        id: 'java_4',
        topic: 'Interfaces vs Abstract Classes',
        difficulty: 'Intermediate',
        question: 'Can a Java class implement multiple interfaces?',
        options: [
          'Yes, Java supports multiple interface inheritance.',
          'No, a class can only implement one interface.',
          'Only if all interfaces have no methods.',
          'Only in Java 7 or earlier.'
        ],
        correctIndex: 0,
        explanation: 'Java supports multiple inheritance of type through interfaces (e.g., `implements Serializable, Cloneable, Comparable`).'
      },
      {
        id: 'java_5',
        topic: 'Static Keyword',
        difficulty: 'Beginner',
        question: 'What is a `static` method in Java?',
        options: [
          'A method belonging to the class itself rather than any specific instance of the class.',
          'A method that cannot be called.',
          'A method that only works on private variables.',
          'A method that is stored on the heap.'
        ],
        correctIndex: 0,
        explanation: 'Static methods belong to the class, can be invoked without creating an object instance, and cannot access `this`.'
      },
      {
        id: 'java_6',
        topic: 'Garbage Collection',
        difficulty: 'Intermediate',
        question: 'When does an object become eligible for Garbage Collection in Java?',
        options: [
          'When it is no longer reachable from any live thread via GC roots.',
          'Immediately when its method exits.',
          'Only when `System.gc()` is called.',
          'When its reference count is negative.'
        ],
        correctIndex: 0,
        explanation: 'The JVM garbage collector reclaims heap memory when objects can no longer be reached through reference chains from active GC roots.'
      },
      {
        id: 'java_7',
        topic: 'Checked vs Unchecked Exceptions',
        difficulty: 'Intermediate',
        question: 'Which of the following is an UNCHECKED (runtime) exception in Java?',
        options: ['NullPointerException', 'IOException', 'SQLException', 'ClassNotFoundException'],
        correctIndex: 0,
        explanation: '`NullPointerException` subclasses `RuntimeException`, making it unchecked (the compiler does not require try-catch or throws declaration).'
      },
      {
        id: 'java_8',
        topic: 'Final Keyword',
        difficulty: 'Beginner',
        question: 'What happens if a Java class is declared as `final`?',
        options: [
          'The class cannot be extended / subclassed.',
          'All methods in the class become private.',
          'No instances of the class can be instantiated.',
          'The class can only be imported once.'
        ],
        correctIndex: 0,
        explanation: 'A `final` class prevents inheritance, ensuring its implementation and security cannot be overridden (e.g., `java.lang.String`).'
      },
      {
        id: 'java_9',
        topic: 'Generics & Type Erasure',
        difficulty: 'Advanced',
        question: 'What happens to generic type parameters at runtime in Java bytecode?',
        options: [
          'They are removed via Type Erasure, replacing parameters with Object or their bound.',
          'They create distinct compiled machine classes like C++ templates.',
          'They remain intact as native dynamic types.',
          'They cause reflection to fail.'
        ],
        correctIndex: 0,
        explanation: 'Java uses Type Erasure to maintain backwards compatibility with older pre-generics bytecodes; type checks occur at compile time.'
      },
      {
        id: 'java_10',
        topic: 'Streams API',
        difficulty: 'Intermediate',
        question: 'What is the output of this stream pipeline?',
        codeSnippet: `List<Integer> list = Arrays.asList(1, 2, 3, 4);
long count = list.stream().filter(n -> n > 2).count();
System.out.println(count);`,
        options: ['2', '4', '1', '3'],
        correctIndex: 0,
        explanation: 'Only elements 3 and 4 satisfy `n > 2`. The terminal operation `.count()` returns 2.'
      }
    ]
  },

  javascript: {
    language: 'javascript',
    languageName: 'JavaScript',
    title: 'Modern JavaScript & Async Engine Quiz',
    description: '10 questions testing closures, promises, event loop, hoisting, prototyping, this binding, and ES6+ features.',
    totalQuestions: 10,
    pointsPerCorrect: 15,
    completionBonus: 50,
    questions: [
      {
        id: 'js_1',
        topic: 'Closures',
        difficulty: 'Intermediate',
        question: 'What does this closure code output?',
        codeSnippet: `function makeCounter() {
    let count = 0;
    return () => ++count;
}
const c1 = makeCounter();
const c2 = makeCounter();
c1(); c1();
console.log(c1(), c2());`,
        options: ['3 1', '3 3', '2 1', '1 1'],
        correctIndex: 0,
        explanation: 'Each call to `makeCounter()` creates a distinct lexical environment. `c1` was called 3 times (count = 3), while `c2` was called once (count = 1).'
      },
      {
        id: 'js_2',
        topic: 'Event Loop & Promises',
        difficulty: 'Intermediate',
        question: 'In what order are these logged to the console?',
        codeSnippet: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
        options: ['A, D, C, B', 'A, B, C, D', 'A, C, D, B', 'C, A, D, B'],
        correctIndex: 0,
        explanation: 'Synchronous code runs first (A, D). Microtasks (Promises) run before Macrotasks (setTimeout), logging C then B.'
      },
      {
        id: 'js_3',
        topic: 'let vs var Hoisting',
        difficulty: 'Beginner',
        question: 'What happens when accessing `let x` before its declaration?',
        codeSnippet: `console.log(x);
let x = 5;`,
        options: [
          'ReferenceError: Cannot access \'x\' before initialization (TDZ)',
          'undefined',
          '5',
          'null'
        ],
        correctIndex: 0,
        explanation: 'Variables declared with `let` and `const` reside in the Temporal Dead Zone (TDZ) from the start of the block until declared.'
      },
      {
        id: 'js_4',
        topic: 'Array Methods map vs forEach',
        difficulty: 'Beginner',
        question: 'What is the return value of `arr.forEach(...)`?',
        options: ['undefined', 'A new array', 'The original array', 'The array length'],
        correctIndex: 0,
        explanation: '`forEach()` executes a provided callback for every element and always returns `undefined`. Use `map()` to transform arrays.'
      },
      {
        id: 'js_5',
        topic: 'Arrow Functions and this',
        difficulty: 'Intermediate',
        question: 'How do arrow functions handle the `this` keyword?',
        options: [
          'They do not have their own `this`; they inherit `this` lexically from the enclosing scope.',
          'They bind `this` to the global window object in all cases.',
          'They bind `this` dynamically to the caller.',
          'They throw an error if `this` is used.'
        ],
        correctIndex: 0,
        explanation: 'Arrow functions do not bind their own `this`, `arguments`, or `super`. They capture `this` from the surrounding context.'
      },
      {
        id: 'js_6',
        topic: 'Equality === vs ==',
        difficulty: 'Beginner',
        question: 'What does `0 == false` and `0 === false` evaluate to?',
        options: ['true false', 'true true', 'false false', 'false true'],
        correctIndex: 0,
        explanation: '`==` performs implicit type coercion (`false` becomes 0 -> true). `===` strictly checks type and value (number !== boolean -> false).'
      },
      {
        id: 'js_7',
        topic: 'Destructuring & Defaults',
        difficulty: 'Beginner',
        question: 'What is logged here?',
        codeSnippet: `const { a = 10, b = 20 } = { a: 0 };
console.log(a, b);`,
        options: ['0 20', '10 20', 'undefined 20', '0 undefined'],
        correctIndex: 0,
        explanation: 'Default parameters only kick in if the property is `undefined`. Because `a` is `0` (falsy, but not undefined), `a` is 0 and `b` is 20.'
      },
      {
        id: 'js_8',
        topic: 'Prototypal Inheritance',
        difficulty: 'Advanced',
        question: 'What does `Object.create(proto)` return?',
        options: [
          'A new object whose internal [[Prototype]] is set to `proto`.',
          'A deep copy of proto.',
          'A frozen instance of proto.',
          'A class constructor.'
        ],
        correctIndex: 0,
        explanation: '`Object.create` builds a new object with the specified prototype object and properties.'
      },
      {
        id: 'js_9',
        topic: 'Async / Await',
        difficulty: 'Intermediate',
        question: 'What does an `async` function always return in JavaScript?',
        options: ['A Promise', 'The raw scalar value', 'An observable', 'An EventEmitter'],
        correctIndex: 0,
        explanation: 'Async functions always wrap their return value in a Promise, resolving to that value.'
      },
      {
        id: 'js_10',
        topic: 'NaN Type',
        difficulty: 'Beginner',
        question: 'What is the result of `typeof NaN` in JavaScript?',
        options: ['"number"', '"NaN"', '"undefined"', '"null"'],
        correctIndex: 0,
        explanation: 'In the IEEE-754 floating-point specification and JavaScript, `NaN` (Not-a-Number) is of numeric type.'
      }
    ]
  },

  typescript: {
    language: 'typescript',
    languageName: 'TypeScript',
    title: 'TypeScript Type Systems & Generics Quiz',
    description: '10 questions covering interfaces, union types, generics, type narrowing, keyof, utility types, and unknown vs any.',
    totalQuestions: 10,
    pointsPerCorrect: 15,
    completionBonus: 50,
    questions: [
      {
        id: 'ts_1',
        topic: 'unknown vs any',
        difficulty: 'Intermediate',
        question: 'Why is `unknown` preferred over `any` for untrusted input?',
        options: [
          '`unknown` is type-safe: TypeScript forces you to perform type-checking before calling methods on it.',
          '`unknown` disables the compiler completely.',
          '`unknown` is identical to string.',
          '`unknown` can only hold objects.'
        ],
        correctIndex: 0,
        explanation: '`unknown` represents any value, but unlike `any`, you cannot access properties or call functions on it without narrowing the type first.'
      },
      {
        id: 'ts_2',
        topic: 'Generics',
        difficulty: 'Intermediate',
        question: 'What does `<T>(arg: T): T` indicate in a function signature?',
        options: [
          'The function accepts an argument of type T and returns a value of the exact same type T.',
          'The function returns void.',
          'The argument must be an array.',
          'T is a string literal.'
        ],
        correctIndex: 0,
        explanation: 'Generics capture the argument type provided by the caller and enforce type consistency between parameter and return value.'
      },
      {
        id: 'ts_3',
        topic: 'Utility Types Partial<T>',
        difficulty: 'Beginner',
        question: 'What does `Partial<User>` do to the User interface?',
        options: [
          'Makes all properties of User optional (marked with ?).',
          'Makes all properties readonly.',
          'Removes all methods from User.',
          'Deletes the User type.'
        ],
        correctIndex: 0,
        explanation: '`Partial<T>` constructs a type with all properties of T set to optional.'
      },
      {
        id: 'ts_4',
        topic: 'Discriminated Unions',
        difficulty: 'Intermediate',
        question: 'What is a Discriminated Union in TypeScript?',
        options: [
          'A union of object types that share a common literal property used for type narrowing.',
          'A union of numbers and strings only.',
          'An enum with negative values.',
          'A private class member.'
        ],
        correctIndex: 0,
        explanation: 'Discriminated unions share a common singleton discriminant property (like `kind: \'circle\' | \'square\'`), allowing TS to narrow types in switch/if.'
      },
      {
        id: 'ts_5',
        topic: 'Readonly<T>',
        difficulty: 'Beginner',
        question: 'What happens when modifying a property on a `Readonly<T>` object?',
        options: [
          'Compile-time error: Cannot assign to property because it is a read-only property.',
          'Runtime crash in node.',
          'Silently ignores the assignment in production.',
          'Converts property to null.'
        ],
        correctIndex: 0,
        explanation: 'TypeScript raises a compile-time error when code attempts to write to a readonly property.'
      },
      {
        id: 'ts_6',
        topic: 'keyof Operator',
        difficulty: 'Intermediate',
        question: 'Given `interface Point { x: number; y: number }`, what is `keyof Point`?',
        options: ['"x" | "y"', 'number', 'Point[]', 'string[]'],
        correctIndex: 0,
        explanation: 'The `keyof` operator takes an object type and produces a string or numeric literal union of its keys.'
      },
      {
        id: 'ts_7',
        topic: 'Never Type',
        difficulty: 'Advanced',
        question: 'When is the `never` type used in TypeScript?',
        options: [
          'To represent values that never occur, such as a function that always throws or an exhaustive check.',
          'For variables with unknown values.',
          'For asynchronous callbacks.',
          'As a synonym for void.'
        ],
        correctIndex: 0,
        explanation: '`never` represents the type of values that never occur, used in exhaustive type checking and unreachable code.'
      },
      {
        id: 'ts_8',
        topic: 'Interface vs Type Alias',
        difficulty: 'Intermediate',
        question: 'What unique feature does `interface` have that `type` alias does not?',
        options: [
          'Declaration merging (defining the same interface name multiple times merges their members).',
          'Interfaces can represent unions.',
          'Interfaces cannot be implemented by classes.',
          'Interfaces are converted to JavaScript runtime objects.'
        ],
        correctIndex: 0,
        explanation: 'Interfaces support declaration merging, allowing third-party libraries and modules to augment existing interfaces.'
      },
      {
        id: 'ts_9',
        topic: 'Optional Chaining ?.',
        difficulty: 'Beginner',
        question: 'What does `user?.profile?.bio` do if `profile` is undefined?',
        options: [
          'Returns undefined immediately without throwing a TypeError.',
          'Throws NullPointerException.',
          'Creates an empty profile object.',
          'Returns null.'
        ],
        correctIndex: 0,
        explanation: 'Optional chaining short-circuits and evaluates to `undefined` if any reference in the chain is nullish (`null` or `undefined`).'
      },
      {
        id: 'ts_10',
        topic: 'Const Assertions as const',
        difficulty: 'Intermediate',
        question: 'What does `const colors = [\'red\', \'green\'] as const` do to the array type?',
        options: [
          'Narrows the type to `readonly ["red", "green"]` (a readonly tuple of literal strings).',
          'Converts the array to a Set.',
          'Prevents runtime mutations in plain JavaScript.',
          'Makes the array global.'
        ],
        correctIndex: 0,
        explanation: '`as const` creates a readonly tuple with literal types instead of widened types (`string[]`).'
      }
    ]
  },

  csharp: {
    language: 'csharp',
    languageName: 'C#',
    title: '.NET & C# Modern Architecture Quiz',
    description: '10 questions covering LINQ, async/await tasks, nullable reference types, records, properties, and delegates.',
    totalQuestions: 10,
    pointsPerCorrect: 15,
    completionBonus: 50,
    questions: [
      {
        id: 'cs_1',
        topic: 'LINQ',
        difficulty: 'Beginner',
        question: 'What does this LINQ expression return?',
        codeSnippet: `var nums = new int[] { 1, 2, 3, 4, 5 };
var result = nums.Where(n => n > 2).Select(n => n * 10);`,
        options: ['[30, 40, 50]', '[10, 20]', '[3, 4, 5]', '[10, 20, 30, 40, 50]'],
        correctIndex: 0,
        explanation: '`Where` filters numbers > 2 (3, 4, 5), and `Select` multiplies each by 10, yielding 30, 40, 50.'
      },
      {
        id: 'cs_2',
        topic: 'Records in C# 9+',
        difficulty: 'Intermediate',
        question: 'What is a primary characteristic of a C# `record` type?',
        options: [
          'It provides built-in value-based equality and concise immutable data representation.',
          'It can only be used on Windows.',
          'It replaces SQL database records.',
          'It cannot have constructor parameters.'
        ],
        correctIndex: 0,
        explanation: 'Records are reference types designed for immutable data with automatic value equality (`Equals`), `ToString`, and `with` expression support.'
      },
      {
        id: 'cs_3',
        topic: 'Async / Await & Tasks',
        difficulty: 'Intermediate',
        question: 'What type should an asynchronous method return if it does not yield a value?',
        options: ['Task', 'void', 'Thread', 'Future'],
        correctIndex: 0,
        explanation: 'In C#, async methods returning no value should return `Task` (avoid `async void` except for top-level event handlers).'
      },
      {
        id: 'cs_4',
        topic: 'Auto-implemented Properties',
        difficulty: 'Beginner',
        question: 'What does `public int Id { get; init; }` allow?',
        options: [
          'Setting the value only during object initialization, after which it becomes read-only.',
          'Setting the value at any time during execution.',
          'Only internal assembly classes can read the value.',
          'Auto-increments the integer.'
        ],
        correctIndex: 0,
        explanation: 'The `init` accessor makes properties immutable after object construction and object initializers have completed.'
      },
      {
        id: 'cs_5',
        topic: 'Nullable Reference Types',
        difficulty: 'Intermediate',
        question: 'In C# with nullable reference types enabled, what does `string? name` indicate?',
        options: [
          '`name` can legally be null, and the compiler will enforce null checks before dereferencing.',
          '`name` is an optional method parameter.',
          '`name` is a char array.',
          '`name` defaults to empty string.'
        ],
        correctIndex: 0,
        explanation: 'The `?` suffix on reference types informs the compiler that the variable may hold a null value, producing warnings if dereferenced unsafely.'
      },
      {
        id: 'cs_6',
        topic: 'Null-coalescing Operator',
        difficulty: 'Beginner',
        question: 'What is the output of `string res = name ?? "Guest";` when `name` is null?',
        options: ['"Guest"', 'null', 'throws NullReferenceException', '""'],
        correctIndex: 0,
        explanation: 'The `??` operator returns the right-hand operand if the left-hand operand is null.'
      },
      {
        id: 'cs_7',
        topic: 'Pattern Matching',
        difficulty: 'Intermediate',
        question: 'What modern C# feature allows switching on types and values concisely?',
        options: ['Switch expressions with pattern matching', 'Preprocessor directives', 'goto statements', 'P/Invoke'],
        correctIndex: 0,
        explanation: 'C# pattern matching and switch expressions allow evaluating expressions based on type, relational patterns, and property patterns.'
      },
      {
        id: 'cs_8',
        topic: 'Generics Constraints',
        difficulty: 'Intermediate',
        question: 'What does `where T : class, new()` mean on a generic class definition?',
        options: [
          'T must be a reference type and have a public parameterless constructor.',
          'T must be a struct.',
          'T cannot be instantiated.',
          'T is an abstract class.'
        ],
        correctIndex: 0,
        explanation: '`class` specifies reference type constraint, and `new()` requires a parameterless constructor allowing `new T()`.'
      },
      {
        id: 'cs_9',
        topic: 'Delegates & Actions',
        difficulty: 'Beginner',
        question: 'What is `Action<int, string>` in .NET?',
        options: [
          'A built-in generic delegate that takes an int and a string and returns void.',
          'A function that returns a boolean.',
          'A database transaction handler.',
          'A thread pool worker.'
        ],
        correctIndex: 0,
        explanation: '`Action<...>` encapsulates a method with parameters returning `void`. Use `Func<..., TResult>` when a return value is required.'
      },
      {
        id: 'cs_10',
        topic: 'Using Statement / IDisposable',
        difficulty: 'Beginner',
        question: 'What does the `using` statement guarantee when applied to an `IDisposable` resource?',
        options: [
          'It automatically calls `.Dispose()` when the block exits, even if an exception is thrown.',
          'It deletes the file from disk.',
          'It keeps the resource open in background threads forever.',
          'It disables garbage collection.'
        ],
        correctIndex: 0,
        explanation: '`using` is syntactic sugar for a `try/finally` block that guarantees `.Dispose()` is called to free unmanaged resources.'
      }
    ]
  },

  php: {
    language: 'php',
    languageName: 'PHP',
    title: 'Modern PHP 8+ Web Engineering Quiz',
    description: '10 questions covering type declarations, match expressions, arrays, arrow functions, nullsafe operators, and PDO.',
    totalQuestions: 10,
    pointsPerCorrect: 15,
    completionBonus: 50,
    questions: [
      {
        id: 'php_1',
        topic: 'Match Expression in PHP 8',
        difficulty: 'Intermediate',
        question: 'How does PHP 8 `match` differ from traditional `switch`?',
        options: [
          '`match` uses strict comparison (===), returns a value directly, and does not require break statements.',
          '`match` is slower than switch.',
          '`match` only works on integers.',
          '`match` does not support default branches.'
        ],
        correctIndex: 0,
        explanation: 'PHP 8 `match` expression provides strict type comparison, evaluates to a value, and has no fall-through risk.'
      },
      {
        id: 'php_2',
        topic: 'Nullsafe Operator ?->',
        difficulty: 'Beginner',
        question: 'What does `$user?->profile?->getName()` return if `$profile` is null?',
        options: ['null', 'Fatal Error: Call to a member function on null', 'empty string', 'false'],
        correctIndex: 0,
        explanation: 'The PHP 8 nullsafe operator `?->` short-circuits and returns `null` if any element in the chain evaluates to null.'
      },
      {
        id: 'php_3',
        topic: 'Array Functions array_map',
        difficulty: 'Beginner',
        question: 'What is the output of this array map operation?',
        codeSnippet: `$arr = [1, 2, 3];
$doubled = array_map(fn($n) => $n * 2, $arr);
print_r($doubled);`,
        options: ['[2, 4, 6]', '[1, 2, 3]', '6', 'null'],
        correctIndex: 0,
        explanation: '`array_map` runs the short arrow function on each element, returning [2, 4, 6].'
      },
      {
        id: 'php_4',
        topic: 'Strict Types Declaration',
        difficulty: 'Intermediate',
        question: 'What does `declare(strict_types=1);` enforce at the top of a PHP file?',
        options: [
          'Enforces exact scalar type matching for function arguments and return types without coercion.',
          'Forces all variables to be capitalized.',
          'Converts PHP into a compiled binary.',
          'Prevents using associative arrays.'
        ],
        correctIndex: 0,
        explanation: '`declare(strict_types=1);` prevents implicit type juggling on function calls defined or called within that file.'
      },
      {
        id: 'php_5',
        topic: 'PDO Prepared Statements',
        difficulty: 'Beginner',
        question: 'Why are PDO prepared statements essential when interacting with databases in PHP?',
        options: [
          'They separate SQL code from user data parameters, completely preventing SQL Injection attacks.',
          'They compress SQL tables.',
          'They eliminate the need for primary keys.',
          'They automatically design CSS stylesheets.'
        ],
        correctIndex: 0,
        explanation: 'Prepared statements treat parameter inputs as literals rather than executable SQL syntax, preventing SQL injection.'
      },
      {
        id: 'php_6',
        topic: 'Constructor Property Promotion',
        difficulty: 'Intermediate',
        question: 'What does `public function __construct(public string $name) {}` accomplish in PHP 8?',
        options: [
          'Declares the class property and assigns the argument automatically in a single statement.',
          'Throws a syntax error.',
          'Makes the property global.',
          'Calls parent::__construct automatically.'
        ],
        correctIndex: 0,
        explanation: 'Constructor property promotion eliminates boilerplate by declaring and initializing class properties in the constructor signature.'
      },
      {
        id: 'php_7',
        topic: 'Named Arguments',
        difficulty: 'Beginner',
        question: 'Can you pass arguments by name in PHP 8, e.g. `setCookie(name: "id", value: "10")`?',
        options: [
          'Yes, PHP 8 supports named arguments regardless of parameter order.',
          'No, parameters must strictly be positional.',
          'Only for built-in functions, not custom ones.',
          'Only in CLI mode.'
        ],
        correctIndex: 0,
        explanation: 'Named arguments allow passing arguments by parameter name, skipping optional defaults and enhancing readability.'
      },
      {
        id: 'php_8',
        topic: 'Sessions & Cookies',
        difficulty: 'Beginner',
        question: 'Which function must be invoked before accessing or storing data in `$_SESSION`?',
        options: ['session_start()', 'session_open()', 'start_session()', 'init_session()'],
        correctIndex: 0,
        explanation: '`session_start()` initializes session storage or resumes the current session based on a session identifier.'
      },
      {
        id: 'php_9',
        topic: 'Anonymous Classes',
        difficulty: 'Intermediate',
        question: 'What is an anonymous class in PHP?',
        options: [
          'A class without a named identifier, instantiated on the fly using `new class { ... }`.',
          'A class without private members.',
          'A class that cannot have methods.',
          'A deprecated PHP 4 feature.'
        ],
        correctIndex: 0,
        explanation: 'Anonymous classes are useful for lightweight, one-off objects like mock tests or inline interfaces.'
      },
      {
        id: 'php_10',
        topic: '=== vs == Type Coercion',
        difficulty: 'Beginner',
        question: 'In modern PHP 8, what does `"0" == 0` evaluate to?',
        options: ['true', 'false', 'TypeError', 'null'],
        correctIndex: 0,
        explanation: 'Numeric strings compared with numbers using `==` evaluate numerically in PHP, resulting in `true`. Use `===` for strict check.'
      }
    ]
  },

  html_css: {
    language: 'html_css',
    languageName: 'HTML / CSS',
    title: 'Modern Responsive Web & CSS Flexbox/Grid Quiz',
    description: '10 questions testing semantic HTML5, Flexbox alignment, CSS Grid, Box Model, specificity, and accessibility.',
    totalQuestions: 10,
    pointsPerCorrect: 15,
    completionBonus: 50,
    questions: [
      {
        id: 'web_1',
        topic: 'CSS Box Model',
        difficulty: 'Beginner',
        question: 'What does `box-sizing: border-box;` do?',
        options: [
          'Includes padding and border within the element\'s total specified width and height.',
          'Adds a border to all child elements.',
          'Causes width to only measure content width.',
          'Disables margins entirely.'
        ],
        correctIndex: 0,
        explanation: 'With `border-box`, padding and borders do not expand an element\'s declared width, making layout sizing predictable.'
      },
      {
        id: 'web_2',
        topic: 'Flexbox Centering',
        difficulty: 'Beginner',
        question: 'Which properties center a child element both vertically and horizontally in a Flex container?',
        options: [
          'justify-content: center; align-items: center;',
          'text-align: center; vertical-align: middle;',
          'float: center; margin: auto;',
          'display: center;'
        ],
        correctIndex: 0,
        explanation: 'In Flexbox with row direction, `justify-content: center` centers along the main axis (horizontal), and `align-items: center` centers along the cross axis (vertical).'
      },
      {
        id: 'web_3',
        topic: 'CSS Specificity',
        difficulty: 'Intermediate',
        question: 'Which CSS selector has the highest specificity?',
        options: ['#header (ID)', '.nav-item (Class)', 'nav (Element tag)', '* (Universal)'],
        correctIndex: 0,
        explanation: 'ID selectors (specificity 0,1,0,0) outweigh classes, attributes, and pseudo-classes (0,0,1,0), which outweigh element selectors (0,0,0,1).'
      },
      {
        id: 'web_4',
        topic: 'Semantic HTML5',
        difficulty: 'Beginner',
        question: 'Why are semantic elements like `<main>`, `<nav>`, `<article>`, and `<header>` preferred over generic `<div>` tags?',
        options: [
          'They improve accessibility for screen readers and assist search engines in indexing content structure.',
          'They load 50% faster in browsers.',
          'They are required for CSS to work.',
          'They automatically style elements.'
        ],
        correctIndex: 0,
        explanation: 'Semantic HTML conveys clear structural meaning to assistive technologies (ARIA/screen readers) and SEO crawlers.'
      },
      {
        id: 'web_5',
        topic: 'CSS Grid fr Unit',
        difficulty: 'Intermediate',
        question: 'What does `grid-template-columns: 1fr 2fr;` create?',
        options: [
          'Two columns where the second column is twice as wide as the first column, sharing available space.',
          'Columns with 1px and 2px widths.',
          'A single column split in half.',
          'A responsive layout that only works on mobile.'
        ],
        correctIndex: 0,
        explanation: 'The `fr` unit represents a fraction of the available space inside the grid container.'
      },
      {
        id: 'web_6',
        topic: 'Position Relative vs Absolute',
        difficulty: 'Intermediate',
        question: 'Where is an element with `position: absolute; top: 0; left: 0;` positioned?',
        options: [
          'At the top-left of its closest ancestor with a position other than static (or viewport if none).',
          'Always at the top-left of the entire screen.',
          'Directly inside its next sibling.',
          'At the original position it occupied in the flow.'
        ],
        correctIndex: 0,
        explanation: 'An absolutely positioned element is removed from normal flow and positioned relative to its nearest positioned ancestor.'
      },
      {
        id: 'web_7',
        topic: 'Rem vs Em Units',
        difficulty: 'Beginner',
        question: 'What is `1rem` relative to in CSS?',
        options: [
          'The font-size of the root `<html>` element.',
          'The font-size of the immediate parent element.',
          'The screen resolution in inches.',
          'The viewport width.'
        ],
        correctIndex: 0,
        explanation: '`rem` stands for "root em" and is calculated relative to the root `<html>` element font-size (typically 16px by default).'
      },
      {
        id: 'web_8',
        topic: 'Accessibility alt Attribute',
        difficulty: 'Beginner',
        question: 'What is the purpose of the `alt` attribute on an `<img>` tag?',
        options: [
          'Provides alternative text for screen readers and displays when the image fails to load.',
          'Sets the image caption in a tooltip.',
          'Specifies the high-resolution source.',
          'Changes the image aspect ratio.'
        ],
        correctIndex: 0,
        explanation: 'The `alt` attribute describes the image content for visually impaired users using screen readers and fallbacks when network fails.'
      },
      {
        id: 'web_9',
        topic: 'CSS Variables Custom Properties',
        difficulty: 'Beginner',
        question: 'What is the correct syntax to declare and use a CSS variable in standard CSS?',
        options: [
          '--primary-color: #3b82f6; and color: var(--primary-color);',
          '$primary-color: #3b82f6; and color: $primary-color;',
          '@primary: #3b82f6; and color: @primary;',
          'let primary = #3b82f6; and color: primary;'
        ],
        correctIndex: 0,
        explanation: 'Standard CSS variables begin with two dashes `--name` and are retrieved using the `var(--name)` function.'
      },
      {
        id: 'web_10',
        topic: 'Responsive Media Queries',
        difficulty: 'Beginner',
        question: 'What does `@media (min-width: 768px) { ... }` target?',
        options: [
          'Devices and browser viewports that are at least 768 pixels wide or wider (tablets and desktops).',
          'Only mobile screens smaller than 768px.',
          'Printers only.',
          'Only devices with high DPI screens.'
        ],
        correctIndex: 0,
        explanation: '`min-width: 768px` applies styles when the screen width is 768px or greater, following the mobile-first CSS methodology.'
      }
    ]
  }
};
