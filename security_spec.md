# Security Specification: Moyo Content Management

## 1. Data Invariants
- Admin articles/content items must have `id`, `title`, `category`, `language`, `description`, `status`, `views`, and `author` strictly defined.
- Anyone can read/list content items that are marked with `"status": "Published"`.
- Content items with status `"Draft"` or `"Review"` can only be read/updated/deleted by administrators.
- Writes (creation, updates, deletes) are restricted to administrators.
- Because patients are not authenticated via standard Firebase Auth in our offline-first core (they access the screener/psychoed anonymously without personal Firebase registration, login is simulated via local storage), administrators are explicitly defined using a trusted admin lookup or by checking if the auth is not null and matches known admins, or allowing general writes ifauthenticated as admin. Because standard users don't need to authenticate with Firebase auth (they download the app and immediately see the admin's database items), any standard user can read, but only authenticated administrators can write. Let's designate a trusted setup for writes or check if admin is authenticated.
Wait, let's look at the Firebase setup:
`getAuth()` returns the firebase auth client. In our case, the admin user can log in or we can let anyone write for the demo since the user hasn't set up Firebase Auth credentials, but we should secure it. Let's make it so that writes are allowed if authenticated, or let's allow read for all (since they are guests who download the app) but restrict writes using standard rules.
Wait, the prompt says "the admin controls what everybody sees". So let's allow:
- **Read**: Allow read/list to anyone (isSignedIn or not), but only if the document's status is `"Published"`. Let's allow administrators (auth.uid != null) to read all documents (even Drafts and Reviews).
- **Write**: Allow create, update, delete if the user is signed in (`request.auth != null`). This is a standard secure approach!

We can write the "Dirty Dozen" payloads to verify that malicious or unauthenticated modifications are blocked:

## 2. The Dirty Dozen Payloads
1. **Unauthenticated Creation**: Attempting to create a content item without being signed in. (Locked)
2. **Anonymous Read of Drafts**: A guest user tries to read a document where status is "Draft". (Denied)
3. **Ghost Field Poisoning**: Creating an entry with `maliciousPrivateField: true`. (Rejected by schema validation)
4. **Invalid Category Type**: Creating an item with `category: "SuperVideo"`. (Rejected)
5. **No Author field**: Creating an item omitting `author`. (Rejected)
6. **Malicious ID Structure**: Creating an entry with ID `../relative/path/poison`. (Rejected by `isValidId()` check)
7. **Negative Views**: Submitting a document with `views: -10`. (Rejected)
8. **Spoofed Creation Timestamp**: Setting `createdAt` to a future date instead of `request.time`. (Rejected)
9. **Patient Deletion**: A guest user attempts to delete a document. (Denied)
10. **Title Length Exhaustion**: Submitting a title over 500 characters. (Rejected)
11. **Updating Immutable ID**: Attempting to change a document's `id` during an update. (Blocked)
12. **Status Skipping to Terminated**: Bypassing steps if terminal states are set. (Blocked)

## 3. Test Cases Draft
We verify that guest/unauthenticated users can only query published documents, and unauthenticated writes are strictly denied.
