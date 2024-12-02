import { connectionAPI } from "./connectionAPI.js";
import { feedbackContainer, successMessage, prepareEditForm } from "./newCard.js";

const home = document.querySelector (".store_name");


// Crear la tarjeta en el DOM
export default function createCard(id, model, price, imageUrl) {

    const card = document.createElement("li");
    card.className = "list_card";
    card.setAttribute("role", "listitem");
    card.id = `card-${id}`;
    card.innerHTML = `

        <img src="${imageUrl}" class="tennis_photo" alt="Modelo de tenis">
        <h3 class="model_name">${model}</h3>
        <p class="model_price">Precio: $${price}</p>
        <div class="buttons">
            <button class="edit_btn" aria-label="Editar tarjeta de tenis">Editar</button>
            <button class="delete_btn" aria-label="Eliminar tarjeta de tenis">Eliminar</button>
        </div>

    `;

    // Evento de edición
    const editBtn = card.querySelector(".edit_btn");
    editBtn.addEventListener("click", () => prepareEditForm(id, model, price, imageUrl));

    // Evento de eliminación
    const deleteBtn = card.querySelector(".delete_btn");
    deleteBtn.addEventListener("click", () => handleDelete(id, card));

    // Insertar la tarjeta en el DOM
    document.querySelector(".main_list_elements").appendChild(card);

    // Detectar si el nombre del modelo se desborda y agregar `title` si es necesario
    const modelName = card.querySelector(".model_name");
    if (modelName.scrollWidth > modelName.clientWidth) {
        modelName.setAttribute("title", model);
    }

}


// Manejar eliminación de tarjeta
async function handleDelete(id, cardElement) {

    const overlay = document.getElementById("overlay");
    const confirmationMessage = document.getElementById("confirmationMessage");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

    // Mostrar overlay y mensaje de confirmación
    overlay.style.display = 'block';
    confirmationMessage.style.display = 'flex';

    // Crear una promesa para manejar la confirmación
    return new Promise((resolve) => {

        // Función para limpiar los event listeners y ocultar elementos
        const cleanup = () => {
            confirmDeleteBtn.removeEventListener("click", handleConfirm);
            cancelDeleteBtn.removeEventListener("click", handleCancel);
            overlay.style.display = 'none';
            confirmationMessage.style.display = 'none';

        };

        // Manejador para confirmar eliminación
        const handleConfirm = async () => {
            
            cleanup();
            try {
                await connectionAPI.deleteCard(id, cardElement);
                
                // Mostrar mensaje de éxito
                successMessage.textContent = '¡Modelo eliminado exitosamente!';
                successMessage.classList.add('show');
                feedbackContainer.style.display = 'flex';

                // Ocultar mensaje después de 5 segundos
                setTimeout(() => {
                    successMessage.classList.remove('show');
                    feedbackContainer.style.display = 'none';
                }, 5000);

                resolve(true);
            } catch (error) {
                console.error("Error en la eliminación:", error);
                resolve(false);
            }

        };

        // Manejador para cancelar eliminación
        const handleCancel = () => {

            cleanup();
            resolve(false);

        };

        // Agregar event listeners
        confirmDeleteBtn.addEventListener("click", handleConfirm);
        cancelDeleteBtn.addEventListener("click", handleCancel);
    });

}


// Listar las tarjetas en el DOM
async function listOfCards() {

    try {

        // Obtener los datos desde el archivo JSON
        const dataInDb = await connectionAPI.dataInDb();
        
        // Agregar cada tarjeta al DOM usando la función createCard
        dataInDb.forEach(cardData => {
            const card = createCard(cardData.id, cardData.model, cardData.price, cardData.imageUrl);
        });

    } catch (error) {
        console.error("Error al obtener los datos de la API:", error);
    }

}


//Evento para mostrar todas las tarjetas al dar click en el nombre del proyecto
home.addEventListener('click', () => {
    
    const list = document.querySelector('[data-list]');
            while (list.firstChild){
                list.removeChild(list.firstChild);
            }
    listOfCards();

});

// Llamar a la función para que se ejecute al cargar el archivo
listOfCards();
