import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ProductType } from "../../data/products";
import { useProducts } from "../../context/ProductContext";
import { useCategories } from "../../context/CategoryContext";

import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Dropdown,
  Tag,
  Typography,
} from "antd";

import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EditOutlined,
  PlusOutlined,
  MoreOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

function ProductInformation() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const {
    products,
    updateProduct,
    updateProductTypes,
    toggleProductTypeStatus,
    isProductFrozen,
  } = useProducts();

  const { categories } = useCategories();

  const product = products.find(
    (item) => item.id === Number(productId)
  );

  const types = product?.types || [];

  const productFrozen = product ? isProductFrozen(product.id) : false;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);

  const [editTypeModalOpen, setEditTypeModalOpen] = useState(false);
  const [selectedEditTypeId, setSelectedEditTypeId] =
    useState<number | null>(null);

  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] =
    useState<number | null>(null);
  const [featureName, setFeatureName] = useState("");

  const [editForm] = Form.useForm();
  const [typeForm] = Form.useForm();
  const [editTypeForm] = Form.useForm();

  useEffect(() => {
    if (product) {
      editForm.setFieldsValue({
        name: product.name,
        category: product.category,
        stockTrackingMethod: product.stockTrackingMethod,
        description: product.description,
      });
    }
  }, [product, editForm]);

  if (!product) {
    return (
      <div style={{ padding: "16px" }}>
        <Text>Product information not found.</Text>

        <br />

        <Button
          type="link"
          onClick={() => navigate("/products")}
        >
          Back to Products
        </Button>
      </div>
    );
  }

  /* Open Edit Product modal */
  const handleEditProduct = () => {
    editForm.setFieldsValue({
      name: product.name,
      category: product.category,
      stockTrackingMethod: product.stockTrackingMethod,
      description: product.description,
    });

    setEditModalOpen(true);
  };

  /* Save edited product */
  const handleSaveProduct = (values: {
    name: string;
    category: string;
    stockTrackingMethod: "count-remaining" | "count-sold";
    description?: string;
  }) => {
    updateProduct({
      ...product,
      name: values.name,
      category: values.category,
      stockTrackingMethod: values.stockTrackingMethod,
      description: values.description,
    });

    setEditModalOpen(false);
  };

  /* Add a new product type */
  const handleAddType = (values: {
    name: string;
    entryMethod: "received" | "produced";
    features?: {
      name: string;
    }[];
  }) => {
    const newType: ProductType = {
      id: Date.now(),
      name: values.name,
      entryMethod: values.entryMethod,
      status: "active",
      features: (values.features || []).map((feature, index) => ({
        id: Date.now() + index,
        name: feature.name,
        options: [],
      })),
      variants: [],
    };

    const updatedTypes = [...types, newType];

    updateProductTypes(product.id, updatedTypes);

    typeForm.resetFields();
    setTypeModalOpen(false);
  };

  /* Open Edit Type modal */
  const handleEditType = (type: ProductType) => {
    setSelectedEditTypeId(type.id);

    editTypeForm.setFieldsValue({
      name: type.name,
      entryMethod: type.entryMethod,
    });

    setEditTypeModalOpen(true);
  };

  /* Save edited type */
  const handleSaveType = (values: {
    name: string;
    entryMethod: "received" | "produced";
  }) => {
    if (selectedEditTypeId === null) return;

    const updatedTypes = product.types.map((type) =>
      type.id === selectedEditTypeId
        ? {
            ...type,
            name: values.name,
            entryMethod: values.entryMethod,
          }
        : type
    );

    updateProductTypes(product.id, updatedTypes);

    setEditTypeModalOpen(false);
    setSelectedEditTypeId(null);
    editTypeForm.resetFields();
  };

  /* Add a feature to an existing product type */
  const handleAddFeature = () => {
    if (selectedTypeId === null) {
      return;
    }

    const trimmedName = featureName.trim();

    if (!trimmedName) {
      return;
    }

    const updatedTypes = product.types.map((type) => {
      if (type.id !== selectedTypeId) {
        return type;
      }

      return {
        ...type,
        features: [
          ...(type.features || []),
          {
            id: Date.now(),
            name: trimmedName,
            options: [],
          },
        ],
      };
    });

    updateProductTypes(product.id, updatedTypes);

    setFeatureName("");
    setSelectedTypeId(null);
    setFeatureModalOpen(false);
  };

  /* Toggle Type Status */
  const handleToggleTypeStatus = (type: ProductType) => {
    toggleProductTypeStatus(
      product.id,
      type.id,
      type.status === "inactive"
    );
  };

  return (
    <div
      style={{
        padding: "16px",
        paddingBottom: "32px",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/products")}
        >
          Back
        </Button>
      </div>

      {/* Product information */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
          }}
        >
          <div
            style={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Title
              level={3}
              style={{
                margin: 0,
              }}
            >
              {product.name}
            </Title>

            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: "4px",
              }}
            >
              {product.category}
            </Text>

            {/* Product status - display only */}
            <Tag
              color={
                product.status === "active"
                  ? "green"
                  : "default"
              }
              style={{
                marginTop: "10px",
              }}
            >
              {product.status === "active"
                ? "Active"
                : "Inactive"}
            </Tag>

            {product.description && (
              <div style={{ marginTop: "12px" }}>
                <Text>{product.description}</Text>
              </div>
            )}
          </div>

          {/* Edit Product */}
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEditProduct}
            disabled={productFrozen}
          >
            Edit
          </Button>
        </div>
      </Card>

      <Divider />

      {/* Product Types */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div>
          <Title
            level={4}
            style={{ margin: 0 }}
          >
            Product Types
          </Title>

          <Text type="secondary">
            Configure how this product enters inventory.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setTypeModalOpen(true)}
          disabled={productFrozen}
        >
          Add Type
        </Button>
      </div>

      <Space
        direction="vertical"
        size={12}
        style={{ width: "100%" }}
      >
        {types.map((type) => {
            const typeFrozen =
                productFrozen || type.status === "inactive";

            const typeMenuItems = productFrozen
                ? [
                    {
                    key: "frozen",
                    label: "Frozen",
                    disabled: true,
                    },
                ]
                : type.status === "inactive"
                ? [
                    {
                    key: "toggle",
                    label: "Activate",
                    onClick: () => handleToggleTypeStatus(type),
                    },
                ]
                : [
                    {
                    key: "edit",
                    label: "Edit Type",
                    icon: <EditOutlined />,
                    onClick: () => handleEditType(type),
                    },
                    {
                    key: "toggle",
                    label: "Deactivate",
                    onClick: () => handleToggleTypeStatus(type),
                    },
                    {
                    key: "add-feature",
                    label: "Add Feature",
                    icon: <PlusOutlined />,
                    onClick: () => {
                        setSelectedTypeId(type.id);
                        setFeatureName("");
                        setFeatureModalOpen(true);
                    },
                    },
                ];

            return (
                <Card
                key={type.id}
                size="small"
                hoverable={!typeFrozen}
                onClick={() => {
                    if (typeFrozen) return;

                    navigate(
                    `/products/${product.id}/types/${type.id}/configuration`
                    );
                }}
                style={{
                    cursor: typeFrozen ? "default" : "pointer",
                    opacity: typeFrozen ? 0.6 : 1,
                }}
                >
                <div
                    style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    }}
                >
                    {/* Type information */}
                    <div style={{ minWidth: 0 }}>
                    <Text strong>{type.name}</Text>

                    <br />

                    <Tag style={{ marginTop: "6px" }}>
                        {type.entryMethod === "received"
                        ? "Received"
                        : "Produced"}
                    </Tag>
                    </div>

                    {/* Status + More Menu */}
                    <Space
                    onClick={(event) => event.stopPropagation()}
                    >
                    <Tag
                        color={
                        type.status === "active"
                            ? "green"
                            : "default"
                        }
                    >
                        {type.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </Tag>

                    <Dropdown
                        menu={{
                        items: typeMenuItems,
                        }}
                        trigger={["click"]}
                    >
                        <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                        />
                    </Dropdown>

                    {!typeFrozen && (
                        <ArrowRightOutlined
                        style={{ color: "#607D8B" }}
                        />
                    )}
                    </Space>
                </div>
                </Card>
            );
         })}
      </Space>

      {types.length === 0 && (
        <Card>
          <Text type="secondary">
            No types configured yet.
          </Text>
        </Card>
      )}

      <Divider />

      {/* Edit Product Modal */}
      <Modal
        title="Edit Product"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveProduct}
        >
          <Form.Item
            label="Product Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter the product name",
              },
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[
              {
                required: true,
                message: "Please select a category",
              },
            ]}
          >
            <Select
              placeholder="Select category"
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

          <Form.Item
            label="Stock Tracking Method"
            name="stockTrackingMethod"
            rules={[
              {
                required: true,
                message: "Please select a stock tracking method",
              },
            ]}
          >
            <Select
              placeholder="Select stock tracking method"
              options={[
                {
                  label: "Count Remaining",
                  value: "count-remaining",
                },
                {
                  label: "Count Sold",
                  value: "count-sold",
                },
              ]}
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

          <Form.Item style={{ marginBottom: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button
                onClick={() =>
                  setEditModalOpen(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
              >
                Save Changes
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Type Modal */}
      <Modal
        title="Add Product Type"
        open={typeModalOpen}
        onCancel={() => setTypeModalOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={typeForm}
          layout="vertical"
          onFinish={handleAddType}
        >
          <Form.Item
            label="Type Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter the type name",
              },
            ]}
          >
            <Input placeholder="e.g. Homemade" />
          </Form.Item>

          <Form.Item
            label="Entry Method"
            name="entryMethod"
            rules={[
              {
                required: true,
                message:
                  "Please select the entry method",
              },
            ]}
          >
            <Select
              placeholder="Select entry method"
              options={[
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
          </Form.Item>

          <Divider />

          <Text strong>Features</Text>

          <Text
            type="secondary"
            style={{
              display: "block",
              marginBottom: "12px",
            }}
          >
            Add the characteristics that can be
            configured for this type.
          </Text>

          <Form.List name="features">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space
                    key={field.key}
                    style={{
                      display: "flex",
                      marginBottom: 8,
                      width: "100%",
                    }}
                    align="start"
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, "name"]}
                      style={{
                        flex: 1,
                        marginBottom: 0,
                      }}
                    >
                      <Input placeholder="e.g. Flavor" />
                    </Form.Item>

                    <Button
                      danger
                      type="text"
                      onClick={() =>
                        remove(field.name)
                      }
                    >
                      Remove
                    </Button>
                  </Space>
                ))}

                <Button
                  type="dashed"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                >
                  Add Feature
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item style={{ marginBottom: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button
                onClick={() =>
                  setTypeModalOpen(false)
                }
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
              >
                Add Type
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Feature Modal */}
      <Modal
        title="Add Feature"
        open={featureModalOpen}
        onCancel={() => {
          setFeatureModalOpen(false);
          setFeatureName("");
          setSelectedTypeId(null);
        }}
        onOk={handleAddFeature}
        okText="Add Feature"
        okButtonProps={{
          disabled: !featureName.trim(),
        }}
        destroyOnHidden
      >
        <Input
          placeholder="e.g. Flavor"
          value={featureName}
          onChange={(event) =>
            setFeatureName(event.target.value)
          }
          onPressEnter={handleAddFeature}
          autoFocus
        />
      </Modal>

      {/* Edit Product Type */}
      <Modal
        title="Edit Product Type"
        open={editTypeModalOpen}
        onCancel={() => {
          setEditTypeModalOpen(false);
          setSelectedEditTypeId(null);
          editTypeForm.resetFields();
        }}
        footer={null}
        destroyOnHidden
      >
        <Form
          form={editTypeForm}
          layout="vertical"
          onFinish={handleSaveType}
        >
          <Form.Item
            label="Type Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter the type name",
              },
            ]}
          >
            <Input placeholder="e.g. Homemade" />
          </Form.Item>

          <Form.Item
            label="Entry Method"
            name="entryMethod"
            rules={[
              {
                required: true,
                message:
                  "Please select the entry method",
              },
            ]}
          >
            <Select
              placeholder="Select entry method"
              options={[
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
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
              }}
            >
              <Button
                onClick={() => {
                  setEditTypeModalOpen(false);
                  setSelectedEditTypeId(null);
                  editTypeForm.resetFields();
                }}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
              >
                Save Changes
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProductInformation;