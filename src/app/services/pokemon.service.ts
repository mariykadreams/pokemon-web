import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, getDoc, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export enum PokemonType {
  Normal = 'Normal',
  Fire = 'Fire',
  Water = 'Water',
  Electric = 'Electric',
  Grass = 'Grass',
  Ice = 'Ice',
  Fighting = 'Fighting',
  Poison = 'Poison',
  Ground = 'Ground',
  Flying = 'Flying',
  Psychic = 'Psychic',
  Bug = 'Bug',
  Rock = 'Rock',
  Ghost = 'Ghost',
  Dragon = 'Dragon',
  Dark = 'Dark',
  Steel = 'Steel',
  Fairy = 'Fairy'
}

export interface Pokemon {
  id?: string;
  name: string;
  photoUrl: string;
  type?: PokemonType | string;
  description?: string;
  height?: number;
  weight?: number;
  abilities?: string[];
  whenCreated?: Timestamp | Date;
  createdBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private readonly pokemonCollection = 'pokemon';

  constructor(private firestore: Firestore) { }

  /**
   * Get all pokemon from Firestore
   */
  getPokemon(): Observable<Pokemon[]> {
    const pokemonRef = collection(this.firestore, this.pokemonCollection);
    return collectionData(pokemonRef, { idField: 'id' }) as Observable<Pokemon[]>;
  }

  /**
   * Get a single pokemon by ID
   */
  async getPokemonById(pokemonId: string): Promise<Pokemon | null> {
    const pokemonDocRef = doc(this.firestore, this.pokemonCollection, pokemonId);
    const pokemonDoc = await getDoc(pokemonDocRef);
    
    if (pokemonDoc.exists()) {
      return { id: pokemonDoc.id, ...pokemonDoc.data() } as Pokemon;
    }
    return null;
  }

  /**
   * Create a new pokemon
   */
  async createPokemon(pokemonData: Omit<Pokemon, 'id' | 'whenCreated'>): Promise<string> {
    const pokemonRef = collection(this.firestore, this.pokemonCollection);
    const newPokemon = {
      ...pokemonData,
      whenCreated: Timestamp.now()
    };
    
    const docRef = doc(pokemonRef);
    await setDoc(docRef, newPokemon);
    return docRef.id;
  }

  /**
   * Update an existing pokemon
   */
  async updatePokemon(pokemonId: string, pokemonData: Partial<Pokemon>): Promise<void> {
    const pokemonDocRef = doc(this.firestore, this.pokemonCollection, pokemonId);
    await setDoc(pokemonDocRef, pokemonData, { merge: true });
  }

  /**
   * Delete a pokemon
   */
  async deletePokemon(pokemonId: string): Promise<void> {
    const pokemonDocRef = doc(this.firestore, this.pokemonCollection, pokemonId);
    await deleteDoc(pokemonDocRef);
  }
}

