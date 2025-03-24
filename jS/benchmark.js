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
  js: {}, // Resultados en modo JavaScript estándar
  wasm: {}, // Resultados en modo WebAssembly
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

// Original de búsqueda (copia de implementación actual)
function originalSearch(products, searchTerm) {
  if (!searchTerm) return products;

  searchTerm = searchTerm.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.price.toString().includes(searchTerm)
  );
}

// Ejecutar pruebas de rendimiento
async function runBenchmark(mode = "js") {
  console.log(`Ejecutando pruebas de rendimiento [Modo: ${mode.toUpperCase()}]...`);

  // Probar con diferentes tamaños de datos
  for (const [sizeKey, size] of Object.entries(TEST_CONFIG.dataSize)) {
    console.log(`\nTamaño de datos: ${sizeKey} (${size} productos)`);
    benchmarkResults[mode][sizeKey] = {};

    const testData = generateTestData(size);

    // Ejecutar cada término de búsqueda
    for (const test of TEST_CONFIG.searchTests) {
      let totalTime = 0;
      let results = [];

      console.log(`- Prueba: ${test.description}`);

      // Calentar el motor JS (para resultados más precisos)
      originalSearch(testData, test.term);

      // Ejecutar varias iteraciones y promediar
      for (let i = 0; i < TEST_CONFIG.iterations; i++) {
        const startTime = performance.now();
        results = originalSearch(testData, test.term); // Usar aquí la función adecuada según el modo
        const endTime = performance.now();
        totalTime += endTime - startTime;
      }

      const avgTime = totalTime / TEST_CONFIG.iterations;
      console.log(`  Tiempo promedio: ${avgTime.toFixed(3)} ms`);
      console.log(`  Resultados encontrados: ${results.length}`);

      benchmarkResults[mode][sizeKey][test.term] = {
        time: avgTime,
        resultCount: results.length,
      };
    }
  }

  return benchmarkResults;
}

// Ejecutar pruebas en modo JS
async function runJsBenchmark() {
  console.log("Forzando modo JavaScript estándar...");
  const newUrl = window.location.origin + window.location.pathname + "?wasm=false";
  window.history.replaceState({}, "", newUrl);

  await runBenchmark("js");
  console.log("Pruebas en modo JS completadas.");
}

// Ejecutar pruebas en modo WASM
async function runWasmBenchmark() {
  console.log("Forzando modo WebAssembly...");
  const newUrl = window.location.origin + window.location.pathname;
  window.history.replaceState({}, "", newUrl);

  await runBenchmark("wasm");
  console.log("Pruebas en modo WASM completadas.");
}

// Mostrar resultados comparativos de ambos modos de búsqueda
function displayComparison() {
  if (!benchmarkResults.js || !benchmarkResults.wasm) {
    console.log(
      "No hay suficientes datos para comparar. Ejecuta ambas versiones primero."
    );
    return;
  }

  console.log("\n=== COMPARACIÓN DE RENDIMIENTO ===");

  for (const sizeKey of Object.keys(benchmarkResults.js)) {
    console.log(`\nTamaño de datos: ${sizeKey}`);
    console.log("--------------------------------------------------------");
    console.log("Término | JS (ms) | WASM (ms) | Mejora (%)");
    console.log("--------------------------------------------------------");

    for (const test of TEST_CONFIG.searchTests) {
      const term = test.term || "(vacío)";
      const jsTime = benchmarkResults.js[sizeKey][test.term]?.time || 0;
      const wasmTime = benchmarkResults.wasm[sizeKey][test.term]?.time || 0;

      if (jsTime && wasmTime) {
        const improvement = (((jsTime - wasmTime) / jsTime) * 100).toFixed(2);
        console.log(
          `${term.padEnd(8)} | ${jsTime.toFixed(3).padStart(12)} | ${wasmTime
            .toFixed(3)
            .padStart(14)} | ${improvement.padStart(9)}%`
        );
      }
    }
  }

  console.log("\nResultados completos:");
  console.log(JSON.stringify(benchmarkResults, null, 2));
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
      "Modo",
      "Tiempo promedio (ms)",
      "Resultados encontrados",
    ].join(",")
  );

  // Iterar sobre los resultados JS y WASM
  for (const mode in benchmarkResults) {
    for (const sizeKey in benchmarkResults[mode]) {
      for (const term in benchmarkResults[mode][sizeKey]) {
        const result = benchmarkResults[mode][sizeKey][term];
        rows.push(
          [
            sizeKey,
            term || "(vacío)",
            mode.toUpperCase(),
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
window.runJsBenchmark = runJsBenchmark;
window.runWasmBenchmark = runWasmBenchmark;
window.displayComparison = displayComparison;
window.exportToCSV = exportToCSV;

console.log("🧪 Benchmark de NikeStore cargado.");
console.log(
  "Ejecuta window.runJsBenchmark() o window.runWasmBenchmark() para iniciar las pruebas."
);