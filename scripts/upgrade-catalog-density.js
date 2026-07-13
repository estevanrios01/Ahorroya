console.error([
  'Este comando fue retirado porque generaba sucursales, existencias y precios sintéticos.',
  'AhorroYa solo admite productos, imágenes, precios y sedes verificables en fuentes oficiales.',
  'Usa npm run data:populate para revisar el plan real y REAL_CATALOG_IMPORT=1 para ejecutarlo.',
].join('\n'));
process.exitCode = 1;
