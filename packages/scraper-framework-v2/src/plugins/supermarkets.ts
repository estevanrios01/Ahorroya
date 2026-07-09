import { ScraperPlugin } from '../plugin';

export const supermarketPlugins: ScraperPlugin[] = [
  {
    id: 'exito', name: 'Éxito', category: 'supermercado', baseUrl: 'https://www.exito.com', rateLimit: 2,
    selectors: { product: '[data-product]', name: '.product-name', price: '.price-current', oldPrice: '.price-before', image: 'img.product-image', barcode: '.barcode', brand: '.brand-name', nextPage: '.pagination .next a' },
    pagination: { type: 'url', param: 'page', maxPages: 50 },
  },
  {
    id: 'carulla', name: 'Carulla', category: 'supermercado', baseUrl: 'https://www.carulla.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-title', price: '.sale-price', oldPrice: '.previous-price', image: 'img.card-image', barcode: '.sku-code', brand: '.brand-tag', nextPage: 'a.pagination-next' },
    pagination: { type: 'url', param: 'pagina', maxPages: 50 },
  },
  {
    id: 'jumbo', name: 'Jumbo', category: 'supermercado', baseUrl: 'https://www.tiendasjumbo.co', rateLimit: 2,
    selectors: { product: '.vtex-product', name: '.productName', price: '.best-price', oldPrice: '.list-price', image: 'img.product-image', barcode: '.ref-code', brand: '.product-brand', nextPage: '.pagination .next' },
    pagination: { type: 'url', param: 'page', maxPages: 40 },
  },
  {
    id: 'olimpica', name: 'Olímpica', category: 'supermercado', baseUrl: 'https://www.olimpica.com', rateLimit: 2,
    selectors: { product: '.item-product', name: '.item-name', price: '.item-price', oldPrice: '.item-old-price', image: 'img.item-image', barcode: '.item-code', brand: '.item-brand', nextPage: '.pagination-next' },
    pagination: { type: 'url', param: 'pagina', maxPages: 30 },
  },
  {
    id: 'd1', name: 'D1', category: 'supermercado', baseUrl: 'https://www.tiendasd1.com', rateLimit: 3,
    selectors: { product: '.product-box', name: '.product-title', price: '.product-value', image: 'img.product-photo', brand: '.product-maker' },
    pagination: { type: 'url', param: 'pag', maxPages: 20 },
  },
  {
    id: 'ara', name: 'Ara', category: 'supermercado', baseUrl: 'https://www.ara.com.co', rateLimit: 3,
    selectors: { product: '.product-card', name: '.product-name', price: '.product-price', oldPrice: '.old-price', image: 'img.product-img', brand: '.product-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 25 },
  },
  {
    id: 'alkosto', name: 'Alkosto', category: 'supermercado', baseUrl: 'https://www.alkosto.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.product-name', price: '.product-price', oldPrice: '.was-price', image: 'img.product-image', barcode: '.product-sku', brand: '.brand-name', nextPage: '.pagination-next' },
    pagination: { type: 'url', param: 'page', maxPages: 40 },
  },
  {
    id: 'alkomprar', name: 'Alkomprar', category: 'supermercado', baseUrl: 'https://www.alkomprar.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old-price', image: 'img.card-image', barcode: '.card-sku', brand: '.card-brand', nextPage: '.next-page' },
    pagination: { type: 'url', param: 'page', maxPages: 30 },
  },
  {
    id: 'makro', name: 'Makro', category: 'supermercado', baseUrl: 'https://www.makro.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.product-name', price: '.product-prices', oldPrice: '.product-old', image: 'img.product-img', brand: '.product-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 30 },
  },
  {
    id: 'metro', name: 'Metro', category: 'supermercado', baseUrl: 'https://www.metro.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-price', oldPrice: '.tile-old', image: 'img.tile-image', barcode: '.tile-sku', brand: '.tile-brand', nextPage: '.pagination a.next' },
    pagination: { type: 'url', param: 'pagina', maxPages: 30 },
  },
  {
    id: 'supertiendas', name: 'Supertiendas', category: 'supermercado', baseUrl: 'https://www.supertiendas.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', oldPrice: '.item-old-price', image: 'img.item-img', brand: '.item-brand', nextPage: '.next-link' },
    pagination: { type: 'url', param: 'p', maxPages: 25 },
  },
  {
    id: 'canaveral', name: 'Cañaveral', category: 'supermercado', baseUrl: 'https://www.cccanaveral.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-title', price: '.card-price', oldPrice: '.card-old', image: 'img.card-photo', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'surtimax', name: 'Surtimax', category: 'supermercado', baseUrl: 'https://www.surtimax.com.co', rateLimit: 2,
    selectors: { product: '.product', name: '.product-name', price: '.product-price', oldPrice: '.price-before', image: 'img.product-pic', barcode: '.product-ean', brand: '.product-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 30 },
  },
  {
    id: 'surtiplaza', name: 'Surtiplaza', category: 'supermercado', baseUrl: 'https://www.surtiplaza.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-value', oldPrice: '.old-value', image: 'img.card-img', brand: '.card-brand', nextPage: '.next-page' },
    pagination: { type: 'url', param: 'page', maxPages: 25 },
  },
  {
    id: 'comfandi', name: 'Comfandi', category: 'supermercado', baseUrl: 'https://www.comfandi.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', image: 'img.item-img', brand: '.item-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'comfamiliar', name: 'Comfamiliar', category: 'supermercado', baseUrl: 'https://www.comfamiliar.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-img', brand: '.box-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'coopservir', name: 'Coopservir', category: 'supermercado', baseUrl: 'https://www.coopservir.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-title', price: '.card-price', image: 'img.card-image', brand: '.card-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 20 },
  },
  {
    id: 'merkandrea', name: 'Merkandrea', category: 'supermercado', baseUrl: 'https://www.merkandrea.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-value', oldPrice: '.item-old', image: 'img.item-photo', brand: '.item-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'merkacentro', name: 'Merkacentro', category: 'supermercado', baseUrl: 'https://www.merkacentro.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-price', oldPrice: '.tile-old-price', image: 'img.tile-photo', barcode: '.tile-code', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 20 },
  },
  {
    id: 'mercazes', name: 'MercaZES', category: 'supermercado', baseUrl: 'https://www.mercazes.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-discount', image: 'img.card-image', brand: '.card-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 15 },
  },
  {
    id: 'entrepagos', name: 'Entrepagos', category: 'supermercado', baseUrl: 'https://www.entrepagos.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', image: 'img.box-img', brand: '.box-brand', nextPage: '.pagination a.next' },
    pagination: { type: 'url', param: 'page', maxPages: 25 },
  },
  {
    id: 'la14', name: 'La 14', category: 'supermercado', baseUrl: 'https://www.la14.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', oldPrice: '.item-old-price', image: 'img.item-img', brand: '.item-brand', nextPage: '.next-link' },
    pagination: { type: 'url', param: 'pagina', maxPages: 30 },
  },
  {
    id: 'surtidora', name: 'Surtidora de Víveres', category: 'supermercado', baseUrl: 'https://www.surtidora.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-title', price: '.card-value', oldPrice: '.card-old', image: 'img.card-pic', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'maximo', name: 'Máximo', category: 'supermercado', baseUrl: 'https://www.maximo.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-title', price: '.tile-price', oldPrice: '.tile-old', image: 'img.tile-img', barcode: '.tile-code', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 25 },
  },
  {
    id: 'surtifamiliar', name: 'Surtifamiliar', category: 'supermercado', baseUrl: 'https://www.surtifamiliar.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-photo', brand: '.box-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 20 },
  },
  {
    id: 'mercamio', name: 'Mercamio', category: 'supermercado', baseUrl: 'https://www.mercamio.com', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-title', price: '.item-price', oldPrice: '.item-old', image: 'img.item-image', brand: '.item-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'surtigar', name: 'Surtigar', category: 'supermercado', baseUrl: 'https://www.surtigar.com', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', image: 'img.card-img', brand: '.card-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'supermercado-oto', name: 'Supermercado Otoya', category: 'supermercado', baseUrl: 'https://www.otoya.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-value', oldPrice: '.tile-old', image: 'img.tile-photo', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 15 },
  },
  {
    id: 'supermercado-sind', name: 'Supermercados Sindicato', category: 'supermercado', baseUrl: 'https://www.sindicato.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-value', image: 'img.box-img', brand: '.box-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 15 },
  },
  {
    id: 'supermercado-unido', name: 'Supermercados Unidos', category: 'supermercado', baseUrl: 'https://www.superunidos.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old', image: 'img.card-image', barcode: '.card-code', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 25 },
  },
  {
    id: 'supermercado-euro', name: 'Eurosupermercados', category: 'supermercado', baseUrl: 'https://www.eurosupermercados.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', oldPrice: '.item-old', image: 'img.item-photo', brand: '.item-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'supermercado-sa', name: 'Supermercados SA', category: 'supermercado', baseUrl: 'https://www.supersa.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-title', price: '.tile-price', image: 'img.tile-image', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 20 },
  },
  {
    id: 'supermercado-bodega', name: 'Bodega Supermercados', category: 'supermercado', baseUrl: 'https://www.bodega.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old-price', image: 'img.box-image', brand: '.box-brand', nextPage: '.next-page' },
    pagination: { type: 'url', param: 'p', maxPages: 20 },
  },
  {
    id: 'supermercado-ahorro', name: 'El Ahorro Supermercados', category: 'supermercado', baseUrl: 'https://www.elahorro.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-value', image: 'img.card-photo', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'supermercado-lider', name: 'Líder Supermercados', category: 'supermercado', baseUrl: 'https://www.lider.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', oldPrice: '.item-old', image: 'img.item-img', barcode: '.item-code', brand: '.item-brand', nextPage: '.pagination-next' },
    pagination: { type: 'url', param: 'pagina', maxPages: 25 },
  },
  {
    id: 'supermercado-vecino', name: 'Supermercado Vecino', category: 'supermercado', baseUrl: 'https://www.vecino.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', image: 'img.box-pic', brand: '.box-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'supermercado-confidence', name: 'Confidence Supermercados', category: 'supermercado', baseUrl: 'https://www.confidence.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-price', oldPrice: '.tile-old', image: 'img.tile-img', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 20 },
  },
  {
    id: 'supermercado-corp', name: 'Corporación de Supermercados', category: 'supermercado', baseUrl: 'https://www.corp-super.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-title', price: '.card-price', oldPrice: '.card-old', image: 'img.card-image', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'supermercado-almacen', name: 'Almacenes y Supermercados', category: 'supermercado', baseUrl: 'https://www.almacenesysuper.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-title', price: '.item-value', image: 'img.item-photo', brand: '.item-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 15 },
  },
  {
    id: 'supermercado-bogota', name: 'Supermercados Bogotá', category: 'supermercado', baseUrl: 'https://www.superbogota.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old-price', image: 'img.box-image', brand: '.box-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 20 },
  },
  {
    id: 'supermercado-medellin', name: 'Supermercados Medellín', category: 'supermercado', baseUrl: 'https://www.supermedellin.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-price', oldPrice: '.tile-old', image: 'img.tile-photo', barcode: '.tile-code', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 20 },
  },
  {
    id: 'supermercado-cali', name: 'Supermercados Cali', category: 'supermercado', baseUrl: 'https://www.supercali.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-value', image: 'img.card-image', brand: '.card-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 15 },
  },
  {
    id: 'supermercado-barranquilla', name: 'Supermercados Barranquilla', category: 'supermercado', baseUrl: 'https://www.superbarranquilla.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-name', price: '.item-price', oldPrice: '.item-old', image: 'img.item-img', brand: '.item-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'supermercado-bucaramanga', name: 'Supermercados Bucaramanga', category: 'supermercado', baseUrl: 'https://www.superbucaramanga.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-photo', brand: '.box-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'supermercado-cartagena', name: 'Supermercados Cartagena', category: 'supermercado', baseUrl: 'https://www.supercartagena.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-value', image: 'img.tile-img', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 15 },
  },
  {
    id: 'supermercado-pereira', name: 'Supermercados Pereira', category: 'supermercado', baseUrl: 'https://www.superpereira.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old', image: 'img.card-pic', brand: '.card-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'supermercado-manizales', name: 'Supermercados Manizales', category: 'supermercado', baseUrl: 'https://www.supermanizales.com.co', rateLimit: 2,
    selectors: { product: '.product-item', name: '.item-title', price: '.item-value', image: 'img.item-image', brand: '.item-brand' },
    pagination: { type: 'url', param: 'pag', maxPages: 15 },
  },
  {
    id: 'supermercado-ibague', name: 'Supermercados Ibagué', category: 'supermercado', baseUrl: 'https://www.superibague.com.co', rateLimit: 2,
    selectors: { product: '.product-box', name: '.box-name', price: '.box-price', oldPrice: '.box-old', image: 'img.box-image', brand: '.box-brand' },
    pagination: { type: 'url', param: 'pagina', maxPages: 15 },
  },
  {
    id: 'supermercado-cucuta', name: 'Supermercados Cúcuta', category: 'supermercado', baseUrl: 'https://www.supercucuta.com.co', rateLimit: 2,
    selectors: { product: '.product-tile', name: '.tile-name', price: '.tile-value', image: 'img.tile-photo', brand: '.tile-brand' },
    pagination: { type: 'url', param: 'page', maxPages: 15 },
  },
  {
    id: 'supermercado-villavo', name: 'Supermercados Villavicencio', category: 'supermercado', baseUrl: 'https://www.supervillavo.com.co', rateLimit: 2,
    selectors: { product: '.product-card', name: '.card-name', price: '.card-price', oldPrice: '.card-old', image: 'img.card-img', brand: '.card-brand' },
    pagination: { type: 'url', param: 'p', maxPages: 15 },
  },
];
