// /src/components/drops/getDropItems.js
import enemyDrops from './enemyDrops.json'; // Assuming you already have this drop table JSON file

const getDropItems = (enemyType) => {
  const dropTable = enemyDrops[enemyType];
  const droppedItems = [];

  if (dropTable) {
    dropTable.forEach((item) => {
      const chance = Math.random(); // Generates a number between 0 and 1
      if (chance <= item.dropChance) {
        droppedItems.push({ ...item });
      }
    });
  }

  return droppedItems;
};

export default getDropItems;
