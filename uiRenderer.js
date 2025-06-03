import {
    detailBgColors,
    capitalizeFirstLetter,
    createTypeBadge,
    createStatItem,
    findDescription,
    createDetailSection,
    createMovesList,
    createEvolutionLine
} from './template.js';

export function updatePokemonImage(elements, pokemonData) {
    const imageUrl = pokemonData.sprites.other?.['official-artwork']?.front_default || pokemonData.sprites.front_default;
    elements.pokemonImage.src = imageUrl || '';
    elements.pokemonImage.alt = imageUrl ? capitalizeFirstLetter(pokemonData.name) : 'No image available';
}

export function updateBackgroundColor(element, primaryType) {
    Object.keys(detailBgColors).forEach(t => element.classList.remove(`bg-${t}`));
    if (detailBgColors[primaryType]) element.classList.add(`bg-${primaryType}`);
}

export function resetDetailFields(elements) {
    elements.pokemonName.textContent = '';
    elements.pokemonId.textContent = '';
    elements.pokemonTypes.innerHTML = '';
    elements.pokemonDescription.textContent = 'Select a Pokémon for details...';
    elements.pokemonStats.innerHTML = '';
}

export function resetExtraDetailFields(elements) {
    elements.extraDetailsName.textContent = '';
    elements.pokemonHabitat.innerHTML = '';
    elements.pokemonHeightWeight.innerHTML = '';
    elements.pokemonMoves.innerHTML = '';
    elements.pokemonEvolution.innerHTML = '';
}

export function displayPokemonList(elements, state, getFilteredPokemon, createPokemonListItem, highlightSelectedListItem, handleNoSearchResults, updatePokemonPreview) {
    elements.pokemonList.innerHTML = '';
    const filtered = getFilteredPokemon();

    if (filtered.length === 0) {
        handleNoSearchResults();
        return;
    }

    filtered.forEach(pokemon =>
        elements.pokemonList.appendChild(createPokemonListItem(pokemon))
    );

    const currentSelectedName = state.allPokemon[state.selectedPokemonIndex]?.name;
    let newIndex = filtered.findIndex(p => p.name === currentSelectedName);
    if (newIndex === -1 && filtered.length > 0) {
        newIndex = 0;
    }

    if (newIndex !== -1) {
        highlightSelectedListItem(elements.pokemonList.children, newIndex);
        updatePokemonPreview();
    }
}

export function highlightSelectedListItemAndScroll(listItems, newIndex, state) {
    const currentActive = document.querySelector('#pokemonList li.active');
    if (currentActive) currentActive.classList.remove('active');
    const newSelectedFilteredItem = listItems[newIndex];
    if (!newSelectedFilteredItem) return;

    const newSelectedOriginalId = parseInt(newSelectedFilteredItem.dataset.id) - 1;
    state.selectedPokemonIndex = newSelectedOriginalId;

    newSelectedFilteredItem.classList.add('active');
    newSelectedFilteredItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

export function updateDetailView(elements, pokemonData, speciesData, getPrimaryTypeName, playPokemonCry) {
    elements.pokemonName.textContent = capitalizeFirstLetter(pokemonData.name);
    elements.pokemonId.textContent = `#${String(pokemonData.id).padStart(3, '0')}`;
    elements.pokemonImage.classList.add('flash');
    setTimeout(() => elements.pokemonImage.classList.remove('flash'), 400);

    elements.pokemonTypes.innerHTML = '';
    const primaryType = getPrimaryTypeName(pokemonData);
    applyBackgroundColors(elements, primaryType);
    pokemonData.types.map(t => t.type.name).forEach(type =>
        elements.pokemonTypes.appendChild(createTypeBadge(type))
    );

    const descriptionEntry = findDescription(speciesData.flavor_text_entries);
    const description = descriptionEntry ? descriptionEntry.flavor_text.replace(/[\n\f]/g, ' ') : 'Keine Beschreibung verfügbar.';
    elements.pokemonDescription.textContent = description;

    elements.pokemonStats.innerHTML = '';
    pokemonData.stats.forEach(stat =>
        elements.pokemonStats.appendChild(createStatItem(stat.stat.name, stat.base_stat))
    );

    playPokemonCry(pokemonData.name);
}

export function applyBackgroundColors(elements, primaryType) {
    updateBackgroundColor(elements.pokedexScreen, primaryType);
    updateBackgroundColor(elements.pokemonDisplayArea, primaryType);
    updateBackgroundColor(elements.pokemonStats, primaryType);
    updateBackgroundColor(elements.extraDetailsScreen, primaryType);
}

export async function updateExtraDetailView(elements, pokemonData, speciesData, evolutionChainData, getPrimaryTypeName) {
    resetExtraDetailFields(elements);
    elements.extraDetailsName.textContent = capitalizeFirstLetter(pokemonData.name);
    updateBackgroundColor(elements.extraDetailsScreen, getPrimaryTypeName(pokemonData));

    const habitat = speciesData.habitat?.name ? capitalizeFirstLetter(speciesData.habitat.name) : 'Unbekannt';
    elements.pokemonHabitat.appendChild(createDetailSection('Habitat:', habitat));

    const height = `${(pokemonData.height / 10).toFixed(1)} m`;
    const weight = `${(pokemonData.weight / 10).toFixed(1)} kg`;
    elements.pokemonHeightWeight.appendChild(createDetailSection('Height:', height));
    elements.pokemonHeightWeight.appendChild(createDetailSection('Weight:', weight));

    elements.pokemonMoves.appendChild(createDetailSection('Moves:', createMovesList(pokemonData.moves)));

    const evolutionSection = createDetailSection('Evolution:', '');
    elements.pokemonEvolution.appendChild(evolutionSection);
    if (evolutionChainData) {
        const evolutionLineHtml = await createEvolutionLine(evolutionChainData);
        evolutionSection.appendChild(evolutionLineHtml);
    } else {
        evolutionSection.appendChild(document.createTextNode('Keine Evolutionsdaten verfügbar.'));
    }
}

export function resetBackgrounds(elements) {
    const elementsToReset = [
        elements.pokemonDisplayArea,
        elements.pokedexScreen,
        elements.pokemonStats,
        elements.extraDetailsScreen
    ];
    elementsToReset.forEach(element => {
        if (element) {
            Object.keys(detailBgColors).forEach(t => element.classList.remove(`bg-${t}`));
        }
    });
}

export function resetPokemonDisplayBackground(elements) {
    Object.keys(detailBgColors).forEach(t =>
        elements.pokemonDisplayArea.classList.remove(`bg-${t}`)
    );
}

export function showListAndSearch(elements) {
    elements.pokedexListArea.classList.remove('hidden');
    elements.pokemonSearch.classList.remove('hidden');
    elements.pokemonSearch.parentNode.classList.remove('hidden');
}

export function hideListAndSearch(elements) {
    elements.pokedexListArea.classList.add('hidden');
    elements.pokemonSearch.classList.add('hidden');
    elements.pokemonSearch.parentNode.classList.add('hidden');
}

export function hideExtraDetailAndShowDetail(elements) {
    elements.pokedexExtraDetailsView.classList.add('hidden');
    elements.pokedexDetailView.classList.remove('hidden');
}