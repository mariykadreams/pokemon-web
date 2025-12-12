import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUsername = this.authService.getLoggedInUser();
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

  checkAnswer(selected: string): void {
    if (this.userAnswered || !this.currentQuestionData) return;
    
    this.userAnswered = true;
    const correct = this.currentQuestionData.pokemon;

    if (selected === correct) {
      this.resultMessage = 'Correct! 🎉';
      this.resultColor = 'green';
      this.score += 1;
      
      if (this.currentUsername) {
        this.score += 5;
      }
    } else {
      this.resultMessage = `Wrong! It was ${correct}.`;
      this.resultColor = 'red';
    }
  }

  nextQuestion(): void {
    this.currentQuestion++;
    this.loadQuestion();
  }

  endQuiz(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.isRunning = false;
    this.gameEnded = true;
    const bonusText = this.currentUsername ? ' (includes login bonus!)' : '';
    this.finalScoreMessage = `Quiz Complete! Your Score: ${this.score}${bonusText}`;
  }

  backToMenu(): void {
    this.gameEnded = false;
  }
}
