export interface SaleItem {
  productId: number;
  typeId?: number;
  variantId?: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: number;
  items: SaleItem[];
  totalAmount: number;
  date: string;
  recordedBy: number;
  recordedByRole: "worker" | "superadmin";
}

export const initialSales: Sale[] = [];