export function setupPokedexEventListeners(pokedexInstance) {
    const elements = pokedexInstance.elements;

    // Allgemeine Pokedex-Steuerung
    elements.openPokedexBtn.addEventListener('click', () => pokedexInstance.togglePokedex());
    elements.backButton.addEventListener('click', () => pokedexInstance.hidePokemonDetail());
    elements.backButtonExtra.addEventListener('click', () => pokedexInstance.hideExtraDetailView());

    // Listen-Interaktion
    elements.pokemonList.addEventListener('click', (event) => pokedexInstance.handlePokemonListClick(event));
    elements.pokemonSearch.addEventListener('input', (event) => pokedexInstance.handleSearchInput(event));

    // Audio-Steuerung
    elements.volumeRange.addEventListener('input', (event) => pokedexInstance.handleVolumeChange(event));

    // Detailansicht-Steuerung
    elements.extraDetailsBtn.addEventListener('click', () => pokedexInstance.showExtraDetailView());

    // D-Pad Listener
    elements.dpadUp.addEventListener('click', () => pokedexInstance.handleDpadMovement(-1));
    elements.dpadDown.addEventListener('click', () => pokedexInstance.handleDpadMovement(1));
    elements.dpadLeft.addEventListener('click', () => pokedexInstance.handleDpadMovement(-10));
    elements.dpadRight.addEventListener('click', () => pokedexInstance.handleDpadMovement(10));

    // Button Listener
    elements.buttonA.addEventListener('click', () => pokedexInstance.handleAButtonPress());
    elements.buttonB.addEventListener('click', () => pokedexInstance.handleBButtonPress());

    // Keyboard Listener
    document.addEventListener('keydown', (event) => pokedexInstance.handleKeyboardInput(event));
}