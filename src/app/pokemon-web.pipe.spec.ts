import { PokemonWebPipe } from './pokemon-web.pipe';

describe('PokemonWebPipe', () => {
  it('create an instance', () => {
    const pipe = new PokemonWebPipe();
    expect(pipe).toBeTruthy();
  });
});
