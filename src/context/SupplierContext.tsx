import { createContext, useContext, useState, useEffect, } from "react";
import {
  initialSuppliers,
  type Supplier,
} from "../data/milkSupplies";

interface SupplierContextType {
  suppliers: Supplier[];

  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;

  toggleSupplierStatus: (supplierId: number) => void;
}

const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined
);

export function SupplierProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const storedSuppliers = localStorage.getItem(
      "enat-milk-shop-suppliers"
    );

    return storedSuppliers
      ? JSON.parse(storedSuppliers)
      : initialSuppliers;
  });

  useEffect(() => {
    localStorage.setItem(
      "enat-milk-shop-suppliers",
      JSON.stringify(suppliers)
    );
  }, [suppliers]);

  const addSupplier = (supplier: Supplier) => {
    setSuppliers((currentSuppliers) => [
      ...currentSuppliers,
      supplier,
    ]);
  };

  const updateSupplier = (updatedSupplier: Supplier) => {
    setSuppliers((currentSuppliers) =>
      currentSuppliers.map((supplier) =>
        supplier.id === updatedSupplier.id
          ? updatedSupplier
          : supplier
      )
    );
  };

  const toggleSupplierStatus = (supplierId: number) => {
    setSuppliers((currentSuppliers) =>
      currentSuppliers.map((supplier) =>
        supplier.id === supplierId
          ? {
              ...supplier,
              status:
                supplier.status === "active"
                  ? "inactive"
                  : "active",
            }
          : supplier
      )
    );
  };

  return (
    <SupplierContext.Provider
      value={{
        suppliers,
        addSupplier,
        updateSupplier,
        toggleSupplierStatus,
      }}
    >
      {children}
    </SupplierContext.Provider>
  );
}

export function useSuppliers() {
  const context = useContext(SupplierContext);

  if (!context) {
    throw new Error(
      "useSuppliers must be used inside SupplierProvider"
    );
  }

  return context;
}