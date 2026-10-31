# CodeShelf Firestore Security Specification

## 1. Data Invariants
1. **Identity & Ownership Invariant**: A snippet cannot be created or deleted by an unverified identity claiming another user's UID or email (`userId == request.auth.uid`).
2. **Immutability of Key Metadata**: Once a snippet is created, its `id`, `userId`, and `createdAt` timestamp cannot be altered by any update operation.
3. **Array & Volumetric Bounds**: Tag collections must never exceed 10 items, and snippet code strings cannot exceed 50,000 characters.
4. **Action-Based Restricted Mutations**: Community engagement counters (`likes`, `views`, `bookmarksCount`) can only be incremented/decremented according to strict numeric diffs and cannot alter snippet content. Content updates can only be executed by the authenticated creator.
5. **Private Profile Isolation**: User profiles in `/users/{userId}` are strictly isolated and readable/writable solely by the authenticated owner (`request.auth.uid == userId`) or admin.

---

## 2. The "Dirty Dozen" Payloads (Designed to Fail)
1. **DD-1: Identity Spoofing (Create)** - Unauthenticated client trying to publish a snippet under someone else's UID.
2. **DD-2: Unverified Email Write** - An authenticated user whose `email_verified` is `false` attempting to write to `/snippets`.
3. **DD-3: Shadow Field Injection** - Adding arbitrary `adminBypass: true` or `verifiedStatus: true` fields during snippet creation.
4. **DD-4: Resource Poisoning (Oversized Code)** - Attempting to write a 2MB payload into `code` field.
5. **DD-5: Tag Array Exhaustion** - Attempting to write 500 tags into the `tags` array.
6. **DD-6: Path ID Injection** - Attempting to use malicious path variable `../escaped/id` or oversized non-alphanumeric ID.
7. **DD-7: Immutable Field Tampering** - Updating `createdAt` or changing `userId` to take over ownership.
8. **DD-8: Counter Inflation Exploit** - Attempting to update `likes` by +1,000,000 in a single update call.
9. **DD-9: Arbitrary Content Alteration by Non-Owner** - User B attempting to edit User A's snippet code.
10. **DD-10: Cross-User Profile Read** - User A attempting to read `/users/{userB}` PII profile.
11. **DD-11: Cross-User Profile Write** - User A attempting to write `/users/{userB}` profile.
12. **DD-12: Blanket List Scrape without Collection Constraints** - Attempting to execute unbounded collection group write or unauthenticated deletion.
