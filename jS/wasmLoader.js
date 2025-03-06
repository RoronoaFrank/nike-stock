// wasmLoader.js - Módulo para cargar y gestionar las funciones de WebAssembly

let wasmModule = null;
let wasmMemory = null;
let searchProductsFunction = null;
let sortProductsByPriceFunction = null;
let filterByPriceRangeFunction = null;

// Cargar el módulo WebAssembly
export async function loadWasmModule() {
  try {
    // Importar el módulo WebAssembly compilado
    const response = await fetch('wasm/nikestore.wasm');
    const wasmBuffer = await response.arrayBuffer();
    
    // Crear un objeto con las importaciones que necesita el módulo
    const importObject = {
      env: {
        memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
        // Añadir funciones de JS que pueda necesitar llamar desde C
        consoleLog: function(ptr) {
          console.log(wasmToString(ptr));
        }
      }
    };
    
    // Instanciar el módulo WebAssembly
    const wasmResult = await WebAssembly.instantiate(wasmBuffer, importObject);
    wasmModule = wasmResult.instance;
    wasmMemory = importObject.env.memory;
    
    // Obtener referencias a las funciones exportadas
    searchProductsFunction = wasmModule.exports.searchProducts;
    sortProductsByPriceFunction = wasmModule.exports.sortProductsByPrice;
    filterByPriceRangeFunction = wasmModule.exports.filterByPriceRange;
    
    console.log('Módulo WebAssembly cargado correctamente');
    return true;
  } catch (error) {
    console.error('Error al cargar el módulo WebAssembly:', error);
    return false;
  }
}

// Función auxiliar para convertir una cadena de C a JavaScript
function wasmToString(ptr) {
  const memory = new Uint8Array(wasmMemory.buffer);
  let str = '';
  let i = ptr;
  
  while (memory[i] !== 0) {
    str += String.fromCharCode(memory[i]);
    i++;
  }
  
  return str;
}

// Auxiliar para convertir una cadena de JavaScript a C
function stringToWasm(str) {
  const lengthBytes = str.length + 1; // +1 para el carácter nulo
  const ptr = wasmModule.exports.malloc(lengthBytes);
  const memory = new Uint8Array(wasmMemory.buffer);
  
  let i = 0;
  for (; i < str.length; i++) {
    memory[ptr + i] = str.charCodeAt(i);
  }
  memory[ptr + i] = 0; // Carácter nulo al final
  
  return ptr;
}

// Optimización para buscar productos
export async function searchProductsOptimized(products, searchTerm) {
  if (!wasmModule) {
    await loadWasmModule();
  }
  
  // Convertir productos a formato JSON
  const productsJson = JSON.stringify(products);
  
  // Convertir datos a formato que WebAssembly pueda entender
  const productsPtr = stringToWasm(productsJson);
  const searchTermPtr = stringToWasm(searchTerm);
  const resultCountPtr = wasmModule.exports.malloc(4); // 4 bytes para un entero
  
  // Llamar a la función de búsqueda en WebAssembly
  const resultIdsPtr = searchProductsFunction(productsPtr, searchTermPtr, resultCountPtr);
  
  // Leer el número de resultados
  const memory = new Uint32Array(wasmMemory.buffer);
  const resultCount = memory[resultCountPtr / 4]; // Dividimos por 4 porque es un entero (4 bytes)
  
  // Leer los IDs de los productos encontrados
  const resultIds = [];
  for (let i = 0; i < resultCount; i++) {
    resultIds.push(memory[resultIdsPtr / 4 + i]);
  }
  
  // Filtrar los productos originales por los IDs encontrados
  const results = products.filter(product => resultIds.includes(product.id));
  
  // Liberar memoria
  wasmModule.exports.free(productsPtr);
  wasmModule.exports.free(searchTermPtr);
  wasmModule.exports.free(resultCountPtr);
  wasmModule.exports.free(resultIdsPtr);
  
  return results;
}

// Más funciones auxiliares para trabajar con otras funciones de WebAssembly...