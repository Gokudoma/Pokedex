import { POKEAPI_BASE_URL, MAX_POKEMON_ID } from './template.js';

export const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    return await response.json();
};

export const getOrFetchPokemonData = async (name, url, detailedPokemonData) => {
    if (detailedPokemonData[name]) return detailedPokemonData[name];
    try {
        const data = await fetchData(url);
        detailedPokemonData[name] = data;
        return data;
    } catch (error) {
        console.error(`Fehler beim Cachen/Abrufen von ${name}:`, error);
        return null;
    }
};

export const fetchAndCacheData = async (id, endpoint, cache, allPokemon, selectedPokemonIndex) => {
    try {
        const url = `${POKEAPI_BASE_URL}${endpoint}/${id}/`;
        const data = await fetchData(url);
        if (cache) {
            cache[id] = data;
        } else if (endpoint === 'pokemon') {
            const pokemonName = allPokemon[selectedPokemonIndex]?.name;
            if (pokemonName) {
            }
        }
        return data;
    } catch (error) {
        console.error(`Fehler beim Laden von ${endpoint} (ID: ${id}).`, error);
        return null;
    }
};

export const loadPokemonDataForDetail = async (pokemonId, detailedPokemonData, allPokemon, selectedPokemonIndex) => {
    const pokemonName = allPokemon[selectedPokemonIndex]?.name;
    if (pokemonName && detailedPokemonData[pokemonName]) {
        return detailedPokemonData[pokemonName];
    }
    return await fetchAndCacheData(pokemonId, 'pokemon', detailedPokemonData, allPokemon, selectedPokemonIndex);
};

export const loadSpeciesDataForDetail = async (pokemonId, speciesDataCache) => {
    return await fetchAndCacheData(pokemonId, 'pokemon-species', speciesDataCache);
};

export const loadEvolutionChainData = async (evolutionChainUrl, evolutionChainCache) => {
    if (!evolutionChainUrl) return null;
    if (evolutionChainCache[evolutionChainUrl]) return evolutionChainCache[evolutionChainUrl];
    try {
        const data = await fetchData(evolutionChainUrl);
        evolutionChainCache[evolutionChainUrl] = data;
        return data;
    } catch (error) {
        console.warn('Fehler beim Laden der Evolutionskette:', error);
        return null;
    }
};