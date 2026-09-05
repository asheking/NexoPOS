export type EntryMethod = "received" | "produced";

export interface ProductFeatureOption {
  id: number;
  name: string;
}

export type StockTrackingMethod =
  | "count-remaining"
  | "count-sold";

export interface ProductFeature {
  id: number;
  name: string;
  options: ProductFeatureOption[];
}

export interface ProductType {
  id: number;
  name: string;
  entryMethod: EntryMethod;
  status: "active" | "inactive";
  features: ProductFeature[];
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: number;
  name: string;
  options: {
    featureId: number;
    optionId: number;
  }[];
  price: number;
  status: "active" | "inactive";
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description?: string;
  status: "active" | "inactive";
  types: ProductType[];
  stockTrackingMethod: StockTrackingMethod;
}

export const initialProducts: Product[] = [
  {
    id: 1,
    name: "Milk",
    category: "Dairy",
    status: "active",
    types: [
      {
        id: 1,
        name: "Homemade",
        entryMethod: "received",
        status: "active",
        features: [],
        variants: [],
      },
      {
        id: 2,
        name: "Factory",
        entryMethod: "received",
        status: "active",
        features: [],
        variants: [],
      },
    ],
    stockTrackingMethod: "count-remaining",
  },

  {
    id: 2,
    name: "Yogurt",
    category: "Dairy",
    status: "active",
    types: [
      {
        id: 3,
        name: "Homemade",
        entryMethod: "produced",
        status: "active",
        features: [],
        variants: [],
      },
      {
        id: 4,
        name: "Factory",
        entryMethod: "received",
        status: "active",
        features: [],
        variants: [],
      },
    ],
    stockTrackingMethod: "count-remaining",
  },

  {
    id: 3,
    name: "Cheese",
    category: "Dairy",
    status: "active",
    types: [
      {
        id: 5,
        name: "Sliced",
        entryMethod: "received",
        status: "active",
        features: [],
        variants: [],
      },
      {
        id: 6,
        name: "Mozzarella",
        entryMethod: "received",
        status: "active",
        features: [],
        variants: [],
      },
      {
        id: 7,
        name: "Crunched",
        entryMethod: "received",
        status: "active",
        features: [],
        variants: [],
      },
    ],
    stockTrackingMethod: "count-sold",
  },

  {
    id: 4,
    name: "Butter",
    category: "Dairy",
    status: "active",
    types: [
      {
        id: 401,
        name: "Standard",
        entryMethod: "received",
        status: "active",
        features: [],
        variants: [],
      },
    ],
    stockTrackingMethod: "count-sold",
  },

  {
    id: 5,
    name: "Egg",
    category: "Poultry",
    status: "active",
    types: [
      {
        id: 402,
        name: "Standard",
        entryMethod: "received",
        status: "active",
        features: [],
        variants: [],
      },
    ],
    stockTrackingMethod: "count-remaining",
  },

  {
    id: 6,
    name: "Chicken",
    category: "Poultry",
    status: "active",
    types: [
      {
        id: 401,
        name: "Standard",
        entryMethod: "received",
        status: "active",
        features: [],
        variants: [],
      },
    ],
    stockTrackingMethod: "count-sold",
  },
]
