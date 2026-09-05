import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  initialProductionRecords,
  type ProductionRecord,
} from "../data/production";

interface ProductionContextType {
  productionRecords: ProductionRecord[];

  addProduction: (record: ProductionRecord) => void;
}

const ProductionContext =
  createContext<ProductionContextType | undefined>(undefined);

export function ProductionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [productionRecords, setProductionRecords] =
    useState<ProductionRecord[]>(() => {
        const storedRecords = localStorage.getItem(
        "enat-milk-shop-production-records"
        );

        return storedRecords
        ? JSON.parse(storedRecords)
        : initialProductionRecords;
    });
  
  useEffect(() => {
    localStorage.setItem(
        "enat-milk-shop-production-records",
        JSON.stringify(productionRecords)
    );
  }, [productionRecords]);

  const addProduction = (record: ProductionRecord) => {
    setProductionRecords((currentRecords) => [
      ...currentRecords,
      record,
    ]);
  };

  return (
    <ProductionContext.Provider
      value={{
        productionRecords,
        addProduction,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
}

export function useProduction() {
  const context = useContext(ProductionContext);

  if (!context) {
    throw new Error(
      "useProduction must be used inside ProductionProvider"
    );
  }

  return context;
}