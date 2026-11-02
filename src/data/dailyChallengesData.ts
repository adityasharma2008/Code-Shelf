export interface TestCase {
  id: string;
  name: string;
  inputDescription: string;
  expectedDescription: string;
  // Execution parameters passed to solution function
  args: any[];
  expectedOutput: any;
  isHidden?: boolean;
}

export interface AlgorithmicChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  problemStatement: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  supportedLanguages: Array<'javascript' | 'python' | 'typescript' | 'cpp'>;
  starterTemplates: Record<string, {
    functionName: string;
    code: string;
  }>;
  testCases: TestCase[];
}

export const ALGORITHMIC_CHALLENGES: AlgorithmicChallenge[] = [
  {
    id: 'ch_two_sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hash Table',
    tags: ['Array', 'Hash Table', 'Two Pointers'],
    problemStatement:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer with indices sorted in ascending order.',
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    supportedLanguages: ['javascript', 'python', 'typescript', 'cpp'],
    starterTemplates: {
      javascript: {
        functionName: 'twoSum',
        code: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`
      },
      typescript: {
        functionName: 'twoSum',
        code: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}`
      },
      python: {
        functionName: 'two_sum',
        code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
      },
      cpp: {
        functionName: 'twoSum',
        code: `#include <vector>
#include <unordered_map>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.find(complement) != map.end()) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}`
      }
    },
    testCases: [
      {
        id: 'tc_1',
        name: 'Basic Pair',
        inputDescription: 'nums = [2, 7, 11, 15], target = 9',
        expectedDescription: '[0, 1]',
        args: [[2, 7, 11, 15], 9],
        expectedOutput: [0, 1]
      },
      {
        id: 'tc_2',
        name: 'Intermediate Offset',
        inputDescription: 'nums = [3, 2, 4], target = 6',
        expectedDescription: '[1, 2]',
        args: [[3, 2, 4], 6],
        expectedOutput: [1, 2]
      },
      {
        id: 'tc_3',
        name: 'Duplicate Values (Hidden)',
        inputDescription: 'nums = [3, 3], target = 6',
        expectedDescription: '[0, 1]',
        args: [[3, 3], 6],
        expectedOutput: [0, 1],
        isHidden: true
      }
    ]
  },
  {
    id: 'ch_valid_palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    category: 'Strings & Two Pointers',
    tags: ['String', 'Two Pointers'],
    problemStatement:
      'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: 'true',
        explanation: '"amanaplanacanalpanama" is a palindrome.'
      },
      {
        input: 's = "race a car"',
        output: 'false',
        explanation: '"raceacar" is not a palindrome.'
      },
      {
        input: 's = " "',
        output: 'true',
        explanation: 's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.'
      }
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.'
    ],
    supportedLanguages: ['javascript', 'python', 'typescript', 'cpp'],
    starterTemplates: {
      javascript: {
        functionName: 'isPalindrome',
        code: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0;
    let right = cleaned.length - 1;
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) return false;
        left++;
        right--;
    }
    return true;
}`
      },
      typescript: {
        functionName: 'isPalindrome',
        code: `function isPalindrome(s: string): boolean {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0;
    let right = cleaned.length - 1;
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) return false;
        left++;
        right--;
    }
    return true;
}`
      },
      python: {
        functionName: 'is_palindrome',
        code: `def is_palindrome(s: str) -> bool:
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`
      },
      cpp: {
        functionName: 'isPalindrome',
        code: `#include <string>
#include <cctype>

bool isPalindrome(std::string s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) return false;
        left++;
        right--;
    }
    return true;
}`
      }
    },
    testCases: [
      {
        id: 'tc_1',
        name: 'Panama Canal Phrase',
        inputDescription: 's = "A man, a plan, a canal: Panama"',
        expectedDescription: 'true',
        args: ['A man, a plan, a canal: Panama'],
        expectedOutput: true
      },
      {
        id: 'tc_2',
        name: 'Asymmetric Car',
        inputDescription: 's = "race a car"',
        expectedDescription: 'false',
        args: ['race a car'],
        expectedOutput: false
      },
      {
        id: 'tc_3',
        name: 'Empty and Spaces (Hidden)',
        inputDescription: 's = "   "',
        expectedDescription: 'true',
        args: ['   '],
        expectedOutput: true,
        isHidden: true
      }
    ]
  },
  {
    id: 'ch_contains_duplicate',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    category: 'Arrays & Hash Set',
    tags: ['Array', 'Hash Table', 'Sorting'],
    problemStatement:
      'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    examples: [
      {
        input: 'nums = [1, 2, 3, 1]',
        output: 'true'
      },
      {
        input: 'nums = [1, 2, 3, 4]',
        output: 'false'
      },
      {
        input: 'nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]',
        output: 'true'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9'
    ],
    supportedLanguages: ['javascript', 'python', 'typescript'],
    starterTemplates: {
      javascript: {
        functionName: 'containsDuplicate',
        code: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
    const set = new Set();
    for (const n of nums) {
        if (set.has(n)) return true;
        set.add(n);
    }
    return false;
}`
      },
      typescript: {
        functionName: 'containsDuplicate',
        code: `function containsDuplicate(nums: number[]): boolean {
    const set = new Set<number>();
    for (const n of nums) {
        if (set.has(n)) return true;
        set.add(n);
    }
    return false;
}`
      },
      python: {
        functionName: 'contains_duplicate',
        code: `def contains_duplicate(nums):
    return len(nums) != len(set(nums))`
      }
    },
    testCases: [
      {
        id: 'tc_1',
        name: 'Basic Duplicate',
        inputDescription: 'nums = [1, 2, 3, 1]',
        expectedDescription: 'true',
        args: [[1, 2, 3, 1]],
        expectedOutput: true
      },
      {
        id: 'tc_2',
        name: 'All Distinct',
        inputDescription: 'nums = [1, 2, 3, 4]',
        expectedDescription: 'false',
        args: [[1, 2, 3, 4]],
        expectedOutput: false
      },
      {
        id: 'tc_3',
        name: 'Multi-Repeats (Hidden)',
        inputDescription: 'nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]',
        expectedDescription: 'true',
        args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]],
        expectedOutput: true,
        isHidden: true
      }
    ]
  },
  {
    id: 'ch_maximum_subarray',
    title: "Maximum Subarray (Kadane's Algorithm)",
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    problemStatement:
      'Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.',
    examples: [
      {
        input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.'
      },
      {
        input: 'nums = [1]',
        output: '1',
        explanation: 'The subarray [1] has the largest sum 1.'
      },
      {
        input: 'nums = [5, 4, -1, 7, 8]',
        output: '23',
        explanation: 'The subarray [5, 4, -1, 7, 8] has the largest sum 23.'
      }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    supportedLanguages: ['javascript', 'python', 'typescript'],
    starterTemplates: {
      javascript: {
        functionName: 'maxSubArray',
        code: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    let currentSum = nums[0];
    let maxSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`
      },
      typescript: {
        functionName: 'maxSubArray',
        code: `function maxSubArray(nums: number[]): number {
    let currentSum = nums[0];
    let maxSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`
      },
      python: {
        functionName: 'max_sub_array',
        code: `def max_sub_array(nums):
    current_sum = nums[0]
    max_sum = nums[0]
    for x in nums[1:]:
        current_sum = max(x, current_sum + x)
        max_sum = max(max_sum, current_sum)
    return max_sum`
      }
    },
    testCases: [
      {
        id: 'tc_1',
        name: 'Mixed Positive & Negative',
        inputDescription: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        expectedDescription: '6',
        args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        expectedOutput: 6
      },
      {
        id: 'tc_2',
        name: 'Single Element',
        inputDescription: 'nums = [1]',
        expectedDescription: '1',
        args: [[1]],
        expectedOutput: 1
      },
      {
        id: 'tc_3',
        name: 'All Positives (Hidden)',
        inputDescription: 'nums = [5, 4, -1, 7, 8]',
        expectedDescription: '23',
        args: [[5, 4, -1, 7, 8]],
        expectedOutput: 23,
        isHidden: true
      }
    ]
  },
  {
    id: 'ch_valid_parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    tags: ['String', 'Stack'],
    problemStatement:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only "()[]{}"'
    ],
    supportedLanguages: ['javascript', 'python', 'typescript'],
    starterTemplates: {
      javascript: {
        functionName: 'isValid',
        code: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else if (pairs[char]) {
            if (stack.pop() !== pairs[char]) return false;
        }
    }
    return stack.length === 0;
}`
      },
      typescript: {
        functionName: 'isValid',
        code: `function isValid(s: string): boolean {
    const stack: string[] = [];
    const pairs: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else if (pairs[char]) {
            if (stack.pop() !== pairs[char]) return false;
        }
    }
    return stack.length === 0;
}`
      },
      python: {
        functionName: 'is_valid',
        code: `def is_valid(s: str) -> bool:
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in pairs.values():
            stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return False
    return len(stack) == 0`
      }
    },
    testCases: [
      {
        id: 'tc_1',
        name: 'Simple Parentheses',
        inputDescription: 's = "()"',
        expectedDescription: 'true',
        args: ['()'],
        expectedOutput: true
      },
      {
        id: 'tc_2',
        name: 'Multi-Type Sequence',
        inputDescription: 's = "()[]{}"',
        expectedDescription: 'true',
        args: ['()[]{}'],
        expectedOutput: true
      },
      {
        id: 'tc_3',
        name: 'Mismatched Types (Hidden)',
        inputDescription: 's = "(]"',
        expectedDescription: 'false',
        args: ['(]'],
        expectedOutput: false,
        isHidden: true
      }
    ]
  },
  {
    id: 'ch_reverse_words',
    title: 'Reverse Words in a String',
    difficulty: 'Medium',
    category: 'Strings',
    tags: ['Two Pointers', 'String'],
    problemStatement:
      'Given an input string s, reverse the order of the words.\n\nA word is defined as a sequence of non-space characters. The words in s will be separated by at least one space.\n\nReturn a string of the words in reverse order concatenated by a single space.\n\nNote that s may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words.',
    examples: [
      {
        input: 's = "the sky is blue"',
        output: '"blue is sky the"'
      },
      {
        input: 's = "  hello world  "',
        output: '"world hello"',
        explanation: 'Your reversed string should not contain leading or trailing spaces.'
      },
      {
        input: 's = "a good   example"',
        output: '"example good a"',
        explanation: 'You need to reduce multiple spaces between two words to a single space in the reversed string.'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's contains English letters, digits, and spaces " ".'
    ],
    supportedLanguages: ['javascript', 'python', 'typescript'],
    starterTemplates: {
      javascript: {
        functionName: 'reverseWords',
        code: `/**
 * @param {string} s
 * @return {string}
 */
function reverseWords(s) {
    return s.trim().split(/\\s+/).reverse().join(' ');
}`
      },
      typescript: {
        functionName: 'reverseWords',
        code: `function reverseWords(s: string): string {
    return s.trim().split(/\\s+/).reverse().join(' ');
}`
      },
      python: {
        functionName: 'reverse_words',
        code: `def reverse_words(s: str) -> str:
    return ' '.join(reversed(s.split()))`
      }
    },
    testCases: [
      {
        id: 'tc_1',
        name: 'Standard Sentence',
        inputDescription: 's = "the sky is blue"',
        expectedDescription: '"blue is sky the"',
        args: ['the sky is blue'],
        expectedOutput: 'blue is sky the'
      },
      {
        id: 'tc_2',
        name: 'Leading and Trailing Spaces',
        inputDescription: 's = "  hello world  "',
        expectedDescription: '"world hello"',
        args: ['  hello world  '],
        expectedOutput: 'world hello'
      },
      {
        id: 'tc_3',
        name: 'Irregular Multi-Spaces (Hidden)',
        inputDescription: 's = "a good   example"',
        expectedDescription: '"example good a"',
        args: ['a good   example'],
        expectedOutput: 'example good a',
        isHidden: true
      }
    ]
  },
  {
    id: 'ch_single_number',
    title: 'Single Number',
    difficulty: 'Easy',
    category: 'Bit Manipulation',
    tags: ['Array', 'Bit Manipulation'],
    problemStatement:
      'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity O(n) and use only constant extra space O(1).',
    examples: [
      {
        input: 'nums = [2, 2, 1]',
        output: '1'
      },
      {
        input: 'nums = [4, 1, 2, 1, 2]',
        output: '4'
      },
      {
        input: 'nums = [1]',
        output: '1'
      }
    ],
    constraints: [
      '1 <= nums.length <= 3 * 10^4',
      '-3 * 10^4 <= nums[i] <= 3 * 10^4',
      'Each element in the array appears twice except for one element which appears only once.'
    ],
    supportedLanguages: ['javascript', 'python', 'typescript'],
    starterTemplates: {
      javascript: {
        functionName: 'singleNumber',
        code: `/**
 * @param {number[]} nums
 * @return {number}
 */
function singleNumber(nums) {
    let result = 0;
    for (const n of nums) {
        result ^= n;
    }
    return result;
}`
      },
      typescript: {
        functionName: 'singleNumber',
        code: `function singleNumber(nums: number[]): number {
    let result = 0;
    for (const n of nums) {
        result ^= n;
    }
    return result;
}`
      },
      python: {
        functionName: 'single_number',
        code: `def single_number(nums):
    res = 0
    for n in nums:
        res ^= n
    return res`
      }
    },
    testCases: [
      {
        id: 'tc_1',
        name: 'Short Array',
        inputDescription: 'nums = [2, 2, 1]',
        expectedDescription: '1',
        args: [[2, 2, 1]],
        expectedOutput: 1
      },
      {
        id: 'tc_2',
        name: 'Five Elements',
        inputDescription: 'nums = [4, 1, 2, 1, 2]',
        expectedDescription: '4',
        args: [[4, 1, 2, 1, 2]],
        expectedOutput: 4
      },
      {
        id: 'tc_3',
        name: 'Single Unit (Hidden)',
        inputDescription: 'nums = [1]',
        expectedDescription: '1',
        args: [[1]],
        expectedOutput: 1,
        isHidden: true
      }
    ]
  }
];

/**
 * Returns today's deterministic daily challenge based on current date YYYY-MM-DD.
 * Every user receives the exact same challenge for the entire day.
 */
export function getTodayAlgorithmicChallenge(dateStr?: string): { challenge: AlgorithmicChallenge; dateStr: string } {
  const today = dateStr || new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % ALGORITHMIC_CHALLENGES.length;
  return {
    challenge: ALGORITHMIC_CHALLENGES[idx],
    dateStr: today
  };
}
