import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  @Input() showAdminCheckbox: boolean = false;
  @Input() isAdmin: boolean = false;
  @Input() adminMode: boolean = false; // If true, don't navigate after registration
  @Output() userCreated = new EventEmitter<{name: string, email: string}>();

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';
  messageColor = 'inherit';
  isLoading = false;
  isAdminUser = false;

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
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

  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async handleRegister(): Promise<void> {
    this.message = '';
    this.messageColor = 'inherit';

    // Validation
    if (!this.name.trim()) {
      this.message = '❌ Please enter a name.';
      this.messageColor = 'red';
      return;
    }

    if (!this.isEmailValid(this.email)) {
      this.message = '❌ Please enter a valid email address.';
      this.messageColor = 'red';
      return;
    }

    if (!this.isPasswordFormatValid(this.password)) {
      this.message = '❌ Invalid password format. Check requirements: min 8 chars, 2 capitals, 1 digit, 1 special character.';
      this.messageColor = 'red';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.message = '❌ Passwords do not match.';
      this.messageColor = 'red';
      return;
    }

    this.isLoading = true;

    try {
      // Register user with Firebase Auth
      const user = await this.authService.register(this.email, this.password);
      
      // Determine admin status: use isAdminUser if checkbox is shown, otherwise false
      const adminStatus = this.showAdminCheckbox ? this.isAdminUser : false;
      
      // Create user document in Firestore with the same UID as Firebase Auth
      await this.usersService.setUser(user.uid, {
        name: this.name.trim(),
        email: this.email.trim(),
        admin: adminStatus
        // whenCreated will be set automatically by setUser
      });

      this.message = this.adminMode ? '✅ User created successfully!' : '✅ Registration successful! Welcome, ' + this.name + '!';
      this.messageColor = 'green';
      
      // Emit event for admin mode
      if (this.adminMode) {
        this.userCreated.emit({ name: this.name, email: this.email });
      }
      
      // Clear form
      this.name = '';
      this.email = '';
      this.password = '';
      this.confirmPassword = '';
      this.isAdminUser = false;
      
      // Navigate to home page only if not in admin mode
      if (!this.adminMode) {
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      } else {
        // In admin mode, reset form after showing success message
        setTimeout(() => {
          this.message = '';
        }, 3000);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      this.message = '❌ ' + error.message;
      this.messageColor = 'red';
    } finally {
      this.isLoading = false;
    }
  }
}

