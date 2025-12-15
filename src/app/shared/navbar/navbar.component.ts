import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  isAdmin = false;
  isLoggedIn = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  async ngOnInit(): Promise<void> {
    // Check login status
    this.isLoggedIn = this.authService.isLoggedIn();
    
    // Subscribe to auth state changes
    this.authSubscription = this.authService.currentUser$.subscribe(async (user) => {
      this.isLoggedIn = !!user;
      if (user) {
        await this.checkAdminStatus();
      } else {
        this.isAdmin = false;
      }
    });

    // Initial admin check
    if (this.isLoggedIn) {
      await this.checkAdminStatus();
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async checkAdminStatus(): Promise<void> {
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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.classList.remove('sidebar-open');
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.isAdmin = false;
      this.isLoggedIn = false;
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 600) {
      this.closeMenu();
    }
  }
}
