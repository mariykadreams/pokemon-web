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
        this.users = users.sort((a, b) => (b.finding_game_score || 0) - (a.finding_game_score || 0));
      },
      error: (error) => {
        console.error('Error loading leaderboard:', error);
      }
    });
  }
}
