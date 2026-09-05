import { createContext, useContext, useEffect, useState } from "react";
import {
  initialStockReceipts,
  type StockReceipt,
} from "../data/stockReceipts";

interface StockReceiptContextType {
  receipts: StockReceipt[];

  addReceipt: (receipt: StockReceipt) => void;

  updateReceipt: (receipt: StockReceipt) => void;

  deleteReceipt: (id: number) => void;
}

const StockReceiptContext = createContext<
  StockReceiptContextType | undefined
>(undefined);

export function StockReceiptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [receipts, setReceipts] = useState<StockReceipt[]>(() => {
    const storedReceipts = localStorage.getItem(
      "enat-milk-shop-stock-receipts"
    );

    return storedReceipts
      ? JSON.parse(storedReceipts)
      : initialStockReceipts;
  });

  useEffect(() => {
    localStorage.setItem(
      "enat-milk-shop-stock-receipts",
      JSON.stringify(receipts)
    );
  }, [receipts]);

  const addReceipt = (receipt: StockReceipt) => {
    setReceipts((currentReceipts) => [
      ...currentReceipts,
      receipt,
    ]);
  };

  const updateReceipt = (updatedReceipt: StockReceipt) => {
    setReceipts((currentReceipts) =>
      currentReceipts.map((receipt) =>
        receipt.id === updatedReceipt.id
          ? updatedReceipt
          : receipt
      )
    );
  };

  const deleteReceipt = (id: number) => {
    setReceipts((currentReceipts) =>
      currentReceipts.filter((receipt) => receipt.id !== id)
    );
  };

  return (
    <StockReceiptContext.Provider
      value={{
        receipts,
        addReceipt,
        updateReceipt,
        deleteReceipt,
      }}
    >
      {children}
    </StockReceiptContext.Provider>
  );
}

export function useStockReceipts() {
  const context = useContext(StockReceiptContext);

  if (!context) {
    throw new Error(
      "useStockReceipts must be used inside StockReceiptProvider"
    );
  }

  return context;
}