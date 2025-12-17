import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, addDoc, getDoc, query, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface User {
  id?: string;
  name: string;
  email: string;
  admin: boolean;
  whenCreated: Timestamp | Date;
  find_score?: number;
  quiz_score?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly usersCollection = 'users';

  constructor(private firestore: Firestore) { }

  /**
   * Get all users from Firestore
   */
  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, this.usersCollection);
    const q = query(usersRef, orderBy('whenCreated', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<User[]>;
  }

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const userDocRef = doc(this.firestore, this.usersCollection, userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  }

  /**
   * Create a new user in Firestore
   */
  async createUser(userData: Omit<User, 'id' | 'whenCreated'>): Promise<string> {
    const usersRef = collection(this.firestore, this.usersCollection);
    const newUser = {
      ...userData,
      whenCreated: Timestamp.now()
    };
    
    const docRef = await addDoc(usersRef, newUser);
    return docRef.id;
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    const userDocRef = doc(this.firestore, this.usersCollection, userId);
    await setDoc(userDocRef, userData, { merge: true });
  }

  /**
   * Create or update a user (upsert)
   */
  async setUser(userId: string, userData: Omit<User, 'id' | 'whenCreated'>): Promise<void> {
    const userDocRef = doc(this.firestore, this.usersCollection, userId);
    const userDataWithTimestamp = {
      ...userData,
      whenCreated: Timestamp.now()
    };
    await setDoc(userDocRef, userDataWithTimestamp);
  }
}
