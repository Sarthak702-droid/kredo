import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Load Firebase applet config
const CONFIG_FILE = path.join(process.cwd(), 'firebase-applet-config.json');
let projectId = 'cellular-deck-471715-u1';
let databaseId = 'ai-studio-kredo-d60ee4dd-c151-4986-a96d-b2d0fd98c947';

if (fs.existsSync(CONFIG_FILE)) {
  try {
    const configData = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    if (configData.projectId) projectId = configData.projectId;
    if (configData.firestoreDatabaseId) databaseId = configData.firestoreDatabaseId;
  } catch (error) {
    console.error('Error reading firebase-applet-config.json:', error);
  }
}

// Ensure Firebase is initialized
const apps = getApps();
const adminApp = apps.length === 0 ? initializeApp({ projectId }) : apps[0];
const firestore = getFirestore(adminApp, databaseId);

const USERS = [
  { id: 'user-1', name: 'Vardhaman Garments', role: 'msme', email: 'vardhaman@example.com' },
  { id: 'user-2', name: 'Srinivasa Kirana', role: 'msme', email: 'srinivasa@example.com' },
  { id: 'user-3', name: 'Lender User', role: 'lender', email: 'lender@example.com' },
  { id: 'user-4', name: 'Apex Manufacturing', role: 'msme', email: 'apex@example.com' },
];

const MSME_PROFILES = [
  {
    id: 'msme-1',
    name: 'Vardhaman Garments Ltd.',
    sector: 'Textile',
    industry: 'Textile',
    location: 'Surat',
    establishedYear: 2015,
    employeeCount: 45,
    gstNumber: '24AAAAV1111A1Z1',
    epfoId: 'EPF001',
    aaConsentId: 'AA-001'
  },
  {
    id: 'msme-2',
    name: 'Srinivasa Kirana & Provisions',
    sector: 'Retail',
    industry: 'Retail',
    location: 'Hyderabad',
    establishedYear: 2018,
    employeeCount: 8,
    gstNumber: '36BBBBV2222B2Z2',
    epfoId: 'EPF002',
    aaConsentId: 'AA-002'
  },
  {
    id: 'msme-3',
    name: 'Tech Solutions Private Limited',
    sector: 'IT Services',
    industry: 'Technology',
    location: 'Bangalore',
    establishedYear: 2020,
    employeeCount: 30,
    gstNumber: '29CCCCV3333C3Z3',
    epfoId: 'EPF003',
    aaConsentId: 'AA-003'
  },
  {
    id: 'msme-4',
    name: 'Apex Manufacturing Co.',
    sector: 'Manufacturing',
    industry: 'Manufacturing',
    location: 'Pune',
    establishedYear: 2012,
    employeeCount: 120,
    gstNumber: '27DDDDV4444D4Z4',
    epfoId: 'EPF004',
    aaConsentId: 'AA-004'
  }
];

const FINANCIAL_DATA = [
  { id: 'doc-1', msmeId: 'msme-1', documentType: 'GST Return', status: 'VERIFIED', timestamp: '2026-07-01T12:00:00Z', notes: 'GSTR-3B verified successfully' },
  { id: 'doc-2', msmeId: 'msme-1', documentType: 'UPI Transaction Ledger', status: 'VERIFIED', timestamp: '2026-07-01T14:30:00Z', notes: 'UPI volume of INR 4.2L' },
  { id: 'doc-3', msmeId: 'msme-1', documentType: 'EPFO Filing', status: 'PENDING', timestamp: '2026-07-02T09:15:00Z', notes: 'Pending headcount growth review' },
  { id: 'doc-4', msmeId: 'msme-2', documentType: 'GST Return', status: 'VERIFIED', timestamp: '2026-06-30T10:00:00Z', notes: 'Verified GSTR-1 logs' },
  { id: 'doc-5', msmeId: 'msme-2', documentType: 'Bank Statement', status: 'FAILED', timestamp: '2026-07-02T11:00:00Z', notes: 'Signature mismatch' },
  { id: 'doc-6', msmeId: 'msme-3', documentType: 'GST Return', status: 'VERIFIED', timestamp: '2026-07-02T15:00:00Z', notes: 'Verified GSTR-3B' },
  { id: 'doc-7', msmeId: 'msme-4', documentType: 'Bank Statement', status: 'VERIFIED', timestamp: '2026-07-03T09:00:00Z', notes: 'Corporate bank accounts fully reconciled' }
];

const CREDIT_SCORES = [
  { id: 'score-1', msmeId: 'msme-1', score: 724, riskRating: 'Medium', updatedAt: '2026-07-01T10:00:00Z' },
  { id: 'score-2', msmeId: 'msme-2', score: 735, riskRating: 'Low', updatedAt: '2026-07-02T10:00:00Z' },
  { id: 'score-3', msmeId: 'msme-3', score: 680, riskRating: 'High', updatedAt: '2026-07-03T09:00:00Z' },
  { id: 'score-4', msmeId: 'msme-4', score: 810, riskRating: 'Low', updatedAt: '2026-07-03T10:00:00Z' }
];

const LOAN_DECISIONS = [
  { id: 'dec-1', msmeId: 'msme-1', requestedAmount: 1500000, approvedAmount: 1500000, status: 'PENDING', decidedAt: null, notes: 'Awaiting final EPFO confirmation' },
  { id: 'dec-2', msmeId: 'msme-2', requestedAmount: 150000, approvedAmount: 150000, status: 'APPROVED', decidedAt: '2026-06-25T14:00:00Z', notes: 'Automated approved based on low failure rate' },
  { id: 'dec-3', msmeId: 'msme-3', requestedAmount: 500000, approvedAmount: 0, status: 'REJECTED', decidedAt: '2026-07-03T11:00:00Z', notes: 'High UPI failure rate detected' }
];

export async function seedNewCollections() {
  console.log('Starting seed operation for new collections in', databaseId);
  try {
    // 1. Seed 'users'
    for (const user of USERS) {
      await firestore.collection('users').doc(user.id).set(user);
    }
    console.log('Seeded users collection successfully.');

    // 2. Seed 'msme_profile'
    for (const profile of MSME_PROFILES) {
      await firestore.collection('msme_profile').doc(profile.id).set(profile);
    }
    console.log('Seeded msme_profile collection successfully.');

    // 3. Seed 'financial_data'
    for (const data of FINANCIAL_DATA) {
      await firestore.collection('financial_data').doc(data.id).set(data);
    }
    console.log('Seeded financial_data collection successfully.');

    // 4. Seed 'credit_score'
    for (const score of CREDIT_SCORES) {
      await firestore.collection('credit_score').doc(score.id).set(score);
    }
    console.log('Seeded credit_score collection successfully.');

    // 5. Seed 'loan_decisions'
    for (const decision of LOAN_DECISIONS) {
      await firestore.collection('loan_decisions').doc(decision.id).set(decision);
    }
    console.log('Seeded loan_decisions collection successfully.');
    console.log('All collections initialized successfully.');
  } catch (error) {
    console.error('Error seeding collections:', error);
    throw error;
  }
}

// Self-run when executed directly
seedNewCollections()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
