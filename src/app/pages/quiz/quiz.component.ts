import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';

interface QuizQuestion {
  pokemon: string;
  silhouette: string;
  image: string;
  options: string[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit, OnDestroy {
  readonly QUIZ_DURATION = 60;
  readonly QUESTIONS_PER_ROUND = 4;

  isRunning = false;
  gameEnded = false;
  timeRemaining = this.QUIZ_DURATION;
  score = 0;
  currentQuestion = 0;
  userAnswered = false;
  timerInterval: any = null;
  currentUsername: string | null = null;
  resultMessage = '';
  resultColor = '';
  finalScoreMessage = '';

  quizQuestions: QuizQuestion[] = [
    { pokemon: 'Pikachu', silhouette: 'assets/images/quiz/pikachu_who_0.png', image: 'assets/images/quiz/pikachu_who_1.png', options: ['Pikachu', 'Raichu', 'Bulbasaur', 'Charmander'] },
    { pokemon: 'Bulbasaur', silhouette: 'assets/images/quiz/bulbasaur_who_0.jpg', image: 'assets/images/quiz/bulbasaur_who_1.jpg', options: ['Squirtle', 'Bulbasaur', 'Charmander', 'Oddish'] },
    { pokemon: 'Charmander', silhouette: 'assets/images/quiz/charmander_who_0.jpg', image: 'assets/images/quiz/charmander_who_1.jpg', options: ['Charmander', 'Charmeleon', 'Psyduck', 'Growlithe'] },
    { pokemon: 'Psyduck', silhouette: 'assets/images/quiz/psyduck_who_0.jpg', image: 'assets/images/quiz/psyduck_who_1.jpg', options: ['Psyduck', 'Wartortle', 'Pikachu', 'Poliwag'] }
  ];

  currentQuestionData: QuizQuestion | null = null;
  shuffledOptions: string[] = [];

  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.authService.isLoggedIn()) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        const userData = await this.usersService.getUserById(userId);
        this.currentUsername = userData?.name || this.authService.getCurrentUserEmail();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startQuiz(): void {
    this.isRunning = true;
    this.gameEnded = false;
    this.timeRemaining = this.QUIZ_DURATION;
    this.score = 0;
    this.currentQuestion = 0;
    this.userAnswered = false;
    this.startTimer();
    this.loadQuestion();
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.endQuiz();
      }
    }, 1000);
  }

  get timerColor(): string {
    return this.timeRemaining <= 10 ? 'red' : '#f5b700';
  }

  loadQuestion(): void {
    if (this.currentQuestion >= this.QUESTIONS_PER_ROUND || this.timeRemaining <= 0) {
      this.endQuiz();
      return;
    }

    this.currentQuestionData = this.quizQuestions[this.currentQuestion % this.quizQuestions.length];
    this.userAnswered = false;
    this.shuffledOptions = [...(this.currentQuestionData?.options || [])].sort(() => Math.random() - 0.5);
    this.resultMessage = '';
  }

  async checkAnswer(selected: string): Promise<void> {
    if (this.userAnswered || !this.currentQuestionData) return;
    
    this.userAnswered = true;
    const correct = this.currentQuestionData.pokemon;

    if (selected === correct) {
      this.resultMessage = 'Correct! 🎉';
      this.resultColor = 'green';
      this.score += 1;
    } else {
      this.resultMessage = `Wrong! It was ${correct}.`;
      this.resultColor = 'red';
    }

    // If this is the last question, end the quiz after a short delay
    if (this.currentQuestion >= this.QUESTIONS_PER_ROUND - 1) {
      setTimeout(() => {
        this.endQuiz();
      }, 1500); // Wait 1.5 seconds to show the result
    }
  }

  nextQuestion(): void {
    this.currentQuestion++;
    this.loadQuestion();
  }

  async endQuiz(): Promise<void> {
    // Prevent multiple calls
    if (this.gameEnded) return;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isRunning = false;
    this.gameEnded = true;
    this.finalScoreMessage = `Quiz Complete! Your Score: ${this.score}`;
    
    // Save score to Firestore if user is logged in
    if (this.authService.isLoggedIn()) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        try {
          // Get current user data
          const userData = await this.usersService.getUserById(userId);
          const currentQuizScore = userData?.quiz_score || 0;
          
          // Save the score - update only if new score is higher (keep best score)
          if (this.score > currentQuizScore) {
            await this.usersService.updateUser(userId, { quiz_score: this.score });
            console.log(`New best quiz score saved: ${this.score} points for user ${userId}`);
          } else {
            console.log(`Quiz score ${this.score} is not higher than current best ${currentQuizScore}, keeping best score`);
          }
        } catch (error) {
          console.error('Error saving quiz score:', error);
        }
      }
    } else {
      console.log('User not logged in, score not saved:', this.score);
    }
  }

  backToMenu(): void {
    this.gameEnded = false;
  }
}
