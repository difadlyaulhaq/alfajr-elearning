
import { adminDb } from '@/lib/firebase/admin';

async function getCollectionCount(collectionName: string): Promise<number> {
  try {
    if (!adminDb) {
      throw new Error('Firebase Admin not initialized');
    }
    const snapshot = await adminDb.collection(collectionName).get();
    return snapshot.size;
  } catch (error) {
    console.error(`Error fetching count for ${collectionName}:`, error);
    return 0; // Return 0 if fetching fails
  }
}

export const getCoursesCount = () => getCollectionCount('courses');
export const getUsersCount = () => getCollectionCount('users');
export const getCategoriesCount = () => getCollectionCount('categories');
export const getDivisionsCount = () => getCollectionCount('divisions');
