import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService, GameDomElements } from '../../services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameMenu') gameMenuRef!: ElementRef<HTMLElement>;
  @ViewChild('gameContainer') gameContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('pokeballOpening') pokeballOpeningRef!: ElementRef<HTMLImageElement>;
  @ViewChild('timerDiv') timerDivRef!: ElementRef<HTMLElement>;
  @ViewChild('scoreDiv') scoreDivRef!: ElementRef<HTMLElement>;
  @ViewChild('gameInstructions') gameInstructionsRef!: ElementRef<HTMLElement>;
  @ViewChild('gameLinks') gameLinksRef!: ElementRef<HTMLElement>;
  @ViewChild('gameEnded') gameEndedRef!: ElementRef<HTMLElement>;

  score = 0;
  timeRemaining = 30;
  gameState: 'menu' | 'playing' | 'ended' = 'menu';
  finalScoreMessage = '';

  private subscriptions = new Subscription();

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Subscribe to game service observables
    this.subscriptions.add(
      this.gameService.score$.subscribe(score => {
        this.score = score;
      })
    );

    this.subscriptions.add(
      this.gameService.timeRemaining$.subscribe(time => {
        this.timeRemaining = time;
      })
    );

    this.subscriptions.add(
      this.gameService.gameState$.subscribe(state => {
        this.gameState = state;
      })
    );

    this.subscriptions.add(
      this.gameService.finalScoreMessage$.subscribe(message => {
        this.finalScoreMessage = message;
      })
    );
  }

  ngAfterViewInit(): void {
    // Initialize game service with DOM element references
    // ViewChild references should be available in ngAfterViewInit
    const domElements: GameDomElements = {
      gameMenu: this.gameMenuRef?.nativeElement || null,
      gameContainer: this.gameContainerRef?.nativeElement || null,
      pokeballOpening: this.pokeballOpeningRef?.nativeElement || null,
      timerDiv: this.timerDivRef?.nativeElement || null,
      scoreDiv: this.scoreDivRef?.nativeElement || null,
      gameInstructions: this.gameInstructionsRef?.nativeElement || null,
      gameLinks: this.gameLinksRef?.nativeElement || null,
      gameEnded: this.gameEndedRef?.nativeElement || null
    };

    // Verify critical elements are available
    if (!domElements.gameContainer) {
      console.error('Game container ViewChild not found. Template reference might be missing.');
      // Try to get it by ID as fallback
      const fallbackContainer = document.getElementById('game');
      if (fallbackContainer) {
        domElements.gameContainer = fallbackContainer;
        console.warn('Using fallback method to get game container');
      }
    }

    this.gameService.initializeGame(domElements);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.gameService.cleanup();
  }

  startGame(): void {
    this.gameService.startGame();
  }

  showGameMenu(): void {
    this.gameService.showGameMenu();
  }
}
