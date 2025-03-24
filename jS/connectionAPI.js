
// Obtener información de la base de datos
async function dataInDb(model, price, imageUrl) {
    try {
        const connection = await fetch("https://674ccaa154e1fca9290d911c.mockapi.io/api/v1/tenisModels");
        if (!connection.ok) throw new Error("Error en la conexión para obtener los datos");
        
        const jsonConnection = await connection.json();
        return jsonConnection;

    } catch (error) {
        console.error("Error al obtener datos de la base de datos:", error);
        return null; 
    }
}

// Actualizar información en base de datos
async function uploadCard(model, price, imageUrl) {
    try {
        const connection = await fetch("https://674ccaa154e1fca9290d911c.mockapi.io/api/v1/tenisModels", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                model: model,
                price: price,
                imageUrl: imageUrl
            })
        });

        if (!connection.ok) throw new Error("Error en la conexión al intentar subir datos");

        const jsonConnection = await connection.json();
        return jsonConnection;

    } catch (error) {
        console.error("Error al subir la tarjeta:", error);
        return null;
    }
}

// Actualizar tarjeta existente
async function updateCard(id, model, price, imageUrl) {
    try {
        // Obtener los datos existentes del recurso
        const response = await fetch(`https://674ccaa154e1fca9290d911c.mockapi.io/api/v1/tenisModels/${id}`);
        if (!response.ok) throw new Error("Error al obtener el recurso actual");
        const existingCard = await response.json();

        // Combinar los datos actuales con los nuevos
        const updatedCard = {
            ...existingCard,
            model: model,
            price: price,
            imageUrl: imageUrl
        };

        // Enviar el recurso completo con PUT
        const connection = await fetch(`https://674ccaa154e1fca9290d911c.mockapi.io/api/v1/tenisModels/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCard),
        });

        if (!connection.ok) throw new Error("Error al intentar actualizar la tarjeta");

        const jsonConnection = await connection.json();
        return jsonConnection;
    } catch (error) {
        console.error("Error al actualizar la tarjeta:", error);
        return null;
    }
}




//Buscar información en la base de datos
async function searchCard(keyword) {

    try {
        const connection = await fetch("https://674ccaa154e1fca9290d911c.mockapi.io/api/v1/tenisModels");
        const dataInDb = await connection.json();

        // Filtrar los resultados en el cliente
        const filteredResults = dataInDb.filter(item =>
            item.model.toLowerCase().includes(keyword.toLowerCase()) 
        );

        return filteredResults;
        
    } catch (error) {
        console.error("Hubo un problema con la búsqueda:", error);
    }

}


// Eliminar tarjeta en db.json y en el DOM
async function deleteCard(id, cardElement) {

    try {
        // Configurar la URL para eliminar el modelo específico
        const response = await fetch(`https://674ccaa154e1fca9290d911c.mockapi.io/api/v1/tenisModels/${id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            // Eliminar la tarjeta del DOM
            cardElement.remove();
            console.log(`Modelo ${id} eliminado de la base de datos y del DOM.`);
        } else {
            console.error("Error al eliminar el modelo de la base de datos.");
        }
    } catch (error) {
        console.error("Error en la solicitud de eliminación:", error);
    }
    
}


export const connectionAPI = {

    dataInDb, uploadCard, updateCard , searchCard, deleteCard

}
