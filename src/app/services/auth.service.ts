import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly LOGGED_IN_USER_KEY = 'loggedInUser';

  setLoggedInUser(username: string): void {
    localStorage.setItem(this.LOGGED_IN_USER_KEY, username);
  }

  getLoggedInUser(): string | null {
    return localStorage.getItem(this.LOGGED_IN_USER_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.LOGGED_IN_USER_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getLoggedInUser();
  }
}
