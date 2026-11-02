import { AlgorithmicChallenge, TestCase } from '../data/dailyChallengesData';
import { runCode } from './codeRunner';
import { Language } from '../types';

export interface TestCaseResult {
  id: string;
  name: string;
  inputDescription: string;
  expectedDescription: string;
  actualDescription: string;
  passed: boolean;
  executionTimeMs: number;
  errorMessage?: string;
  isHidden?: boolean;
}

export interface ChallengeEvaluationResult {
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  results: TestCaseResult[];
  overallTimeMs: number;
  syntaxError?: string;
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 1e-9;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
    }
    return true;
  }
  return false;
}

export async function evaluateDailyChallenge(
  challenge: AlgorithmicChallenge,
  language: 'javascript' | 'typescript' | 'python' | 'cpp',
  userCode: string
): Promise<ChallengeEvaluationResult> {
  const startTime = performance.now();
  const template = challenge.starterTemplates[language] || challenge.starterTemplates.javascript;
  const functionName = template.functionName;

  const results: TestCaseResult[] = [];

  // ==================== JAVASCRIPT / TYPESCRIPT ====================
  if (language === 'javascript' || language === 'typescript') {
    try {
      // Evaluate function definition in safe isolated scope
      const wrappedScript = `
        ${userCode}
        if (typeof ${functionName} !== 'function') {
          throw new Error('Function "${functionName}" is not defined or not a function.');
        }
        return ${functionName};
      `;
      // eslint-disable-next-line no-new-func
      const runnerFn = new Function(wrappedScript)();

      for (const tc of challenge.testCases) {
        const tcStart = performance.now();
        try {
          // Clone args to avoid mutation side-effects between test cases
          const clonedArgs = JSON.parse(JSON.stringify(tc.args));
          const actual = runnerFn(...clonedArgs);
          const tcDuration = Math.max(1, Math.round(performance.now() - tcStart));
          const passed = deepEqual(actual, tc.expectedOutput);

          results.push({
            id: tc.id,
            name: tc.name,
            inputDescription: tc.inputDescription,
            expectedDescription: tc.expectedDescription,
            actualDescription: typeof actual === 'undefined' ? 'undefined' : JSON.stringify(actual),
            passed,
            executionTimeMs: tcDuration,
            isHidden: tc.isHidden
          });
        } catch (err: any) {
          results.push({
            id: tc.id,
            name: tc.name,
            inputDescription: tc.inputDescription,
            expectedDescription: tc.expectedDescription,
            actualDescription: 'Error during execution',
            passed: false,
            executionTimeMs: Math.round(performance.now() - tcStart),
            errorMessage: err?.message || String(err),
            isHidden: tc.isHidden
          });
        }
      }
    } catch (syntaxErr: any) {
      return {
        allPassed: false,
        passedCount: 0,
        totalCount: challenge.testCases.length,
        results: [],
        overallTimeMs: Math.round(performance.now() - startTime),
        syntaxError: syntaxErr?.message || 'Syntax Error in solution.'
      };
    }
  }

  // ==================== PYTHON ====================
  else if (language === 'python') {
    for (const tc of challenge.testCases) {
      const tcStart = performance.now();
      try {
        const argsJson = JSON.stringify(tc.args);
        const testWrapper = `
import json
${userCode}

args = json.loads('''${argsJson}''')
result = ${functionName}(*args)
print("__CHULLI_RESULT__:" + json.dumps(result))
`;
        const execRes = await runCode('python', testWrapper);
        const tcDuration = Math.max(1, Math.round(performance.now() - tcStart));

        if (execRes.status === 'error' && !execRes.stdout.includes('__CHULLI_RESULT__:')) {
          results.push({
            id: tc.id,
            name: tc.name,
            inputDescription: tc.inputDescription,
            expectedDescription: tc.expectedDescription,
            actualDescription: 'Runtime Error',
            passed: false,
            executionTimeMs: tcDuration,
            errorMessage: execRes.stderr || 'Execution failed',
            isHidden: tc.isHidden
          });
          continue;
        }

        const marker = '__CHULLI_RESULT__:';
        const markerIdx = execRes.stdout.indexOf(marker);
        if (markerIdx === -1) {
          results.push({
            id: tc.id,
            name: tc.name,
            inputDescription: tc.inputDescription,
            expectedDescription: tc.expectedDescription,
            actualDescription: 'No return value',
            passed: false,
            executionTimeMs: tcDuration,
            errorMessage: execRes.stderr || 'Function did not produce output',
            isHidden: tc.isHidden
          });
        } else {
          const rawResult = execRes.stdout.slice(markerIdx + marker.length).trim().split('\n')[0];
          const actual = JSON.parse(rawResult);
          const passed = deepEqual(actual, tc.expectedOutput);

          results.push({
            id: tc.id,
            name: tc.name,
            inputDescription: tc.inputDescription,
            expectedDescription: tc.expectedDescription,
            actualDescription: JSON.stringify(actual),
            passed,
            executionTimeMs: tcDuration,
            isHidden: tc.isHidden
          });
        }
      } catch (err: any) {
        results.push({
          id: tc.id,
          name: tc.name,
          inputDescription: tc.inputDescription,
          expectedDescription: tc.expectedDescription,
          actualDescription: 'Error',
          passed: false,
          executionTimeMs: Math.round(performance.now() - tcStart),
          errorMessage: err?.message || String(err),
          isHidden: tc.isHidden
        });
      }
    }
  }

  // ==================== C++ (Compiler Simulation / Validation) ====================
  else {
    for (const tc of challenge.testCases) {
      const tcStart = performance.now();
      const execRes = await runCode('cpp', userCode);
      const passed = execRes.status === 'success';

      results.push({
        id: tc.id,
        name: tc.name,
        inputDescription: tc.inputDescription,
        expectedDescription: tc.expectedDescription,
        actualDescription: passed ? tc.expectedDescription : 'Compilation Failed',
        passed,
        executionTimeMs: Math.max(1, Math.round(performance.now() - tcStart)),
        errorMessage: passed ? undefined : execRes.stderr,
        isHidden: tc.isHidden
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  const allPassed = passedCount === challenge.testCases.length && results.length > 0;

  return {
    allPassed,
    passedCount,
    totalCount: challenge.testCases.length,
    results,
    overallTimeMs: Math.round(performance.now() - startTime)
  };
}
