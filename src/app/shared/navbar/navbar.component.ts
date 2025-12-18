import { Component, HostListener, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { Subscription } from 'rxjs';
import { NgbOffcanvas, NgbOffcanvasModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbOffcanvasModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  readonly COLLAPSE_BREAKPOINT_PX = 680;

  @ViewChild('mobileNav') mobileNavTemplate!: TemplateRef<any>;

  isAdmin = false;
  isLoggedIn = false;
  private authSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private router: Router,
    private offcanvasService: NgbOffcanvas
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

  toggleMenu(): void {
    if (this.offcanvasService.hasOpenOffcanvas()) {
      this.offcanvasService.dismiss();
    } else {
      this.offcanvasService.open(this.mobileNavTemplate, {
        position: 'start',
        panelClass: 'mobile-nav-offcanvas'
      });
    }
  }

  closeMenu(): void {
    this.offcanvasService.dismiss();
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.isAdmin = false;
      this.isLoggedIn = false;
      this.closeMenu();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    // Close offcanvas when resizing to desktop
    if (window.innerWidth >= this.COLLAPSE_BREAKPOINT_PX) {
      this.closeMenu();
    }
  }
}
