// Konstanten und Hilfsfunktionen
export const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/';
export const MAX_POKEMON_ID = 1025;

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
    badge.classList.add('type-badge', `type-${type}`);
    badge.textContent = capitalizeFirstLetter(type);
 
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

export const createDetailSection = (titleText, contentHtml) => {
    const sectionDiv = document.createElement('div');
    const titleSpan = document.createElement('b');
    titleSpan.textContent = titleText;
    sectionDiv.appendChild(titleSpan);
    sectionDiv.appendChild(document.createElement('br'));

    const contentDiv = document.createElement('span');
    if (typeof contentHtml === 'string') {
        contentDiv.innerHTML = contentHtml;
    } else if (contentHtml instanceof HTMLElement) {
        contentDiv.appendChild(contentHtml);
    }
    sectionDiv.appendChild(contentDiv);
    return sectionDiv;
};

export const createMovesList = (moves) => {
    const movesList = document.createElement('div');
    if (moves.length === 0) {
        movesList.textContent = 'Keine Attacken bekannt.';
        return movesList;
    }

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.paddingLeft = '0';
    ul.style.columns = '2';
    ul.style.maxHeight = '150px';
    ul.style.overflowY = 'auto';
    ul.style.border = '1px solid #ccc';
    ul.style.padding = '5px';

    moves.slice(0, 20).forEach(move => {
        const li = document.createElement('li');
        li.textContent = capitalizeFirstLetter(move.move.name.replace('-', ' '));
        ul.appendChild(li);
    });
    movesList.appendChild(ul);
    return movesList;
};

export const createEvolutionLine = async (evolutionChainData) => {
    const evolutionDiv = document.createElement('div');

    let current = evolutionChainData.chain;

    while (current) {
        const stageDiv = document.createElement('div');
        stageDiv.style.display = 'flex';
        stageDiv.style.alignItems = 'center';
        stageDiv.style.marginBottom = '5px';

        const pokemonName = capitalizeFirstLetter(current.species.name);

        const idMatch = current.species.url.match(/\/(\d+)\/$/);
        const pokemonId = idMatch ? idMatch[1] : null;
        let imageUrl = '';
        if (pokemonId) {
            try {
                const pokemonData = await fetch(`${POKEAPI_BASE_URL}pokemon/${pokemonId}/`).then(res => res.json());
                imageUrl = pokemonData.sprites.front_default;
            } catch (e) {
                console.warn(`Fehler beim Laden des Bildes für ${pokemonName} (ID: ${pokemonId}):`, e);
                imageUrl = '';
            }
        }
        
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = pokemonName;
            img.style.width = '50px';
            img.style.height = '50px';
            img.style.marginRight = '5px';
            img.style.objectFit = 'contain';
            stageDiv.appendChild(img);
        }

        const nameSpan = document.createElement('span');
        nameSpan.textContent = pokemonName;
        nameSpan.style.fontWeight = 'bold';
        stageDiv.appendChild(nameSpan);
        
        evolutionDiv.appendChild(stageDiv);

        if (current.evolves_to && current.evolves_to.length > 0) {
            const arrowSpan = document.createElement('span');
            arrowSpan.textContent = ' → ';
            arrowSpan.style.fontWeight = 'bold';
            arrowSpan.style.margin = '0 10px';
            evolutionDiv.appendChild(arrowSpan);
            current = current.evolves_to[0];
        } else {
            current = null;
        }
    }
    return evolutionDiv;
};