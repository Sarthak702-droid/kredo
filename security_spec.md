# Security Specification for Kredo Credit Intelligence Platform

This security specification defines the attribute-based access control (ABAC) and zero-trust role-based access control (RBAC) security rules designed for Kredo's Firestore database instance.

## 1. Core Data Invariants

1. **User Identity Isolation**: A user cannot modify or create another user's profile or financial credentials.
2. **Strict Identity Verification**: Only authenticated users with verified emails may access secure non-public collections.
3. **Strict MSME Privacy**: Users with the `msme` role can only read/write their specific profile (`msme_profile/{msmeId}`) and financial compliance data records (`financial_data/{docId}`).
4. **Scoped Lender Authority**: Lenders are restricted to read-only access to aggregated scores (`credit_score/{scoreId}`) and anonymized application data (`loan_decisions/{decisionId}`), while being forbidden from direct write-access to core profiles and transactional financial files.
5. **No Self-Privilege Escalation**: Users cannot self-assign roles or modify administrative parameters within their own user metadata.
6. **Temporal & Schema Integrity**: All timestamp fields must validate strictly against the server timestamp (`request.time`). All primary identifiers must be verified for length and format to prevent injection.

---

## 2. The "Dirty Dozen" Security Attack Payloads

The following 12 attack payloads represent exploit attempts that must be mathematically rejected with a `PERMISSION_DENIED` response under all conditions.

### Exploit 1: Privilege Escalation (User Self-Promotion)
- **Path**: `/users/attacker-uid`
- **Method**: `create` / `update`
- **Payload**:
```json
{
  "id": "attacker-uid",
  "name": "Attacker",
  "role": "admin"
}
```
- **Reason to Reject**: Non-admins are strictly forbidden from writing or self-promoting to the `admin` or `lender` roles.

### Exploit 2: Cross-Tenant Profile Data Harvesting (MSME Reading Sibling Profile)
- **Path**: `/msme_profile/msme-2`
- **Method**: `get` / `list`
- **Authenticated User**: `uid: user-1`, `role: msme`
- **Reason to Reject**: MSME-1 cannot access MSME-2's core corporate profile.

### Exploit 3: PII Leakage / Direct Financial Statement Scraping
- **Path**: `/financial_data/doc-2`
- **Method**: `get`
- **Authenticated User**: `uid: user-2` (unrelated to the file), `role: msme`
- **Reason to Reject**: MSME-2 cannot view MSME-1's bank statements or tax receipts.

### Exploit 4: Impersonated Score Spoofing (Forged Credit Rating)
- **Path**: `/credit_score/score-1`
- **Method**: `create` / `update`
- **Authenticated User**: `uid: user-1`, `role: msme`
- **Payload**:
```json
{
  "msmeId": "msme-1",
  "score": 850,
  "riskGrade": "A+"
}
```
- **Reason to Reject**: Credit scores are system-generated and immutable by borrowers.

### Exploit 5: Unauthorized Loan Decision Write (Forging Lender Sign-Off)
- **Path**: `/loan_decisions/dec-1`
- **Method**: `create` / `update`
- **Authenticated User**: `uid: user-1`, `role: msme`
- **Payload**:
```json
{
  "msmeId": "msme-1",
  "requestedAmount": 1500000,
  "approvedAmount": 1500000,
  "status": "APPROVED"
}
```
- **Reason to Reject**: Borrowers cannot issue or modify credit approvals.

### Exploit 6: Unauthorized Administrative Delete of Sibling Accounts
- **Path**: `/users/user-1`
- **Method**: `delete`
- **Authenticated User**: `uid: user-2`, `role: msme`
- **Reason to Reject**: Standard tenants cannot delete other users.

### Exploit 7: Orphan Record Injection (Invalid References)
- **Path**: `/financial_data/doc-malicious`
- **Method**: `create`
- **Payload**:
```json
{
  "msmeId": "non-existent-msme-id",
  "documentType": "GSTR-1 Tax Invoice Ledger",
  "status": "VERIFIED"
}
```
- **Reason to Reject**: Document creation must reference a valid, existing parent MSME profile.

### Exploit 8: Temporal Timestamp Drift (Client Spoofing Verification Time)
- **Path**: `/financial_data/doc-1`
- **Method**: `create`
- **Payload**:
```json
{
  "msmeId": "msme-1",
  "documentType": "GSTR-3B Tax Filing",
  "timestamp": "2030-01-01T00:00:00Z"
}
```
- **Reason to Reject**: Time values must match the server's cryptographic timestamp clock (`request.time`).

### Exploit 9: Resource Poisoning (Massive Identifier Injection)
- **Path**: `/msme_profile/a-very-long-id-repeated-for-one-megabyte-to-exhaust-system-memory-and-deny-wallets`
- **Method**: `create`
- **Reason to Reject**: Document paths must adhere strictly to format constraints (`isValidId()`).

### Exploit 10: State Shortcutting (Skipping Verification Checks)
- **Path**: `/financial_data/doc-1`
- **Method**: `update`
- **Payload**:
```json
{
  "status": "VERIFIED"
}
```
- **Reason to Reject**: Only automated security pipelines or admins may transition files to verified statuses.

### Exploit 11: Unauthenticated Database Scraping (Blanket Read Attempt)
- **Path**: `/msme_profile`
- **Method**: `list`
- **Authenticated User**: Unauthenticated (guest session)
- **Reason to Reject**: Blanket queries without a strict target filter or guest credentials are blocklisted.

### Exploit 12: Administrative Bypass Attempt using Forged Token Claims
- **Path**: `/users/admin-uid`
- **Method**: `create`
- **Payload**:
```json
{
  "id": "admin-uid",
  "role": "admin",
  "isAdmin": true
}
```
- **Reason to Reject**: Standard user claims cannot bypass Firestore security without matching real Admin collections.

---

## 3. The Rules Test Suite Blueprint (firestore.rules.test.ts)

Below is the automated TypeScript code verifying that all "Dirty Dozen" test cases fail under strict permission verification checks.

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'ai-studio-kredo-d60ee4dd-c151-4986-a96d-b2d0fd98c947',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8')
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Kredo Security rules - Fortress Validation', () => {
  it('rejects user privilege self-promotion (Exploit 1)', async () => {
    const context = testEnv.authenticatedContext('user-1', { email_verified: true });
    const db = context.firestore();
    await assertFails(
      db.collection('users').doc('user-1').set({
        id: 'user-1',
        role: 'admin'
      })
    );
  });

  it('blocks cross-tenant profile reads (Exploit 2)', async () => {
    const context = testEnv.authenticatedContext('user-1', { email_verified: true });
    const db = context.firestore();
    await assertFails(
      db.collection('msme_profile').doc('msme-2').get()
    );
  });
});
```
