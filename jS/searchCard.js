import { connectionAPI } from "./connectionAPI.js";
import createCard from "./showCards.js";


const searchData = document.querySelector ('[data-search]');
const searchInput = document.querySelector('[data-keyword]');
const clearBtn = document.querySelector('.clear-btn');


async function searchModel(evento) {

    evento.preventDefault();

    const keyword = document.querySelector('[data-keyword]').value;
    if (!keyword) return;

    try {
        const searchResults = await connectionAPI.searchCard(keyword);
        
        // Comprobar si hay resultados
        if (searchResults.length === 0) {

            console.log("No se encontraron resultados para el modelo:", keyword);

        } else {

            const list = document.querySelector('[data-list]');
            while (list.firstChild){
                list.removeChild(list.firstChild);
            }
            searchResults.forEach(card => list.appendChild(createCard(card.model, card.price, card.imageUrl)));

        }

        clearBtn.style.display = keyword ? 'inline' : 'none';

    } catch (error) {

        console.error("Error al realizar la búsqueda:", error);

    }

}

// Limpiar el campo de búsqueda y ocultar el botón
clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    searchInput.focus();
});   
  
// Mostrar el botón de borrar solo si hay texto
searchInput.addEventListener('input', () => {
    clearBtn.style.display = searchInput.value ? 'inline' : 'none';
});

// Enviar formulario
searchData.addEventListener ("submit", evento => searchModel(evento));