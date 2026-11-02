import fs from 'fs';
import path from 'path';

/**
 * Automated Test Suite: Verification of Zero Fake, AI-Generated, or Seeded User Data
 * 
 * Verifies:
 * 1. Startup creates 0 records in database / localStorage.
 * 2. Empty database produces empty states (not errors or fallback mock items).
 * 3. Leaderboard strictly excludes unregistered users and users with 0 XP.
 * 4. No fake user, discussion, or snippet fallback arrays exist in source code.
 */

// Simple in-memory mock for localStorage in Node environment
const mockStorage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = String(val); },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {
    for (const k of Object.keys(mockStorage)) delete mockStorage[k];
  }
};
(global as any).window = {
  dispatchEvent: () => true
};

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ''}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('ChulliCode Data Integrity & Zero-Fake Verification');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // TEST 1: Startup creates 0 records in localStorage
  // ----------------------------------------------------
  console.log('Test 1: Clean Startup Verification');
  mockStorage['chullicode_discussions'] = '';
  mockStorage['chullicode_discussion_replies'] = '';
  mockStorage['chullicode_snippet_comments'] = '';
  delete mockStorage['chullicode_discussions'];
  delete mockStorage['chullicode_discussion_replies'];
  delete mockStorage['chullicode_snippet_comments'];

  const { communityService } = await import('../src/services/communityService');
  const { gamificationService } = await import('../src/services/gamificationService');
  const { snippetStorage } = await import('../src/services/snippetStorage');

  const discussionsOnStartup = communityService.getAllDiscussions();
  assert(
    discussionsOnStartup.length === 0,
    'Startup creates 0 discussions in storage',
    `Found ${discussionsOnStartup.length} discussions`
  );

  const commentsOnStartup = communityService.getCommentsForSnippet('any-snippet-id');
  assert(
    commentsOnStartup.length === 0,
    'Startup creates 0 comments in storage',
    `Found ${commentsOnStartup.length} comments`
  );

  // ----------------------------------------------------
  // TEST 2: Empty database produces empty states (no throw)
  // ----------------------------------------------------
  console.log('\nTest 2: Empty Database Yields Empty States (No Throw)');
  let discResult: any = null;
  let errorCaught = false;
  try {
    discResult = communityService.getAllDiscussions();
  } catch (e) {
    errorCaught = true;
  }
  assert(!errorCaught && Array.isArray(discResult) && discResult.length === 0, 'getAllDiscussions() returns empty array without throwing');

  const snippetsResult = snippetStorage.getAllSnippets();
  assert(Array.isArray(snippetsResult) && snippetsResult.length === 0, 'getAllSnippets() returns empty array without seeded snippets');

  // ----------------------------------------------------
  // TEST 3: Leaderboard excludes unregistered users and 0 XP
  // ----------------------------------------------------
  console.log('\nTest 3: Leaderboard Integrity');
  // With 0 users or 0 XP:
  const emptyLeaderboard = gamificationService.getRealLeaderboard();
  assert(
    Array.isArray(emptyLeaderboard) && emptyLeaderboard.length === 0,
    'Leaderboard is empty when no registered user has earned XP (> 0)',
    `Returned ${emptyLeaderboard.length} users`
  );

  // Ensure no fictional competitors (e.g., Aarav, Priya, Rahul) are injected:
  const fictionalNames = ['Aarav Kumar', 'Priya Sharma', 'Rahul Verma', 'Vikram Patel', 'Sneha Roy'];
  const hasFictional = emptyLeaderboard.some(u => fictionalNames.includes(u.name));
  assert(!hasFictional, 'Leaderboard does not contain fabricated competitor accounts');

  // ----------------------------------------------------
  // TEST 4: Source code scan for prohibited fake arrays
  // ----------------------------------------------------
  console.log('\nTest 4: Static Codebase Audit for Seed / Fake Arrays');
  const srcDir = path.resolve(process.cwd(), 'src');

  function scanDir(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath, fileList);
      } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
        fileList.push(fullPath);
      }
    }
    return fileList;
  }

  const allSrcFiles = scanDir(srcDir);
  let hasSeedDiscussionsConst = false;
  let hasSeedRepliesConst = false;

  for (const filePath of allSrcFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Check that SEED_DISCUSSIONS or SEED_REPLIES definitions do NOT exist
    if (content.includes('const SEED_DISCUSSIONS') || content.includes('SEED_DISCUSSIONS = [')) {
      hasSeedDiscussionsConst = true;
    }
    if (content.includes('const SEED_REPLIES') || content.includes('SEED_REPLIES = [')) {
      hasSeedRepliesConst = true;
    }
  }

  assert(!hasSeedDiscussionsConst, 'No SEED_DISCUSSIONS mock array found in src/');
  assert(!hasSeedRepliesConst, 'No SEED_REPLIES mock array found in src/');

  // ----------------------------------------------------
  // TEST 5: Verify exact requested empty state text in UI components
  // ----------------------------------------------------
  console.log('\nTest 5: UI Empty State Copy Verification');
  const communityViewPath = path.join(srcDir, 'views/CommunityView.tsx');
  const libraryViewPath = path.join(srcDir, 'views/LibraryView.tsx');
  const savedViewPath = path.join(srcDir, 'views/SavedView.tsx');
  const profileViewPath = path.join(srcDir, 'views/ProfileView.tsx');
  const achievementsModalPath = path.join(srcDir, 'components/AchievementsModal.tsx');

  const communityContent = fs.readFileSync(communityViewPath, 'utf-8');
  assert(
    communityContent.includes('No discussions yet. Start the first conversation.'),
    'CommunityView contains exact empty state: "No discussions yet. Start the first conversation."'
  );

  const libraryContent = fs.readFileSync(libraryViewPath, 'utf-8');
  assert(
    libraryContent.includes('No snippets published yet. Share your first code snippet.'),
    'LibraryView contains exact empty state: "No snippets published yet. Share your first code snippet."'
  );

  const savedContent = fs.readFileSync(savedViewPath, 'utf-8');
  assert(
    savedContent.includes('Your bookmarks will appear here when you save useful code.'),
    'SavedView contains exact empty state: "Your bookmarks will appear here when you save useful code."'
  );

  const profileContent = fs.readFileSync(profileViewPath, 'utf-8');
  assert(
    profileContent.includes("This developer hasn't published any snippets yet."),
    'ProfileView contains exact empty state: "This developer hasn\'t published any snippets yet."'
  );

  const achievementsContent = fs.readFileSync(achievementsModalPath, 'utf-8');
  assert(
    achievementsContent.includes('No leaderboard entries yet.') &&
    achievementsContent.includes('Complete a lesson or solve a coding challenge to earn your first XP.'),
    'AchievementsModal contains exact empty state: "No leaderboard entries yet."'
  );

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passedTests}/${totalTests} tests passed`);
  console.log('----------------------------------------------------');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
  process.exit(0);
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
