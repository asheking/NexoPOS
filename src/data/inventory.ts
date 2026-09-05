export interface InventoryItem {
  id: number;

  productId: number;
  typeId: number;

  quantity: number;
}

export const initialInventory: InventoryItem[] = [
  // Milk
  {
    id: 1,
    productId: 1,
    typeId: 1,
    quantity: 35,
  },
  {
    id: 2,
    productId: 1,
    typeId: 2,
    quantity: 20,
  },

  // Yogurt
  {
    id: 3,
    productId: 2,
    typeId: 3,
    quantity: 18,
  },
  {
    id: 4,
    productId: 2,
    typeId: 4,
    quantity: 25,
  },

  // Cheese
  {
    id: 5,
    productId: 3,
    typeId: 5,
    quantity: 15,
  },
  {
    id: 6,
    productId: 3,
    typeId: 6,
    quantity: 12,
  },
  {
    id: 7,
    productId: 3,
    typeId: 7,
    quantity: 10,
  },

  // Butter
  {
    id: 8,
    productId: 4,
    typeId: 401,
    quantity: 20,
  },

  // Egg
  {
    id: 9,
    productId: 5,
    typeId: 402,
    quantity: 120,
  },

  // Chicken
  {
    id: 10,
    productId: 6,
    typeId: 401,
    quantity: 25,
  },
];