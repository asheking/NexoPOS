export interface MilkReceipt {
  id: number;
  supplierId: number;
  contractId: number;
  date: string;
  session: "morning" | "afternoon";
  quantity: number;
}