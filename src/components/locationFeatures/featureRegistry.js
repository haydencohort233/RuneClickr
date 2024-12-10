// featureRegistry.js
import MagicShop from './shops/magicShop/magicShop';
import Banking from '../banking/banking';
import CookingRange from '../skills/cooking/CookingRange';

const featureRegistry = {
  "MagicShop": MagicShop,
  "Banking": Banking,
  "CookingRange": CookingRange
};

export default featureRegistry;
