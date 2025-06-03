import {
    POKEAPI_BASE_URL, MAX_POKEMON_ID,
    detailBgColors,
    capitalizeFirstLetter, createTypeBadge,
    createStatItem, findDescription,
    createDetailSection, createMovesList, createEvolutionLine
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

    resetPokedexVisuals() {
        this.resetBackgrounds();
        this.resetDetailFields();
        this.resetExtraDetailFields();
        this.elements.pokemonImage.src = '';
        this.elements.pokemonImage.alt = '';
        this.stopPokemonCry();
    }

    initEventListeners() {
        this.elements.openPokedexBtn.addEventListener('click', () => this.togglePokedex());
        this.elements.backButton.addEventListener('click', () => this.hidePokemonDetail());
        this.elements.backButtonExtra.addEventListener('click', () => this.hideExtraDetailView());
        this.elements.pokemonList.addEventListener('click', (event) => this.handlePokemonListClick(event));
        this.elements.pokemonSearch.addEventListener('input', (event) => this.handleSearchInput(event));
        this.elements.volumeRange.addEventListener('input', (event) => this.handleVolumeChange(event));
        this.elements.extraDetailsBtn.addEventListener('click', () => this.showExtraDetailView());
        this.setupDpadListeners();
        this.setupButtonListeners();
        this.setupKeyboardListeners();
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
            const response = await this.fetchData(`${POKEAPI_BASE_URL}pokemon?limit=${MAX_POKEMON_ID}`);
            this.state.allPokemon = response.results;
            this.displayPokemonList();
        } catch (error) {
            this.handleFetchError('Fehler beim Abrufen der Pokémon-Liste.', error);
        }
    }

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        return await response.json();
    }

    displayPokemonList() {
        this.elements.pokemonList.innerHTML = '';
        const filtered = this.getFilteredPokemon();
        if (filtered.length === 0) {
            this.handleNoSearchResults();
            return;
        }
        this.renderPokemonListItems(filtered);
        this.selectInitialListItem(filtered);
    }

    getFilteredPokemon() {
        return this.state.allPokemon.filter(pokemon =>
            pokemon.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
        );
    }

    handleNoSearchResults() {
        this.elements.pokemonList.innerHTML = '<li>Keine Ergebnisse gefunden.</li>';
        this.resetPokemonDisplayBackground();
        this.elements.pokemonImage.src = '';
        this.elements.pokemonImage.alt = 'Kein Pokémon gefunden';
        this.resetDetailFields();
        this.resetExtraDetailFields();
        this.stopPokemonCry();
        this.elements.extraDetailsBtn.disabled = true;
    }

    renderPokemonListItems(pokemonList) {
        pokemonList.forEach(pokemon =>
            this.elements.pokemonList.appendChild(this.createPokemonListItem(pokemon))
        );
    }

    selectInitialListItem(filteredPokemon) {
        const currentSelectedName = this.state.allPokemon[this.state.selectedPokemonIndex]?.name;
        let newIndex = filteredPokemon.findIndex(p => p.name === currentSelectedName);
        if (newIndex === -1 && filteredPokemon.length > 0) newIndex = 0;
        if (newIndex !== -1) {
            this.highlightSelectedListItem(this.elements.pokemonList.children, newIndex);
            this.updatePokemonPreview();
        }
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
        if (!newSelectedFilteredItem) return;
        const newSelectedOriginalId = parseInt(newSelectedFilteredItem.dataset.id) - 1;
        this.state.selectedPokemonIndex = newSelectedOriginalId;
        newSelectedFilteredItem.classList.add('active');
        newSelectedFilteredItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async updatePokemonPreview() {
        if (this.state.detailViewActive || this.state.extraDetailViewActive) return;
        const pokemon = this.state.allPokemon[this.state.selectedPokemonIndex];
        if (!pokemon) {
            this.resetPokemonPreviewDisplay();
            return;
        }
        const currentPokemonData = await this.getOrFetchPokemonData(pokemon.name, pokemon.url);
        if (!currentPokemonData) {
            this.resetPokemonPreviewDisplay();
            return;
        }
        this.updatePokemonImage(currentPokemonData);
        this.updateDisplayBackground(currentPokemonData);
        this.resetDetailAndExtraFields();
        this.stopPokemonCry();
        this.elements.extraDetailsBtn.disabled = true;
    }

    resetPokemonPreviewDisplay() {
        this.elements.extraDetailsBtn.disabled = true;
        this.resetPokedexVisuals();
    }

    resetDetailAndExtraFields() {
        this.resetDetailFields();
        this.resetExtraDetailFields();
    }

    async getOrFetchPokemonData(name, url) {
        if (this.state.detailedPokemonData[name]) return this.state.detailedPokemonData[name];
        try {
            const data = await this.fetchData(url);
            this.state.detailedPokemonData[name] = data;
            return data;
        } catch (error) {
            console.error(`Fehler beim Cachen/Abrufen von ${name}:`, error);
            return null;
        }
    }

    updatePokemonImage(pokemonData) {
        const imageUrl = pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default;
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

    resetExtraDetailFields() {
        this.elements.extraDetailsName.textContent = '';
        this.elements.pokemonHabitat.innerHTML = '';
        this.elements.pokemonHeightWeight.innerHTML = '';
        this.elements.pokemonMoves.innerHTML = '';
        this.elements.pokemonEvolution.innerHTML = '';
    }

    async showPokemonDetail() {
        this.prepareDetailView();
        const pokemonId = this.getSelectedPokemonId();
        if (!pokemonId) return this.handleDetailError('Kein Pokémon ausgewählt.');

        const [pokemonData, speciesData] = await Promise.all([
            this.loadPokemonDataForDetail(pokemonId),
            this.loadSpeciesDataForDetail(pokemonId)
        ]);
        if (!pokemonData || !speciesData) return this.handleDetailError('Daten nicht geladen.');
        this.updateDetailView(pokemonData, speciesData);
    }

    prepareDetailView() {
        this.hideListAndSearch();
        this.hideExtraDetailAndShowDetail();
        this.state.detailViewActive = true;
        this.state.extraDetailViewActive = false;
        this.elements.extraDetailsBtn.disabled = false;
    }

    hideListAndSearch() {
        this.elements.pokedexListArea.classList.add('hidden');
        this.elements.pokemonSearch.classList.add('hidden');
        this.elements.pokemonSearch.parentNode.classList.add('hidden');
    }

    hideExtraDetailAndShowDetail() {
        this.elements.pokedexExtraDetailsView.classList.add('hidden');
        this.elements.pokedexDetailView.classList.remove('hidden');
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
            this.loadPokemonDataForDetail(pokemonId),
            this.loadSpeciesDataForDetail(pokemonId)
        ]);
        if (!pokemonData || !speciesData) return;

        const evolutionChainData = await this.loadEvolutionChainData(speciesData?.evolution_chain.url);
        this.updateExtraDetailView(pokemonData, speciesData, evolutionChainData);
    }

    getSelectedPokemonId() {
        const pokemon = this.state.allPokemon[this.state.selectedPokemonIndex];
        return pokemon ? pokemon.url.split('/').slice(-2, -1)[0] : null;
    }

    async loadPokemonDataForDetail(pokemonId) {
        const pokemonName = this.state.allPokemon[this.state.selectedPokemonIndex]?.name;
        if (pokemonName && this.state.detailedPokemonData[pokemonName]) {
            return this.state.detailedPokemonData[pokemonName];
        }
        return await this.fetchAndCacheData(pokemonId, 'pokemon', 'detailedPokemonData');
    }

    async loadSpeciesDataForDetail(pokemonId) {
        return await this.fetchAndCacheData(pokemonId, 'pokemon-species', 'speciesDataCache');
    }

    async loadEvolutionChainData(evolutionChainUrl) {
        if (!evolutionChainUrl) return null;
        if (this.state.evolutionChainCache[evolutionChainUrl]) return this.state.evolutionChainCache[evolutionChainUrl];
        try {
            const data = await this.fetchData(evolutionChainUrl);
            this.state.evolutionChainCache[evolutionChainUrl] = data;
            return data;
        } catch (error) {
            this.handleFetchError('Fehler beim Laden der Evolutionskette.', error, true);
            return null;
        }
    }

    async fetchAndCacheData(id, endpoint, cacheName) {
        try {
            const url = `${POKEAPI_BASE_URL}${endpoint}/${id}/`;
            const data = await this.fetchData(url);
            if (this.state[cacheName]) {
                this.state[cacheName][id] = data;
            } else if (endpoint === 'pokemon') {
                const pokemonName = this.state.allPokemon[this.state.selectedPokemonIndex]?.name;
                if (pokemonName) this.state.detailedPokemonData[pokemonName] = data;
            }
            return data;
        } catch (error) {
            this.handleFetchError(`Fehler beim Laden von ${endpoint} (ID: ${id}).`, error, true);
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

    async updateExtraDetailView(pokemonData, speciesData, evolutionChainData) {
        this.resetExtraDetailFields();
        this.elements.extraDetailsName.textContent = capitalizeFirstLetter(pokemonData.name);
        this.updateBackgroundColor(this.elements.extraDetailsScreen, this.getPrimaryTypeName(pokemonData));
        this.addHabitatInfo(speciesData);
        this.addHeightWeightInfo(pokemonData);
        this.addMovesInfo(pokemonData);
        await this.addEvolutionInfo(evolutionChainData);
    }

    addHabitatInfo(speciesData) {
        const habitat = speciesData.habitat?.name ? capitalizeFirstLetter(speciesData.habitat.name) : 'Unbekannt';
        this.elements.pokemonHabitat.appendChild(createDetailSection('Habitat:', habitat));
    }

    addHeightWeightInfo(pokemonData) {
        const height = `${(pokemonData.height / 10).toFixed(1)} m`;
        const weight = `${(pokemonData.weight / 10).toFixed(1)} kg`;
        this.elements.pokemonHeightWeight.appendChild(createDetailSection('Größe:', height));
        this.elements.pokemonHeightWeight.appendChild(createDetailSection('Gewicht:', weight));
    }

    addMovesInfo(pokemonData) {
        this.elements.pokemonMoves.appendChild(createDetailSection('Attacken:', createMovesList(pokemonData.moves)));
    }

    async addEvolutionInfo(evolutionChainData) {
        const evolutionSection = createDetailSection('Entwicklung:', '');
        this.elements.pokemonEvolution.appendChild(evolutionSection);
        if (evolutionChainData) {
            const evolutionLineHtml = await createEvolutionLine(evolutionChainData);
            evolutionSection.appendChild(evolutionLineHtml);
        } else {
            evolutionSection.appendChild(document.createTextNode('Keine Evolutionsdaten verfügbar.'));
        }
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
        const primaryType = this.getPrimaryTypeName(pokemonData);
        this.applyBackgroundColors(primaryType);
        pokemonData.types.map(t => t.type.name).forEach(type =>
            this.elements.pokemonTypes.appendChild(createTypeBadge(type))
        );
    }

    getPrimaryTypeName(pokemonData) {
        return pokemonData.types[0].type.name.toLowerCase();
    }

    applyBackgroundColors(primaryType) {
        this.updateBackgroundColor(this.elements.pokedexScreen, primaryType);
        this.updateBackgroundColor(this.elements.pokemonDisplayArea, primaryType);
        this.updateBackgroundColor(this.elements.pokemonStats, primaryType);
        this.updateBackgroundColor(this.elements.extraDetailsScreen, primaryType);
    }

    updateBackgroundColor(element, type) {
        Object.keys(detailBgColors).forEach(t => element.classList.remove(`bg-${t}`));
        if (detailBgColors[type]) element.classList.add(`bg-${type}`);
    }

    updatePokemonDescription(speciesData) {
        const descriptionEntry = findDescription(speciesData.flavor_text_entries);
        const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'Keine Beschreibung verfügbar.';
        this.elements.pokemonDescription.textContent = description;
    }

    updatePokemonStats(pokemonData) {
        this.elements.pokemonStats.innerHTML = '';
        pokemonData.stats.forEach(stat =>
            this.elements.pokemonStats.appendChild(createStatItem(stat.stat.name, stat.base_stat))
        );
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
        this.showListAndSearch();
        this.resetAllDetailStates();
        this.displayPokemonList();
        this.elements.extraDetailsBtn.disabled = true;
    }

    showListAndSearch() {
        this.elements.pokedexListArea.classList.remove('hidden');
        this.elements.pokemonSearch.classList.remove('hidden');
        this.elements.pokemonSearch.parentNode.classList.remove('hidden');
    }

    resetAllDetailStates() {
        this.resetDetailFields();
        this.resetExtraDetailFields();
        this.resetBackgrounds();
        this.stopPokemonCry();
    }

    hideExtraDetailView() {
        this.state.extraDetailViewActive = false;
        this.elements.pokedexExtraDetailsView.classList.add('hidden');
        this.elements.pokedexDetailView.classList.remove('hidden');
        this.resetExtraDetailFields();
        this.restoreDetailViewBackground();
    }

    restoreDetailViewBackground() {
        const currentPokemonData = this.state.detailedPokemonData[this.state.allPokemon[this.state.selectedPokemonIndex]?.name];
        if (currentPokemonData) {
            const primaryType = this.getPrimaryTypeName(currentPokemonData);
            this.updateBackgroundColor(this.elements.pokemonDisplayArea, primaryType);
            this.updateBackgroundColor(this.elements.pokedexScreen, primaryType);
            this.updateBackgroundColor(this.elements.pokemonStats, primaryType);
        } else {
            this.resetBackgrounds();
        }
    }

    stopPokemonCry() {
        this.elements.pokemonCry.pause();
        this.elements.pokemonCry.currentTime = 0;
    }

    resetBackgrounds() {
        const elementsToReset = [
            this.elements.pokemonDisplayArea,
            this.elements.pokedexScreen,
            this.elements.pokemonStats,
            this.elements.extraDetailsScreen
        ];
        elementsToReset.forEach(element => {
            if (element) {
                Object.keys(detailBgColors).forEach(t => element.classList.remove(`bg-${t}`));
            }
        });
    }

    resetPokemonDisplayBackground() {
        Object.keys(detailBgColors).forEach(t =>
            this.elements.pokemonDisplayArea.classList.remove(`bg-${t}`)
        );
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

    setupDpadListeners() {
        this.elements.dpadUp.addEventListener('click', () => this.handleDpadMovement(-1));
        this.elements.dpadDown.addEventListener('click', () => this.handleDpadMovement(1));
        this.elements.dpadLeft.addEventListener('click', () => this.handleDpadMovement(-10));
        this.elements.dpadRight.addEventListener('click', () => this.handleDpadMovement(10));
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

    setupButtonListeners() {
        this.elements.buttonA.addEventListener('click', () => this.handleAButtonPress());
        this.elements.buttonB.addEventListener('click', () => this.handleBButtonPress());
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

    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => this.handleKeyboardInput(event));
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
        this.resetDetailFields();
        this.resetExtraDetailFields();
        this.resetBackgrounds();
        this.stopPokemonCry();
        if (shouldHideDetail) this.hidePokemonDetail();
        this.elements.extraDetailsBtn.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => new Pokedex());