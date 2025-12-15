import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  messageColor = 'inherit';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private router: Router
  ) {}

  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async handleLogin(): Promise<void> {
    this.message = '';
    this.messageColor = 'inherit';

    if (!this.isEmailValid(this.email)) {
      this.message = '❌ Please enter a valid email address.';
      this.messageColor = 'red';
      return;
    }

    if (!this.password) {
      this.message = '❌ Please enter your password.';
      this.messageColor = 'red';
      return;
    }

    this.isLoading = true;

    try {
      // Login with Firebase Auth
      const user = await this.authService.login(this.email, this.password);
      
      // Get user data from Firestore to display name
      const userData = await this.usersService.getUserById(user.uid);
      const userName = userData?.name || this.email;
      
      this.message = '✅ Login successful! Welcome, ' + userName + '!';
      this.messageColor = 'green';
      
      // Clear form
      this.email = '';
      this.password = '';
      
      // Navigate to home page after a short delay
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 500);
    } catch (error: any) {
      this.message = '❌ ' + error.message;
      this.messageColor = 'red';
    } finally {
      this.isLoading = false;
    }
  }
}
