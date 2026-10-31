/**
 * Comprehensive Multi-Language Compiler & Syntax Error Validator
 * Produces authentic compiler errors (GCC/Clang, Javac, Roslyn, Python, V8)
 * for invalid, broken, or half-written code.
 */

export interface CompilerValidationResult {
  isValid: boolean;
  errorMessage?: string;
  line?: number;
  column?: number;
}

/**
 * Format a GCC/Clang style compiler error message with snippet and caret pointer
 */
function formatGccError(
  file: string,
  lineNum: number,
  colNum: number,
  errorMsg: string,
  sourceLine: string,
  functionName: string = 'int main()'
): string {
  const lineStr = String(lineNum);
  const pad = ' '.repeat(lineStr.length);
  const caretCol = Math.max(1, colNum);
  const caret = ' '.repeat(caretCol - 1) + '^';

  return `\x1b[1m${file}: In function '\x1b[32m${functionName}\x1b[39m':\x1b[0m\n` +
    `\x1b[1m${file}:${lineNum}:${caretCol}:\x1b[0m \x1b[1;31merror:\x1b[0m \x1b[1m${errorMsg}\x1b[0m\n` +
    `   \x1b[1;36m${lineStr}\x1b[0m | ${sourceLine}\n` +
    `   \x1b[1;36m${pad}\x1b[0m | \x1b[1;32m${caret}\x1b[0m`;
}

const GCC_LINKER_ERROR = `\x1b[1m/usr/bin/ld:\x1b[0m /usr/lib/gcc/x86_64-linux-gnu/10/crt1.o: in function '_start':\n(.text+0x20): \x1b[1;31mundefined reference to 'main'\x1b[0m\n\x1b[1;31mcollect2: error: ld returned 1 exit status\x1b[0m`;

/**
 * Validate C++ code for syntax, structure, brackets, types, declarations, and semicolons
 */
export function validateCpp(code: string): CompilerValidationResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: GCC_LINKER_ERROR
    };
  }

  const rawLines = code.split('\n');

  // 1. Check for unclosed quotes (string or char literals)
  for (let idx = 0; idx < rawLines.length; idx++) {
    const line = rawLines[idx];
    let inString = false;
    let inChar = false;
    let escape = false;
    let quoteStartCol = 0;

    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\') {
        escape = true;
        continue;
      }
      if (ch === '"' && !inChar) {
        if (!inString) {
          inString = true;
          quoteStartCol = c + 1;
        } else {
          inString = false;
        }
      } else if (ch === "'" && !inString) {
        if (!inChar) {
          inChar = true;
          quoteStartCol = c + 1;
        } else {
          inChar = false;
        }
      } else if (ch === '/' && c + 1 < line.length && line[c + 1] === '/' && !inString && !inChar) {
        // Comment rest of line
        break;
      }
    }

    if (inString) {
      return {
        isValid: false,
        line: idx + 1,
        column: quoteStartCol,
        errorMessage: formatGccError('main.cpp', idx + 1, quoteStartCol, 'missing terminating " character', line)
      };
    }
    if (inChar) {
      return {
        isValid: false,
        line: idx + 1,
        column: quoteStartCol,
        errorMessage: formatGccError("main.cpp", idx + 1, quoteStartCol, "missing terminating ' character", line)
      };
    }
  }

  // 2. Bracket and brace matching check: {}, (), []
  const stack: { char: string; line: number; col: number }[] = [];
  for (let idx = 0; idx < rawLines.length; idx++) {
    const line = rawLines[idx];
    let inStr = false;
    let inChr = false;
    let esc = false;

    for (let c = 0; c < line.length; c++) {
      const ch = line[c];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"' && !inChr) { inStr = !inStr; continue; }
      if (ch === "'" && !inStr) { inChr = !inChr; continue; }
      if (inStr || inChr) continue;
      if (ch === '/' && c + 1 < line.length && line[c + 1] === '/') break;

      if (ch === '{' || ch === '(' || ch === '[') {
        stack.push({ char: ch, line: idx + 1, col: c + 1 });
      } else if (ch === '}' || ch === ')' || ch === ']') {
        if (stack.length === 0) {
          return {
            isValid: false,
            line: idx + 1,
            column: c + 1,
            errorMessage: formatGccError('main.cpp', idx + 1, c + 1, `extraneous closing '${ch}'`, line)
          };
        }
        const top = stack.pop()!;
        const expected = top.char === '{' ? '}' : top.char === '(' ? ')' : ']';
        if (ch !== expected) {
          return {
            isValid: false,
            line: idx + 1,
            column: c + 1,
            errorMessage: formatGccError('main.cpp', idx + 1, c + 1, `expected '${expected}' before '${ch}' token`, line)
          };
        }
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    const expected = unclosed.char === '{' ? '}' : unclosed.char === '(' ? ')' : ']';
    const lastLineNum = rawLines.length;
    const lastLineText = rawLines[lastLineNum - 1] || '';
    return {
      isValid: false,
      line: lastLineNum,
      column: lastLineText.length + 1,
      errorMessage: formatGccError('main.cpp', lastLineNum, lastLineText.length + 1, `expected '${expected}' at end of input`, lastLineText)
    };
  }

  // 3. Main function check
  const hasMain = /\b(?:int|void)\s+main\s*\([^)]*\)/.test(code);
  if (!hasMain) {
    return {
      isValid: false,
      errorMessage: GCC_LINKER_ERROR
    };
  }

  // 4. Pre-scan declarations to track valid variable names
  const declaredVars = new Set<string>([
    'cin', 'cout', 'cerr', 'clog', 'endl', 'string', 'vector', 'map', 'set',
    'true', 'false', 'NULL', 'nullptr', 'std', 'pair', 'max', 'min', 'abs', 'sqrt', 'pow'
  ]);

  // Extract function parameters in main(int argc, char* argv[])
  const mainParamMatch = code.match(/main\s*\(([^)]*)\)/);
  if (mainParamMatch && mainParamMatch[1].trim()) {
    const params = mainParamMatch[1].split(',');
    for (const p of params) {
      const pMatch = p.trim().match(/([a-zA-Z_]\w*)$/);
      if (pMatch) declaredVars.add(pMatch[1]);
    }
  }

  // Extract declared variables inside the code
  const declRegex = /\b(?:int|long|short|float|double|char|string|auto|bool|size_t)\s+([^;{\n]+);/g;
  let dMatch;
  while ((dMatch = declRegex.exec(code)) !== null) {
    const list = dMatch[1].split(',');
    for (const item of list) {
      const vMatch = item.trim().match(/^([a-zA-Z_]\w*)/);
      if (vMatch) declaredVars.add(vMatch[1]);
    }
  }

  // Also extract for-loop variable declarations: for (int i = 0; ...
  const forMatches = Array.from(code.matchAll(/for\s*\(\s*(?:int|long|size_t|auto)\s+([a-zA-Z_]\w*)/g));
  for (const fm of forMatches) {
    declaredVars.add(fm[1]);
  }

  // 5. Line-by-line syntax & semicolon validation
  let inMainBody = false;
  let braceDepth = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    const lineNum = i + 1;

    if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('#')) {
      continue;
    }

    if (/\b(?:int|void)\s+main\s*\(/.test(line)) {
      inMainBody = true;
    }

    // Update brace depth
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') {
        braceDepth--;
        if (braceDepth === 0) inMainBody = false;
      }
    }

    // Check invalid operator chains: << <<, >> >>, = = (assignment check)
    if (/<<\s*<</.test(line)) {
      const col = line.indexOf('<<') + 1;
      return {
        isValid: false,
        line: lineNum,
        column: col,
        errorMessage: formatGccError('main.cpp', lineNum, col, "expected primary-expression before '<<' token", rawLines[i])
      };
    }
    if (/>>\s*>>/.test(line)) {
      const col = line.indexOf('>>') + 1;
      return {
        isValid: false,
        line: lineNum,
        column: col,
        errorMessage: formatGccError('main.cpp', lineNum, col, "expected primary-expression before '>>' token", rawLines[i])
      };
    }

    // Check broken type declarations like `int = 5;` or `float ;`
    if (/\b(?:int|long|float|double|char|string|bool)\s*=/.test(line)) {
      const col = line.indexOf('=') + 1;
      return {
        isValid: false,
        line: lineNum,
        column: col,
        errorMessage: formatGccError('main.cpp', lineNum, col, "expected unqualified-id before '=' token", rawLines[i])
      };
    }

    // Check broken cin/cout statements: `cin >> ;` or `cout << ;`
    if (/(?:cin\s*>>|cout\s*<<)\s*;/.test(line)) {
      const col = line.indexOf(';') + 1;
      return {
        isValid: false,
        line: lineNum,
        column: col,
        errorMessage: formatGccError('main.cpp', lineNum, col, "expected primary-expression before ';' token", rawLines[i])
      };
    }

    // Check empty control statements: if () or while ()
    if (/\b(?:if|while)\s*\(\s*\)/.test(line)) {
      const col = line.indexOf('(') + 2;
      return {
        isValid: false,
        line: lineNum,
        column: col,
        errorMessage: formatGccError('main.cpp', lineNum, col, "expected primary-expression before ')' token", rawLines[i])
      };
    }

    // Check missing semicolon on statements inside functions
    if (inMainBody && braceDepth > 0) {
      const isControlStart = /^(?:if|else|for|while|do|switch|case|default)\b/.test(line);
      const isBlockBoundary = line.endsWith('{') || line.endsWith('}') || line.startsWith('{') || line.startsWith('}');
      const isComment = line.startsWith('//');

      // Check if statement should have a semicolon
      const isStatementCandidate =
        /^(?:int|long|float|double|char|string|bool|auto|cin|cout|return|break|continue|[a-zA-Z_]\w*\s*=|[a-zA-Z_]\w*\s*\+\+|[a-zA-Z_]\w*\s*--)/.test(line) ||
        /\b(?:cin\s*>>|cout\s*<<)\b/.test(line);

      if (isStatementCandidate && !isControlStart && !isBlockBoundary && !isComment) {
        if (!line.endsWith(';') && !line.endsWith('{')) {
          // If next line starts with a statement or closing brace, this line definitely missed ';'
          const nextNonEmpty = rawLines.slice(i + 1).find(l => l.trim().length > 0)?.trim() || '}';
          const nextWord = nextNonEmpty.split(/\s+/)[0] || ';';

          return {
            isValid: false,
            line: lineNum,
            column: rawLines[i].length + 1,
            errorMessage: formatGccError('main.cpp', lineNum, rawLines[i].length + 1, `expected ';' before '${nextWord}'`, rawLines[i])
          };
        }
      }

      // Check for undeclared variables in cin >> var
      const cinMatches = Array.from(line.matchAll(/(?:std::)?cin\s*>>\s*([a-zA-Z_]\w*)/g));
      for (const m of cinMatches) {
        const v = m[1];
        if (!declaredVars.has(v)) {
          const col = line.indexOf(v) + 1;
          return {
            isValid: false,
            line: lineNum,
            column: col,
            errorMessage: formatGccError('main.cpp', lineNum, col, `'${v}' was not declared in this scope`, rawLines[i])
          };
        }
      }

      // Check for undeclared variables in simple assignments: varName = ...
      const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*(?:=|\+=|-=|\*=|\/=)/);
      if (assignMatch) {
        const v = assignMatch[1];
        if (!declaredVars.has(v) && !['if', 'for', 'while', 'return'].includes(v)) {
          const col = line.indexOf(v) + 1;
          return {
            isValid: false,
            line: lineNum,
            column: col,
            errorMessage: formatGccError('main.cpp', lineNum, col, `'${v}' was not declared in this scope`, rawLines[i])
          };
        }
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate Java source code
 */
export function validateJava(code: string): CompilerValidationResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: 'Main.java:1: error: class, interface, or enum expected'
    };
  }

  if (!/\b(?:public\s+)?class\s+\w+/.test(code)) {
    return {
      isValid: false,
      errorMessage: 'Main.java:1: error: class, interface, or enum expected\npublic class Main {\n^'
    };
  }

  if (!/\bstatic\s+void\s+main\s*\(\s*String\s*(\[\s*\])?\s+\w+/.test(code) && !/\bstatic\s+void\s+main\s*\(\s*String\s*\.\.\.\s*\w+/.test(code)) {
    return {
      isValid: false,
      errorMessage: 'Error: Main method not found in class Main, please define the main method as:\n   public static void main(String[] args)'
    };
  }

  // Braces matching
  let braceCount = 0;
  for (const ch of code) {
    if (ch === '{') braceCount++;
    if (ch === '}') braceCount--;
    if (braceCount < 0) {
      return {
        isValid: false,
        errorMessage: 'Main.java: error: class, interface, or enum expected (extra closing brace)'
      };
    }
  }
  if (braceCount !== 0) {
    return {
      isValid: false,
      errorMessage: "\x1b[1mMain.java:\x1b[0m \x1b[1;31merror:\x1b[0m reached end of file while parsing (missing '}')"
    };
  }

  // Missing semicolon check
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) continue;
    if (line.includes('System.out.print') || line.startsWith('return ') || /^[a-zA-Z_]\w*\s*=/.test(line)) {
      if (!line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}')) {
        return {
          isValid: false,
          line: i + 1,
          errorMessage: `\x1b[1mMain.java:${i + 1}:\x1b[0m \x1b[1;31merror:\x1b[0m \x1b[1m';' expected\x1b[0m\n    ${line}\n    ${' '.repeat(line.length)}\x1b[1;32m^\x1b[0m`
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate C# source code
 */
export function validateCSharp(code: string): CompilerValidationResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: '\x1b[1mProgram.cs(1,1):\x1b[0m \x1b[1;31merror CS1525:\x1b[0m \x1b[1mInvalid expression term\x1b[0m'
    };
  }

  if (!/\bclass\s+\w+/.test(code)) {
    return {
      isValid: false,
      errorMessage: '\x1b[1mProgram.cs(1,1):\x1b[0m \x1b[1;31merror CS0116:\x1b[0m \x1b[1mA namespace cannot directly contain members such as fields or methods\x1b[0m'
    };
  }

  if (!/\bstatic\s+void\s+Main\s*\(/.test(code)) {
    return {
      isValid: false,
      errorMessage: '\x1b[1mProgram.cs(1,1):\x1b[0m \x1b[1;31merror CS5001:\x1b[0m \x1b[1mProgram does not contain a static \'Main\' method suitable for an entry point\x1b[0m'
    };
  }

  // Missing semicolon check
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('//')) continue;
    if (line.includes('Console.Write') || line.startsWith('return ') || /^[a-zA-Z_]\w*\s*=/.test(line)) {
      if (!line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}')) {
        return {
          isValid: false,
          line: i + 1,
          errorMessage: `\x1b[1mProgram.cs(${i + 1},${line.length + 1}):\x1b[0m \x1b[1;31merror CS1002:\x1b[0m \x1b[1m; expected\x1b[0m`
        };
      }
    }
  }

  return { isValid: true };
}

/**
 * Validate Python source code
 */
export function validatePython(code: string): CompilerValidationResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return { isValid: true };
  }

  const lines = code.split('\n');

  // Check quotes
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.split('#')[0]; // remove comments
    let inSingle = false;
    let inDouble = false;
    let esc = false;

    for (let c = 0; c < stripped.length; c++) {
      const ch = stripped[c];
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === "'" && !inDouble) inSingle = !inSingle;
      if (ch === '"' && !inSingle) inDouble = !inDouble;
    }

    if (inSingle || inDouble) {
      return {
        isValid: false,
        line: i + 1,
        errorMessage: `  File "\x1b[36mmain.py\x1b[0m", line \x1b[33m${i + 1}\x1b[0m\n    ${line.trim()}\n    \x1b[1;32m^\x1b[0m\n\x1b[1;31mSyntaxError:\x1b[0m \x1b[1munterminated string literal (detected at line ${i + 1})\x1b[0m`
      };
    }
  }

  // Check matching parens/brackets
  const stack: { char: string; line: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].split('#')[0];
    for (const ch of line) {
      if (ch === '(' || ch === '[' || ch === '{') stack.push({ char: ch, line: i + 1 });
      else if (ch === ')' || ch === ']' || ch === '}') {
        if (stack.length === 0) {
          return {
            isValid: false,
            line: i + 1,
            errorMessage: `  File "\x1b[36mmain.py\x1b[0m", line \x1b[33m${i + 1}\x1b[0m\n    ${lines[i].trim()}\n    \x1b[1;32m^\x1b[0m\n\x1b[1;31mSyntaxError:\x1b[0m \x1b[1munmatched '${ch}'\x1b[0m`
          };
        }
        const top = stack.pop()!;
        const expected = top.char === '(' ? ')' : top.char === '[' ? ']' : '}';
        if (ch !== expected) {
          return {
            isValid: false,
            line: i + 1,
            errorMessage: `  File "\x1b[36mmain.py\x1b[0m", line \x1b[33m${i + 1}\x1b[0m\n    ${lines[i].trim()}\n    \x1b[1;32m^\x1b[0m\n\x1b[1;31mSyntaxError:\x1b[0m \x1b[1mclosing parenthesis '${ch}' does not match opening parenthesis '${top.char}' on line ${top.line}\x1b[0m`
          };
        }
      }
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    return {
      isValid: false,
      line: unclosed.line,
      errorMessage: `  File "\x1b[36mmain.py\x1b[0m", line \x1b[33m${unclosed.line}\x1b[0m\n    ${lines[unclosed.line - 1].trim()}\n    \x1b[1;32m^\x1b[0m\n\x1b[1;31mSyntaxError:\x1b[0m \x1b[1m'(' was never closed\x1b[0m`
    };
  }

  // Check missing colon on control keywords: if, elif, else, for, while, def, class, try, except, finally
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].split('#')[0].trim();
    if (!line) continue;

    if (/^(?:if|elif|else|for|while|def|class|except|finally)\b/.test(line)) {
      if (!line.endsWith(':')) {
        return {
          isValid: false,
          line: i + 1,
          errorMessage: `  File "\x1b[36mmain.py\x1b[0m", line \x1b[33m${i + 1}\x1b[0m\n    ${line}\n    ${' '.repeat(line.length)}\x1b[1;32m^\x1b[0m\n\x1b[1;31mSyntaxError:\x1b[0m \x1b[1mexpected ':'\x1b[0m`
        };
      }
    }

    if (/^(?:def\s*\(\s*:|def\s*:)/.test(line)) {
      return {
        isValid: false,
        line: i + 1,
        errorMessage: `  File "\x1b[36mmain.py\x1b[0m", line \x1b[33m${i + 1}\x1b[0m\n    ${line}\n    \x1b[1;32m^\x1b[0m\n\x1b[1;31mSyntaxError:\x1b[0m \x1b[1minvalid syntax\x1b[0m`
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate JavaScript / TypeScript source code using Function constructor & parser
 */
export function validateJavaScript(code: string, language: 'javascript' | 'typescript'): CompilerValidationResult {
  const trimmed = code.trim();
  if (!trimmed) return { isValid: true };

  // For JavaScript, directly test parsing with Function constructor
  if (language === 'javascript') {
    try {
      // eslint-disable-next-line no-new-func
      new Function(code);
    } catch (err: any) {
      const msg = err?.message || String(err);
      return {
        isValid: false,
        errorMessage: `\x1b[1;31mSyntaxError:\x1b[0m \x1b[1m${msg}\x1b[0m\n\n\x1b[33m[Compilation failed: Invalid JavaScript syntax]\x1b[0m`
      };
    }
  }

  // Bracket and paren check for both JS and TS
  const stack: { char: string; line: number }[] = [];
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{' || ch === '(' || ch === '[') stack.push({ char: ch, line: i + 1 });
      else if (ch === '}' || ch === ')' || ch === ']') {
        if (stack.length === 0) {
          return {
            isValid: false,
            line: i + 1,
            errorMessage: `\x1b[1mmain.ts:${i + 1}:\x1b[0m \x1b[1;31merror:\x1b[0m \x1b[1mUnexpected closing '${ch}'\x1b[0m`
          };
        }
        const top = stack.pop()!;
        const expected = top.char === '{' ? '}' : top.char === '(' ? ')' : ']';
        if (ch !== expected) {
          return {
            isValid: false,
            line: i + 1,
            errorMessage: `\x1b[1mmain.ts:${i + 1}:\x1b[0m \x1b[1;31merror:\x1b[0m \x1b[1mExpected '${expected}' to match '${top.char}' from line ${top.line}, but found '${ch}'\x1b[0m`
          };
        }
      }
    }
  }

  if (stack.length > 0) {
    const top = stack[stack.length - 1];
    return {
      isValid: false,
      line: top.line,
      errorMessage: `\x1b[1mmain.ts:${top.line}:\x1b[0m \x1b[1;31merror:\x1b[0m \x1b[1mExpected closing bracket for '${top.char}' before end of input\x1b[0m`
    };
  }

  return { isValid: true };
}
