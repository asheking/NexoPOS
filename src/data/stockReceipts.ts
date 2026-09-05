export interface StockReceipt {
  id: number;
  productId: number;
  typeId?: number;
  variantId?: number;
  quantity: number;
  date: string;
  supplierId?: number;
  unitCost?: number;
}

export const initialStockReceipts: StockReceipt[] = [];