import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Dropdown,
  Input,
  InputNumber,
  Modal,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import { useProducts } from "../../context/ProductContext";

const { Title, Text } = Typography;

export default function TypeConfiguration() {
  const navigate = useNavigate();
  const { productId, typeId } = useParams();

  const {
    products,
    updateProductTypeFeatures,
    updateProductTypeVariants,
    updateProductVariant,
    deleteProductVariant,
    toggleProductVariantStatus,
    isProductFrozen,
    isProductTypeFrozen,
  } = useProducts();

  const [newOptions, setNewOptions] = useState<Record<number, string>>({});

  // Feature editing
  const [editingFeatureId, setEditingFeatureId] = useState<number | null>(
    null
  );
  const [editingFeatureName, setEditingFeatureName] = useState("");

  // Variant price editing
  const [editingVariantId, setEditingVariantId] = useState<number | null>(
    null
  );
  const [editingVariantPrice, setEditingVariantPrice] = useState<number>(0);

  const product = products.find(
    (item) => item.id === Number(productId)
  );

  const type = product?.types.find(
    (item) => item.id === Number(typeId)
  );

  if (!product || !type) {
    return (
      <div style={{ padding: "24px" }}>
        <Text type="secondary">Type not found.</Text>
      </div>
    );
  }

  const productFrozen = isProductFrozen(product.id);
  const typeFrozen = isProductTypeFrozen(product.id, type.id);
  const pageFrozen = productFrozen || typeFrozen;

  const features = type.features || [];
  const variants = type.variants || [];

  // FEATURE OPTIONS
  const handleAddOption = (featureId: number) => {
    if (pageFrozen) {
      message.warning("This type is frozen.");
      return;
    }

    const value = (newOptions[featureId] || "").trim();

    if (!value) return;

    const updatedFeatures = features.map((feature) => {
      if (feature.id !== featureId) return feature;

      const alreadyExists = (feature.options || []).some(
        (option) =>
          option.name.toLowerCase() === value.toLowerCase()
      );

      if (alreadyExists) {
        message.warning("This option already exists.");
        return feature;
      }

      return {
        ...feature,
        options: [
          ...(feature.options || []),
          {
            id: Date.now(),
            name: value,
          },
        ],
      };
    });

    updateProductTypeFeatures(
      product.id,
      type.id,
      updatedFeatures
    );

    setNewOptions((current) => ({
      ...current,
      [featureId]: "",
    }));
  };

  // FEATURE DELETE
  const handleRemoveOption = (
    featureId: number,
    optionId: number
  ) => {

    if (pageFrozen) {
      message.warning("This type is frozen.");
      return;
    }

    const updatedFeatures = features.map((feature) => {
      if (feature.id !== featureId) return feature;

      return {
        ...feature,
        options: (feature.options || []).filter(
          (option) => option.id !== optionId
        ),
      };
    });

    updateProductTypeFeatures(
      product.id,
      type.id,
      updatedFeatures
    );
  };

  // FEATURE EDIT
  const handleEditFeature = (featureId: number) => {
    if (pageFrozen) {
      message.warning("This type is frozen.");
      return;
    }

    const feature = features.find(
      (item) => item.id === featureId
    );

    if (!feature) return;

    setEditingFeatureId(feature.id);
    setEditingFeatureName(feature.name);
  };

  const saveFeatureEdit = () => {
    if (pageFrozen) {
      message.warning("This type is frozen.");
      return;
    }

    if (editingFeatureId === null) return;

    const trimmedName = editingFeatureName.trim();

    if (!trimmedName) {
      message.warning("Feature name cannot be empty.");
      return;
    }

    const updatedFeatures = features.map((feature) =>
      feature.id === editingFeatureId
        ? {
            ...feature,
            name: trimmedName,
          }
        : feature
    );

    updateProductTypeFeatures(
      product.id,
      type.id,
      updatedFeatures
    );

    setEditingFeatureId(null);
    setEditingFeatureName("");
  };

  const handleDeleteFeature = (featureId: number) => {
    if (pageFrozen) {
      message.warning("This type is frozen.");
      return;
    }

    const feature = features.find(
      (item) => item.id === featureId
    );

    if (!feature) return;

    Modal.confirm({
      title: "Delete Feature?",
      content: `Deleting "${feature.name}" will also remove its options. Existing variants will not be updated until you regenerate them.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",

      onOk: () => {
        const updatedFeatures = features.filter(
          (item) => item.id !== featureId
        );

        updateProductTypeFeatures(
          product.id,
          type.id,
          updatedFeatures
        );

        message.success("Feature deleted.");
      },
    });
  };

  // VARIANT GENERATION
  const generateVariantCombinations = () => {
    if (features.length === 0) {
      return [];
    }

    // Every feature must have at least one option
    if (
      features.some(
        (feature) => (feature.options || []).length === 0
      )
    ) {
      return [];
    }

    let combinations: {
      optionPairs: {
        featureId: number;
        optionId: number;
      }[];
      names: string[];
    }[] = [
      {
        optionPairs: [],
        names: [],
      },
    ];

    features.forEach((feature) => {
      const nextCombinations: typeof combinations = [];

      (feature.options || []).forEach((option) => {
        combinations.forEach((combination) => {
          nextCombinations.push({
            optionPairs: [
              ...combination.optionPairs,
              {
                featureId: feature.id,
                optionId: option.id,
              },
            ],
            names: [
              ...combination.names,
              option.name,
            ],
          });
        });
      });

      combinations = nextCombinations;
    });

    return combinations;
  };

  const getVariantKey = (
    optionPairs: {
      featureId: number;
      optionId: number;
    }[]
  ) => {
    return optionPairs
      .map(
        (pair) =>
          `${pair.featureId}:${pair.optionId}`
      )
      .join("|");
  };

  const handleGenerateVariants = () => {
    if (pageFrozen) {
      message.warning("This type is frozen.");
      return;
    }
    const combinations = generateVariantCombinations();

    if (features.length === 0) {
      message.warning(
        "Add at least one feature before generating variants."
      );
      return;
    }

    if (combinations.length === 0) {
      message.warning(
        "Every feature must have at least one option."
      );
      return;
    }

    const existingVariants = variants;

    const generatedVariants = combinations.map(
      (combination, index) => {
        const key = getVariantKey(
          combination.optionPairs
        );

        const existingVariant = existingVariants.find(
          (variant) =>
            getVariantKey(variant.options) === key
        );

        if (existingVariant) {
          return {
            ...existingVariant,
            name: combination.names.join(" · "),
          };
        }

        return {
          id: Date.now() + index + Math.random(),
          name: combination.names.join(" · "),
          options: combination.optionPairs,
          price: 0,
          status: "active" as const,
        };
      }
    );

    updateProductTypeVariants(
      product.id,
      type.id,
      generatedVariants
    );

    message.success(
      `${generatedVariants.length} variant${
        generatedVariants.length === 1 ? "" : "s"
      } generated.`
    );
  };

  // VARIANT PRICE
  const handleEditVariantPrice = (
    variantId: number
  ) => {

    const variant = variants.find(
      (item) => item.id === variantId
    );

    if (!variant) return;

    if (variant.status === "inactive") {
      message.warning("This variant is inactive.");
      return;
    }

    setEditingVariantId(variant.id);
    setEditingVariantPrice(variant.price);
  };

  const saveVariantPrice = () => {
    if (editingVariantId === null) return;

    const variant = variants.find(
      (item) => item.id === editingVariantId
    );

    if (!variant) return;

    if (variant.status === "inactive") {
      message.warning("This variant is inactive.");
      return;
    }

    updateProductVariant(product.id, type.id, {
      ...variant,
      price: editingVariantPrice || 0,
    });

    setEditingVariantId(null);
    setEditingVariantPrice(0);

    message.success("Variant price updated.");
  };

  // VARIANT DELETE
  const handleDeleteVariant = (
    variantId: number
  ) => {

    const variant = variants.find(
      (item) => item.id === variantId
    );

    if (!variant) return;

    if (variant.status === "inactive") {
      message.warning("This variant is inactive.");
      return;
    }
    
    Modal.confirm({
      title: "Delete Variant?",
      content: `Are you sure you want to delete "${variant.name}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",

      onOk: () => {
        deleteProductVariant(
          product.id,
          type.id,
          variantId
        );

        message.success("Variant deleted.");
      },
    });
  };

  // RENDER
  return (
    <div
      style={{
        padding: "16px",
        paddingBottom: "40px",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            navigate(
              `/products/${product.id}/info`
            )
          }
        >
          Back
        </Button>
      </div>

      {/* ENTRY METHOD */}

      <Card style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* Type name */}
          <Title
            level={3}
            style={{
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {type.name}
          </Title>

          {/* Entry method */}
          <Space size={8}>
            <Text strong>Entry Method:</Text>

            <Tag
              color={
                type.entryMethod === "received"
                  ? "blue"
                  : "purple"
              }
            >
              {type.entryMethod === "received"
                ? "Received"
                : "Produced"}
            </Tag>
          </Space>
        </div>

        {/* Product name */}
        <Text type="secondary">
          {product.name}
        </Text>
      </Card>

      {/* FEATURES */}

      <div
        style={{
          marginBottom: "12px",
        }}
      >
        <Title
          level={4}
          style={{ margin: 0 }}
        >
          Features
        </Title>

        <Text type="secondary">
          Define the options that make up this type.
        </Text>
      </div>

      {features.length === 0 ? (
        <Card
          style={{
            marginBottom: "24px",
          }}
        >
          <Text type="secondary">
            No features have been defined for this
            type yet.
          </Text>
        </Card>
      ) : (
        <Space
          direction="vertical"
          size={12}
          style={{
            width: "100%",
            marginBottom: "24px",
          }}
        >
          {features.map((feature) => {
            const featureMenuItems = pageFrozen
              ? [
                  {
                    key: "frozen",
                    label: "Frozen",
                    disabled: true,
                  },
                ]
              : [
                  {
                    key: "edit",
                    icon: <EditOutlined />,
                    label: "Edit Feature",
                    onClick: () =>
                      handleEditFeature(feature.id),
                  },
                  {
                    key: "delete",
                    danger: true,
                    icon: <DeleteOutlined />,
                    label: "Delete Feature",
                    onClick: () =>
                      handleDeleteFeature(feature.id),
                  },
                ];

            return (
              <Card
                key={feature.id}
                size="small"
              >
                {/* FEATURE HEADER */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <Text strong>
                      {feature.name}
                    </Text>

                    <div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "12px",
                        }}
                      >
                        {feature.options.length}{" "}
                        option
                        {feature.options.length === 1
                          ? ""
                          : "s"}
                      </Text>
                    </div>
                  </div>

                  <Dropdown
                    menu={{
                      items: featureMenuItems,
                    }}
                    trigger={["click"]}
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                    />
                  </Dropdown>
                </div>

                {/* OPTIONS */}

                <Space
                  wrap
                  size={[8, 8]}
                  style={{
                    width: "100%",
                    marginBottom: "12px",
                  }}
                >
                  {(feature.options || []).map(
                    (option) => (
                      <Tag
                        key={option.id}
                        closable={!pageFrozen}
                        onClose={
                          pageFrozen
                            ? undefined
                            : () =>
                                handleRemoveOption(
                                  feature.id,
                                  option.id
                                )
                        }
                      >
                        {option.name}
                      </Tag>
                    )
                  )}
                </Space>

                {/* ADD OPTION */}

                <Space.Compact
                  style={{
                    width: "100%",
                  }}
                >
                  <Input
                    disabled={pageFrozen}
                    placeholder={`Add ${feature.name.toLowerCase()} option`}
                    value={
                      newOptions[feature.id] || ""
                    }
                    onChange={(event) => {
                      setNewOptions((current) => ({
                        ...current,
                        [feature.id]:
                          event.target.value,
                      }));
                    }}
                    onPressEnter={() =>
                      handleAddOption(feature.id)
                    }
                  />

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      handleAddOption(feature.id)
                    }
                    disabled={
                      pageFrozen ||
                      !newOptions[feature.id]?.trim()
                    }
                  >
                    Add
                  </Button>
                </Space.Compact>
              </Card>
            );
          })}
        </Space>
      )}

      {/* VARIANTS */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div>
          <Title
            level={4}
            style={{ margin: 0 }}
          >
            Variants
          </Title>

          <Text type="secondary">
            Generate combinations from the feature
            options.
          </Text>
        </div>

        <Button
          type="primary"
          icon={<SyncOutlined />}
          onClick={handleGenerateVariants}
          disabled={
            pageFrozen ||
            features.length === 0 ||
            features.some(
              (feature) =>
                feature.options.length === 0
            )
          }
        >
          Generate
        </Button>
      </div>

      {/* VARIANT EXPLANATION */}

      {features.length > 0 &&
        features.some(
          (feature) =>
            feature.options.length === 0
        ) && (
          <Card
            size="small"
            style={{
              marginBottom: "12px",
            }}
          >
            <Text type="secondary">
              Add at least one option to every
              feature before generating variants.
            </Text>
          </Card>
        )}

      {/* VARIANT LIST */}

      {variants.length === 0 ? (
        <Card>
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            <Text type="secondary">
              No variants generated yet.
            </Text>

            <div style={{ marginTop: "8px" }}>
              <Text type="secondary">
                Add feature options above, then tap
                Generate.
              </Text>
            </div>
          </div>
        </Card>
      ) : (
        <Space
          direction="vertical"
          size={12}
          style={{
            width: "100%",
          }}
        >
          {variants.map((variant) => {
            const ancestorFrozen = productFrozen || typeFrozen;

            const variantMenuItems = ancestorFrozen
              ? [
                  {
                    key: "frozen",
                    label: "Frozen",
                    disabled: true,
                  },
                ]
              : variant.status === "inactive"
              ? [
                  {
                    key: "status",
                    label: "Activate",
                    onClick: () =>
                      toggleProductVariantStatus(
                        product.id,
                        type.id,
                        variant.id,
                        true
                      ),
                  },
                ]
              : [
                  {
                    key: "edit-price",
                    icon: <EditOutlined />,
                    label: "Edit Price",
                    onClick: () =>
                      handleEditVariantPrice(variant.id),
                  },
                  {
                    key: "status",
                    label: "Deactivate",
                    onClick: () =>
                      toggleProductVariantStatus(
                        product.id,
                        type.id,
                        variant.id,
                        false
                      ),
                  },
                  {
                    key: "delete",
                    danger: true,
                    icon: <DeleteOutlined />,
                    label: "Delete Variant",
                    onClick: () =>
                      handleDeleteVariant(variant.id),
                  },
                ];

            return (
              <Card
                key={variant.id}
                size="small"
                style={{
                  opacity:
                    ancestorFrozen || variant.status === "inactive"
                      ? 0.55
                      : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
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
                        marginBottom: "6px",
                      }}
                    >
                      {variant.name}
                    </Text>

                    <Space size={8}>
                      <Text strong>
                        {variant.price.toLocaleString()} ETB
                      </Text>

                      <Tag
                        color={
                          variant.status === "active"
                            ? "green"
                            : "default"
                        }
                      >
                        {variant.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </Tag>
                    </Space>
                  </div>

                  <Dropdown
                    menu={{
                      items: variantMenuItems,
                    }}
                    trigger={["click"]}
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                    />
                  </Dropdown>
                </div>
              </Card>
            );
          })}
        </Space>
      )}

      {/* EDIT FEATURE MODAL */}

      <Modal
        title="Edit Feature"
        open={editingFeatureId !== null}
        onCancel={() => {
          setEditingFeatureId(null);
          setEditingFeatureName("");
        }}
        onOk={saveFeatureEdit}
        okText="Save"
      >
        <Input
          value={editingFeatureName}
          placeholder="Feature name"
          onChange={(event) =>
            setEditingFeatureName(
              event.target.value
            )
          }
          onPressEnter={saveFeatureEdit}
        />
      </Modal>

      {/* EDIT VARIANT PRICE MODAL */}

      <Modal
        title="Edit Variant Price"
        open={editingVariantId !== null}
        onCancel={() => {
          setEditingVariantId(null);
          setEditingVariantPrice(0);
        }}
        onOk={saveVariantPrice}
        okText="Save"
      >
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          addonAfter="ETB"
          value={editingVariantPrice}
          onChange={(value) =>
            setEditingVariantPrice(value ?? 0)
          }
        />
      </Modal>
    </div>
  );
}