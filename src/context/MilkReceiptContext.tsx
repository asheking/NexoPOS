import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  initialMilkReceipts,
  type MilkReceipt,
} from "../data/milkSupplies";

interface MilkReceiptContextType {
  receipts: MilkReceipt[];

  addReceipt: (receipt: MilkReceipt) => void;

  updateReceipt: (receipt: MilkReceipt) => void;
}

const MilkReceiptContext =
  createContext<MilkReceiptContextType | undefined>(
    undefined
  );

export function MilkReceiptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [receipts, setReceipts] = useState<MilkReceipt[]>(
    () => {
      const storedReceipts = localStorage.getItem(
        "enat-milk-shop-milk-receipts"
      );

      return storedReceipts
        ? JSON.parse(storedReceipts)
        : initialMilkReceipts;
    }
  );

  useEffect(() => {
    localStorage.setItem(
      "enat-milk-shop-milk-receipts",
      JSON.stringify(receipts)
    );
  }, [receipts]);

  const addReceipt = (receipt: MilkReceipt) => {
    setReceipts((currentReceipts) => [
      ...currentReceipts,
      receipt,
    ]);
  };

  const updateReceipt = (updatedReceipt: MilkReceipt) => {
    setReceipts((currentReceipts) =>
      currentReceipts.map((receipt) =>
        receipt.id === updatedReceipt.id
          ? updatedReceipt
          : receipt
      )
    );
  };

  return (
    <MilkReceiptContext.Provider
      value={{
        receipts,
        addReceipt,
        updateReceipt,
      }}
    >
      {children}
    </MilkReceiptContext.Provider>
  );
}

export function useMilkReceipts() {
  const context = useContext(MilkReceiptContext);

  if (!context) {
    throw new Error(
      "useMilkReceipts must be used inside MilkReceiptProvider"
    );
  }

  return context;
}