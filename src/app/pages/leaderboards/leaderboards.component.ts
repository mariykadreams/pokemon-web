import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, User } from '../../services/users.service';

@Component({
  selector: 'app-leaderboards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboards.component.html',
  styleUrl: './leaderboards.component.css'
})
export class LeaderboardsComponent implements OnInit {
  users: User[] = [];

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
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
      }
    });
  }
}
