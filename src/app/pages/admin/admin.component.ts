import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UsersService, User } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  allUsers: User[] = [];
  adminUsers: User[] = [];
  normalUsers: User[] = [];
  isLoading = true;
  isAdmin = false;
  errorMessage = '';

  constructor(
    private usersService: UsersService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    // Check if current user is admin
    await this.checkAdminStatus();
    
    if (!this.isAdmin) {
      this.errorMessage = 'Access denied. Admin privileges required.';
      this.isLoading = false;
      return;
    }

    this.loadUsers();
  }

  async checkAdminStatus(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.isAdmin = false;
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.isAdmin = false;
      return;
    }

    try {
      const userData = await this.usersService.getUserById(userId);
      this.isAdmin = userData?.admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      this.isAdmin = false;
    }
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.allUsers = users;
        this.separateUsers(users);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Failed to load users. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  separateUsers(users: User[]): void {
    this.adminUsers = users.filter(user => user.admin === true);
    this.normalUsers = users.filter(user => !user.admin);
  }

  formatDate(date: any): string {
    if (!date) return 'N/A';
    
    // Handle Firestore Timestamp
    if (date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleString();
    }
    
    // Handle regular Date
    if (date instanceof Date) {
      return date.toLocaleString();
    }
    
    // Handle timestamp number
    if (typeof date === 'number') {
      return new Date(date).toLocaleString();
    }
    
    return 'N/A';
  }

  toggleAdminStatus(user: User): void {
    if (!user.id) return;

    const newAdminStatus = !user.admin;
    
    this.usersService.updateUser(user.id, { admin: newAdminStatus }).then(() => {
      // Reload users to reflect changes
      this.loadUsers();
    }).catch((error) => {
      console.error('Error updating user admin status:', error);
      this.errorMessage = 'Failed to update user status. Please try again.';
    });
  }
}

