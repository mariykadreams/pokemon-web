import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private auth: Auth) {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  /**
   * Get current user email
   */
  getCurrentUserEmail(): string | null {
    return this.auth.currentUser?.email || null;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  /**
   * Handle authentication errors and return user-friendly messages
   */
  private handleAuthError(error: any): Error {
    let message = 'An error occurred during authentication';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered. Please use a different email or login.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address. Please check your email format.';
        break;
      case 'auth/operation-not-allowed':
        message = 'Email/password accounts are not enabled. Please contact support.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please use a stronger password.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-credential':
        message = 'Invalid email or password. Please try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed login attempts. Please try again later.';
        break;
      default:
        message = error.message || message;
    }
    
    return new Error(message);
  }
}
