#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <emscripten.h>

// Estructura para almacenar información de productos
typedef struct {
  int id;
  char name[100];
  double price;
  char imageUrl[200];
} Product;

// Convertir todo a minúsculas para búsqueda
void toLowerCase(char* str, char* result) {
  int i = 0;
  while (str[i]) {
    result[i] = (str[i] >= 'A' && str[i] <= 'Z') ? str[i] + 32 : str[i];
    i++;
  }
  result[i] = '\0';
}

// Optimizar búsqueda parcial de texto
EMSCRIPTEN_KEEPALIVE
int* searchProducts(char* productsJson, char* searchTerm, int* resultCount) {
  // En un caso real, aquí parsearíamos el JSON
  // Para este ejemplo, simularemos productos ya parseados
  Product products[100]; // Asumimos máximo 100 productos
  int productCount = 0;  // El número real de productos
  
  // TODO: Parsear productsJson para llenar el array products
  // Esto requeriría una implementación de parsing JSON en C
  
  // Convertir término de búsqueda a minúsculas
  char searchTermLower[100];
  toLowerCase(searchTerm, searchTermLower);
  
  // Array para almacenar IDs de resultados de búsqueda
  int* results = (int*)malloc(100 * sizeof(int));
  *resultCount = 0;
  
  // Algoritmo de búsqueda optimizado
  for (int i = 0; i < productCount; i++) {
    char nameLower[100];
    toLowerCase(products[i].name, nameLower);
    
    // Verificar si el nombre contiene el término de búsqueda
    if (strstr(nameLower, searchTermLower) != NULL) {
      results[*resultCount] = products[i].id;
      (*resultCount)++;
    }
  }
  
  return results;
}

// Ordenar productos por precio (ascendente)
EMSCRIPTEN_KEEPALIVE
void sortProductsByPrice(int* productIds, int count, Product* products, int ascending) {
  // Implementación del algoritmo QuickSort optimizado
  // Este algoritmo es mucho más rápido en C que en JavaScript para conjuntos grandes
  
  // Código del algoritmo QuickSort aquí...
}

// Filtrar productos por rango de precio
EMSCRIPTEN_KEEPALIVE
int* filterByPriceRange(Product* products, int count, double minPrice, double maxPrice, int* resultCount) {
  int* results = (int*)malloc(count * sizeof(int));
  *resultCount = 0;
  
  for (int i = 0; i < count; i++) {
    if (products[i].price >= minPrice && products[i].price <= maxPrice) {
      results[*resultCount] = products[i].id;
      (*resultCount)++;
    }
  }
  
  return results;
}