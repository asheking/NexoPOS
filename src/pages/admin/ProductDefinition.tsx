import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../data/products";
import { useCategories } from "../../context/CategoryContext";
import { useProducts } from "../../context/ProductContext";

import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";

import {
  AppstoreOutlined,
  PlusOutlined,
  SearchOutlined,
  RightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function ProductDefinition() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const navigate = useNavigate();
  const [form] = Form.useForm();

  const {
    products,
    addProduct,
    toggleProductStatus,
  } = useProducts();

  const { categories } = useCategories();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      product.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddProduct = () => {
    setModalOpen(true);
  };

  const handleProductClick = (product: Product) => {
    // Inactive products are completely frozen.
    if (product.status === "inactive") return;

    navigate(`/products/${product.id}/info`);
  };

  const handleToggleProductStatus = (
    event: React.MouseEvent,
    product: Product
  ) => {
    event.stopPropagation();

    const newStatus =
      product.status === "active" ? false : true;

    Modal.confirm({
      title: newStatus
        ? "Activate product?"
        : "Deactivate product?",

      content: newStatus
        ? `Are you sure you want to activate "${product.name}"?`
        : `Are you sure you want to deactivate "${product.name}"?`,

      okText: newStatus ? "Activate" : "Deactivate",
      cancelText: "Cancel",

      onOk: () => {
        toggleProductStatus(product.id, newStatus);
      },
    });
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* PAGE HEADER */}
      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <Space align="center">
          <AppstoreOutlined
            style={{
              fontSize: "24px",
              color: "#3A86B8",
            }}
          />

          <Title
            level={3}
            style={{
              margin: 0,
              color: "#1F5E85",
            }}
          >
            Product Definition
          </Title>
        </Space>

        <Text
          style={{
            display: "block",
            marginTop: "6px",
            color: "#607D8B",
          }}
        >
          Define the products your shop sells and manage their
          configurations.
        </Text>
      </div>
      <Space
        direction="vertical"
        size="middle"
        style={{
          width: "100%",
          marginBottom: "20px",
        }}
      >
      <div
        style={{
          display: "flex",
          gap: 8,
          width: "100%",
        }}
      >
        <Input
          placeholder="Search products..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            height: 42,
          }}
        />

        <Button
          icon={<AppstoreOutlined />}
          onClick={() => navigate("/categories")}
          style={{
            height: 42,
            minWidth: 120,
          }}
        >
          Categories
        </Button>
      </div>

      {/* ADD */}
      
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          block
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
        <div
          style={{
            display: "flex",
            width: "100%",
          }}
        >
          <Button
            type={statusFilter === "all" ? "primary" : "default"}
            onClick={() => setStatusFilter("all")}
            style={{
              flex: 1,
              borderRadius: "6px 0 0 6px",
              height: "42px",
            }}
          >
            All
          </Button>

          <Button
            type={statusFilter === "active" ? "primary" : "default"}
            onClick={() => setStatusFilter("active")}
            style={{
              flex: 1,
              borderRadius: 0,
              height: "42px",
              marginLeft: "-1px",
            }}
          >
            Active
          </Button>

          <Button
            type={statusFilter === "inactive" ? "primary" : "default"}
            onClick={() => setStatusFilter("inactive")}
            style={{
              flex: 1,
              borderRadius: "0 6px 6px 0",
              height: "42px",
              marginLeft: "-1px",
            }}
          >
            Inactive
          </Button>
        </div>
      </Space>

      {/* PRODUCT LIST */}
      <Space
        direction="vertical"
        size="small"
        style={{
          width: "100%",
        }}
      >
        {filteredProducts.map((product) => {
        const isInactive =
          product.status === "inactive";

        const allVariants =
          product.types?.flatMap((type) => type.variants ?? []) ?? [];

        const totalVariants = allVariants.length;

        const activeVariants = allVariants.filter(
          (variant) => variant.status === "active"
        ).length;

          return (
            <Card
              key={product.id}
              hoverable={!isInactive}
              onClick={() =>
                handleProductClick(product)
              }
              styles={{
                body: {
                  padding: "16px",
                },
              }}
              style={{
                opacity: isInactive ? 0.6 : 1,
                cursor: isInactive
                  ? "default"
                  : "pointer",
                transition: "opacity 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                {/* PRODUCT INFO */}
                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Text
                    strong
                    style={{
                      display: "block",
                      fontSize: "16px",
                      color: isInactive
                        ? "#8C8C8C"
                        : "#263238",
                    }}
                  >
                    {product.name}
                  </Text>

                  <div
                    style={{
                      marginTop: "6px",
                    }}
                  >
                    {/* VARIANTS COUNT */}
                    <Tag>
                      {activeVariants} / {totalVariants} Active Variants
                    </Tag>
                  </div>
                </div>

                {/* ACTIONS */}
                <Space>
                  <Button
                    size="small"
                    type={isInactive ? "primary" : "default"}
                    danger={!isInactive}
                    onClick={(event) =>
                      handleToggleProductStatus(event, product)
                    }
                  >
                    {isInactive ? "Activate" : "Deactivate"}
                  </Button>

                  {!isInactive && (
                    <RightOutlined
                      style={{
                        color: "#607D8B",
                      }}
                    />
                  )}
                </Space>
              </div>
            </Card>
          );
        })}

        {/* EMPTY STATE */}
        {filteredProducts.length === 0 && (
          <Card>
            <Empty
              description="No products found"
              image={
                Empty.PRESENTED_IMAGE_SIMPLE
              }
            />
          </Card>
        )}
      </Space>

      {/* CREATE PRODUCT MODAL */}
      <Modal
        title={
          <span
            style={{
              color: "#1F5E85",
            }}
          >
            Create Product
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => {
            const newProduct: Product = {
              id: Date.now(),
              name: values.name,
              category: values.category,
              description: values.description,
              status: "active",
              types: [],
            };

            addProduct(newProduct);

            form.resetFields();
            setModalOpen(false);
          }}
        >
          {/* PRODUCT NAME */}
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              {
                required: true,
                message:
                  "Please enter a product name",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="e.g. Yogurt"
            />
          </Form.Item>

          {/* CATEGORY */}
          <Form.Item
            label="Category"
            name="category"
            rules={[
              {
                required: true,
                message:
                  "Please select a category",
              },
            ]}
          >
            <Select
              size="large"
              placeholder="Select a category"
              options={categories
                .filter(
                  (category) =>
                    category.status === "active"
                )
                .map((category) => ({
                  label: category.name,
                  value: category.name,
                }))}
            />
          </Form.Item>

          {/* DESCRIPTION */}
          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Optional description"
            />
          </Form.Item>

          {/* ACTIONS */}
          <Space
            style={{
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
            >
              Create Product
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

export default ProductDefinition;