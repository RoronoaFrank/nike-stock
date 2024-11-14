
// Obtener información de la base de datos
async function dataInDb(model, price, imageUrl) {
    try {
        const connection = await fetch("http://localhost:3001/tenisModels");
        if (!connection.ok) throw new Error("Error en la conexión para obtener los datos");
        
        const jsonConnection = await connection.json();
        return jsonConnection;

    } catch (error) {
        console.error("Error al obtener datos de la base de datos:", error);
        return null;  // Opcional: podrías retornar un valor para manejar el error en el llamado a la función
    }
}

// Actualizar información en base de datos
async function uploadCard(model, price, imageUrl) {
    try {
        const connection = await fetch("http://localhost:3001/tenisModels", {
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
        const connection = await fetch(`http://localhost:3001/tenisModels/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: model,
                price: price,
                imageUrl: imageUrl
            })
        });

        if (!connection.ok) throw new Error("Error en la conexión al intentar actualizar la tarjeta");

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
        const connection = await fetch("http://localhost:3001/tenisModels");
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
        const response = await fetch(`http://localhost:3001/tenisModels/${id}`, {
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
