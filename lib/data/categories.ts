// lib/data/categories.ts
import 'server-only';
import { adminDb } from '@/lib/firebase/admin';

interface Category {
  id: string;
  name: string;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    if (!adminDb) {
      console.error('[FIREBASE_GET_ALL_CATEGORIES] Firebase Admin has not been initialized.');
      throw new Error('Firebase Admin has not been initialized.');
    }

    const catSnapshot = await adminDb.collection('categories').orderBy('name').get();
    
    if (catSnapshot.empty) {
      return [];
    }

    return catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
  
  } catch (error) {
    console.error('[FIREBASE_GET_ALL_CATEGORIES_ERROR]', error);
    return []; // Return an empty array on error
  }
}
