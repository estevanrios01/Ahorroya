'use strict';

// Ported from packages/normalization-engine (a TypeScript-only workspace
// package with no build step -- these plain Node scripts can't `require` a
// .ts file directly, so this is a faithful JS port of just the one function
// worth using here: it fixed a real bug in the source on the way (resolveBrands
// there discarded its own computed result and returned the untouched input).
const UNIT_MAP = {
  ml: 'ml', mililitro: 'ml', mililitros: 'ml', mL: 'ml', ML: 'ml',
  l: 'L', lt: 'L', litro: 'L', litros: 'L', LT: 'L',
  g: 'g', gr: 'g', gramo: 'g', gramos: 'g', GR: 'g',
  kg: 'kg', kilo: 'kg', kilos: 'kg', KG: 'kg',
  mg: 'mg', miligramo: 'mg', miligramos: 'mg',
};

const PRESENTATION_PATTERNS = [
  /(\d+)\s*(ml|l|lt|g|gr|kg|mg)\b/i,
  /x\s*(\d+)\s*(unidad(?:es)?|tableta(?:s)?|c[aá]psula(?:s)?|sobre(?:s)?|bolsa(?:s)?)?\b/i,
];

// Extracts an embedded package size from a free-text product name, e.g.
// "Arroz Diana Premium 500g" -> { name: 'Arroz Diana Premium', quantity: 500, unit: 'g' }.
// Falls back to { name: text } when nothing matches.
function extractPresentation(text) {
  const input = String(text || '');
  for (const pattern of PRESENTATION_PATTERNS) {
    const match = input.match(pattern);
    if (match) {
      const quantity = parseInt(match[1], 10);
      const unit = (match[2] || 'unidad').toLowerCase();
      const resolvedUnit = UNIT_MAP[unit] || unit;
      return { name: input.replace(pattern, '').trim(), quantity, unit: resolvedUnit };
    }
  }
  return { name: input };
}

module.exports = { extractPresentation };
