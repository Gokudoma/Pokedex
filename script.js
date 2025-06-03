import {
    POKEAPI_BASE_URL,
    MAX_POKEMON_ID
} from './template.js';

import {
    fetchData,
    getOrFetchPokemonData,
    loadPokemonDataForDetail,
    loadSpeciesDataForDetail,
    loadEvolutionChainData,
    fetchAndCacheData
} from './dataHandler.js';

import {
    setupPokedexEventListeners
} from './eventHandlers.js';

import {
    updatePokemonImage,
    updateBackgroundColor,
    resetDetailFields,
    resetExtraDetailFields,
    displayPokemonList,
    highlightSelectedListItemAndScroll,
    updateDetailView,
    applyBackgroundColors,
    updateExtraDetailView,
    resetBackgrounds,
    resetPokemonDisplayBackground,
    showListAndSearch,
    hideListAndSearch,
    hideExtraDetailAndShowDetail
} from './uiRenderer.js';

import {
    capitalizeFirstLetter
} from './template.js';

class Pokedex {
    constructor() {
        this.initElements();
        this.initState();
        this.initEventListeners();
        this.setInitialState();
    }

    initElements() {
        this.elements = {
            pokedexClosed: document.querySelector('.pokedex-closed'),
            pokedexOpen: document.querySelector('.pokedex-open'),
            openPokedexBtn: document.getElementById('openPokedexBtn'),
            pokemonList: document.getElementById('pokemonList'),
            pokemonImage: document.getElementById('pokemonImage'),
            pokemonName: document.getElementById('pokemonName'),
            pokemonId: document.getElementById('pokemonId'),
            pokemonTypes: document.getElementById('pokemonTypes'),
            pokemonDescription: document.getElementById('pokemonDescription'),
            pokemonStats: document.getElementById('pokemonStats'),
            pokemonCry: document.getElementById('pokemonCry'),
            pokedexScreen: document.querySelector('.pokedex-screen'),
            pokemonDisplayArea: document.querySelector('.pokemon-display-area'),
            pokedexDetailView: document.querySelector('.pokedex-detail-view'),
            pokedexListArea: document.querySelector('.pokedex-list-area'),
            backButton: document.getElementById('backButton'),
            dpadUp: document.getElementById('dpad-up'),
            dpadDown: document.getElementById('dpad-down'),
            dpadLeft: document.getElementById('dpad-left'),
            dpadRight: document.getElementById('dpad-right'),
            buttonA: document.getElementById('button-a'),
            buttonB: document.getElementById('button-b'),
            pokemonSearch: document.getElementById('pokemonSearch'),
            volumeRange: document.getElementById('volumeRange'),
            volumePercentage: document.getElementById('volumePercentage'),
            extraDetailsBtn: document.getElementById('extraDetailsBtn'),
            pokedexExtraDetailsView: document.querySelector('.pokedex-extra-details-view'),
            backButtonExtra: document.getElementById('backButtonExtra'),
            extraDetailsName: document.getElementById('extraDetailsName'),
            pokemonHabitat: document.getElementById('pokemonHabitat'),
            pokemonHeightWeight: document.getElementById('pokemonHeightWeight'),
            pokemonMoves: document.getElementById('pokemonMoves'),
            pokemonEvolution: document.getElementById('pokemonEvolution'),
            extraDetailsScreen: document.querySelector('.pokedex-extra-details-view .pokedex-screen')
        };
    }

    initState() {
        this.state = {
            allPokemon: [],
            detailedPokemonData: {},
            speciesDataCache: {},
            evolutionChainCache: {},
            selectedPokemonIndex: 0,
            detailViewActive: false,
            extraDetailViewActive: false,
            pokedexIsOpen: false,
            searchTerm: '',
            volume: 0.1
        };
    }

    setInitialState() {
        this.resetPokedexVisibility();
        this.resetPokedexVisuals();
        this.resetSearchAndVolume();
    }

    resetPokedexVisibility() {
        this.elements.pokedexClosed.classList.remove('hidden', 'opening', 'closing');
        this.elements.pokedexOpen.classList.add('hidden');
        this.elements.pokedexOpen.classList.remove('opened');
        this.elements.pokedexDetailView.classList.add('hidden');
        this.elements.pokedexExtraDetailsView.classList.add('hidden');
        this.elements.extraDetailsBtn.disabled = true;
    }

    resetSearchAndVolume() {
        this.elements.pokemonSearch.value = '';
        this.state.searchTerm = '';
        this.elements.volumeRange.value = this.state.volume * 100;
        this.elements.volumePercentage.textContent = `${Math.round(this.state.volume * 100)}%`;
        this.elements.pokemonCry.volume = this.state.volume;
    }

    // Nutzt die ausgelagerten Reset-Funktionen
    resetPokedexVisuals() {
        resetBackgrounds(this.elements);
        resetDetailFields(this.elements);
        resetExtraDetailFields(this.elements);
        this.elements.pokemonImage.src = '';
        this.elements.pokemonImage.alt = '';
        this.stopPokemonCry();
    }

    initEventListeners() {
        setupPokedexEventListeners(this);
    }

    togglePokedex() {
        this.state.pokedexIsOpen ? this.closePokedex() : this.openPokedex();
    }

    openPokedex() {
        if (this.state.pokedexIsOpen) return;
        this.state.pokedexIsOpen = true;
        this.resetPokedexVisibility();
        this.animatePokedexOpen();
        this.loadPokemonContent();
    }

    loadPokemonContent() {
        if (this.state.allPokemon.length === 0) {
            this.fetchPokemonList();
        } else {
            this.displayPokemonList();
        }
    }

    animatePokedexOpen() {
        this.elements.pokedexOpen.classList.remove('hidden');
        this.elements.pokedexOpen.classList.remove('opened');
        this.elements.pokedexClosed.classList.add('opening');
        setTimeout(() => this.elements.pokedexOpen.classList.add('opened'), 10);
        this.elements.pokedexClosed.addEventListener('transitionend', this.handleOpenTransitionEnd);
    }

    handleOpenTransitionEnd = (event) => {
        if (event.target === this.elements.pokedexClosed && event.propertyName === 'transform') {
            this.elements.pokedexClosed.classList.add('hidden');
            this.elements.pokedexClosed.classList.remove('opening');
            this.elements.pokedexClosed.removeEventListener('transitionend', this.handleOpenTransitionEnd);
        }
    };

    closePokedex() {
        if (!this.state.pokedexIsOpen) return;
        this.state.pokedexIsOpen = false;
        this.hidePokemonDetail();
        this.hideExtraDetailView();
        this.animatePokedexClose();
        this.elements.extraDetailsBtn.disabled = true;
        this.resetPokedexVisuals();
    }

    animatePokedexClose() {
        this.elements.pokedexOpen.classList.remove('opened');
        this.elements.pokedexClosed.classList.remove('hidden', 'opening');
        setTimeout(() => this.elements.pokedexClosed.classList.add('closing'), 10);
        this.elements.pokedexClosed.addEventListener('transitionend', this.handleCloseTransitionEnd);
        this.elements.pokedexOpen.addEventListener('transitionend', this.handleCloseTransitionEndOpen);
    }

    handleCloseTransitionEnd = (event) => {
        if (event.target === this.elements.pokedexClosed && event.propertyName === 'transform') {
            this.elements.pokedexClosed.classList.remove('closing');
            this.elements.pokedexClosed.removeEventListener('transitionend', this.handleCloseTransitionEnd);
        }
    };

    handleCloseTransitionEndOpen = (event) => {
        if (event.target === this.elements.pokedexOpen && event.propertyName === 'transform') {
            this.elements.pokedexOpen.classList.add('hidden');
            this.elements.pokedexOpen.removeEventListener('transitionend', this.handleCloseTransitionEndOpen);
        }
    };

    async fetchPokemonList() {
        try {
            this.elements.pokemonList.innerHTML = '<li>Lade Pokémon...</li>';
            const response = await fetchData(`${POKEAPI_BASE_URL}pokemon?limit=${MAX_POKEMON_ID}`);
            this.state.allPokemon = response.results;
            this.displayPokemonList();
        } catch (error) {
            this.handleFetchError('Fehler beim Abrufen der Pokémon-Liste.', error);
        }
    }

    // Diese Methode ruft nun die ausgelagerte `displayPokemonList` Funktion auf und übergibt benötigte "Pokedex"-Methoden.
    displayPokemonList() {
        displayPokemonList(
            this.elements,
            this.state,
            this.getFilteredPokemon.bind(this),
            this.createPokemonListItem.bind(this),
            this.highlightSelectedListItem.bind(this),
            this.handleNoSearchResults.bind(this),
            this.updatePokemonPreview.bind(this)
        );
    }

    getFilteredPokemon() {
        return this.state.allPokemon.filter(pokemon =>
            pokemon.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
        );
    }

    // Diese Methode bleibt in der Pokedex-Klasse, da sie den Zustand (state) des Pokedex direkt manipuliert.
    handleNoSearchResults() {
        this.elements.pokemonList.innerHTML = '<li>Keine Ergebnisse gefunden.</li>';
        resetPokemonDisplayBackground(this.elements);
        this.elements.pokemonImage.src = '';
        this.elements.pokemonImage.alt = 'Kein Pokémon gefunden';
        resetDetailFields(this.elements);
        resetExtraDetailFields(this.elements);
        this.stopPokemonCry();
        this.elements.extraDetailsBtn.disabled = true;
    }

    createPokemonListItem(pokemon) {
        const listItem = document.createElement('li');
        const originalIndex = this.state.allPokemon.findIndex(p => p.name === pokemon.name);
        listItem.textContent = `${originalIndex + 1}. ${capitalizeFirstLetter(pokemon.name)}`;
        listItem.dataset.url = pokemon.url;
        listItem.dataset.id = originalIndex + 1;
        return listItem;
    }

    selectPokemonListItem(index) {
        const listItems = this.elements.pokemonList.children;
        if (listItems.length === 0) return;
        this.highlightSelectedListItem(listItems, index);
        this.updatePokemonPreview();
    }

    highlightSelectedListItem(listItems, newIndex) {
        highlightSelectedListItemAndScroll(listItems, newIndex, this.state);
    }

    async updatePokemonPreview() {
        if (this.state.detailViewActive || this.state.extraDetailViewActive) return;
        const pokemon = this.state.allPokemon[this.state.selectedPokemonIndex];
        if (!pokemon) {
            this.resetPokemonPreviewDisplay();
            return;
        }
        const currentPokemonData = await getOrFetchPokemonData(pokemon.name, pokemon.url, this.state.detailedPokemonData);
        if (!currentPokemonData) {
            this.resetPokemonPreviewDisplay();
            return;
        }
        updatePokemonImage(this.elements, currentPokemonData);
        updateBackgroundColor(this.elements.pokemonDisplayArea, this.getPrimaryTypeName(currentPokemonData));
        resetDetailFields(this.elements);
        resetExtraDetailFields(this.elements);
        this.stopPokemonCry();
        this.elements.extraDetailsBtn.disabled = true;
    }

    resetPokemonPreviewDisplay() {
        this.elements.extraDetailsBtn.disabled = true;
        this.resetPokedexVisuals();
    }

    resetDetailAndExtraFields() {
        resetDetailFields(this.elements);
        resetExtraDetailFields(this.elements);
    }

    async showPokemonDetail() {
        this.prepareDetailView();
        const pokemonId = this.getSelectedPokemonId();
        if (!pokemonId) return this.handleDetailError('Kein Pokémon ausgewählt.');

        const [pokemonData, speciesData] = await Promise.all([
            loadPokemonDataForDetail(pokemonId, this.state.detailedPokemonData, this.state.allPokemon, this.state.selectedPokemonIndex),
            loadSpeciesDataForDetail(pokemonId, this.state.speciesDataCache)
        ]);
        if (!pokemonData || !speciesData) return this.handleDetailError('Daten nicht geladen.');
        updateDetailView(this.elements, pokemonData, speciesData, this.getPrimaryTypeName.bind(this), this.playPokemonCry.bind(this));
    }

    // prepareDetailView nutzt jetzt die ausgelagerten show/hide-Funktionen
    prepareDetailView() {
        hideListAndSearch(this.elements);
        hideExtraDetailAndShowDetail(this.elements);
        this.state.detailViewActive = true;
        this.state.extraDetailViewActive = false;
        this.elements.extraDetailsBtn.disabled = false;
    }

    handleDetailError(message) {
        this.handleFetchError(message, null, true);
        this.elements.extraDetailsBtn.disabled = true;
        return null;
    }

    async showExtraDetailView() {
        if (!this.state.pokedexIsOpen) return;
        if (!this.state.detailViewActive) await this.showPokemonDetail();
        if (!this.state.detailViewActive) return;

        this.elements.pokedexDetailView.classList.add('hidden');
        this.elements.pokedexExtraDetailsView.classList.remove('hidden');
        this.state.extraDetailViewActive = true;

        const pokemonId = this.getSelectedPokemonId();
        if (!pokemonId) return this.handleDetailError('Kein Pokémon ausgewählt.');

        await this.loadAndDisplayExtraDetails(pokemonId);
    }

    async loadAndDisplayExtraDetails(pokemonId) {
        const [pokemonData, speciesData] = await Promise.all([
            loadPokemonDataForDetail(pokemonId, this.state.detailedPokemonData, this.state.allPokemon, this.state.selectedPokemonIndex),
            loadSpeciesDataForDetail(pokemonId, this.state.speciesDataCache)
        ]);
        if (!pokemonData || !speciesData) return;

        const evolutionChainData = await loadEvolutionChainData(speciesData?.evolution_chain.url, this.state.evolutionChainCache);
        updateExtraDetailView(this.elements, pokemonData, speciesData, evolutionChainData, this.getPrimaryTypeName.bind(this));
    }

    getSelectedPokemonId() {
        const pokemon = this.state.allPokemon[this.state.selectedPokemonIndex];
        return pokemon ? pokemon.url.split('/').slice(-2, -1)[0] : null;
    }

    getPrimaryTypeName(pokemonData) {
        return pokemonData.types[0].type.name.toLowerCase();
    }

    playPokemonCry(pokemonName) {
        this.elements.pokemonCry.src = `https://play.pokemonshowdown.com/audio/cries/${pokemonName.toLowerCase()}.mp3`;
        this.elements.pokemonCry.volume = this.state.volume;
        this.elements.pokemonCry.play().catch(e => console.warn('Fehler beim Abspielen des Rufs:', e));
    }

    hidePokemonDetail() {
        this.state.detailViewActive = false;
        this.state.extraDetailViewActive = false;
        this.elements.pokedexDetailView.classList.add('hidden');
        this.elements.pokedexExtraDetailsView.classList.add('hidden');
        showListAndSearch(this.elements);
        this.resetAllDetailStates();
        this.displayPokemonList();
        this.elements.extraDetailsBtn.disabled = true;
    }

    resetAllDetailStates() {
        resetDetailFields(this.elements);
        resetExtraDetailFields(this.elements);
        resetBackgrounds(this.elements);
        this.stopPokemonCry();
    }

    hideExtraDetailView() {
        this.state.extraDetailViewActive = false;
        this.elements.pokedexExtraDetailsView.classList.add('hidden');
        this.elements.pokedexDetailView.classList.remove('hidden');
        resetExtraDetailFields(this.elements);
        this.restoreDetailViewBackground();
    }

    restoreDetailViewBackground() {
        const currentPokemonData = this.state.detailedPokemonData[this.state.allPokemon[this.state.selectedPokemonIndex]?.name];
        if (currentPokemonData) {
            const primaryType = this.getPrimaryTypeName(currentPokemonData);
            updateBackgroundColor(this.elements.pokemonDisplayArea, primaryType);
            updateBackgroundColor(this.elements.pokedexScreen, primaryType);
            updateBackgroundColor(this.elements.pokemonStats, primaryType);
        } else {
            resetBackgrounds(this.elements);
        }
    }

    stopPokemonCry() {
        this.elements.pokemonCry.pause();
        this.elements.pokemonCry.currentTime = 0;
    }

    handlePokemonListClick(event) {
        const listItem = event.target.closest('li');
        if (!listItem || !this.state.pokedexIsOpen) return;
        const pokemonIdClicked = parseInt(listItem.dataset.id);
        const originalIndex = pokemonIdClicked - 1;

        if (originalIndex !== -1 && this.state.selectedPokemonIndex !== originalIndex) {
            this.state.selectedPokemonIndex = originalIndex;
            this.displayPokemonList();
            this.hidePokemonDetail();
        } else if (this.state.selectedPokemonIndex === originalIndex && !this.state.detailViewActive && !this.state.extraDetailViewActive) {
            this.showPokemonDetail();
        }
    }

    handleSearchInput(event) {
        this.state.searchTerm = event.target.value;
        this.displayPokemonList();
        if (this.state.detailViewActive || this.state.extraDetailViewActive) {
            this.hidePokemonDetail();
        }
    }

    handleVolumeChange(event) {
        const newVolume = parseFloat(event.target.value) / 100;
        this.state.volume = newVolume;
        this.elements.pokemonCry.volume = newVolume;
        this.elements.volumePercentage.textContent = `${Math.round(newVolume * 100)}%`;
    }

    handleDpadMovement(offset) {
        if (!this.state.pokedexIsOpen || this.state.detailViewActive || this.state.extraDetailViewActive) return;
        const filteredPokemon = this.getFilteredPokemon();
        if (filteredPokemon.length === 0) return;

        let currentFilteredIndex = this.getCurrentFilteredIndex(filteredPokemon);
        const newFilteredIndex = this.calculateNewFilteredIndex(currentFilteredIndex, offset, filteredPokemon.length);
        this.updateSelectedPokemonAndDisplay(filteredPokemon[newFilteredIndex]);
    }

    getCurrentFilteredIndex(filteredPokemon) {
        const currentSelectedName = this.state.allPokemon[this.state.selectedPokemonIndex]?.name;
        let currentFilteredIndex = filteredPokemon.findIndex(p => p.name === currentSelectedName);
        return currentFilteredIndex === -1 ? 0 : currentFilteredIndex;
    }

    calculateNewFilteredIndex(currentIndex, offset, totalLength) {
        let newIndex = currentIndex + offset;
        if (newIndex < 0) newIndex = 0;
        else if (newIndex >= totalLength) newIndex = totalLength - 1;
        return newIndex;
    }

    updateSelectedPokemonAndDisplay(newPokemon) {
        const newOriginalIndex = this.state.allPokemon.findIndex(p => p.name === newPokemon.name);
        if (newOriginalIndex !== -1) {
            this.state.selectedPokemonIndex = newOriginalIndex;
            this.displayPokemonList();
        }
    }

    handleAButtonPress() {
        if (!this.state.pokedexIsOpen) return;
        if (this.state.detailViewActive || this.state.extraDetailViewActive) {
            const pokemonName = this.state.allPokemon[this.state.selectedPokemonIndex]?.name;
            if (pokemonName) this.playPokemonCry(pokemonName);
        } else {
            this.showPokemonDetail();
        }
    }

    handleBButtonPress() {
        if (!this.state.pokedexIsOpen) return;
        if (this.state.extraDetailViewActive) {
            this.hideExtraDetailView();
        } else if (this.state.detailViewActive) {
            this.hidePokemonDetail();
        } else {
            this.closePokedex();
        }
    }

    handleKeyboardInput(event) {
        if (event.target === this.elements.pokemonSearch) return;
        if (this.state.pokedexIsOpen) {
            this.handleOpenPokedexKey(event);
        } else {
            this.handleClosedPokedexKey(event);
        }
    }

    handleClosedPokedexKey(event) {
        if (event.key === ' ') {
            event.preventDefault();
            this.openPokedex();
        }
    }

    handleOpenPokedexKey(event) {
        event.preventDefault();
        const keyActions = {
            'ArrowUp': () => this.handleDpadMovement(-1),
            'ArrowDown': () => this.handleDpadMovement(1),
            'ArrowLeft': () => this.handleDpadMovement(-10),
            'ArrowRight': () => this.handleDpadMovement(10),
            'Enter': () => this.handleAButtonPress(),
            'a': () => this.handleAButtonPress(),
            'A': () => this.handleAButtonPress(),
            'Escape': () => this.handleBButtonPress(),
            'b': () => this.handleBButtonPress(),
            'B': () => this.handleBButtonPress(),
            'd': () => this.handleExtraDetailKey(),
            'D': () => this.handleExtraDetailKey(),
        };
        const action = keyActions[event.key];
        if (action) action();
    }

    handleExtraDetailKey() {
        if (this.state.detailViewActive && !this.state.extraDetailViewActive) {
            this.showExtraDetailView();
        }
    }

    handleFetchError(message, error, shouldHideDetail = false) {
        console.error(message, error);
        this.elements.pokemonList.innerHTML = `<li style="color: red;">Fehler: ${message} Bitte versuchen Sie es später erneut.</li>`;
        this.elements.pokemonImage.src = '';
        this.elements.pokemonImage.alt = 'Fehler beim Laden';
        resetDetailFields(this.elements);
        resetExtraDetailFields(this.elements);
        resetBackgrounds(this.elements);
        this.stopPokemonCry();
        if (shouldHideDetail) this.hidePokemonDetail();
        this.elements.extraDetailsBtn.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => new Pokedex());