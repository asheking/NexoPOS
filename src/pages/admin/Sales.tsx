import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  InputNumber,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import { useProducts } from "../../context/ProductContext";
import { useSales } from "../../context/SalesContext";
import { useInventory } from "../../context/InventoryContext";

import type { SaleItem } from "../../data/sales";

const { Title, Text } = Typography;

interface CurrentSaleItem extends SaleItem {
  key: string;
  productName: string;
  typeName?: string;
  variantName?: string;
}

function Sales() {
  const { products } = useProducts();
  const { addSale } = useSales();
  const { inventory } = useInventory();

  const [selectedProductId, setSelectedProductId] =
    useState<number | undefined>();

  const [selectedTypeId, setSelectedTypeId] =
    useState<number | undefined>();

  const [selectedVariantId, setSelectedVariantId] =
    useState<number | undefined>();

  const [quantity, setQuantity] = useState<number>(1);

  const [currentSale, setCurrentSale] = useState<
    CurrentSaleItem[]
  >([]);

  const [messageApi, contextHolder] = message.useMessage();

  /*
   * Only count-sold products with available
   * stock should appear in Sales.
   */
  const sellableProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.status !== "active") {
        return false;
      }

      if (
        product.stockTrackingMethod !==
        "count-sold"
      ) {
        return false;
      }

      /*
      * A product is sellable only when it has
      * at least one active, fully configured variant
      * with a valid price and available stock.
      */
      return product.types.some((type) => {
        if (type.status !== "active") {
          return false;
        }

        return type.variants.some((variant) => {
          if (variant.status !== "active") {
            return false;
          }

          if (variant.price <= 0) {
            return false;
          }

          return inventory.some(
            (row) =>
              row.productId === product.id &&
              row.typeId === type.id &&
              row.variantId === variant.id &&
              row.current > 0
          );
        });
      });
    });
  }, [products, inventory]);

  /*
   * Types belonging to the selected product
   * that are active and have stock.
   */
  const availableTypes = useMemo(() => {
    const product = sellableProducts.find(
      (product) =>
        product.id === selectedProductId
    );

    if (!product) {
      return [];
    }

    return product.types.filter((type) => {
      if (type.status !== "active") {
        return false;
      }

      return type.variants.some((variant) => {
        if (variant.status !== "active") {
          return false;
        }

        if (variant.price <= 0) {
          return false;
        }

        return inventory.some(
          (row) =>
            row.productId === product.id &&
            row.typeId === type.id &&
            row.variantId === variant.id &&
            row.current > 0
        );
      });
    });
  }, [
    sellableProducts,
    selectedProductId,
    inventory,
  ]);

  // Variants belonging to the selected type that are active and have stock.
  const availableVariants = useMemo(() => {
    const type = availableTypes.find(
      (type) => type.id === selectedTypeId
    );

    if (!type) {
      return [];
    }

    return type.variants.filter((variant) => {
      if (
        variant.status !== "active" ||
        variant.price <= 0
      ) {
        return false;
      }

      return inventory.some(
        (row) =>
          row.productId === selectedProductId &&
          row.typeId === selectedTypeId &&
          row.variantId === variant.id &&
          row.current > 0
      );
    });
  }, [
    availableTypes,
    selectedProductId,
    selectedTypeId,
    inventory,
  ]);

  const selectedProduct = useMemo(() => {
    return sellableProducts.find(
      (product) =>
        product.id === selectedProductId
    );
  }, [sellableProducts, selectedProductId]);

  const selectedType = useMemo(() => {
    return availableTypes.find(
      (type) => type.id === selectedTypeId
    );
  }, [availableTypes, selectedTypeId]);

  const selectedVariant = useMemo(() => {
    return availableVariants.find(
      (variant) =>
        variant.id === selectedVariantId
    );
  }, [availableVariants, selectedVariantId]);

  /*
   * Find the exact inventory row for the
   * selected product/type/variant.
   *
   * We use all three IDs so duplicate type IDs
   * across different products cannot cause a
   * stock lookup collision.
   */
  const selectedInventoryRow = useMemo(() => {
    if (
      !selectedProductId ||
      !selectedTypeId ||
      !selectedVariantId
    ) {
      return undefined;
    }

    return inventory.find(
      (row) =>
        row.productId === selectedProductId &&
        row.typeId === selectedTypeId &&
        row.variantId === selectedVariantId
    );
  }, [
    inventory,
    selectedProductId,
    selectedTypeId,
    selectedVariantId,
  ]);

  const availableStock =
    selectedInventoryRow?.current ?? 0;

  const currentPrice =
    selectedVariant?.price ?? 0;

  /*
   * Check how much of the selected item is
   * already sitting in the current sale cart.
   */
  const quantityAlreadyInCart = useMemo(() => {
    return currentSale
      .filter(
        (item) =>
          item.productId === selectedProductId &&
          item.typeId === selectedTypeId &&
          item.variantId === selectedVariantId
      )
      .reduce(
        (total, item) =>
          total + item.quantity,
        0
      );
  }, [
    currentSale,
    selectedProductId,
    selectedTypeId,
    selectedVariantId,
  ]);

  const remainingAvailableStock =
    Math.max(
      availableStock - quantityAlreadyInCart,
      0
    );

  const handleAddToSale = () => {
    if (!selectedProduct) {
      messageApi.warning(
        "Please select a product."
      );
      return;
    }

    if (!selectedType) {
      messageApi.warning(
        "Please select a type."
      );
      return;
    }

    if (!selectedVariant) {
      messageApi.warning(
        "Please select a variant."
      );
      return;
    }

    if (!quantity || quantity <= 0) {
      messageApi.warning(
        "Quantity must be greater than 0."
      );
      return;
    }

    if (availableStock <= 0) {
      messageApi.error(
        "This item is out of stock."
      );
      return;
    }

    if (
      quantity > remainingAvailableStock
    ) {
      messageApi.error(
        `Only ${remainingAvailableStock} available in stock.`
      );
      return;
    }

    const total =
      quantity * selectedVariant.price;

    const newItem: CurrentSaleItem = {
      key: `${selectedProduct.id}-${selectedType.id}-${selectedVariant.id}-${Date.now()}`,
      productId: selectedProduct.id,
      typeId: selectedType.id,
      variantId: selectedVariant.id,
      quantity,
      unitPrice: selectedVariant.price,
      total,
      productName: selectedProduct.name,
      typeName: selectedType.name,
      variantName: selectedVariant.name,
    };

    setCurrentSale((items) => [
      ...items,
      newItem,
    ]);

    setQuantity(1);
    setSelectedVariantId(undefined);
  };

  const handleRemoveItem = (key: string) => {
    setCurrentSale((items) =>
      items.filter(
        (item) => item.key !== key
      )
    );
  };

  const saleTotal = useMemo(() => {
    return currentSale.reduce(
      (total, item) =>
        total + item.total,
      0
    );
  }, [currentSale]);

  const handleCompleteSale = () => {
    if (currentSale.length === 0) {
      messageApi.warning(
        "Add at least one item to the sale."
      );
      return;
    }

    /*
     * Re-check stock before completing the sale.
     *
     * This protects against the inventory changing
     * after the item was added to the cart.
     */
    for (const item of currentSale) {
      const row = inventory.find(
        (inventoryRow) =>
          inventoryRow.productId ===
            item.productId &&
          inventoryRow.typeId ===
            item.typeId &&
          inventoryRow.variantId ===
            item.variantId
      );

      const available =
        row?.current ?? 0;

      if (item.quantity > available) {
        messageApi.error(
          `${item.productName} ${item.variantName ?? ""} no longer has enough stock.`
        );
        return;
      }
    }

    addSale({
      id: Date.now(),
      items: currentSale.map(
        ({
          key,
          productName,
          typeName,
          variantName,
          ...saleItem
        }) => saleItem
      ),
      totalAmount: saleTotal,
      date: new Date().toISOString(),
      recordedBy: 1,
      recordedByRole: "superadmin",
    });

    setCurrentSale([]);

    setSelectedProductId(undefined);
    setSelectedTypeId(undefined);
    setSelectedVariantId(undefined);
    setQuantity(1);

    messageApi.success(
      "Sale completed successfully."
    );
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "productName",
      key: "product",
    },
    {
      title: "Type",
      dataIndex: "typeName",
      key: "type",
    },
    {
      title: "Variant",
      dataIndex: "variantName",
      key: "variant",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number) =>
        `${price.toLocaleString()} ETB`,
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total: number) => (
        <Text strong>
          {total.toLocaleString()} ETB
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (
        _: unknown,
        record: CurrentSaleItem
      ) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() =>
            handleRemoveItem(record.key)
          }
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      <Space
        direction="vertical"
        size={24}
        style={{ width: "100%" }}
      >
        <div>
          <Title
            level={2}
            style={{ marginBottom: 4 }}
          >
            Sales
          </Title>

          <Text type="secondary">
            Create a sale and record the
            products sold.
          </Text>
        </div>

        <Card title="Add Product to Sale">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Text strong>
                Product
              </Text>

              <Select
                style={{
                  width: "100%",
                  marginTop: 8,
                }}
                placeholder="Select product"
                value={selectedProductId}
                onChange={(value) => {
                  setSelectedProductId(
                    value
                  );
                  setSelectedTypeId(
                    undefined
                  );
                  setSelectedVariantId(
                    undefined
                  );
                }}
                options={sellableProducts.map(
                  (product) => ({
                    value: product.id,
                    label: product.name,
                  })
                )}
              />
            </Col>

            <Col xs={24} md={6}>
              <Text strong>
                Type
              </Text>

              <Select
                style={{
                  width: "100%",
                  marginTop: 8,
                }}
                placeholder="Select type"
                value={selectedTypeId}
                disabled={
                  !selectedProductId
                }
                onChange={(value) => {
                  setSelectedTypeId(
                    value
                  );
                  setSelectedVariantId(
                    undefined
                  );
                }}
                options={availableTypes.map(
                  (type) => ({
                    value: type.id,
                    label: type.name,
                  })
                )}
              />
            </Col>

            <Col xs={24} md={6}>
              <Text strong>
                Variant
              </Text>

              <Select
                style={{
                  width: "100%",
                  marginTop: 8,
                }}
                placeholder="Select variant"
                value={selectedVariantId}
                disabled={
                  !selectedTypeId
                }
                onChange={
                  setSelectedVariantId
                }
                options={availableVariants.map(
                  (variant) => ({
                    value: variant.id,
                    label: variant.name,
                  })
                )}
              />
            </Col>

            <Col xs={24} md={4}>
              <Text strong>
                Quantity
              </Text>

              <InputNumber
                style={{
                  width: "100%",
                  marginTop: 8,
                }}
                min={1}
                max={
                  remainingAvailableStock ||
                  undefined
                }
                value={quantity}
                onChange={(value) =>
                  setQuantity(
                    value ?? 1
                  )
                }
              />
            </Col>
          </Row>

          <Divider />

          <Row
            justify="space-between"
            align="middle"
            gutter={[16, 16]}
          >
            <Col>
              {selectedVariant && (
                <Space>
                  <Text>
                    Price:
                  </Text>

                  <Tag color="green">
                    {currentPrice.toLocaleString()}{" "}
                    ETB
                  </Tag>

                  <Text>
                    Available:
                  </Text>

                  <Tag>
                    {
                      remainingAvailableStock
                    }
                  </Tag>
                </Space>
              )}
            </Col>

            <Col>
              <Button
                type="primary"
                icon={
                  <ShoppingCartOutlined />
                }
                onClick={
                  handleAddToSale
                }
              >
                Add to Sale
              </Button>
            </Col>
          </Row>
        </Card>

        <Card title="Current Sale">
          <Table
            rowKey="key"
            columns={columns}
            dataSource={currentSale}
            pagination={false}
            locale={{
              emptyText:
                "No products added to this sale yet.",
            }}
          />

          <Divider />

          <Row
            justify="end"
            align="middle"
            gutter={24}
          >
            <Col>
              <Text
                strong
                style={{
                  fontSize: 18,
                }}
              >
                Total:
              </Text>
            </Col>

            <Col>
              <Text
                strong
                style={{
                  fontSize: 22,
                  color: "#3F5F48",
                }}
              >
                {saleTotal.toLocaleString()}{" "}
                ETB
              </Text>
            </Col>

            <Col>
              <Button
                type="primary"
                size="large"
                disabled={
                  currentSale.length === 0
                }
                onClick={
                  handleCompleteSale
                }
              >
                Complete Sale
              </Button>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
}

export default Sales;