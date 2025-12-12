import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

declare function initializeGame(): void;
// Functions defined in assets/game.js
declare global {
  interface Window {
    startGame?: () => void;
    showGameMenu?: () => void;
  }
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit, AfterViewInit, OnDestroy {
  private scriptLoaded = false;

  ngOnInit(): void {
    // Load the game.js script
    if (!this.scriptLoaded) {
      this.loadScript();
    }
  }

  ngAfterViewInit(): void {
    // Wait a bit for the DOM to be ready, then initialize
    setTimeout(() => {
      if (typeof initializeGame === 'function') {
        initializeGame();
      }
    }, 100);
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Expose game.js functions to the template safely
  startGame(): void {
    window.startGame?.();
  }

  showGameMenu(): void {
    window.showGameMenu?.();
  }

  private loadScript(): void {
    const script = document.createElement('script');
    script.src = 'assets/game.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      this.scriptLoaded = true;
      // Initialize after script loads
      setTimeout(() => {
        if (typeof initializeGame === 'function') {
          initializeGame();
        }
      }, 100);
    };
    document.head.appendChild(script);
  }
}
