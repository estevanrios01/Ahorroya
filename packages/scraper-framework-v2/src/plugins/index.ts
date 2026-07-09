import { supermarketPlugins } from './supermarkets';
import { pharmacyPlugins } from './pharmacies';

export const allPluginConfigs = [...supermarketPlugins, ...pharmacyPlugins];

export { supermarketPlugins, pharmacyPlugins };
