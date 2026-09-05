import {
  createContext,
  useContext,
  useMemo,
} from "react";

import { useProducts } from "./ProductContext";
import { useMilkReceipts } from "./MilkReceiptContext";
import { useStockReceipts } from "./StockReceiptContext";
import { useProduction } from "./ProductionContext";
import { useSales } from "./SalesContext";

export interface InventoryRow {
  key: string;

  productId: number;
  typeId: number;
  variantId?: number;

  productName: string;
  typeName: string;
  variantName?: string;

  entryMethod: "received" | "produced";

  received: number;
  produced: number;
  consumed: number;
  sold: number;
  current: number;
}

interface InventoryContextType {
  inventory: InventoryRow[];
}

const InventoryContext =
  createContext<InventoryContextType | undefined>(
    undefined
  );

export function InventoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { products } = useProducts();

  const { receipts: milkReceipts } =
    useMilkReceipts();

  const { receipts: stockReceipts } =
    useStockReceipts();

  const { productionRecords } =
    useProduction();

  const { sales } = useSales();

  const inventory = useMemo<InventoryRow[]>(() => {
    const rows: InventoryRow[] = [];

    products
      .filter((product) => product.status === "active")
      .forEach((product) => {
        product.types
          .filter((type) => type.status === "active")
          .forEach((type) => {
            const activeVariants =
              type.variants?.filter(
                (variant) => variant.status === "active"
              ) ?? [];

            if (activeVariants.length === 0) {
              rows.push({
                key: `${product.id}-${type.id}-none`,
                productId: product.id,
                typeId: type.id,

                productName: product.name,
                typeName: type.name,

                entryMethod: type.entryMethod,

                received: 0,
                produced: 0,
                consumed: 0,
                sold: 0,
                current: 0,
              });

              return;
            }

              activeVariants.forEach((variant) => {
                rows.push({
                  key: `${product.id}-${type.id}-${variant.id}`,

                  productId: product.id,
                  typeId: type.id,
                  variantId: variant.id,

                  productName: product.name,
                  typeName: type.name,
                  variantName: variant.name,

                  entryMethod: type.entryMethod,

                  received: 0,
                  produced: 0,
                  consumed: 0,
                  sold: 0,
                  current: 0,
                });
              });
            });
        });

    return rows.map((row) => {

      let received = 0;
      let produced = 0;
      let consumed = 0;
      let sold = 0;

      // Find the product so we can read its product-level stock tracking method.
      const product = products.find(
        (product) => product.id === row.productId
      );
      
      // RECEIVED STOCK
      const isHomemadeMilk =
        row.productId === 1 &&
        row.typeId === 1 &&
        row.entryMethod === "received";

      if (isHomemadeMilk) {
        received = milkReceipts.reduce(
          (total, receipt) =>
            total + receipt.quantity,
          0
        );
      }

      // GENERAL RECEIVED STOCK
      if (
        row.entryMethod === "received" &&
        !isHomemadeMilk
      ) {
        received = stockReceipts
          .filter(
            (receipt) =>
              receipt.productId === row.productId &&
              receipt.typeId === row.typeId &&
              receipt.variantId === row.variantId
          )
          .reduce(
            (total, receipt) =>
              total + receipt.quantity,
            0
          );
      }

      // PRODUCTION OUTPUT
      if (row.entryMethod === "produced") {
        produced = productionRecords
          .filter(
            (record) =>
              record.outputProductId === row.productId &&
              record.outputTypeId === row.typeId &&
              record.outputVariantId === row.variantId
          )
          .reduce(
            (total, record) =>
              total + record.outputQuantity,
            0
          );
      }

      // PRODUCTION CONSUMPTION
      consumed = productionRecords.reduce(
        (total, record) => {
          const consumedByRecord =
            record.inputs
              .filter(
                (input) =>
                  input.productId === row.productId &&
                  input.typeId === row.typeId &&
                  input.variantId === row.variantId
              )
              .reduce(
                (inputTotal, input) =>
                  inputTotal + input.quantity,
                0
              );

          return total + consumedByRecord;
        },
        0
      );

      // SALES
      if (
        product?.stockTrackingMethod ===
        "count-sold"
      ) {
        sold = sales.reduce(
          (total, sale) => {
            const soldBySale = sale.items
              .filter(
                (item) =>
                  item.productId === row.productId &&
                  item.typeId === row.typeId &&
                  item.variantId === row.variantId
              )
              .reduce(
                (itemTotal, item) =>
                  itemTotal + item.quantity,
                0
              );

            return total + soldBySale;
          },
          0
        );
      }

      // CURRENT STOCK
      const current =
        received +
        produced -
        consumed -
        sold;

      return {
        ...row,
        received,
        produced,
        consumed,
        sold,
        current,
      };
    });
  }, [
    products,
    milkReceipts,
    stockReceipts,
    productionRecords,
    sales,
  ]);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);

  if (!context) {
    throw new Error(
      "useInventory must be used inside InventoryProvider"
    );
  }

  return context;
}