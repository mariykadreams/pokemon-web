import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pokemonWeb',
  standalone: true
})
export class PokemonWebPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
