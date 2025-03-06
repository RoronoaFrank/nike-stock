// benchmark.js - Para medir el rendimiento antes y después de las optimizaciones WASM

// Configuración de pruebas
const TEST_CONFIG = {
  searchTests: [
    { term: "", description: "Búsqueda vacía (mostrar todo)" },
    { term: "air", description: "Término común (Air)" },
    { term: "jordan", description: "Término específico (Jordan)" },
    { term: "z", description: "Término poco común" },
    { term: "2", description: "Búsqueda numérica" },
  ],
  iterations: 5, // Número de veces que se ejecuta cada prueba
  dataSize: {
    small: 20, // Pocos productos
    medium: 100, // Tamaño medio
    large: 500, // Muchos productos (para probar escalabilidad)
  },
};

// Almacenamiento de resultados
const benchmarkResults = {
  original: {}, // Resultados antes de WASM
  optimized: {}, // Resultados después de WASM
};

// Función para generar datos de prueba
function generateTestData(size) {
  const products = [];
  const brands = ["Nike", "Air", "Jordan", "Max", "Zoom", "React", "Free"];
  const types = ["Running", "Basketball", "Training", "Lifestyle", "Soccer"];

  for (let i = 0; i < size; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const id = i + 1;

    products.push({
      id: id,
      name: `${brand} ${type} ${id}`,
      price: Math.floor(Math.random() * 15000) + 1000, // Entre 1000 y 16000
      imageUrl: `https://example.com/image${id}.jpg`,
    });
  }

  return products;
}

// Función original de búsqueda (copia de tu implementación actual)
function originalSearch(products, searchTerm) {
  if (!searchTerm) return products;

  searchTerm = searchTerm.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.price.toString().includes(searchTerm)
  );
}

// Función para ejecutar pruebas de rendimiento
async function runBenchmark(isOriginal = true) {
  const resultType = isOriginal ? "original" : "optimized";
  const searchFunction = isOriginal ? originalSearch : optimizedSearch;

  console.log(`Ejecutando pruebas de rendimiento [${resultType}]...`);

  // Probar con diferentes tamaños de datos
  for (const [sizeKey, size] of Object.entries(TEST_CONFIG.dataSize)) {
    console.log(`\nTamaño de datos: ${sizeKey} (${size} productos)`);
    benchmarkResults[resultType][sizeKey] = {};

    const testData = generateTestData(size);

    // Ejecutar cada término de búsqueda
    for (const test of TEST_CONFIG.searchTests) {
      let totalTime = 0;
      let results = [];

      console.log(`- Prueba: ${test.description}`);

      // Calentar el motor JS (para resultados más precisos)
      searchFunction(testData, test.term);

      // Ejecutar varias iteraciones y promediar
      for (let i = 0; i < TEST_CONFIG.iterations; i++) {
        const startTime = performance.now();
        results = searchFunction(testData, test.term);
        const endTime = performance.now();
        totalTime += endTime - startTime;
      }

      const avgTime = totalTime / TEST_CONFIG.iterations;
      console.log(`  Tiempo promedio: ${avgTime.toFixed(3)} ms`);
      console.log(`  Resultados encontrados: ${results.length}`);

      benchmarkResults[resultType][sizeKey][test.term] = {
        time: avgTime,
        resultCount: results.length,
      };
    }
  }

  return benchmarkResults;
}

// Función para mostrar resultados comparativos cuando tengamos ambos
function displayComparison() {
  if (!benchmarkResults.original || !benchmarkResults.optimized) {
    console.log(
      "No hay suficientes datos para comparar. Ejecuta ambas versiones primero."
    );
    return;
  }

  console.log("\n=== COMPARACIÓN DE RENDIMIENTO ===");

  for (const sizeKey of Object.keys(benchmarkResults.original)) {
    console.log(`\nTamaño de datos: ${sizeKey}`);
    console.log("--------------------------------------------------------");
    console.log("Término | Original (ms) | Optimizado (ms) | Mejora (%)");
    console.log("--------------------------------------------------------");

    for (const test of TEST_CONFIG.searchTests) {
      const term = test.term || "(vacío)";
      const original = benchmarkResults.original[sizeKey][test.term]?.time || 0;
      const optimized =
        benchmarkResults.optimized[sizeKey][test.term]?.time || 0;

      if (original && optimized) {
        const improvement = (((original - optimized) / original) * 100).toFixed(
          2
        );
        console.log(
          `${term.padEnd(8)} | ${original.toFixed(3).padStart(12)} | ${optimized
            .toFixed(3)
            .padStart(14)} | ${improvement.padStart(9)}%`
        );
      }
    }
  }

  console.log("\nResultados completos:");
  console.log(JSON.stringify(benchmarkResults, null, 2));
}

// Placeholder para la función optimizada (se reemplazará después)
async function optimizedSearch(products, searchTerm) {
  // Esta función será reemplazada por la versión WASM
  return originalSearch(products, searchTerm);
}

// Ejecutar benchmark para la versión original
async function runOriginalBenchmark() {
  console.log("Ejecutando benchmark para la versión ORIGINAL...");
  await runBenchmark(true);

  // Guardar los resultados en LocalStorage para referencia futura
  localStorage.setItem(
    "nikestore_benchmark_original",
    JSON.stringify(benchmarkResults.original)
  );

  console.log("Benchmark original completado y guardado.");
  console.log(
    "Puedes revisar los resultados en la consola o exportarlos con exportResults()"
  );
}

// Función para exportar resultados
function exportResults() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    },
    results: benchmarkResults,
  };

  // Crear un blob con los resultados
  const blob = new Blob([JSON.stringify(results, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  // Crear un enlace para descargar
  const a = document.createElement("a");
  a.href = url;
  a.download = "nikestore_benchmark_results.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Exportar resultados como JSON
function exportResults() {
  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    },
    results: benchmarkResults,
  };

  // Crear un blob con los resultados
  const blob = new Blob([JSON.stringify(results, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  // Crear un enlace para descargar
  const a = document.createElement("a");
  a.href = url;
  a.download = "nikestore_benchmark_results.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Exportar resultados como CSV
function exportToCSV() {
  // Convertir los resultados a un formato tabular
  const rows = [];

  // Encabezados del CSV
  rows.push(
    [
      "Tamaño de datos",
      "Término de búsqueda",
      "Versión",
      "Tiempo promedio (ms)",
      "Resultados encontrados",
    ].join(",")
  );

  // Iterar sobre los resultados originales y optimizados
  for (const version in benchmarkResults) {
    for (const sizeKey in benchmarkResults[version]) {
      for (const term in benchmarkResults[version][sizeKey]) {
        const result = benchmarkResults[version][sizeKey][term];
        rows.push(
          [
            sizeKey,
            term || "(vacío)",
            version,
            result.time.toFixed(3),
            result.resultCount,
          ].join(",")
        );
      }
    }
  }

  // Crear un blob con los datos CSV
  const csvContent = rows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  // Crear un enlace para descargar el archivo
  const a = document.createElement("a");
  a.href = url;
  a.download = "nikestore_benchmark_results.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(
    "Los resultados han sido exportados como CSV. Puedes abrirlo en Excel."
  );
}

// Exponer funciones al ámbito global
window.exportResults = exportResults;
window.exportToCSV = exportToCSV;

// Exponer funciones al ámbito global para acceder desde la consola
window.runOriginalBenchmark = runOriginalBenchmark;
window.exportResults = exportResults;
window.benchmarkResults = benchmarkResults;

console.log("🧪 Benchmark de NikeStore cargado.");
console.log(
  "Ejecuta window.runOriginalBenchmark() para iniciar las pruebas de la versión original."
);
