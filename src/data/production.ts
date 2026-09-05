export interface ProductionInput {
  productId: number;
  typeId: number;
  variantId?: number;
  quantity: number;
}

export interface ProductionRecord {
  id: number;

  outputProductId: number;
  outputTypeId: number;
  outputVariantId?: number;

  inputs: ProductionInput[];

  outputQuantity: number;

  date: string;
}

export const initialProductionRecords: ProductionRecord[] = [];