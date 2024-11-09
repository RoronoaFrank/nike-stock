import { connectionAPI } from "./connectionAPI.js";

const list = document.querySelector("[data-list]");

//Crear la tarjeta en el DOM
export default function createCard(id, model, price, imageUrl) {

    const card = document.createElement("li");
    card.className = "list_card";
    card.setAttribute("role", "listitem");
    card.innerHTML = `
        <img src="${imageUrl}" class="tennis_photo" alt="Modelo de tenis">
        <h3 class="model_name">${model}</h3>
        <p class="model_price">Precio: $${price}</p>
        <button class="delete-btn" aria-label="Eliminar tarjeta de tenis">Eliminar</button>
    `;

    // Evento de eliminación
    const deleteButton = card.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => connectionAPI.deleteCard(id, card));

    return card;

}


// Listar las tarjetas en el DOM
async function listOfCards() {

    try {
        // Obtener los datos desde el archivo JSON
        const dataInDb = await connectionAPI.dataInDb();
        
        // Agregar cada tarjeta al DOM usando la función createCard
        dataInDb.forEach(cardData => {
            const card = createCard(cardData.id, cardData.model, cardData.price, cardData.imageUrl);
            list.appendChild(card);
        });
    } catch (error) {
        console.error("Error al obtener los datos de la API:", error);
    }

}

// Llamar a la función para que se ejecute al cargar el archivo
listOfCards();
