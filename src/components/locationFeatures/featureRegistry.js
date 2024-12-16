import Shop from './shops/Shop'; // Generic shop component
import Banking from '../banking/banking';
import CookingRange from '../skills/cooking/CookingRange';

const featureRegistry = {
  "Shop": Shop, // Use the same Shop component for all shops
  "Banking": Banking,
  "CookingRange": CookingRange
};

export default featureRegistry;
