import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import type { Category } from "../../data/categories";
import { useCategories } from "../../context/CategoryContext";
import { useProducts } from "../../context/ProductContext";

const { Title, Text } = Typography;

function CategoryManagement() {
    const navigate = useNavigate();

  const {
    categories,
    addCategory,
    updateCategory,
  } = useCategories();

  const { products } = useProducts();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [form] = Form.useForm();

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredProducts = selectedCategory
    ? products.filter(
        (product) =>
            product.category === selectedCategory.name
        )
    : [];

  const openAddModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);

    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });

    setModalOpen(true);
  };

    const handleSubmit = (values: {
      name: string;
      description?: string;
    }) => {
    if (editingCategory) {
        updateCategory({
        ...editingCategory,
        name: values.name,
        description: values.description,
        });
    } else {
        const newCategory: Category = {
        id: Date.now(),
        name: values.name,
        description: values.description,
        status: "active",
      };

      addCategory(newCategory);
    }

    form.resetFields();
    setEditingCategory(null);
    setModalOpen(false);
    };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "16px",
      }}
    >
      {/* Back */}
        <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/products")}
        style={{
            paddingLeft: 0,
            marginBottom: 12,
        }}
        >
        Product Definition
        </Button>

        {/* Header */}
        <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            gap: 12,
        }}
        >
        <div>
            <Title level={3} style={{ margin: 0 }}>
            Categories
            </Title>

            <Text type="secondary">
            Manage product categories
            </Text>
        </div>

        <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAddModal}
        >
            Add
        </Button>
        </div>

      {/* Search */}
      <Input
        size="large"
        prefix={<SearchOutlined />}
        placeholder="Search categories..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        style={{ marginBottom: 20 }}
      />

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <Empty description="No categories found" />
      ) : (
        <Space
          direction="vertical"
          size={12}
          style={{ width: "100%" }}
        >
          {filteredCategories.map((category) => {
            const isSelected =
                selectedCategory?.id === category.id;

            return (
                <Card
                key={category.id}
                size="small"
                onClick={() => setSelectedCategory(category)}
                style={{
                    borderRadius: 12,
                    cursor: "pointer",
                    border: isSelected
                    ? "2px solid #1F5E85"
                    : "1px solid #DCE8EE",
                    background: isSelected
                    ? "#F0F7FA"
                    : "#FFFFFF",
                }}
                >
                <div
                    style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    }}
                >
                    <div style={{ flex: 1 }}>
                    <div
                        style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        }}
                    >
                        <Text strong>
                        {category.name}
                        </Text>

                        <Tag
                        color={
                            category.status === "active"
                            ? "green"
                            : "default"
                        }
                        >
                        {category.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </Tag>
                    </div>

                    {category.description && (
                        <Text type="secondary">
                        {category.description}
                        </Text>
                    )}
                    </div>

                    <Space
                    onClick={(event) =>
                        event.stopPropagation()
                    }
                    >

                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() =>
                        openEditModal(category)
                        }
                    />
                    </Space>
                </div>
                </Card>
            );
            })}
        {selectedCategory && (
        <div style={{ marginTop: 28 }}>
            <Title
            level={4}
            style={{ marginBottom: 4 }}
            >
            Products in {selectedCategory.name}
            </Title>

            <Text type="secondary">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
                ? "product"
                : "products"}
            </Text>

            <div style={{ marginTop: 12 }}>
            {filteredProducts.length === 0 ? (
                <Empty
                description={`No products in ${selectedCategory.name}`}
                />
            ) : (
                <Space
                direction="vertical"
                size={12}
                style={{ width: "100%" }}
                >
                {filteredProducts.map((product) => {
                    const variantCount =
                    product.types?.reduce(
                        (total, type) =>
                        total +
                        (type.variants?.length ?? 0),
                        0
                    ) ?? 0;

                    return (
                    <Card
                        key={product.id}
                        size="small"
                        hoverable
                        onClick={() =>
                        navigate(
                            `/products/${product.id}/info`
                        )
                        }
                        style={{
                        borderRadius: 12,
                        cursor: "pointer",
                        opacity:
                            product.status === "inactive"
                            ? 0.55
                            : 1,
                        }}
                    >
                        <div
                        style={{
                            display: "flex",
                            justifyContent:
                            "space-between",
                            alignItems: "center",
                            gap: 12,
                        }}
                        >
                        <div>
                            <Text strong>
                            {product.name}
                            </Text>

                            <div
                            style={{
                                marginTop: 6,
                                display: "flex",
                                gap: 8,
                            }}
                            >
                            <Tag>
                                {product.types?.length ?? 0}{" "}
                                {product.types?.length === 1
                                ? "Type"
                                : "Types"}
                            </Tag>

                            <Tag color="blue">
                                {variantCount}{" "}
                                {variantCount === 1
                                ? "Variant"
                                : "Variants"}
                            </Tag>
                            </div>
                        </div>

                        <Text
                            type="secondary"
                            style={{ fontSize: 20 }}
                        >
                            ›
                        </Text>
                        </div>
                    </Card>
                    );
                })}
                </Space>
            )}
            </div>
        </div>
        )}
        </Space>
      )}

      {/* Add / Edit Modal */}
      <Modal
        title={
          editingCategory
            ? "Edit Category"
            : "Create Category"
        }
        open={modalOpen}
        onCancel={() => {
          form.resetFields();
          setEditingCategory(null);
          setModalOpen(false);
        }}
        footer={null}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter a category name",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="e.g. Dairy"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Optional description"
            />
          </Form.Item>

          <Space
            style={{
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => {
                form.resetFields();
                setEditingCategory(null);
                setModalOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
            >
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}

export default CategoryManagement;