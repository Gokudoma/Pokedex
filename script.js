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
            backButton: document.getElementById('backButton'),
            dpadUp: document.getElementById('dpad-up'),
            dpadDown: document.getElementById('dpad-down'),
            dpadLeft: document.getElementById('dpad-left'),
            dpadRight: document.getElementById('dpad-right'),
            buttonA: document.getElementById('button-a'),
            buttonB: document.getElementById('button-b')
        };
    }

    initState() {
        this.state = {
            allPokemon: [],
            detailedPokemonData: {},
            selectedPokemonIndex: 0,
            detailViewActive: false,
            pokedexIsOpen: false
        };
    }

    setInitialState() {
        this.elements.pokedexClosed.classList.remove('hidden');
        this.elements.pokedexOpen.classList.add('hidden');
        this.elements.pokedexDetailView.classList.add('hidden');
        this.resetPokemonDisplayBackground();
        this.resetDetailFields();
    }

    initEventListeners() {
        this.elements.openPokedexBtn.addEventListener('click', () => this.togglePokedex());
        this.elements.backButton.addEventListener('click', () => this.hidePokemonDetail());

        // Event Listener für Klicks auf die Pokémon-Liste
        this.elements.pokemonList.addEventListener('click', (event) => {
            const listItem = event.target.closest('li');
            if (listItem && this.state.pokedexIsOpen && !this.state.detailViewActive) {
                const index = Array.from(this.elements.pokemonList.children).indexOf(listItem);
                if (index !== -1) {
                    this.selectPokemonListItem(index);
                }
            }
        });

        this.setupDpadListeners();
        this.setupButtonListeners();
        this.setupKeyboardListeners();
    }

    // Hauptfunktionen
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
            this.selectPokemonListItem(this.state.selectedPokemonIndex);
        }
    }

    closePokedex() {
        this.state.pokedexIsOpen = false;
        this.elements.pokedexOpen.classList.add('hidden');
        this.elements.pokedexClosed.classList.remove('hidden');
        this.hidePokemonDetail();
    }

    // Datenabruf
    async fetchPokemonList() {
        try {
            this.elements.pokemonList.innerHTML = '<li>Lade Pokémon...</li>';
            const response = await this.fetchData(`${POKEAPI_BASE_URL}pokemon?limit=${MAX_POKEMON_ID}`);
            this.state.allPokemon = response.results;
            this.displayPokemonList();
            this.selectPokemonListItem(0);
        } catch (error) {
            this.showError('Fehler beim Abrufen der Pokémon-Liste:', error);
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

            return null;
        }
    }

    // Anzeigefunktionen
    displayPokemonList() {
        this.elements.pokemonList.innerHTML = '';
        this.state.allPokemon.forEach((pokemon, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${capitalizeFirstLetter(pokemon.name)}`;
            listItem.dataset.url = pokemon.url;
            listItem.dataset.id = index + 1;
            this.elements.pokemonList.appendChild(listItem);
        });
    }

    selectPokemonListItem(index) {
        const listItems = this.elements.pokemonList.children;
        if (listItems.length === 0) return;

        const currentActive = document.querySelector('#pokemonList li.active');
        if (currentActive) currentActive.classList.remove('active');

        this.state.selectedPokemonIndex = Math.max(0, Math.min(index, listItems.length - 1));
        const newSelected = listItems[this.state.selectedPokemonIndex];
        newSelected.classList.add('active');
        newSelected.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        this.updatePokemonPreview();
    }

    async updatePokemonPreview() {
        if (this.state.detailViewActive) return;

        const pokemon = this.state.allPokemon[this.state.selectedPokemonIndex];
        if (!pokemon) return;

        let currentPokemonData = this.state.detailedPokemonData[pokemon.name];

        if (!currentPokemonData) {
            currentPokemonData = await this.fetchData(pokemon.url);
            if (!currentPokemonData) return; // Fehler beim Laden, abbrechen
            this.state.detailedPokemonData[pokemon.name] = currentPokemonData;
        }

        this.updatePokemonImage(currentPokemonData);
        this.updateDisplayBackground(currentPokemonData);
        this.resetDetailFields(); // Detailfelder für die Vorschau leeren
    }

    updatePokemonImage(pokemonData) {
        const imageUrl = pokemonData.sprites.other?.['official-artwork']?.front_default ||
                         pokemonData.sprites.front_default;
        this.elements.pokemonImage.src = imageUrl || '';
        this.elements.pokemonImage.alt = imageUrl ? capitalizeFirstLetter(pokemonData.name) : 'Kein Bild verfügbar';
    }

    updateDisplayBackground(pokemonData) {
        const primaryType = pokemonData.types[0].type.name.toLowerCase();
        this.updateBackgroundColor(this.elements.pokemonDisplayArea, primaryType);
    }

    resetDetailFields() {
        this.elements.pokemonName.textContent = '';
        this.elements.pokemonId.textContent = '';
        this.elements.pokemonTypes.innerHTML = '';
        this.elements.pokemonDescription.textContent = 'Wähle ein Pokémon für Details...';
        this.elements.pokemonStats.innerHTML = '';
    }

    // Detailansicht
    async showPokemonDetail() {
        this.state.detailViewActive = true;
        this.toggleDetailView(true);

        const pokemonId = this.getSelectedPokemonId();
        const pokemonData = await this.loadPokemonData(pokemonId);
        if (!pokemonData) return;

        const speciesData = await this.loadSpeciesData(pokemonData.id);
        if (!speciesData) return;

        this.updateDetailView(pokemonData, speciesData);
    }

    getSelectedPokemonId() {
        // Sicherstellen, dass allPokemon existiert und ein Element an selectedPokemonIndex hat
        if (!this.state.allPokemon[this.state.selectedPokemonIndex]) {
            console.warn('Kein Pokémon an diesem Index ausgewählt.');
            return null;
        }
        // Extrahiert die ID aus der URL
        const urlParts = this.state.allPokemon[this.state.selectedPokemonIndex].url.split('/');
        return urlParts[urlParts.length - 2]; // Die ID ist das vorletzte Segment
    }

    async loadPokemonData(pokemonId) {
        if (!pokemonId) return null;

        const pokemonName = this.state.allPokemon[this.state.selectedPokemonIndex].name;
        let pokemonData = this.state.detailedPokemonData[pokemonName];

        if (!pokemonData) {
            pokemonData = await this.fetchData(`${POKEAPI_BASE_URL}pokemon/${pokemonId}/`);
            if (!pokemonData) {
                this.showError('Fehler beim Laden der Pokémon-Details.');
                this.hidePokemonDetail();
                return null;
            }
            this.state.detailedPokemonData[pokemonName] = pokemonData;
        }
        return pokemonData;
    }

    async loadSpeciesData(pokemonId) {
        if (!pokemonId) return null;
        const speciesData = await this.fetchData(`${POKEAPI_BASE_URL}pokemon-species/${pokemonId}/`);
        if (!speciesData) {
            this.showError('Fehler beim Laden der Pokémon-Beschreibung.');
            this.hidePokemonDetail();
            return null;
        }
        return speciesData;
    }

    updateDetailView(pokemonData, speciesData) {
        this.updateBasicInfo(pokemonData);
        this.updateTypeInfo(pokemonData);
        this.updateDescription(speciesData);
        this.updateStats(pokemonData);
        this.playPokemonCry(pokemonData.name);
    }

    updateBasicInfo(pokemonData) {
        this.elements.pokemonName.textContent = capitalizeFirstLetter(pokemonData.name);
        this.elements.pokemonId.textContent = `#${String(pokemonData.id).padStart(3, '0')}`;
        this.elements.pokemonImage.classList.add('flash');
        setTimeout(() => this.elements.pokemonImage.classList.remove('flash'), 400);
    }

    updateTypeInfo(pokemonData) {
        this.elements.pokemonTypes.innerHTML = '';
        const types = pokemonData.types.map(t => t.type.name);
        const primaryType = types[0].toLowerCase();

        this.updateBackgroundColor(this.elements.pokedexScreen, primaryType);
        this.updateBackgroundColor(this.elements.pokemonDisplayArea, primaryType);
        this.updateBackgroundColor(this.elements.pokemonStats, primaryType);

        types.forEach(type => {
            this.elements.pokemonTypes.appendChild(createTypeBadge(type));
        });
    }

    updateBackgroundColor(element, type) {
        Object.keys(detailBgColors).forEach(t => element.classList.remove(`bg-${t}`));
        if (detailBgColors[type]) element.classList.add(`bg-${type}`);
    }

    updateDescription(speciesData) {
        const descriptionEntry = findDescription(speciesData.flavor_text_entries);
        const description = descriptionEntry ?
            descriptionEntry.flavor_text.replace(/[\n\f]/g, ' ') :
            'Keine Beschreibung verfügbar.';
        this.elements.pokemonDescription.textContent = description;
    }

    updateStats(pokemonData) {
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
        this.elements.pokemonCry.play().catch(e => console.warn('Fehler beim Abspielen des Rufs:', e));
    }

    hidePokemonDetail() {
        this.state.detailViewActive = false;
        this.toggleDetailView(false);
        this.resetDetailFields();
        this.resetPokemonDisplayBackground();
        this.elements.pokemonCry.pause();
        this.elements.pokemonCry.currentTime = 0;
        this.selectPokemonListItem(this.state.selectedPokemonIndex);
    }

    //Nur den Hauptcontainer der Detailansicht togglen
    toggleDetailView(show) {
        this.elements.pokedexDetailView.classList.toggle('hidden', !show);
    }

    resetPokemonDisplayBackground() {
        Object.keys(detailBgColors).forEach(t =>
        this.elements.pokemonDisplayArea.classList.remove(`bg-${t}`)
    );
    }

    // Event Handler
    setupDpadListeners() {
        const { dpadUp, dpadDown, dpadLeft, dpadRight } = this.elements;
        dpadUp.addEventListener('click', () => this.handleDpadClick(-1));
        dpadDown.addEventListener('click', () => this.handleDpadClick(1));
        dpadLeft.addEventListener('click', () => this.handleDpadClick(-10));
        dpadRight.addEventListener('click', () => this.handleDpadClick(10));
    }

    handleDpadClick(offset) {
        if (this.state.pokedexIsOpen && !this.state.detailViewActive) {
            this.selectPokemonListItem(this.state.selectedPokemonIndex + offset);
        }
    }

    setupButtonListeners() {
        this.elements.buttonA.addEventListener('click', () => this.handleAButton());
        this.elements.buttonB.addEventListener('click', () => this.handleBButton());
    }

    handleAButton() {
        if (!this.state.pokedexIsOpen) return;

        if (!this.state.detailViewActive) {
            this.showPokemonDetail();
        } else {
            this.elements.pokemonCry.currentTime = 0;
            this.elements.pokemonCry.play().catch(e => console.warn('Fehler beim Abspielen des Rufs:', e));
        }
    }

    handleBButton() {
        if (!this.state.pokedexIsOpen) return;

        if (this.state.detailViewActive) {
            this.hidePokemonDetail();
        } else {
            this.closePokedex();
        }
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            if (!this.state.pokedexIsOpen) {
                if (event.key === ' ') {
                    event.preventDefault();
                    this.openPokedex();
                }
                return;
            }

            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    this.handleDpadClick(-1);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    this.handleDpadClick(1);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    this.handleDpadClick(-10);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    this.handleDpadClick(10);
                    break;
                case 'Enter':
                case 'a':
                case 'A':
                    event.preventDefault();
                    this.handleAButton();
                    break;
                case 'Escape':
                case 'b':
                case 'B':
                    event.preventDefault();
                    this.handleBButton();
                    break;
            }
        });
    }

    // Verbesserte Fehleranzeige für den Benutzer
    showError(message, error) {
        console.error(message, error);
        this.elements.pokemonList.innerHTML = '<li style="color: red;">Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.</li>';
        this.elements.pokemonImage.src = '';
        this.elements.pokemonImage.alt = 'Fehler beim Laden';
        this.resetDetailFields();
        this.resetPokemonDisplayBackground();
        this.elements.pokemonCry.pause();
        this.elements.pokemonCry.currentTime = 0;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => new Pokedex());