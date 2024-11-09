import { connectionAPI } from "./connectionAPI.js";

const form = document.querySelector ('[data-form]');
const formContainer = document.querySelector('.main_section_form');

// Crear elementos para el feedback
const feedbackContainer = document.createElement('div');
feedbackContainer.className = 'form-feedback';

const spinner = document.createElement('div');
spinner.className = 'loading-spinner';

const successMessage = document.createElement('div');
successMessage.className = 'success-message';
successMessage.textContent = '¡Modelo agregado exitosamente!';

feedbackContainer.appendChild(spinner);
feedbackContainer.appendChild(successMessage);
formContainer.appendChild(feedbackContainer);


//Seleccionar elementos en el DOM
async function newCard(evento){

    evento.preventDefault();


    // Mostrar efecto de carga
    form.classList.add('form-blur');
    feedbackContainer.style.display = 'flex';

    try{

        const model = document.querySelector ('[data-model]').value;
        const price = parseFloat(document.querySelector('[data-price]').value);
        const imageUrl = document.querySelector ('[data-imageUrl]').value;

        await connectionAPI.uploadCard (model,price,imageUrl);

        // Ocultar spinner y mostrar mensaje de éxito
        spinner.style.display = 'none';
        successMessage.classList.add('show');
        
        // Resetear el formulario después de 5 segundos
        setTimeout(() => {
            form.reset();
            form.classList.remove('form-blur');
            feedbackContainer.style.display = 'none';
            successMessage.classList.remove('show');
            spinner.style.display = 'block';
        }, 5000);

    }catch (error){

        console.error('Error:', error);
        // Manejar el error aquí si lo deseas
        form.classList.remove('form-blur');
        feedbackContainer.style.display = 'none';

    }

}

form.addEventListener('submit', evento => newCard(evento));

