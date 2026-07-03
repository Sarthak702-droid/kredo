import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function test() {
  try {
    const adminApp = initializeApp({
      projectId: 'cellular-deck-471715-u1'
    });
    console.log('Successfully initialized with options!');
    
    const db = getFirestore(adminApp, 'ai-studio-kredo-d60ee4dd-c151-4986-a96d-b2d0fd98c947');
    console.log('Attempting to list collections in custom DB...');
    const collections = await db.listCollections();
    console.log('Collections:', collections.map(c => c.id));
  } catch (err: any) {
    console.error('Failed with correct project and custom database:', err.stack);
  }
}

test().then(() => process.exit(0));
