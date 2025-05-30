// Konstanten und Hilfsfunktionen
export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/';
export const MAX_POKEMON_ID = 151;

// Typenfarben für Badges
export const typeColors = {
    normal: '#C6C6A7', fire: '#F5AC78', water: '#9DB7F5', electric: '#FAE078',
    grass: '#A7DB8D', ice: '#BCE6E6', fighting: '#D67873', poison: '#C183C1',
    ground: '#EBD69D', flying: '#C6B7F5', psychic: '#FA92B2', bug: '#C6D16E',
    rock: '#D1C17D', ghost: '#A292BC', dragon: '#A27DFA', steel: '#D1D1E0',
    fairy: '#F4BDC9', dark: '#A29288',
};

// Hintergrundfarben für die Anzeigebereiche
export const detailBgColors = {
    normal: '#E0E0C6', fire: '#FADCB3', water: '#C6D6F5', electric: '#FFF3B3',
    grass: '#D0E6C6', ice: '#D6F2F2', fighting: '#E3C1BF', poison: '#D6BDD6',
    ground: '#F5ECCB', flying: '#DCD6F5', psychic: '#FCD7E0', bug: '#D6DDBB',
    rock: '#E0D6B3', ghost: '#D6CFE0', dragon: '#D6C6FB', steel: '#E0E0E6',
    fairy: '#FBE0E3', dark: '#D6D0CC',
};

// Hilfsfunktionen
export const capitalizeFirstLetter = string =>
    string.charAt(0).toUpperCase() + string.slice(1);

export const createTypeBadge = (type) => {
    const badge = document.createElement('span');
    badge.classList.add('type-badge');
    badge.textContent = capitalizeFirstLetter(type);
    badge.style.backgroundColor = typeColors[type] || '#888';
    return badge;
};

export const createStatItem = (name, value) => {
    const statItem = document.createElement('div');
    statItem.classList.add('stat-item');

    const statName = document.createElement('span');
    statName.classList.add('stat-name');
    statName.textContent = name.replace('-', ' ');

    const statValue = document.createElement('span');
    statValue.classList.add('stat-value');
    statValue.textContent = value;

    statItem.appendChild(statName);
    statItem.appendChild(statValue);
    return statItem;
};

export const findDescription = (entries) => {
    return entries.find(entry => entry.language.name === 'de') ||
           entries.find(entry => entry.language.name === 'en' &&
             ['red', 'blue', 'yellow'].includes(entry.version.name)) ||
           entries.find(entry => entry.language.name === 'en');
};