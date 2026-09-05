export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  status: "active" | "inactive";
}

export interface SupplierMilkContract {
  id: number;
  supplierId: number;
  startDate: string;
  endDate: string;
  pricePerLiter: number;
  status: "active" | "completed" | "cancelled";
}

export interface MilkReceipt {
  id: number;
  productId: number;
  typeId: number;
  supplierId: number;
  contractId: number;
  date: string;
  session: "morning" | "afternoon";
  quantity: number;
}

export const initialSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Abebe",
    phone: "0912345678",
    status: "active",
  },
  {
    id: 2,
    name: "Hana",
    phone: "0923456789",
    status: "active",
  },
  {
    id: 3,
    name: "Kebede",
    phone: "0934567890",
    status: "active",
  },
  {
    id: 4,
    name: "Mulu",
    phone: "0945678901",
    status: "active",
  },
  {
    id: 5,
    name: "Tesfaye",
    phone: "0956789012",
    status: "active",
  },
];

export const initialSupplierContracts: SupplierMilkContract[] = [
  {
    id: 1,
    supplierId: 1, // Abebe
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    pricePerLiter: 100,
    status: "active",
  },
  {
    id: 2,
    supplierId: 2, // Hana
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    pricePerLiter: 105,
    status: "active",
  },
  {
    id: 3,
    supplierId: 3, // Kebede
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    pricePerLiter: 98,
    status: "active",
  },
  {
    id: 4,
    supplierId: 4, // Mulu
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    pricePerLiter: 102,
    status: "active",
  },
  {
    id: 5,
    supplierId: 5, // Tesfaye
    startDate: "2026-09-01",
    endDate: "2026-09-07",
    pricePerLiter: 100,
    status: "active",
  },
  {
    id: 6,
    supplierId: 1, // Abebe - previous contract
    startDate: "2026-08-24",
    endDate: "2026-08-30",
    pricePerLiter: 95,
    status: "completed",
  },
];

export const initialMilkReceipts: MilkReceipt[] = [];