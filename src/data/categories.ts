export interface Category {
  id: number;
  name: string;
  description?: string;
  status: "active" | "inactive";
}

export const initialCategories: Category[] = [
  {
    id: 1,
    name: "Dairy",
    description: "Milk and other dairy products",
    status: "active",
  },
  {
    id: 2,
    name: "Poultry",
    description: "Chicken and eggs",
    status: "active",
  },
];