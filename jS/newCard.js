import { connectionAPI } from "./connectionAPI.js";
import { showCards } from "./showCards.js";

const btnClear = document.querySelector('#btnClear');
const form = document.querySelector ('[data-form]');
const formContainer = document.querySelector('.main_section_form');


// Crear elementos para el feedback
const feedbackContainer = document.createElement('div');
feedbackContainer.className = 'form-feedback';


const spinner = document.createElement('div');
spinner.className = 'loading-spinner';


const successMessage = document.createElement('div');
successMessage.className = 'success-message';


// Añadir elementos de feedback al contenedor del formulario
feedbackContainer.appendChild(spinner);
feedbackContainer.appendChild(successMessage);
formContainer.appendChild(feedbackContainer);


// Variables para controlar modo edición
let editMode = false;
let editCardId = null;


//Seleccionar elementos en el DOM
async function submitCard(evento){

    evento.preventDefault();


    // Mostrar efecto de carga
    form.classList.add('form-blur');
    feedbackContainer.style.display = 'flex';

    try{

        const model = document.querySelector ('[data-model]').value;
        const price = Number(parseFloat(document.querySelector('[data-price]').value).toFixed(2));
        const imageUrl = document.querySelector ('[data-imageUrl]').value;

        if (editMode) {
            // Actualizar tarjeta existente
            const updatedCard = await connectionAPI.updateCard(editCardId, model, price, imageUrl);
            if (updatedCard) {
                // Actualizar la tarjeta en el DOM
                const cardElement = document.querySelector(`#card-${editCardId}`);
                if (cardElement) {
                    cardElement.querySelector(".model_name").textContent = updatedCard.model;
                    cardElement.querySelector(".model_price").textContent = `Precio: $${updatedCard.price}`;
                    cardElement.querySelector("img").src = updatedCard.imageUrl;
                }
                successMessage.textContent = '¡Modelo editado exitosamente!';
            }
        }
         else {
            // Crear nueva tarjeta
            const newData = await connectionAPI.uploadCard(model, price, imageUrl);
    
            if (newData) {
                successMessage.textContent = '¡Modelo agregado exitosamente!';

                const card = showCards.createCard(newData.id, newData.model, newData.price, newData.imageUrl)
                card
                ? document.querySelector(".main_list_elements").appendChild(card)
                : console.error("No se pudo agregar la tarjeta al DOM");
            }
        }

        // Ocultar spinner y mostrar mensaje de éxito
        spinner.style.display = 'none';
        successMessage.classList.add('show');
        
        // Resetear formulario después de 3 segundos
        setTimeout(() => {
            form.reset();
            form.classList.remove('form-blur');
            feedbackContainer.style.display = 'none';
            successMessage.classList.remove('show');
            spinner.style.display = 'block';

            // Si estamos en modo edición, salir de él
            if (editMode) {
                editMode = false;
                editCardId = null;
                form.querySelector("#bntSubmit").textContent = "Agregar modelo";
            }

        }, 3000);

    }catch (error){

        console.error('Error:', error);
        // Manejar el error aquí si lo deseas
        form.classList.remove('form-blur');
        feedbackContainer.style.display = 'none';

    }

}


// Preparar formulario para edición
function prepareEditForm(id, model, price, imageUrl) {

    editMode = true;
    editCardId = id;
    
    document.querySelector('.main_form_title').textContent = 'EDITAR';
    document.querySelector('#btnClear').setAttribute('title', 'Cancelar edición');
    document.querySelector('[data-model]').value = model;
    document.querySelector('[data-price]').value = price;
    document.querySelector('[data-imageUrl]').value = imageUrl;

    form.querySelector("#bntSubmit").textContent = "Guardar";

}

// Evento para limpiar campos del formulario 
btnClear.addEventListener('click', ()=> {

    // Obtener informacion ingresada en formulario
    document.querySelector ('[data-model]').value='';
    document.querySelector('[data-price]').value='';
    document.querySelector ('[data-imageUrl]').value='';

    if (editMode) {
        editMode = false;
        editCardId = null;
        document.querySelector('.main_form_title').textContent = 'AGREGAR';
        document.querySelector('#btnClear').setAttribute('title', 'Limpiar formulario');
        form.querySelector("#bntSubmit").textContent = "Agregar modelo";
    }
    
})

// Evento para enviar información a la base de datos
form.addEventListener('submit', evento => submitCard(evento));

export { feedbackContainer, successMessage, prepareEditForm };
