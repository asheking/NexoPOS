import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  initialSupplierContracts,
  type SupplierMilkContract,
} from "../data/milkSupplies";

interface SupplierContractContextType {
  contracts: SupplierMilkContract[];

  addContract: (contract: SupplierMilkContract) => void;
  updateContract: (contract: SupplierMilkContract) => void;
}

const SupplierContractContext =
  createContext<SupplierContractContextType | undefined>(
    undefined
  );

export function SupplierContractProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contracts, setContracts] = useState<
    SupplierMilkContract[]
  >(() => {
    const stored = localStorage.getItem(
      "enat-milk-shop-supplier-contracts"
    );

    return stored
      ? JSON.parse(stored)
      : initialSupplierContracts;
  });

  useEffect(() => {
    localStorage.setItem(
      "enat-milk-shop-supplier-contracts",
      JSON.stringify(contracts)
    );
  }, [contracts]);

  const addContract = (contract: SupplierMilkContract) => {
    setContracts((currentContracts) => [
      ...currentContracts,
      contract,
    ]);
  };

  const updateContract = (
    updatedContract: SupplierMilkContract
  ) => {
    setContracts((currentContracts) =>
      currentContracts.map((contract) =>
        contract.id === updatedContract.id
          ? updatedContract
          : contract
      )
    );
  };

  return (
    <SupplierContractContext.Provider
      value={{
        contracts,
        addContract,
        updateContract,
      }}
    >
      {children}
    </SupplierContractContext.Provider>
  );
}

export function useSupplierContracts() {
  const context = useContext(SupplierContractContext);

  if (!context) {
    throw new Error(
      "useSupplierContracts must be used inside SupplierContractProvider"
    );
  }

  return context;
}