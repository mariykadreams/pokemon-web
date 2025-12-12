import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  message = '';
  messageColor = 'inherit';

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private router: Router
  ) {}

  isPasswordFormatValid(password: string): boolean {
    if (password.length < 8) return false;
    const capitalCount = (password.match(/[A-Z]/g) || []).length;
    if (capitalCount < 2) return false;
    if (!/\d/.test(password)) return false;
    if (!/[^A-Za-z0-9\s]/.test(password)) return false;
    return true;
  }

  handleLogin(): void {
    this.message = '';
    this.messageColor = 'inherit';

    if (!this.isPasswordFormatValid(this.password)) {
      this.message = '❌ Invalid password format. Check requirements: min 8 chars, 2 capitals, 1 digit, 1 special character.';
      this.messageColor = 'red';
      return;
    }

    this.usersService.getUsers().subscribe({
      next: (users) => {
        const user = users.find(
          u => u.username === this.username && u.password === this.password
        );

        if (user) {
          this.message = '✅ Login successful! Welcome, ' + this.username + '!';
          this.messageColor = 'green';
          this.authService.setLoggedInUser(this.username);
          this.username = '';
          this.password = '';
          
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 500);
        } else {
          this.message = '❌ Invalid username or password.';
          this.messageColor = 'red';
        }
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
        this.message = '❌ Failed to load user data. Please check the console.';
        this.messageColor = 'red';
      }
    });
  }
}
