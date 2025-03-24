import { connectionAPI } from "./connectionAPI.js";
import { showCards } from "./showCards.js";
import { searchProductsOptimized, loadWasmModule } from "./wasmLoader.js";

const searchData = document.querySelector("[data-search]");
const searchInput = document.querySelector("[data-keyword]");
const clearBtn = document.querySelector(".clear_btn");

//Controlar si WASM esta disponible
let wasmAvailable = false;

document.addEventListener('DOMContentLoaded', async () => {
  try {
      // Verificar si hay un parámetro en la URL para forzar JS
      const urlParams = new URLSearchParams(window.location.search);
      const forceJs = urlParams.get('wasm') === 'false'; // Si wasm=false, forzar JS

      if (!forceJs) {
          // Cargar el módulo WASM
          await loadWasmModule();
          wasmAvailable = true;
          console.log('WASM cargado correctamente. Búsquedas optimizadas disponibles.');
      } else {
          // Forzar uso de JS estándar
          wasmAvailable = false;
          console.log('Modo benchmark: Forzando búsqueda estándar (JS)');
      }
  } catch (error) {
      console.warn('No se pudo cargar WASM. Se usará la búsqueda estándar:', error);
  }
});

async function searchModel(e) {
  e.preventDefault();

  const keyword = document.querySelector("[data-keyword]").value;
  if (!keyword) return;

  try {
    let searchResults;
    let searchTime;

    if (wasmAvailable) {
      try {
        const startTime = performance.now();
        const allCards = await connectionAPI.listCards();

        searchResults = await searchProductsOptimized(allCards, keyword);

        const endTime = performance.now();
        searchTime = endTime - startTime;
        console.log(`Búsqueda WASM completada en ${searchTime.toFixed(2)} ms`);
      } catch (wasmError) {
        console.error("Error en búsqueda WASM: ", wasmError);
        searchResults = await connectionAPI.searchCard(keyword);
      }
    } else {
      // Usar el método de búsqueda estándar
      console.log("Usando búsqueda estándar JavaScript");
      const startTime = performance.now();

      searchResults = await connectionAPI.searchCard(keyword);

      const endTime = performance.now();
      searchTime = endTime - startTime;
      console.log(`Búsqueda JS completada en ${searchTime.toFixed(2)} ms`);
    }

    // Comprobar si hay resultados
    if (searchResults.length === 0) {
      console.log("No se encontraron resultados para el modelo:", keyword);
    } else {
      const list = document.querySelector("[data-list]");
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      searchResults.forEach((card) =>
        list.appendChild(
          showCards.createCard(card.id, card.model, card.price, card.imageUrl)
        )
      );
    }

    clearBtn.style.display = keyword ? "inline" : "none";
  } catch (error) {
    console.error("Error al realizar la búsqueda:", error);
  }
}

// Limpiar el campo de búsqueda y ocultar el botón
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.style.display = "none";
  searchInput.focus();
});

// Mostrar el botón de borrar solo si hay texto
searchInput.addEventListener("input", () => {
  clearBtn.style.display = searchInput.value ? "inline" : "none";
});

// Enviar formulario
searchData.addEventListener("submit", (e) => searchModel(e));
