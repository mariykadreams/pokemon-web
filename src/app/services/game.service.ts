import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';

export type GameState = 'menu' | 'playing' | 'ended';

export interface GameDomElements {
  gameMenu: HTMLElement | null;
  gameContainer: HTMLElement | null;
  pokeballOpening: HTMLElement | null;
  timerDiv: HTMLElement | null;
  scoreDiv: HTMLElement | null;
  gameInstructions: HTMLElement | null;
  gameLinks: HTMLElement | null;
  gameEnded: HTMLElement | null;
}

interface Position {
  top: number;
  left: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  // game constants
  private readonly GAME_DURATION = 30 * 1000; // milliseconds
  private readonly NUM_TRAINERS = 401;
  private readonly NUM_POKEMONS = 401;
  private readonly NUM_DISPLAYED = 300;
  private readonly IMG_SIZE = 70;
  private readonly SAFE_MARGIN = 45;

  // game state
  private score = 0;
  private startTime: number | null = null;
  private startPositionTop: number | null = null;
  private startPositionLeft: number | null = null;
  private animationFrameId: number | null = null;

  // image arrays
  private trainerImages: string[] = [];
  private pokemonImages: string[] = [];
  private imageNodes: HTMLImageElement[] = [];

  // DOM element references
  private domElements: GameDomElements | null = null;

  // RxJS subjects for state management
  private scoreSubject = new BehaviorSubject<number>(0);
  private timeRemainingSubject = new BehaviorSubject<number>(30);
  private gameStateSubject = new BehaviorSubject<GameState>('menu');
  private finalScoreMessageSubject = new BehaviorSubject<string>('');

  // public observables
  score$: Observable<number> = this.scoreSubject.asObservable();
  timeRemaining$: Observable<number> = this.timeRemainingSubject.asObservable();
  gameState$: Observable<GameState> = this.gameStateSubject.asObservable();
  finalScoreMessage$: Observable<string> = this.finalScoreMessageSubject.asObservable();

  constructor(
    private authService: AuthService,
    private usersService: UsersService
  ) {
    this.initializeImageArrays();
  }

  private initializeImageArrays(): void {
    for (let i = 0; i < this.NUM_TRAINERS; i++) {
      this.trainerImages.push(`assets/images/trainers/${i}.png`);
    }
    for (let i = 0; i < this.NUM_POKEMONS; i++) {
      this.pokemonImages.push(`assets/images/pokemon_svg/${i}.svg`);
    }
  }

  initializeGame(domElements: GameDomElements): void {
    this.domElements = domElements;

    if (this.domElements?.gameContainer) {
      this.createElements();
    } else {
      console.warn('Game container not available during initialization. Elements will be created when game starts.');
    }
  }

  startGame(): void {
    if (!this.domElements) return;

    if (!this.domElements.gameContainer || this.imageNodes.length === 0) {
      if (this.domElements.gameContainer) {
        this.createElements();
      } else {
        console.error('Game container not available');
        return;
      }
    }

    this.score = 0;
    this.scoreSubject.next(this.score);
    
    this.setImageVisibility(this.domElements.gameMenu, false);
    this.setImageVisibility(this.domElements.timerDiv, true);
    this.setImageVisibility(this.domElements.scoreDiv, true);
    
    this.gameStateSubject.next('playing');
    this.startRound();
    this.startCountdown();
  }

  private startCountdown(): void {
    this.startTime = performance.now();
    this.updateCountdown(this.startTime);
    this.animationFrameId = requestAnimationFrame(() => this.updateCountdown(this.startTime!));
  }

  private updateCountdown(timestamp: number): void {
    if (!this.startTime) return;

    const elapsed = timestamp - this.startTime;
    const remaining = Math.max(0, this.GAME_DURATION - elapsed);
    const remainingSeconds = Math.round(remaining / 100) / 10;

    this.timeRemainingSubject.next(remainingSeconds);

    if (remaining > 0) {
      this.animationFrameId = requestAnimationFrame(() => this.updateCountdown(performance.now()));
    } else {
      this.endGame();
    }
  }

  private startRound(): void {
    if (!this.domElements?.gameContainer) {
      console.error('Cannot start round: gameContainer is not available');
      return;
    }

    if (this.imageNodes.length === 0) {
      console.warn('Image nodes not created, creating them now');
      this.createElements();
      if (this.imageNodes.length === 0) {
        console.error('Failed to create image nodes');
        return;
      }
    }

    this.startPositionTop = (window.innerHeight * 80) / 100;
    this.startPositionLeft = window.innerWidth / 2 - this.IMG_SIZE / 2;

    const shuffledTrainers = this.shuffle([...this.trainerImages]);
    const pokemon = this.pokemonImages[Math.floor(Math.random() * this.NUM_POKEMONS)];

    const srcs = shuffledTrainers.slice(0, this.NUM_DISPLAYED - 1);
    srcs.push(pokemon);

    this.loadImages(this.imageNodes, srcs, () => {
      this.setImageVisibility(this.domElements!.pokeballOpening, true);
      for (let i = 0; i < this.NUM_DISPLAYED; i++) {
        this.setImageVisibility(this.imageNodes[i], true);
        this.animateCurveMove(this.imageNodes[i]);
      }
    });
  }

  pokemonFound(): void {
    if (!this.domElements) return;

    for (let i = 0; i < this.imageNodes.length; i++) {
      this.setImageVisibility(this.imageNodes[i], false);
    }
    
    this.score++;
    this.scoreSubject.next(this.score);
    this.startRound();
  }

  async endGame(): Promise<void> {
    if (!this.domElements) return;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    for (let i = 0; i < this.imageNodes.length; i++) {
      this.setImageVisibility(this.imageNodes[i], false);
    }
    
    this.setImageVisibility(this.domElements.pokeballOpening, false);
    this.setImageVisibility(this.domElements.timerDiv, false);
    this.setImageVisibility(this.domElements.scoreDiv, false);
    
    this.gameStateSubject.next('ended');
    this.showEndScreen();
    
    // Save score to Firestore if user is logged in
    await this.saveScore();
  }

  private async saveScore(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      console.log('User not logged in, score not saved:', this.score);
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      console.log('User ID not available, score not saved:', this.score);
      return;
    }

    try {
      // Get current user data
      const userData = await this.usersService.getUserById(userId);
      const currentFindScore = userData?.find_score || 0;
      
      // Save the score - update only if new score is higher (keep best score)
      if (this.score > currentFindScore) {
        await this.usersService.updateUser(userId, { find_score: this.score });
        console.log(`New best find game score saved: ${this.score} points for user ${userId}`);
      } else {
        console.log(`Find game score ${this.score} is not higher than current best ${currentFindScore}, keeping best score`);
      }
    } catch (error) {
      console.error('Error saving find game score:', error);
    }
  }

  private showEndScreen(): void {
    if (!this.domElements) return;

    this.setImageVisibility(this.domElements.gameMenu, true);
    this.setImageVisibility(this.domElements.gameInstructions, false);
    this.setImageVisibility(this.domElements.gameLinks, false);
    
    const message = `Game Over! Your final score is: ${this.score}`;
    this.finalScoreMessageSubject.next(message);
    
    this.setImageVisibility(this.domElements.gameEnded, true);
  }

  showGameMenu(): void {
    if (!this.domElements) return;

    this.setImageVisibility(this.domElements.gameInstructions, true);
    this.setImageVisibility(this.domElements.gameLinks, true);
    this.setImageVisibility(this.domElements.gameEnded, false);
    this.gameStateSubject.next('menu');
  }

  private createElements(): void {
    if (!this.domElements?.gameContainer) {
      console.error('Cannot create elements: gameContainer is not available');
      return;
    }

    // Clear existing elements
    while (this.domElements.gameContainer.firstChild) {
      this.domElements.gameContainer.removeChild(this.domElements.gameContainer.firstChild);
    }
    this.imageNodes = [];

    for (let i = 0; i < this.NUM_DISPLAYED; i++) {
      const trainer = document.createElement('img');
      this.setImageAttributes(trainer);
      this.domElements.gameContainer.appendChild(trainer);
      this.imageNodes.push(trainer);
    }
    
    // The last image is the pokemon
    if (this.imageNodes.length > 0) {
      this.imageNodes[this.NUM_DISPLAYED - 1].style.zIndex = '1000';
      this.imageNodes[this.NUM_DISPLAYED - 1].onclick = () => this.pokemonFound();
    }
  }

  private setImageAttributes(img: HTMLImageElement): void {
    img.width = this.IMG_SIZE;
    img.height = this.IMG_SIZE;
    img.style.position = 'absolute';
    this.setImageVisibility(img, false);
  }

  private generateRandomPosition(): Position {
    const top = Math.floor(
      Math.random() * (window.innerHeight - this.SAFE_MARGIN * 4 - this.IMG_SIZE)
    ) + this.SAFE_MARGIN * 2.5;
    const left = Math.floor(
      Math.random() * (window.innerWidth - this.IMG_SIZE - this.SAFE_MARGIN * 0.5)
    ) + this.SAFE_MARGIN * 0.3;
    return { top, left };
  }

  private loadImages(nodes: HTMLImageElement[], srcs: string[], callback: () => void): void {
    let remaining = nodes.length;
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].onload = () => {
        remaining--;
        if (remaining === 0) callback();
      };
      nodes[i].src = srcs[i];
    }
  }

  private setImageVisibility(img: HTMLElement | null, visible: boolean): void {
    if (img) {
      img.style.display = visible ? 'block' : 'none';
    }
  }

  private animateCurveMove(img: HTMLImageElement): void {
    if (this.startPositionTop === null || this.startPositionLeft === null) return;

    img.style.top = `${this.startPositionTop}px`;
    img.style.left = `${this.startPositionLeft}px`;

    const position = this.generateRandomPosition();
    const newTop = position.top;
    const newLeft = position.left;

    const dx = newLeft - this.startPositionLeft;
    const dy = newTop - this.startPositionTop;

    const cx = dx * 0.5 + (-dy * 0.3);
    const cy = -window.innerHeight * 0.3 + dx * dx * 0.0005 - 300 * Math.random();

    img.style.setProperty('--cx', `${cx}px`);
    img.style.setProperty('--cy', `${cy}px`);
    img.style.setProperty('--ex', `${dx}px`);
    img.style.setProperty('--ey', `${dy}px`);

    img.style.animation = 'none';
    void img.offsetWidth; // force reflow
    img.style.animation = 'curve 1s linear forwards';

    img.onanimationend = () => {
      img.style.animation = 'none';
      img.style.left = `${newLeft}px`;
      img.style.top = `${newTop}px`;
      this.setImageVisibility(this.domElements!.pokeballOpening, false);
    };
  }

  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  cleanup(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.imageNodes = [];
    this.domElements = null;
    this.score = 0;
    this.startTime = null;
    this.scoreSubject.next(0);
    this.timeRemainingSubject.next(30);
    this.gameStateSubject.next('menu');
    this.finalScoreMessageSubject.next('');
  }
}

