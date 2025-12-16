import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService, Pokemon, PokemonType } from '../../services/pokemon.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pokemon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon.component.html',
  styleUrl: './pokemon.component.css'
})
export class PokemonComponent implements OnInit {
  pokemonList: Pokemon[] = [];
  filteredPokemon: Pokemon[] = [];
  isLoading = true;
  isLoggedIn = false;
  
  // Form states
  showAddForm = false;
  showEditForm = false;
  editingPokemon: Pokemon | null = null;
  
  // Form fields
  pokemonName = '';
  photoUrl = '';
  type: PokemonType | '' = '';
  description = '';
  height: number | null = null;
  weight: number | null = null;
  abilitiesString = '';
  
  message = '';
  messageColor = 'inherit';
  searchTerm = '';
  
  // Available Pokemon types
  pokemonTypes = Object.values(PokemonType);
  PokemonType = PokemonType; // Make enum available in template

  constructor(
    private pokemonService: PokemonService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadPokemon();
  }

  loadPokemon(): void {
    this.isLoading = true;
    this.pokemonService.getPokemon().subscribe({
      next: (pokemon) => {
        this.pokemonList = pokemon;
        this.filteredPokemon = pokemon;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pokemon:', error);
        this.message = '❌ Failed to load Pokémon. Please try again.';
        this.messageColor = 'red';
        this.isLoading = false;
      }
    });
  }

  filterPokemon(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPokemon = this.pokemonList;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredPokemon = this.pokemonList.filter(p => 
      p.name.toLowerCase().includes(term) ||
      (p.type && p.type.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.showEditForm = false;
    this.resetForm();
  }

  startEdit(pokemon: Pokemon): void {
    this.editingPokemon = pokemon;
    this.showEditForm = true;
    this.showAddForm = false;
    
    // Populate form with pokemon data
    this.pokemonName = pokemon.name;
    this.photoUrl = pokemon.photoUrl || '';
    this.type = (pokemon.type as PokemonType) || '';
    this.description = pokemon.description || '';
    this.height = pokemon.height ?? null;
    this.weight = pokemon.weight ?? null;
    this.abilitiesString = pokemon.abilities?.join(', ') || '';
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editingPokemon = null;
    this.resetForm();
  }

  resetForm(): void {
    this.pokemonName = '';
    this.photoUrl = '';
    this.type = '';
    this.description = '';
    this.height = null;
    this.weight = null;
    this.abilitiesString = '';
    this.message = '';
    this.messageColor = 'inherit';
  }

  parseAbilities(abilitiesString: string): string[] {
    return abilitiesString.split(',').map(a => a.trim()).filter(a => a.length > 0);
  }

  isUrlValid(url: string): boolean {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async savePokemon(): Promise<void> {
    this.message = '';
    this.messageColor = 'inherit';

    // Validation
    if (!this.pokemonName.trim()) {
      this.message = '❌ Please enter a Pokémon name.';
      this.messageColor = 'red';
      return;
    }

    if (this.pokemonName.trim().length < 2) {
      this.message = '❌ Pokémon name must be at least 2 characters long.';
      this.messageColor = 'red';
      return;
    }

    if (!this.photoUrl.trim()) {
      this.message = '❌ Please enter a photo URL.';
      this.messageColor = 'red';
      return;
    }

    if (!this.isUrlValid(this.photoUrl.trim())) {
      this.message = '❌ Please enter a valid URL (must start with http:// or https://).';
      this.messageColor = 'red';
      return;
    }

    if (this.height !== null && (this.height <= 0 || this.height > 1000)) {
      this.message = '❌ Height must be a positive number between 0 and 1000.';
      this.messageColor = 'red';
      return;
    }

    if (this.weight !== null && (this.weight <= 0 || this.weight > 10000)) {
      this.message = '❌ Weight must be a positive number between 0 and 10000.';
      this.messageColor = 'red';
      return;
    }

    if (this.description && this.description.trim().length > 500) {
      this.message = '❌ Description must be 500 characters or less.';
      this.messageColor = 'red';
      return;
    }

    const userId = this.authService.getCurrentUserId();
    const pokemonData: Omit<Pokemon, 'id' | 'whenCreated'> = {
      name: this.pokemonName.trim(),
      photoUrl: this.photoUrl.trim(),
      type: this.type || undefined,
      description: this.description.trim() || undefined,
      height: this.height ?? undefined,
      weight: this.weight ?? undefined,
      abilities: this.parseAbilities(this.abilitiesString),
      createdBy: userId || undefined
    };

    try {
      if (this.showEditForm && this.editingPokemon?.id) {
        // Update existing
        await this.pokemonService.updatePokemon(this.editingPokemon.id, pokemonData);
        this.message = '✅ Pokémon updated successfully!';
      } else {
        // Create new
        await this.pokemonService.createPokemon(pokemonData);
        this.message = '✅ Pokémon added successfully!';
      }
      
      this.messageColor = 'green';
      this.loadPokemon();
      
      // Close form after a delay
      setTimeout(() => {
        this.resetForm();
        this.showAddForm = false;
        this.showEditForm = false;
        this.editingPokemon = null;
        this.message = '';
      }, 2000);
    } catch (error: any) {
      console.error('Error saving pokemon:', error);
      this.message = '❌ Failed to save Pokémon. Please try again.';
      this.messageColor = 'red';
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/pokeball-opening.gif';
    }
  }

  async deletePokemon(pokemon: Pokemon): Promise<void> {
    if (!pokemon.id) return;
    
    if (!confirm(`Are you sure you want to delete ${pokemon.name}?`)) {
      return;
    }

    try {
      await this.pokemonService.deletePokemon(pokemon.id);
      this.message = '✅ Pokémon deleted successfully!';
      this.messageColor = 'green';
      this.loadPokemon();
      
      setTimeout(() => {
        this.message = '';
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting pokemon:', error);
      this.message = '❌ Failed to delete Pokémon. Please try again.';
      this.messageColor = 'red';
    }
  }
}

