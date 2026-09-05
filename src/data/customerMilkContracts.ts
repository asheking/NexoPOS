export interface CustomerMilkContract {
  id: number;
  customerId: number;
  startDate: string;
  endDate: string;
  quantityPerDay: number;
  pricePerUnit: number;
  status: "active" | "completed" | "cancelled";
}