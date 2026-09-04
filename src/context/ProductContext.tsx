import { createContext, useContext, useEffect, useState } from "react";
import {
  initialProducts,
  type Product,
  type ProductVariant,
} from "../data/products";

interface ProductContextType {
  products: Product[];

  addProduct: (product: Product) => void;

  updateProduct: (product: Product) => void;

  updateProductTypes: (
    productId: number,
    types: Product["types"]
  ) => void;

  updateProductTypeFeatures: (
    productId: number,
    typeId: number,
    features: Product["types"][number]["features"]
  ) => void;

  updateProductTypeVariants: (
    productId: number,
    typeId: number,
    variants: ProductVariant[]
  ) => void;

  updateProductVariant: (
    productId: number,
    typeId: number,
    variant: ProductVariant
  ) => void;

  deleteProductVariant: (
    productId: number,
    typeId: number,
    variantId: number
  ) => void;

  toggleProductVariantStatus: (
    productId: number,
    typeId: number,
    variantId: number,
    active: boolean
  ) => void;

  toggleProductStatus: (
    productId: number,
    active: boolean
  ) => void;

  toggleProductTypeStatus: (
    productId: number,
    typeId: number,
    active: boolean
  ) => void;

  isProductFrozen: (
    productId: number
  ) => boolean;

  isProductTypeFrozen: (
    productId: number,
    typeId: number
  ) => boolean;

  isProductVariantFrozen: (
    productId: number,
    typeId: number,
    variantId: number
  ) => boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(
  undefined
);

const STORAGE_KEY = "enat-milk-shop-products";

export function ProductProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts =
      localStorage.getItem(STORAGE_KEY);

    if (savedProducts) {
      const parsedProducts: Product[] =
        JSON.parse(savedProducts);

      // Make sure older saved data has the required fields
      return parsedProducts.map((product) => ({
        ...product,

        types: (product.types || []).map((type) => ({
          ...type,
          features: type.features || [],
          variants: type.variants || [],
        })),
      }));
    }

    return initialProducts;
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(products)
    );
  }, [products]);

  // PRODUCT
  const addProduct = (product: Product) => {
    setProducts((current) => [
      product,
      ...current,
    ]);
  };

  const updateProduct = (
    updatedProduct: Product
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === updatedProduct.id
          ? updatedProduct
          : product
      )
    );
  };

  // TYPES
  const updateProductTypes = (
    productId: number,
    types: Product["types"]
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              types,
            }
          : product
      )
    );
  };

  // FEATURES
  const updateProductTypeFeatures = (
    productId: number,
    typeId: number,
    features: Product["types"][number]["features"]
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,

              types: product.types.map((type) =>
                type.id === typeId
                  ? {
                      ...type,
                      features,
                    }
                  : type
              ),
            }
          : product
      )
    );
  };

  // VARIANTS
  const updateProductTypeVariants = (
    productId: number,
    typeId: number,
    variants: ProductVariant[]
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,

              types: product.types.map((type) =>
                type.id === typeId
                  ? {
                      ...type,
                      variants,
                    }
                  : type
              ),
            }
          : product
      )
    );
  };

  const updateProductVariant = (
    productId: number,
    typeId: number,
    updatedVariant: ProductVariant
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,

              types: product.types.map((type) =>
                type.id === typeId
                  ? {
                      ...type,

                      variants: (
                        type.variants || []
                      ).map((variant) =>
                        variant.id ===
                        updatedVariant.id
                          ? updatedVariant
                          : variant
                      ),
                    }
                  : type
              ),
            }
          : product
      )
    );
  };

  const deleteProductVariant = (
    productId: number,
    typeId: number,
    variantId: number
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,

              types: product.types.map((type) =>
                type.id === typeId
                  ? {
                      ...type,

                      variants: (
                        type.variants || []
                      ).filter(
                        (variant) =>
                          variant.id !== variantId
                      ),
                    }
                  : type
              ),
            }
          : product
      )
    );
  };

  // VARIANT STATUS
  const toggleProductVariantStatus = (
    productId: number,
    typeId: number,
    variantId: number,
    active: boolean
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,

              types: product.types.map((type) =>
                type.id === typeId
                  ? {
                      ...type,

                      variants: (
                        type.variants || []
                      ).map((variant) =>
                        variant.id === variantId
                          ? {
                              ...variant,
                              status: active
                                ? "active"
                                : "inactive",
                            }
                          : variant
                      ),
                    }
                  : type
              ),
            }
          : product
      )
    );
  };

  // PRODUCT STATUS
  const toggleProductStatus = (
    productId: number,
    active: boolean
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              status: active
                ? "active"
                : "inactive",
            }
          : product
      )
    );
  };

  // TYPE STATUS
  const toggleProductTypeStatus = (
    productId: number,
    typeId: number,
    active: boolean
  ) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,

              types: product.types.map((type) =>
                type.id === typeId
                  ? {
                      ...type,
                      status: active
                        ? "active"
                        : "inactive",
                    }
                  : type
              ),
            }
          : product
      )
    );
  };

  // FREEZE LOGIC
  const isProductFrozen = (
    productId: number
  ) => {
    const product = products.find(
      (product) =>
        product.id === productId
    );

    return (
      !product ||
      product.status === "inactive"
    );
  };

  const isProductTypeFrozen = (
    productId: number,
    typeId: number
  ) => {
    const product = products.find(
      (product) =>
        product.id === productId
    );

    if (!product) {
      return true;
    }

    // Parent product is inactive
    if (product.status === "inactive") {
      return true;
    }

    const type = product.types.find(
      (type) => type.id === typeId
    );

    if (!type) {
      return true;
    }

    // Type itself is inactive
    return type.status === "inactive";
  };

  const isProductVariantFrozen = (
    productId: number,
    typeId: number,
    variantId: number
  ) => {
    const product = products.find(
      (product) =>
        product.id === productId
    );

    if (!product) {
      return true;
    }

    // Product is inactive
    if (product.status === "inactive") {
      return true;
    }

    const type = product.types.find(
      (type) => type.id === typeId
    );

    if (!type) {
      return true;
    }

    // Type is inactive
    if (type.status === "inactive") {
      return true;
    }

    const variant = (
      type.variants || []
    ).find(
      (variant) =>
        variant.id === variantId
    );

    if (!variant) {
      return true;
    }

    // Variant itself is inactive
    return variant.status === "inactive";
  };

  // PROVIDER
  return (
    <ProductContext.Provider
      value={{
        products,

        // Product
        addProduct,
        updateProduct,

        // Types
        updateProductTypes,

        // Features
        updateProductTypeFeatures,

        // Variants
        updateProductTypeVariants,
        updateProductVariant,
        deleteProductVariant,

        // Status
        toggleProductVariantStatus,
        toggleProductStatus,
        toggleProductTypeStatus,

        // Freeze
        isProductFrozen,
        isProductTypeFrozen,
        isProductVariantFrozen,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

// HOOK
export function useProducts() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error(
      "useProducts must be used inside ProductProvider"
    );
  }
  return context;
}