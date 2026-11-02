import { Language, LanguageMeta } from '../types';

export const LANGUAGES: Record<Language, LanguageMeta> = {
  python: {
    id: 'python',
    name: 'Python',
    extension: 'py',
    mimeType: 'text/x-python',
    pistonLanguage: 'python',
    version: '3.10.0',
    color: 'text-amber-700',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
    bgDark: 'bg-amber-50 text-amber-800 border-amber-200',
    sampleBoilerplate: `# Python - Simple Arithmetic & Even/Odd Checker
num1 = 15
num2 = 4

print("Sum:", num1 + num2)
print("Difference:", num1 - num2)
print("Product:", num1 * num2)

# Check if num1 is Even or Odd
if num1 % 2 == 0:
    print(f"{num1} is an Even number")
else:
    print(f"{num1} is an Odd number")
`,
    keywords: [
      'def', 'class', 'import', 'from', 'return', 'if', 'elif', 'else', 'for', 'while',
      'in', 'is', 'not', 'and', 'or', 'True', 'False', 'None', 'try', 'except',
      'finally', 'raise', 'with', 'as', 'lambda', 'yield', 'async', 'await', 'pass',
      'break', 'continue', 'global', 'nonlocal', 'assert', 'print', 'input', 'len', 'range',
      'enumerate', 'zip', 'map', 'filter', 'list', 'dict', 'set', 'tuple', 'int', 'str',
      'float', 'bool', 'math', 'sys', 'os', 'json', 'datetime', 'random', 'collections'
    ],
    sampleOutput: {
      stdout: `Sum: 19
Difference: 11
Product: 60
15 is an Odd number`,
      executionTimeMs: 25,
      status: 'success'
    }
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    extension: 'sql',
    mimeType: 'text/x-sql',
    pistonLanguage: 'sqlite3',
    version: '3.36.0',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    bgDark: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    sampleBoilerplate: `-- SQL - Simple Student Marks Table
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT,
    subject TEXT,
    marks INTEGER
);

INSERT INTO students (id, name, subject, marks) VALUES
(1, 'Emma', 'Math', 92),
(2, 'Liam', 'Science', 85),
(3, 'Noah', 'English', 78),
(4, 'Olivia', 'Math', 95);

SELECT name, subject, marks
FROM students
WHERE marks >= 80
ORDER BY marks DESC;
`,
    keywords: [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
      'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'JOIN', 'INNER', 'LEFT',
      'RIGHT', 'OUTER', 'ON', 'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC',
      'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'COUNT', 'SUM', 'AVG',
      'MIN', 'MAX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'INTEGER', 'TEXT',
      'BOOLEAN', 'VARCHAR', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'EXISTS',
      'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COALESCE', 'CAST', 'LIKE', 'BETWEEN',
      'WITH', 'AS', 'OVER', 'PARTITION', 'ROW_NUMBER', 'INDEX', 'VIEW', 'TRIGGER'
    ],
    sampleOutput: {
      stdout: `name    | subject | marks
--------+---------+------
Olivia  | Math    | 95   
Emma    | Math    | 92   
Liam    | Science | 85   

[Total: 3 row(s) returned]`,
      tabularData: {
        columns: ['name', 'subject', 'marks'],
        values: [
          ['Olivia', 'Math', 95],
          ['Emma', 'Math', 92],
          ['Liam', 'Science', 85]
        ]
      },
      executionTimeMs: 14,
      status: 'success'
    }
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    extension: 'js',
    mimeType: 'text/javascript',
    pistonLanguage: 'javascript',
    version: '18.15.0',
    color: 'text-amber-600',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
    bgDark: 'bg-amber-50 text-amber-800 border-amber-200',
    sampleBoilerplate: `// JavaScript - Simple Shopping Bill Calculator
const pricePerItem = 25;
const quantity = 3;
const taxRate = 0.08;

const subtotal = pricePerItem * quantity;
const tax = subtotal * taxRate;
const total = subtotal + tax;

console.log("Subtotal: $" + subtotal);
console.log("Tax (8%): $" + tax.toFixed(2));
console.log("Total Amount: $" + total.toFixed(2));
`,
    keywords: [
      'const', 'let', 'var', 'function', 'return', 'async', 'await', 'import',
      'export', 'default', 'from', 'class', 'extends', 'new', 'this', 'super',
      'if', 'else', 'switch', 'case', 'break', 'continue', 'for', 'while', 'do',
      'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'true', 'false',
      'null', 'undefined', 'console', 'log', 'warn', 'error', 'info', 'table',
      'Promise', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Math', 'Date',
      'JSON', 'Set', 'Map', 'RegExp', 'fetch', 'setTimeout', 'setInterval',
      'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every', 'includes'
    ],
    sampleOutput: {
      stdout: `Subtotal: $75
Tax (8%): $6.00
Total Amount: $81.00`,
      executionTimeMs: 12,
      status: 'success'
    }
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    extension: 'ts',
    mimeType: 'application/typescript',
    pistonLanguage: 'typescript',
    version: '5.0.3',
    color: 'text-blue-600',
    bgLight: 'bg-blue-50 text-blue-800 border-blue-200',
    bgDark: 'bg-blue-50 text-blue-800 border-blue-200',
    sampleBoilerplate: `// TypeScript - Student Report Card
interface Student {
  name: string;
  math: number;
  science: number;
  english: number;
}

const student: Student = {
  name: "Alex",
  math: 90,
  science: 85,
  english: 95
};

const average = (student.math + student.science + student.english) / 3;

console.log("Student Name: " + student.name);
console.log("Average Marks: " + average.toFixed(1));
console.log("Result: " + (average >= 75 ? "Passed with Distinction" : "Passed"));
`,
    keywords: [
      'interface', 'type', 'enum', 'namespace', 'implements', 'declare', 'abstract',
      'readonly', 'as', 'keyof', 'typeof', 'extends', 'infer', 'is', 'const', 'let',
      'function', 'return', 'async', 'await', 'class', 'public', 'private', 'protected',
      'string', 'number', 'boolean', 'any', 'unknown', 'never', 'void', 'Record',
      'Partial', 'Required', 'Pick', 'Omit', 'Promise', 'Array', 'Tuple', 'satisfies'
    ],
    sampleOutput: {
      stdout: `Student Name: Alex
Average Marks: 90.0
Result: Passed with Distinction`,
      executionTimeMs: 22,
      status: 'success'
    }
  },
  c: {
    id: 'c',
    name: 'C',
    extension: 'c',
    mimeType: 'text/x-csrc',
    pistonLanguage: 'c',
    version: '10.2.0',
    color: 'text-sky-700',
    bgLight: 'bg-sky-50 text-sky-800 border-sky-200',
    bgDark: 'bg-sky-950/60 text-sky-200 border-sky-800',
    sampleBoilerplate: `// C - Pointer arithmetic & Sum of Array
#include <stdio.h>

int main() {
    int arr[] = {10, 20, 30, 40, 50};
    int n = sizeof(arr) / sizeof(arr[0]);
    int sum = 0;

    printf("Array elements: ");
    for (int i = 0; i < n; i++) {
        printf("%d ", *(arr + i));
        sum += *(arr + i);
    }
    printf("\\nTotal Sum = %d\\n", sum);
    return 0;
}
`,
    keywords: [
        '#include', 'int', 'char', 'float', 'double', 'void', 'long', 'short', 'unsigned', 'signed',
        'struct', 'union', 'enum', 'typedef', 'sizeof', 'static', 'extern', 'const', 'volatile',
        'auto', 'register', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
        'continue', 'goto', 'printf', 'scanf', 'malloc', 'free', 'NULL'
    ],
    sampleOutput: {
        stdout: `Array elements: 10 20 30 40 50 
Total Sum = 150`,
        executionTimeMs: 18,
        status: 'success'
    }
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    extension: 'cpp',
    mimeType: 'text/x-c++src',
    pistonLanguage: 'c++',
    version: '10.2.0',
    color: 'text-blue-700',
    bgLight: 'bg-blue-50 text-blue-800 border-blue-200',
    bgDark: 'bg-blue-50 text-blue-800 border-blue-200',
    sampleBoilerplate: `// C++ - Interactive Multiplication Table & Even/Odd Check
#include <iostream>
using namespace std;

int main() {
    int number;
    cout << "Enter a number: ";
    cin >> number;

    cout << "Multiplication Table of " << number << ":" << endl;

    for (int i = 1; i <= 5; i++) {
        cout << number << " x " << i << " = " << (number * i) << endl;
    }

    if (number % 2 == 0) {
        cout << number << " is Even" << endl;
    } else {
        cout << number << " is Odd" << endl;
    }

    return 0;
}
`,
    keywords: [
      '#include', 'using', 'namespace', 'std', 'int', 'float', 'double', 'char',
      'bool', 'void', 'auto', 'const', 'constexpr', 'nullptr', 'cout', 'cin', 'endl',
      'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break',
      'continue', 'class', 'struct', 'public', 'private', 'protected', 'virtual',
      'template', 'typename', 'vector', 'string', 'map', 'set', 'pair', 'queue',
      'stack', 'algorithm', 'sort', 'min', 'max', 'push_back', 'size', 'getline', 'printf', 'scanf'
    ],
    sampleOutput: {
      stdout: `Multiplication Table of 5:
5 x 1 = 5
5 x 2 = 10
5 x 3 = 15
5 x 4 = 20
5 x 5 = 25
5 is Odd`,
      executionTimeMs: 45,
      status: 'success'
    }
  },
  java: {
    id: 'java',
    name: 'Java',
    extension: 'java',
    mimeType: 'text/x-java-source',
    pistonLanguage: 'java',
    version: '15.0.2',
    color: 'text-orange-700',
    bgLight: 'bg-orange-50 text-orange-800 border-orange-200',
    bgDark: 'bg-orange-50 text-orange-800 border-orange-200',
    sampleBoilerplate: `// Java - Simple Score & Grade Evaluator
public class Main {
    public static void main(String[] args) {
        int score = 85;

        System.out.println("Student Score: " + score);

        if (score >= 90) {
            System.out.println("Grade: A");
        } else if (score >= 80) {
            System.out.println("Grade: B");
        } else {
            System.out.println("Grade: C");
        }

        System.out.print("Countdown: ");
        for (int i = 3; i >= 1; i--) {
            System.out.print(i + " ");
        }
        System.out.println("Go!");
    }
}
`,
    keywords: [
      'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements',
      'static', 'final', 'void', 'int', 'double', 'float', 'boolean', 'char', 'long',
      'String', 'System', 'out', 'println', 'print', 'Scanner', 'new', 'return',
      'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'continue', 'try',
      'catch', 'finally', 'throw', 'throws', 'ArrayList', 'HashMap', 'List', 'Map',
      'Set', 'Arrays', 'Collections', 'Math', 'Override'
    ],
    sampleOutput: {
      stdout: `Student Score: 85
Grade: B
Countdown: 3 2 1 Go!`,
      executionTimeMs: 65,
      status: 'success'
    }
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    extension: 'cs',
    mimeType: 'text/x-csharp',
    pistonLanguage: 'csharp',
    version: '6.12.0',
    color: 'text-purple-700',
    bgLight: 'bg-purple-50 text-purple-800 border-purple-200',
    bgDark: 'bg-purple-50 text-purple-800 border-purple-200',
    sampleBoilerplate: `// C# - Simple Temperature Converter
using System;

public class Program {
    public static void Main() {
        double celsius = 25.0;
        double fahrenheit = (celsius * 9 / 5) + 32;

        Console.WriteLine("Temperature in Celsius: " + celsius + "°C");
        Console.WriteLine("Temperature in Fahrenheit: " + fahrenheit + "°F");

        if (celsius >= 30) {
            Console.WriteLine("Weather: Hot day");
        } else if (celsius >= 20) {
            Console.WriteLine("Weather: Pleasant day");
        } else {
            Console.WriteLine("Weather: Cold day");
        }
    }
}
`,
    keywords: [
      'using', 'namespace', 'class', 'public', 'private', 'protected', 'internal',
      'static', 'void', 'double', 'string', 'int', 'float', 'bool', 'var', 'async',
      'await', 'Task', 'Console', 'WriteLine', 'Write', 'ReadLine', 'return', 'if',
      'else', 'for', 'foreach', 'while', 'switch', 'case', 'break', 'new', 'List',
      'Dictionary', 'Math', 'Convert', 'try', 'catch', 'finally', 'override', 'virtual', 'record'
    ],
    sampleOutput: {
      stdout: `Temperature in Celsius: 25°C
Temperature in Fahrenheit: 77°F
Weather: Pleasant day`,
      executionTimeMs: 58,
      status: 'success'
    }
  },
  php: {
    id: 'php',
    name: 'PHP',
    extension: 'php',
    mimeType: 'text/x-php',
    pistonLanguage: 'php',
    version: '8.2.3',
    color: 'text-indigo-700',
    bgLight: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    bgDark: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    sampleBoilerplate: `<?php
// PHP - Simple Greeting & Average Marks Calculator
$name = "Alex";
$marks = [85, 90, 78];
$total = array_sum($marks);
$average = $total / count($marks);

echo "Hello, " . $name . "!\n";
echo "Total Marks: " . $total . "\n";
echo "Average: " . round($average, 1) . "\n";

if ($average >= 80) {
    echo "Performance: Excellent\n";
} else {
    echo "Performance: Good\n";
}
?>
`,
    keywords: [
      'echo', 'print', 'function', 'return', 'if', 'else', 'elseif', 'for', 'foreach',
      'while', 'switch', 'case', 'break', 'continue', 'array', 'array_sum', 'count',
      'round', 'strlen', 'substr', 'explode', 'implode', 'in_array', 'json_encode',
      'json_decode', 'class', 'public', 'private', 'protected', 'static', 'new',
      'try', 'catch', 'finally', 'Exception', 'true', 'false', 'null'
    ],
    sampleOutput: {
      stdout: `Hello, Alex!
Total Marks: 253
Average: 84.3
Performance: Excellent`,
      executionTimeMs: 20,
      status: 'success'
    }
  },
  html_css: {
    id: 'html_css',
    name: 'HTML/CSS',
    extension: 'html',
    mimeType: 'text/html',
    pistonLanguage: 'html',
    version: '5.0',
    color: 'text-rose-700',
    bgLight: 'bg-rose-50 text-rose-800 border-rose-200',
    bgDark: 'bg-rose-50 text-rose-800 border-rose-200',
    sampleBoilerplate: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 30px;
      background-color: #f8fafc;
      color: #334155;
    }
    .card {
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 24px;
      max-width: 300px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    h2 {
      color: #2563eb;
      margin-top: 0;
    }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Welcome to CodeShelf!</h2>
    <p>A simple beginner card built with basic HTML and CSS.</p>
    <button onclick="console.log('Button clicked!')">Click Me</button>
  </div>
</body>
</html>
`,
    keywords: [
      '<!DOCTYPE html>', '<html>', '<head>', '<style>', '<body>', '<header>', '<footer>',
      '<nav>', '<main>', '<section>', '<article>', '<div>', '<span>', '<p>', '<h1>', '<h2>',
      '<h3>', '<ul>', '<ol>', '<li>', '<table>', '<tr>', '<th>', '<td>', '<form>', '<input>',
      '<button>', '<textarea>', '<a>', '<img>', 'class', 'id', 'display', 'flex', 'grid',
      'margin', 'padding', 'color', 'background', 'border', 'border-radius', 'font-size', 'font-family'
    ],
    sampleOutput: {
      stdout: 'Rendered live preview in isolated sandboxed iframe container.',
      htmlPreview: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 30px;
      background-color: #f8fafc;
      color: #334155;
    }
    .card {
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 24px;
      max-width: 300px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
    }
    h2 {
      color: #2563eb;
      margin-top: 0;
    }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Welcome to CodeShelf!</h2>
    <p>A simple beginner card built with basic HTML and CSS.</p>
    <button onclick="console.log('Button clicked!')">Click Me</button>
  </div>
</body>
</html>`,
      executionTimeMs: 15,
      status: 'success'
    }
  }
};

export const DIFFICULTY_LEVELS: { id: 'Beginner' | 'Intermediate' | 'Advanced'; label: string; color: string }[] = [
  { id: 'Beginner', label: 'Beginner', color: 'text-emerald-500' },
  { id: 'Intermediate', label: 'Intermediate', color: 'text-amber-500' },
  { id: 'Advanced', label: 'Advanced', color: 'text-rose-500' },
];

export const CATEGORIES: { id: string; label: string }[] = [
  { id: 'All', label: 'All Categories' },
  { id: 'DSA', label: 'DSA' },
  { id: 'Algorithms', label: 'Algorithms' },
  { id: 'Database/Queries', label: 'Database / Queries' },
  { id: 'OOP', label: 'OOP' },
  { id: 'STL', label: 'STL' },
  { id: 'Basics', label: 'Basics' },
  { id: 'Web Dev', label: 'Web Dev' },
];
