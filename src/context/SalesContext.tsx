import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  initialSales,
  type Sale,
} from "../data/sales";

interface SalesContextType {
  sales: Sale[];

  addSale: (sale: Sale) => void;

  updateSale: (sale: Sale) => void;

  deleteSale: (id: number) => void;
}

const SalesContext =
  createContext<SalesContextType | undefined>(undefined);

export function SalesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sales, setSales] = useState<Sale[]>(() => {
    const storedSales = localStorage.getItem(
      "enat-milk-shop-sales"
    );

    return storedSales
      ? JSON.parse(storedSales)
      : initialSales;
  });

  useEffect(() => {
    localStorage.setItem(
      "enat-milk-shop-sales",
      JSON.stringify(sales)
    );
  }, [sales]);

  const addSale = (sale: Sale) => {
    setSales((currentSales) => [
      ...currentSales,
      sale,
    ]);
  };

  const updateSale = (updatedSale: Sale) => {
    setSales((currentSales) =>
      currentSales.map((sale) =>
        sale.id === updatedSale.id
          ? updatedSale
          : sale
      )
    );
  };

  const deleteSale = (id: number) => {
    setSales((currentSales) =>
      currentSales.filter((sale) => sale.id !== id)
    );
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        addSale,
        updateSale,
        deleteSale,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
}

export function useSales() {
  const context = useContext(SalesContext);

  if (!context) {
    throw new Error(
      "useSales must be used inside SalesProvider"
    );
  }

  return context;
}