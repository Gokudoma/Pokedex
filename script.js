import {
    POKEAPI_BASE_URL, MAX_POKEMON_ID,
    typeColors, detailBgColors,
    capitalizeFirstLetter, createTypeBadge,
    createStatItem, findDescription
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
            volumePercentage: document.getElementById('volumePercentage')
        };
    }

    initState() {
        this.state = {
            allPokemon: [],
            detailedPokemonData: {},
            selectedPokemonIndex: 0,
            detailViewActive: false,
            pokedexIsOpen: false,
            searchTerm: '',
            volume: 0.1
        };
    }

    setInitialState() {
        this.elements.pokedexClosed.classList.remove('hidden');
        this.elements.pokedexOpen.classList.add('hidden');
        this.elements.pokedexDetailView.classList.add('hidden');
        this.resetBackgrounds();
        this.resetDetailFields();
        this.elements.pokemonSearch.value = '';
        this.state.searchTerm = '';
        this.elements.volumeRange.value = this.state.volume * 100;
        this.elements.volumePercentage.textContent = `${Math.round(this.state.volume * 100)}%`;
        this.elements.pokemonCry.volume = this.state.volume;
    }

    initEventListeners() {
        this.elements.openPokedexBtn.addEventListener('click', () => this.togglePokedex());
        this.elements.backButton.addEventListener('click', () => this.hidePokemonDetail());
        this.elements.pokemonList.addEventListener('click', (event) => this.handlePokemonListClick(event));
        this.elements.pokemonSearch.addEventListener('input', (event) => this.handleSearchInput(event));
        this.elements.volumeRange.addEventListener('input', (event) => this.handleVolumeChange(event));
        this.setupDpadListeners();
        this.setupButtonListeners();
        this.setupKeyboardListeners();
    }

    togglePokedex() {
        this.state.pokedexIsOpen ? this.closePokedex() : this.openPokedex();
    }

    openPokedex() {
        this.state.pokedexIsOpen = true;
        this.elements.pokedexClosed.classList.add('hidden');
        this.elements.pokedexOpen.classList.remove('hidden');

        if (this.state.allPokemon.length === 0) {
            this.fetchPokemonList();
        } else {
            this.displayPokemonList();
        }
    }

    closePokedex() {
        this.state.pokedexIsOpen = false;
        this.elements.pokedexOpen.classList.add('hidden');
        this.elements.pokedexClosed.classList.remove('hidden');
        this.hidePokemonDetail();
    }

    async fetchPokemonList() {
        try {
            this.elements.pokemonList.innerHTML = '<li>Lade Pokémon...</li>';
            const response = await this.fetchData(`${POKEAPI_BASE_URL}pokemon?limit=${MAX_POKEMON_ID}`);
            this.state.allPokemon = response.results;
            this.displayPokemonList();
        } catch (error) {
            this.showError('Fehler beim Abrufen der Pokémon-Liste.', error);
        }
    }

    async fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP-Fehler! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Fehler beim Abrufen von ${url}:`, error);
            throw error;
        }
    }

    displayPokemonList() {
        this.elements.pokemonList.innerHTML = '';
        const filteredPokemon = this.state.allPokemon.filter(pokemon =>
            pokemon.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
        );

        if (filteredPokemon.length === 0) {
            this.elements.pokemonList.innerHTML = '<li>Keine Ergebnisse gefunden.</li>';
            this.resetPokemonDisplayBackground();
            this.elements.pokemonImage.src = '';
            this.elements.pokemonImage.alt = 'Kein Pokémon gefunden';
            this.resetDetailFields();
            this.stopPokemonCry();
            return;
        }

        filteredPokemon.forEach((pokemon) => {
            this.elements.pokemonList.appendChild(this.createPokemonListItem(pokemon));
        });

        const currentSelectedName = this.state.allPokemon[this.state.selectedPokemonIndex]?.name;
        const currentSelectedInFilteredIndex = filteredPokemon.findIndex(p => p.name === currentSelectedName);
        
        this.selectPokemonListItem(currentSelectedInFilteredIndex !== -1 ? currentSelectedInFilteredIndex : 0);
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
        const currentActive = document.querySelector('#pokemonList li.active');
        if (currentActive) currentActive.classList.remove('active');

        const newSelectedFilteredItem = listItems[newIndex];
        const newSelectedOriginalId = parseInt(newSelectedFilteredItem.dataset.id) - 1;

        this.state.selectedPokemonIndex = newSelectedOriginalId;

        newSelectedFilteredItem.classList.add('active');
        newSelectedFilteredItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async updatePokemonPreview() {
        if (this.state.detailViewActive) return;

        const pokemon = this.state.allPokemon[this.state.selectedPokemonIndex];
        if (!pokemon) return;

        let currentPokemonData = await this.getOrFetchPokemonData(pokemon.name, pokemon.url);
        if (!currentPokemonData) return;

        this.updatePokemonImage(currentPokemonData);
        this.updateDisplayBackground(currentPokemonData);
        this.resetDetailFields();
    }

    async getOrFetchPokemonData(name, url) {
        if (this.state.detailedPokemonData[name]) {
            return this.state.detailedPokemonData[name];
        }
        const data = await this.fetchData(url);
        if (data) {
            this.state.detailedPokemonData[name] = data;
        }
        return data;
    }

    updatePokemonImage(pokemonData) {
        const imageUrl = pokemonData.sprites.other?.['official-artwork']?.front_default ||
                                   pokemonData.sprites.front_default;
        this.elements.pokemonImage.src = imageUrl || '';
        this.elements.pokemonImage.alt = imageUrl ? capitalizeFirstLetter(pokemonData.name) : 'Kein Bild verfügbar';
    }

    updateDisplayBackground(pokemonData) {
        const primaryType = this.getPrimaryTypeName(pokemonData);
        this.updateBackgroundColor(this.elements.pokemonDisplayArea, primaryType);
    }

    resetDetailFields() {
        this.elements.pokemonName.textContent = '';
        this.elements.pokemonId.textContent = '';
        this.elements.pokemonTypes.innerHTML = '';
        this.elements.pokemonDescription.textContent = 'Wähle ein Pokémon für Details...';
        this.elements.pokemonStats.innerHTML = '';
    }

    async showPokemonDetail() {
        this.state.detailViewActive = true;
        this.toggleDetailViewVisibility(true);

        const pokemonId = this.getSelectedPokemonId();
        const pokemonData = await this.loadPokemonDataForDetail(pokemonId);
        if (!pokemonData) return;

        const speciesData = await this.loadSpeciesDataForDetail(pokemonId);
        if (!speciesData) return;

        this.updateDetailView(pokemonData, speciesData);
    }

    toggleDetailViewVisibility(show) {
        this.elements.pokedexDetailView.classList.toggle('hidden', !show);
        this.elements.pokedexListArea.classList.toggle('hidden', show);
        this.elements.pokemonSearch.classList.toggle('hidden', show);
        this.elements.pokemonSearch.parentNode.classList.toggle('hidden', show);
    }

    getSelectedPokemonId() {
        if (!this.state.allPokemon[this.state.selectedPokemonIndex]) {
            console.warn('Kein Pokémon an diesem Index ausgewählt.');
            return null;
        }
        const urlParts = this.state.allPokemon[this.state.selectedPokemonIndex].url.split('/');
        return urlParts[urlParts.length - 2];
    }

    async loadPokemonDataForDetail(pokemonId) {
        if (!pokemonId) return null;
        const pokemonName = this.state.allPokemon[this.state.selectedPokemonIndex].name;
        let pokemonData = this.state.detailedPokemonData[pokemonName];

        if (!pokemonData) {
            try {
                pokemonData = await this.fetchData(`${POKEAPI_BASE_URL}pokemon/${pokemonId}/`);
                this.state.detailedPokemonData[pokemonName] = pokemonData;
            } catch (error) {
                this.showError('Fehler beim Laden der Pokémon-Details.', error);
                this.hidePokemonDetail();
                return null;
            }
        }
        return pokemonData;
    }

    async loadSpeciesDataForDetail(pokemonId) {
        if (!pokemonId) return null;
        try {
            return await this.fetchData(`${POKEAPI_BASE_URL}pokemon-species/${pokemonId}/`);
        } catch (error) {
            this.showError('Fehler beim Laden der Pokémon-Beschreibung.', error);
            this.hidePokemonDetail();
            return null;
        }
    }

    updateDetailView(pokemonData, speciesData) {
        this.updateBasicPokemonInfo(pokemonData);
        this.updatePokemonTypeAndBackgrounds(pokemonData);
        this.updatePokemonDescription(speciesData);
        this.updatePokemonStats(pokemonData);
        this.playPokemonCry(pokemonData.name);
    }

    updateBasicPokemonInfo(pokemonData) {
        this.elements.pokemonName.textContent = capitalizeFirstLetter(pokemonData.name);
        this.elements.pokemonId.textContent = `#${String(pokemonData.id).padStart(3, '0')}`;
        this.animatePokemonImage();
    }

    animatePokemonImage() {
        this.elements.pokemonImage.classList.add('flash');
        setTimeout(() => this.elements.pokemonImage.classList.remove('flash'), 400);
    }

    updatePokemonTypeAndBackgrounds(pokemonData) {
        this.elements.pokemonTypes.innerHTML = '';
        const types = pokemonData.types.map(t => t.type.name);
        const primaryType = this.getPrimaryTypeName(pokemonData);

        this.applyBackgroundColors(primaryType);
        types.forEach(type => this.elements.pokemonTypes.appendChild(createTypeBadge(type)));
    }

    getPrimaryTypeName(pokemonData) {
        return pokemonData.types[0].type.name.toLowerCase();
    }

    applyBackgroundColors(primaryType) {
        this.updateBackgroundColor(this.elements.pokedexScreen, primaryType);
        this.updateBackgroundColor(this.elements.pokemonDisplayArea, primaryType);
        this.updateBackgroundColor(this.elements.pokemonStats, primaryType);
    }

    updateBackgroundColor(element, type) {
        Object.keys(detailBgColors).forEach(t => element.classList.remove(`bg-${t}`));
        if (detailBgColors[type]) element.classList.add(`bg-${type}`);
    }

    updatePokemonDescription(speciesData) {
        const descriptionEntry = findDescription(speciesData.flavor_text_entries);
        const description = descriptionEntry ?
            descriptionEntry.flavor_text.replace(/[\n\f]/g, ' ') :
            'Keine Beschreibung verfügbar.';
        this.elements.pokemonDescription.textContent = description;
    }

    updatePokemonStats(pokemonData) {
        this.elements.pokemonStats.innerHTML = '';
        pokemonData.stats.forEach(stat => {
            this.elements.pokemonStats.appendChild(
                createStatItem(stat.stat.name, stat.base_stat)
            );
        });
    }

    playPokemonCry(pokemonName) {
        this.elements.pokemonCry.src =
            `https://play.pokemonshowdown.com/audio/cries/${pokemonName.toLowerCase()}.mp3`;
        this.elements.pokemonCry.volume = this.state.volume;
        this.elements.pokemonCry.play().catch(e => console.warn('Fehler beim Abspielen des Rufs:', e));
    }

    hidePokemonDetail() {
        this.state.detailViewActive = false;
        this.toggleDetailViewVisibility(false);
        this.resetDetailFields();
        this.resetBackgrounds();
        this.stopPokemonCry();
        this.displayPokemonList();
    }

    stopPokemonCry() {
        this.elements.pokemonCry.pause();
        this.elements.pokemonCry.currentTime = 0;
    }

    resetBackgrounds() {
        Object.keys(detailBgColors).forEach(t => {
            this.elements.pokemonDisplayArea.classList.remove(`bg-${t}`);
            this.elements.pokedexScreen.classList.remove(`bg-${t}`);
            this.elements.pokemonStats.classList.remove(`bg-${t}`);
        });
    }

    resetPokemonDisplayBackground() {
        Object.keys(detailBgColors).forEach(t =>
            this.elements.pokemonDisplayArea.classList.remove(`bg-${t}`)
        );
    }

    handlePokemonListClick(event) {
        const listItem = event.target.closest('li');
        if (listItem && this.state.pokedexIsOpen && !this.state.detailViewActive) {
            const pokemonIdClicked = parseInt(listItem.dataset.id);
            const originalIndex = pokemonIdClicked - 1; 

            if (originalIndex !== -1) {
                this.state.selectedPokemonIndex = originalIndex;
                this.displayPokemonList();
            }
        }
    }

    handleSearchInput(event) {
        this.state.searchTerm = event.target.value;
        this.displayPokemonList();
    }

    handleVolumeChange(event) {
        const newVolume = parseFloat(event.target.value) / 100;
        this.state.volume = newVolume;
        this.elements.pokemonCry.volume = newVolume;
        this.elements.volumePercentage.textContent = `${Math.round(newVolume * 100)}%`;
    }

    setupDpadListeners() {
        this.elements.dpadUp.addEventListener('click', () => this.handleDpadMovement(-1));
        this.elements.dpadDown.addEventListener('click', () => this.handleDpadMovement(1));
        this.elements.dpadLeft.addEventListener('click', () => this.handleDpadMovement(-10));
        this.elements.dpadRight.addEventListener('click', () => this.handleDpadMovement(10));
    }

    handleDpadMovement(offset) {
        if (this.state.pokedexIsOpen && !this.state.detailViewActive) {
            const filteredPokemon = this.state.allPokemon.filter(pokemon =>
                pokemon.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
            );

            if (filteredPokemon.length === 0) return;

            const currentSelectedName = this.state.allPokemon[this.state.selectedPokemonIndex]?.name;
            let currentFilteredIndex = filteredPokemon.findIndex(p => p.name === currentSelectedName);

            if (currentFilteredIndex === -1) {
                currentFilteredIndex = 0;
            }

            let newFilteredIndex = currentFilteredIndex + offset;

            if (newFilteredIndex < 0) {
                newFilteredIndex = 0;
            } else if (newFilteredIndex >= filteredPokemon.length) {
                newFilteredIndex = filteredPokemon.length - 1;
            }

            const newPokemonName = filteredPokemon[newFilteredIndex].name;
            const newOriginalIndex = this.state.allPokemon.findIndex(p => p.name === newPokemonName);

            if (newOriginalIndex !== -1) {
                this.state.selectedPokemonIndex = newOriginalIndex;
                this.displayPokemonList();
            }
        }
    }

    setupButtonListeners() {
        this.elements.buttonA.addEventListener('click', () => this.handleAButtonPress());
        this.elements.buttonB.addEventListener('click', () => this.handleBButtonPress());
    }

    handleAButtonPress() {
        if (!this.state.pokedexIsOpen) return;

        if (!this.state.detailViewActive) {
            this.showPokemonDetail();
        } else {
            this.playPokemonCry(this.state.allPokemon[this.state.selectedPokemonIndex].name);
        }
    }

    handleBButtonPress() {
        if (!this.state.pokedexIsOpen) return;

        if (this.state.detailViewActive) {
            this.hidePokemonDetail();
        } else {
            this.closePokedex();
        }
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => this.handleKeyboardInput(event));
    }

    handleKeyboardInput(event) {
        if (event.target === this.elements.pokemonSearch) {
            return;
        }

        if (!this.state.pokedexIsOpen) {
            this.handleClosedPokedexKey(event);
            return;
        }
        this.handleOpenPokedexKey(event);
    }

    handleClosedPokedexKey(event) {
        if (event.key === ' ') {
            event.preventDefault();
            this.openPokedex();
        }
    }

    handleOpenPokedexKey(event) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault(); this.handleDpadMovement(-1); break;
            case 'ArrowDown':
                event.preventDefault(); this.handleDpadMovement(1); break;
            case 'ArrowLeft':
                event.preventDefault(); this.handleDpadMovement(-10); break;
            case 'ArrowRight':
                event.preventDefault(); this.handleDpadMovement(10); break;
            case 'Enter': case 'a': case 'A':
                event.preventDefault(); this.handleAButtonPress(); break;
            case 'Escape': case 'b': case 'B':
                event.preventDefault(); this.handleBButtonPress(); break;
        }
    }

    showError(message, error) {
        console.error(message, error);
        this.elements.pokemonList.innerHTML = '<li style="color: red;">Fehler: ' + message + ' Bitte versuchen Sie es später erneut.</li>';
        this.elements.pokemonImage.src = '';
        this.elements.pokemonImage.alt = 'Fehler beim Laden';
        this.resetDetailFields();
        this.resetBackgrounds();
        this.stopPokemonCry();
    }
}

document.addEventListener('DOMContentLoaded', () => new Pokedex());