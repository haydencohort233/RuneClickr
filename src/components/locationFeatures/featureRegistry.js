import Shop from './shops/Shop'; // Generic shop component
import Banking from '../banking/banking';
import CookingRange from '../skills/cooking/CookingRange';

const featureRegistry = {
  "Shop": Shop,
  "Banking": Banking,
  "CookingRange": CookingRange
};

export default featureRegistry;
