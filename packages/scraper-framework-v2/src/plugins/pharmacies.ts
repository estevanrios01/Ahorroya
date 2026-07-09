import { ScraperPlugin } from '../plugin';

export const pharmacyPlugins: ScraperPlugin[] = [
  {
    id: 'cruz-verde', name: 'Cruz Verde', category: 'farmacia', baseUrl: 'https://www.cruzverde.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old-price', image: 'img.card-image', barcode: '.card-code', brand: '.card-brand', nextPage: '.pagination .next' },
    pagination: { type: 'url', param: 'page', maxPages: 40 },
  },
  {
    id: 'farmatodo', name: 'Farmatodo', category: 'farmacia', baseUrl: 'https://www.farmatodo.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-title', price: '.item-price', oldPrice: '.item-old', image: 'img.item-image', barcode: '.item-ean', brand: '.item-brand', nextPage: '.pagination-next' },
    pagination: { type: 'url', param: 'pagina', maxPages: 30 },
  },
  {
    id: 'la-rebaja', name: 'La Rebaja', category: 'farmacia', baseUrl: 'https://www.larebaja.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-image', brand: '.box-brand', nextPage: '.next-page' },
    pagination: { type: 'url', param: 'page', maxPages: 30 },
  },
  {
    id: 'locatel', name: 'Locatel', category: 'farmacia', baseUrl: 'https://www.locatel.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-price', oldPrice: '.tile-old', image: 'img.tile-image', barcode: '.tile-code', brand: '.tile-brand', nextPage: '.pagination a.next' },
    pagination: { type: 'url', param: 'pag', maxPages: 30 },
  },
  {
    id: 'farmasanitas', name: 'Farmasanitas', category: 'farmacia', baseUrl: 'https://www.farmasanitas.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-value', oldPrice: '.card-old', image: 'img.card-photo', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'colsubsidio-farma', name: 'Colsubsidio Farmacia', category: 'farmacia', baseUrl: 'https://www.colsubsidio.com/farmacia', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', oldPrice: '.item-old', image: 'img.item-img', brand: '.item-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 20 },
  },
  {
    id: 'cafam-farma', name: 'Cafam Farmacia', category: 'farmacia', baseUrl: 'https://www.cafam.com.co/farmacia', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-title', price: '.box-price', oldPrice: '.box-old-price', image: 'img.box-image', brand: '.box-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'compensar-farma', name: 'Compensar Farmacia', category: 'farmacia', baseUrl: 'https://www.compensar.com/farmacia', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-price', image: 'img.tile-photo', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 20 },
  },
  {
    id: 'drog-colombiana', name: 'Droguería Colombiana', category: 'farmacia', baseUrl: 'https://www.drogueriacolombiana.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old', image: 'img.card-img', barcode: '.card-code', brand: '.card-brand', nextPage: '.next-link' },
    pagination: { type: 'url', param: 'pagina', maxPages: 25 },
  },
  {
    id: 'drog-pasteur', name: 'Droguería Pasteur', category: 'farmacia', baseUrl: 'https://www.pasteur.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-value', oldPrice: '.item-old-value', image: 'img.item-pic', brand: '.item-brand', nextPage: '.pagination-next' },
    pagination: { type: 'url', param: 'page', maxPages: 25 },
  },
  {
    id: 'drog-economia', name: 'Droguería La Economía', category: 'farmacia', baseUrl: 'https://www.laeconomia.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-photo', brand: '.box-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 20 },
  },
  {
    id: 'drog-dinamica', name: 'Droguería Dinámica', category: 'farmacia', baseUrl: 'https://www.dinamica.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-value', oldPrice: '.tile-old', image: 'img.tile-img', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 20 },
  },
  {
    id: 'farmacia-sanitarias', name: 'Farmacia Sanitarias', category: 'farmacia', baseUrl: 'https://www.farmaciasanitarias.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-title', price: '.card-price', image: 'img.card-image', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-elifarma', name: 'Droguería Elifarma', category: 'farmacia', baseUrl: 'https://www.elifarma.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', oldPrice: '.item-old', image: 'img.item-image', barcode: '.item-code', brand: '.item-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 20 },
  },
  {
    id: 'drog-salud-total', name: 'Droguería Salud Total', category: 'farmacia', baseUrl: 'https://www.saludtotal.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-value', image: 'img.box-img', brand: '.box-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-farmacoop', name: 'Droguería Farmacoop', category: 'farmacia', baseUrl: 'https://www.farmacoop.com', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-title', price: '.tile-price', oldPrice: '.tile-old', image: 'img.tile-image', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 20 },
  },
  {
    id: 'drog-san-jose', name: 'Droguería San José', category: 'farmacia', baseUrl: 'https://www.sanjose.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old-price', image: 'img.card-photo', brand: '.card-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 15 },
  },
  {
    id: 'drog-comuneros', name: 'Droguería Los Comuneros', category: 'farmacia', baseUrl: 'https://www.comuneros.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-value', image: 'img.item-photo', brand: '.item-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'drog-ahorro', name: 'Droguería El Ahorro', category: 'farmacia', baseUrl: 'https://www.drogueriaahorro.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-image', brand: '.box-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'drog-medica', name: 'Droguería Médica', category: 'farmacia', baseUrl: 'https://www.drogmedica.com', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-price', oldPrice: '.tile-old', image: 'img.tile-pic', barcode: '.tile-code', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 20 },
  },
  {
    id: 'farmacia-alemana', name: 'Farmacia Alemana', category: 'farmacia', baseUrl: 'https://www.farmaciaalemana.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-title', price: '.card-value', image: 'img.card-img', brand: '.card-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'farmacia-hogar', name: 'Farmacia Hogar', category: 'farmacia', baseUrl: 'https://www.farmaciahogar.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', oldPrice: '.item-old', image: 'img.item-image', brand: '.item-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-colsubsidio', name: 'Droguería Colsubsidio', category: 'farmacia', baseUrl: 'https://www.farmacia.colsubsidio.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-photo', brand: '.box-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 20 },
  },
  {
    id: 'drog-cafam', name: 'Droguería Cafam', category: 'farmacia', baseUrl: 'https://www.farmacia.cafam.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-value', oldPrice: '.tile-old', image: 'img.tile-img', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 20 },
  },
  {
    id: 'drog-del-sur', name: 'Droguería del Sur', category: 'farmacia', baseUrl: 'https://www.drogdelsur.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', image: 'img.card-image', brand: '.card-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'farmacia-san-pablo', name: 'Farmacia San Pablo', category: 'farmacia', baseUrl: 'https://www.sanpablo.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', oldPrice: '.item-old', image: 'img.item-img', brand: '.item-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-nacional', name: 'Droguería Nacional', category: 'farmacia', baseUrl: 'https://www.droguerianacional.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-image', barcode: '.box-code', brand: '.box-brand', nextPage: '.next-page' },
    pagination: { type: 'url', param: 'p', maxPages: 20 },
  },
  {
    id: 'drog-san-jorge', name: 'Droguería San Jorge', category: 'farmacia', baseUrl: 'https://www.sanjorgefarmacia.com', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-title', price: '.tile-price', image: 'img.tile-photo', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 15 },
  },
  {
    id: 'drog-san-vicente', name: 'Droguería San Vicente', category: 'farmacia', baseUrl: 'https://www.sanvicentefarma.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-value', oldPrice: '.card-old', image: 'img.card-photo', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-bendicion', name: 'Droguería La Bendición', category: 'farmacia', baseUrl: 'https://www.bendicionfarma.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-value', image: 'img.item-image', brand: '.item-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'farmacia-san-jose-farm', name: 'Farmacia San José', category: 'farmacia', baseUrl: 'https://www.farmaciasanjose.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-img', brand: '.box-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-central', name: 'Droguería Central', category: 'farmacia', baseUrl: 'https://www.drogcentral.com', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-value', image: 'img.tile-image', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 15 },
  },
  {
    id: 'drog-dorado', name: 'Droguería El Dorado', category: 'farmacia', baseUrl: 'https://www.drogeldorado.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old', image: 'img.card-image', barcode: '.card-code', brand: '.card-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 20 },
  },
  {
    id: 'farmacia-san-martin', name: 'Farmacia San Martín', category: 'farmacia', baseUrl: 'https://www.sanmartinfarma.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-title', price: '.item-price', image: 'img.item-photo', brand: '.item-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'drog-san-miguel', name: 'Droguería San Miguel', category: 'farmacia', baseUrl: 'https://www.sanmigueldrogs.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-value', oldPrice: '.box-old', image: 'img.box-image', brand: '.box-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-del-norte', name: 'Droguería del Norte', category: 'farmacia', baseUrl: 'https://www.drogdelnorte.com', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-price', image: 'img.tile-img', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 15 },
  },
  {
    id: 'farmacia-andes', name: 'Farmacia Los Andes', category: 'farmacia', baseUrl: 'https://www.farmandes.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old-price', image: 'img.card-pic', brand: '.card-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 20 },
  },
  {
    id: 'drog-san-rafael', name: 'Droguería San Rafael', category: 'farmacia', baseUrl: 'https://www.sanrafaeldrogs.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-value', image: 'img.item-image', brand: '.item-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-san-pedro', name: 'Droguería San Pedro', category: 'farmacia', baseUrl: 'https://www.sanpedrofarma.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-photo', brand: '.box-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 15 },
  },
  {
    id: 'farmacia-san-juan', name: 'Farmacia San Juan', category: 'farmacia', baseUrl: 'https://www.sanjuanfarma.com', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-title', price: '.tile-value', image: 'img.tile-image', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 15 },
  },
  {
    id: 'drog-santa-fe', name: 'Droguería Santa Fe', category: 'farmacia', baseUrl: 'https://www.santafedrogs.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old', image: 'img.card-img', barcode: '.card-code', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'drog-san-lucas', name: 'Droguería San Lucas', category: 'farmacia', baseUrl: 'https://www.sanlucasfarma.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-value', image: 'img.item-photo', brand: '.item-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'farmacia-del-sur', name: 'Farmacia del Sur', category: 'farmacia', baseUrl: 'https://www.farmaciadsur.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-image', brand: '.box-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 15 },
  },
  {
    id: 'drog-san-antonio', name: 'Droguería San Antonio', category: 'farmacia', baseUrl: 'https://www.sanantoniodrogs.com', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-value', image: 'img.tile-pic', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-san-felipe', name: 'Droguería San Felipe', category: 'farmacia', baseUrl: 'https://www.sanfelipedrogs.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old', image: 'img.card-image', brand: '.card-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 15 },
  },
  {
    id: 'farmacia-san-fernando', name: 'Farmacia San Fernando', category: 'farmacia', baseUrl: 'https://www.sanfernandofarma.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-title', price: '.item-price', image: 'img.item-image', brand: '.item-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'drog-san-carlos', name: 'Droguería San Carlos', category: 'farmacia', baseUrl: 'https://www.sancarlosdrogs.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-value', oldPrice: '.box-old', image: 'img.box-img', brand: '.box-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'drog-san-pablo-online', name: 'Droguería San Pablo Online', category: 'farmacia', baseUrl: 'https://www.sanpablonline.com', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-price', image: 'img.tile-photo', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 15 },
  },
  {
    id: 'farmacia-la-14', name: 'Farmacia La 14', category: 'farmacia', baseUrl: 'https://www.farmaciala14.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-value', oldPrice: '.card-old', image: 'img.card-photo', barcode: '.card-code', brand: '.card-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 20 },
  },
  {
    id: 'drog-san-agustin', name: 'Droguería San Agustín', category: 'farmacia', baseUrl: 'https://www.sanagustinfarma.com', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-image', brand: '.box-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
];
