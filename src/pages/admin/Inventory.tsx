import { useMemo, useState } from "react";
import {
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AppstoreOutlined,
  InboxOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import { useInventory } from "../../context/InventoryContext";

const { Title, Text } = Typography;

type InventoryTableRow = {
  key: string;

  productName: string;
  typeName?: string;
  variantName?: string;

  entryMethod?: "received" | "produced";

  received: number;
  produced: number;
  consumed: number;
  current: number;

  children?: InventoryTableRow[];
};

function Inventory() {
  const { inventory } = useInventory();

  const [search, setSearch] = useState("");
  const [entryMethodFilter, setEntryMethodFilter] = useState<
    "all" | "received" | "produced"
  >("all");

  /*
   * Filter the actual inventory rows first.
   */
  const filteredInventory = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.productName.toLowerCase().includes(searchValue) ||
        item.typeName.toLowerCase().includes(searchValue) ||
        item.variantName?.toLowerCase().includes(searchValue);

      const matchesEntryMethod =
        entryMethodFilter === "all" ||
        item.entryMethod === entryMethodFilter;

      return matchesSearch && matchesEntryMethod;
    });
  }, [inventory, search, entryMethodFilter]);

  /*
   * Convert the flat inventory rows into a tree:
   *
   * Product
   *   └── Type
   *        └── Variant
   */
  const tableData = useMemo<InventoryTableRow[]>(() => {
    const productMap = new Map<
      number,
      {
        productName: string;
        types: Map<
          number,
          {
            typeName: string;
            entryMethod: "received" | "produced";
            items: (typeof filteredInventory)[number][];
          }
        >;
      }
    >();

    filteredInventory.forEach((item) => {
      if (!productMap.has(item.productId)) {
        productMap.set(item.productId, {
          productName: item.productName,
          types: new Map(),
        });
      }

      const product = productMap.get(item.productId)!;

      if (!product.types.has(item.typeId)) {
        product.types.set(item.typeId, {
          typeName: item.typeName,
          entryMethod: item.entryMethod,
          items: [],
        });
      }

      product.types.get(item.typeId)!.items.push(item);
    });

    return Array.from(productMap.entries()).map(
      ([productId, product]) => {
        const typeRows: InventoryTableRow[] = [];

        product.types.forEach((type, typeId) => {
          const hasVariants = type.items.some(
            (item) => item.variantId !== undefined
          );

          /*
           * Type has variants.
           */
          if (hasVariants) {
            const variantRows: InventoryTableRow[] =
              type.items.map((item) => ({
                key: `variant-${item.key}`,
                productName: "",
                typeName: "",
                variantName: item.variantName,
                entryMethod: item.entryMethod,
                received: item.received,
                produced: item.produced,
                consumed: item.consumed,
                current: item.current,
              }));

            typeRows.push({
              key: `type-${productId}-${typeId}`,
              productName: "",
              typeName: type.typeName,
              entryMethod: type.entryMethod,
              received: variantRows.reduce(
                (sum, row) => sum + row.received,
                0
              ),
              produced: variantRows.reduce(
                (sum, row) => sum + row.produced,
                0
              ),
              consumed: variantRows.reduce(
                (sum, row) => sum + row.consumed,
                0
              ),
              current: variantRows.reduce(
                (sum, row) => sum + row.current,
                0
              ),
              children: variantRows,
            });

            return;
          }

          /*
           * Type has no variants.
           * The type itself is the inventory item.
           */
          const item = type.items[0];

          typeRows.push({
            key: `type-${productId}-${typeId}`,
            productName: "",
            typeName: type.typeName,
            entryMethod: type.entryMethod,
            received: item.received,
            produced: item.produced,
            consumed: item.consumed,
            current: item.current,
          });
        });

        /*
         * Product totals are calculated from its types.
         */
        return {
          key: `product-${productId}`,
          productName: product.productName,
          received: typeRows.reduce(
            (sum, row) => sum + row.received,
            0
          ),
          produced: typeRows.reduce(
            (sum, row) => sum + row.produced,
            0
          ),
          consumed: typeRows.reduce(
            (sum, row) => sum + row.consumed,
            0
          ),
          current: typeRows.reduce(
            (sum, row) => sum + row.current,
            0
          ),
          children: typeRows,
        };
      }
    );
  }, [filteredInventory]);

  /*
   * Summary values.
   */
  const totalCurrentStock = useMemo(
    () =>
      inventory.reduce(
        (total, item) => total + Math.max(0, item.current),
        0
      ),
    [inventory]
  );

  const totalReceived = useMemo(
    () =>
      inventory.reduce(
        (total, item) => total + item.received,
        0
      ),
    [inventory]
  );

  const totalProduced = useMemo(
    () =>
      inventory.reduce(
        (total, item) => total + item.produced,
        0
      ),
    [inventory]
  );

  const lowStockItems = useMemo(
    () =>
      inventory.filter(
        (item) => item.current > 0 && item.current <= 10
      ).length,
    [inventory]
  );

  const columns: ColumnsType<InventoryTableRow> = [
    {
      title: "Product / Type / Variant",
      key: "name",
      width: 300,
      render: (_, record) => {
        if (record.productName) {
          return (
            <Text strong style={{ fontSize: 15 }}>
              {record.productName}
            </Text>
          );
        }

        if (record.typeName) {
          return (
            <Text strong>
              {record.typeName}
            </Text>
          );
        }

        return (
          <Text type="secondary">
            {record.variantName}
          </Text>
        );
      },
    },

    {
      title: "Entry",
      dataIndex: "entryMethod",
      key: "entryMethod",
      width: 130,
      render: (value) => {
        if (!value) {
          return "—";
        }

        return value === "received" ? (
          <Tag>Received</Tag>
        ) : (
          <Tag color="blue">Produced</Tag>
        );
      },
    },

    {
      title: "Received",
      dataIndex: "received",
      key: "received",
      align: "right",
      width: 130,
      render: (value: number) =>
        value.toLocaleString(),
    },

    {
      title: "Produced",
      dataIndex: "produced",
      key: "produced",
      align: "right",
      width: 130,
      render: (value: number) =>
        value.toLocaleString(),
    },

    {
      title: "Consumed",
      dataIndex: "consumed",
      key: "consumed",
      align: "right",
      width: 130,
      render: (value: number) =>
        value.toLocaleString(),
    },

    {
      title: "Current Stock",
      dataIndex: "current",
      key: "current",
      align: "right",
      width: 160,
      sorter: (a, b) => a.current - b.current,
      render: (value: number) => {
        const stock = Math.max(0, value);

        if (stock === 0) {
          return (
            <Tag color="red">
              Out of stock
            </Tag>
          );
        }

        if (stock <= 10) {
          return (
            <Tag color="orange">
              {stock.toLocaleString()} Low
            </Tag>
          );
        }

        return (
          <Text strong>
            {stock.toLocaleString()}
          </Text>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space
        direction="vertical"
        size={24}
        style={{ width: "100%" }}
      >
        {/* Page header */}
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            Inventory
          </Title>

          <Text type="secondary">
            View and monitor stock across all products,
            types, and variants.
          </Text>
        </div>

        {/* Summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Current Stock"
                value={totalCurrentStock}
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Total Received"
                value={totalReceived}
                prefix={<InboxOutlined />}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Total Produced"
                value={totalProduced}
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Low stock warning */}
        {lowStockItems > 0 && (
          <Card>
            <Space>
              <WarningOutlined />

              <Text>
                <strong>{lowStockItems}</strong>{" "}
                inventory item
                {lowStockItems !== 1 ? "s are" : " is"}{" "}
                running low.
              </Text>
            </Space>
          </Card>
        )}

        {/* Inventory table */}
        <Card>
          <Space
            wrap
            size="middle"
            style={{
              width: "100%",
              marginBottom: 20,
            }}
          >
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search product, type or variant"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              style={{ width: 300 }}
            />

            <Select
              value={entryMethodFilter}
              onChange={setEntryMethodFilter}
              style={{ width: 180 }}
              options={[
                {
                  label: "All entry methods",
                  value: "all",
                },
                {
                  label: "Received",
                  value: "received",
                },
                {
                  label: "Produced",
                  value: "produced",
                },
              ]}
            />
          </Space>

          <Table
            rowKey="key"
            columns={columns}
            dataSource={tableData}
            pagination={false}
            expandable={{
              defaultExpandAllRows: false,
            }}
            scroll={{ x: 900 }}
          />
        </Card>
      </Space>
    </div>
  );
}

export default Inventory;