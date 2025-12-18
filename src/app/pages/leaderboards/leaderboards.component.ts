import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from '../../services/users.service';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-leaderboards',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './leaderboards.component.html',
  styleUrl: './leaderboards.component.css'
})
export class LeaderboardsComponent implements OnInit {
  users: User[] = [];
  page = 1;
  pageSize: number = 0; // 0 = show all (default, non-breaking)
  readonly pageSizeOptions = [10, 25, 50];

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
  }

  loadLeaderboard(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        // Filter out users without names (they might be incomplete accounts)
        // Sort by quiz_score descending, then by name
        this.users = users
          .filter(user => user.name && user.name.trim() !== '')
          .sort((a, b) => {
            const scoreA = a.quiz_score || 0;
            const scoreB = b.quiz_score || 0;
            if (scoreB !== scoreA) {
              return scoreB - scoreA;
            }
            return (a.name || '').localeCompare(b.name || '');
          });

        // Keep existing behavior by default: show all on one page
        this.page = 1;
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
      }
    });
  }

  get effectivePageSize(): number {
    const size = this.pageSize <= 0 ? this.users.length : this.pageSize;
    return Math.max(1, size);
  }

  get displayedUsers(): User[] {
    if (!this.users.length) return [];
    if (this.pageSize <= 0 || this.pageSize >= this.users.length) return this.users;

    const start = (this.page - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  rankForIndex(indexOnPage: number): number {
    if (this.pageSize <= 0) return indexOnPage + 1;
    return (this.page - 1) * this.pageSize + indexOnPage + 1;
  }
}
