import { useMemo, useState, useCallback, } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { useProducts } from "../../../context/ProductContext";
import { useProduction } from "../../../context/ProductionContext";
import { useMilkReceipts } from "../../../context/MilkReceiptContext";
import { useStockReceipts } from "../../../context/StockReceiptContext";

const { Title, Text } = Typography;

interface ProductionInputForm {
  productId?: number;
  typeId?: number;
  variantId?: number;
  quantity?: number;
}

interface ProductionFormValues {
  outputProductId?: number;
  outputTypeId?: number;
  outputVariantId?: number;
  outputQuantity?: number;
  date?: dayjs.Dayjs;
}

function Production() {
  const { products } = useProducts();

  const {
    productionRecords,
    addProduction,
  } = useProduction();

  const { receipts: milkReceipts } =
    useMilkReceipts();

  const { receipts: stockReceipts } =
    useStockReceipts();

  const [form] =
    Form.useForm<ProductionFormValues>();

  const [inputForms, setInputForms] =
    useState<ProductionInputForm[]>([
      {},
    ]);

  const [
    selectedOutputProductId,
    setSelectedOutputProductId,
  ] = useState<number>();

  const [
    selectedOutputTypeId,
    setSelectedOutputTypeId,
  ] = useState<number>();

  const getAvailableQuantity = useCallback(
    (
      productId: number,
      typeId: number,
      variantId?: number
    ) => {
      const product = products.find(
        (item) => item.id === productId
      );

      const type = product?.types.find(
        (item) => item.id === typeId
      );

      if (!product || !type) {
        return 0;
      }

      let receivedQuantity = 0;

      // Homemade Milk is stored in MilkReceiptContext.
      if (
        product.name === "Milk" &&
        type.name === "Homemade"
      ) {
        receivedQuantity =
          milkReceipts.reduce(
            (total, receipt) =>
              total + receipt.quantity,
            0
          );
      } else {
        // Other received products are storedin StockReceiptContext.
        receivedQuantity =
          stockReceipts
            .filter(
              (receipt) =>
                receipt.productId === productId &&
                receipt.typeId === typeId &&
                receipt.variantId === variantId
            )
            .reduce(
              (total, receipt) =>
                total + receipt.quantity,
              0
            );
      }

      // Calculate how much of this raw material has already been consumed by production.
      const consumedQuantity =
        productionRecords.reduce(
          (total, production) => {
            return (
              total +
              production.inputs
                .filter(
                  (input) =>
                    input.productId === productId &&
                    input.typeId === typeId &&
                    input.variantId === variantId
                )
                .reduce(
                  (inputTotal, input) =>
                    inputTotal + input.quantity,
                  0
                )
            );
          },
          0
        );

      return Math.max(
        0,
        receivedQuantity - consumedQuantity
      );
    },
    [
      products,
      milkReceipts,
      stockReceipts,
      productionRecords,
    ]
  );

  // Products that have at least one active PRODUCED type.
  const producedProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.status === "active" &&
        product.types.some(
          (type) =>
            type.status === "active" &&
            type.entryMethod === "produced"
        )
    );
  }, [products]);

  // Products that have at least one active RECEIVED type.
  const receivedProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.status !== "active") {
        return false;
      }

      return product.types.some((type) => {
        if (
          type.status !== "active" ||
          type.entryMethod !== "received"
        ) {
          return false;
        }

        // If the type has no variants, check the type's stock.
        if (type.variants.length === 0) {
          return getAvailableQuantity(
            product.id,
            type.id
          ) > 0;
        }

        // If the type has variants, check whether
        // at least one variant has stock.
        return type.variants.some(
          (variant) =>
            variant.status === "active" &&
            getAvailableQuantity(
              product.id,
              type.id,
              variant.id
            ) > 0
        );
      });
    });
  }, [
    products,
    milkReceipts,
    stockReceipts,
    productionRecords,
  ]);

  // Active produced types for the selected output product.
  const outputTypes = useMemo(() => {
    if (!selectedOutputProductId) {
      return [];
    }

    const product = products.find(
      (item) =>
        item.id === selectedOutputProductId
    );

    if (!product) {
      return [];
    }

    return product.types.filter(
      (type) =>
        type.status === "active" &&
        type.entryMethod === "produced"
    );
  }, [
    products,
    selectedOutputProductId,
  ]);

  // Active received types for an input product.
  const getInputTypes = (
    productId?: number
    ) => {
      if (productId === undefined) {
        return [];
      }

      const product = products.find(
        (item) => item.id === productId
      );

      if (!product) {
        return [];
      }

      return product.types.filter((type) => {
        if (
          type.status !== "active" ||
          type.entryMethod !== "received"
        ) {
          return false;
        }

        // No variants → check type-level stock
        if (type.variants.length === 0) {
          return (
            getAvailableQuantity(
              product.id,
              type.id
            ) > 0
          );
        }

        // Has variants → type is available if at least
        // one active variant has stock.
        return type.variants.some(
          (variant) =>
            variant.status === "active" &&
            getAvailableQuantity(
              product.id,
              type.id,
              variant.id
            ) > 0
        );
      });
    };

  // Active variants belonging to a selected type.
  const getInputVariants = (
    productId?: number,
    typeId?: number
  ) => {
    if (
      productId === undefined ||
      typeId === undefined
    ) {
      return [];
    }

    const product = products.find(
      (item) => item.id === productId
    );

    const type = product?.types.find(
      (item) => item.id === typeId
    );

    if (!type) {
      return [];
    }

    return type.variants.filter(
      (variant) =>
        variant.status === "active" &&
        getAvailableQuantity(
          productId,
          typeId,
          variant.id
        ) > 0
    );
  };

  const getOutputVariants = (
    productId?: number,
    typeId?: number
  ) => {
    if (
      productId === undefined ||
      typeId === undefined
    ) {
      return [];
    }

    const product = products.find(
      (item) => item.id === productId
    );

    const type = product?.types.find(
      (item) => item.id === typeId
    );

    if (!type) {
      return [];
    }

    return type.variants.filter(
      (variant) =>
        variant.status === "active"
    );
  };

  //  Add another raw-material row.
  const addInput = () => {
    setInputForms((current) => [
      ...current,
      {},
    ]);
  };

  /*
   * Remove a raw-material row.
   */
  const removeInput = (
    index: number
  ) => {
    setInputForms((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  };

  // Update one raw-material row.
  const updateInput = (
    index: number,
    field: keyof ProductionInputForm,
    value: number | undefined
  ) => {
    setInputForms((current) =>
      current.map((input, i) => {
        if (i !== index) {
          return input;
        }

        // Changing product resets type and variant.
        if (field === "productId") {
          return {
            productId: value,
            typeId: undefined,
            variantId: undefined,
            quantity: input.quantity,
          };
        }

        // Changing type resets variant.
        if (field === "typeId") {
          return {
            ...input,
            typeId: value,
            variantId: undefined,
          };
        }

        return {
          ...input,
          [field]: value,
        };
      })
    );
  };

  // Change output product.
  const handleOutputProductChange = (
    productId: number
  ) => {
    setSelectedOutputProductId(
      productId
    );

    setSelectedOutputTypeId(
      undefined
    );

    form.setFieldsValue({
      outputProductId: productId,
      outputTypeId: undefined,
      outputVariantId: undefined,
    });
  };

  // Change output type.
  const handleOutputTypeChange = (
    typeId: number
  ) => {
    setSelectedOutputTypeId(typeId);

    form.setFieldsValue({
      outputTypeId: typeId,
      outputVariantId: undefined,
    });
  };

  // Submit production record.
  const handleSubmit = async () => {
    try {
      const values =
        await form.validateFields();

      // Remove incomplete input rows.
      const validInputs =
        inputForms.filter(
          (input) =>
            input.productId !==
              undefined &&
            input.typeId !== undefined &&
            input.quantity !==
              undefined &&
            input.quantity > 0
        );

      if (validInputs.length === 0) {
        message.error(
          "Add at least one raw material."
        );
        return;
      }

      // Validate required variants.
      for (const input of validInputs) {
        const product = products.find(
          (item) =>
            item.id === input.productId
        );

        const type = product?.types.find(
          (item) =>
            item.id === input.typeId
        );

        if (
          type &&
          type.variants.length > 0 &&
          input.variantId === undefined
        ) {
          message.error(
            `Select a variant for ${product?.name ?? "raw material"} - ${type.name}.`
          );
          return;
        }
      }

      // Validate output product/type.
      if (
        !values.outputProductId ||
        !values.outputTypeId
      ) {
        message.error(
          "Select the product and type being produced."
        );
        return;
      }

      const outputProduct =
        products.find(
          (product) =>
            product.id ===
            values.outputProductId
        );

      const outputType =
        outputProduct?.types.find(
          (type) =>
            type.id ===
            values.outputTypeId
        );

      if (
        outputType &&
        outputType.variants.length > 0 &&
        values.outputVariantId === undefined
      ) {
        message.error(
          `Select a variant for ${outputProduct?.name ?? "output"} - ${outputType.name}.`
        );
        return;
      }

      // Validate output quantity.
      if (
        !values.outputQuantity ||
        values.outputQuantity <= 0
      ) {
        message.error(
          "Enter a valid output quantity."
        );
        return;
      }

      // Validate date.
      if (!values.date) {
        message.error(
          "Select a production date."
        );
        return;
      }

      //Group requested quantities
      const requestedByMaterial =
        new Map<string, number>();

      for (const input of validInputs) {
        const key = [
          input.productId,
          input.typeId,
          input.variantId ?? "none",
        ].join("-");

        const current =
          requestedByMaterial.get(key) ?? 0;

        requestedByMaterial.set(
          key,
          current + input.quantity!
        );
      }

      // Validate the combined quantity against available stock.
      for (const input of validInputs) {
        const key = [
          input.productId,
          input.typeId,
          input.variantId ?? "none",
        ].join("-");

        const requested =
          requestedByMaterial.get(key) ?? 0;

        const available =
          getAvailableQuantity(
            input.productId!,
            input.typeId!,
            input.variantId
          );

        if (requested > available) {
          const product =
            products.find(
              (item) =>
                item.id === input.productId
            );

          const type =
            product?.types.find(
              (item) =>
                item.id === input.typeId
            );

          const variant =
            type?.variants.find(
              (item) =>
                item.id === input.variantId
            );

          message.error(
            `Insufficient stock for ${
              product?.name ?? "raw material"
            }${
              type
                ? ` - ${type.name}`
                : ""
            }${
              variant
                ? ` - ${variant.name}`
                : ""
            }. Available: ${available}, requested: ${requested}.`
          );

          return;
        }
      }

      // All raw materials have enough stock.
      // Create the production record.
      addProduction({
        id: Date.now(),

        outputProductId:
          values.outputProductId,

        outputTypeId:
          values.outputTypeId,

        outputVariantId:
          values.outputVariantId,

        inputs: validInputs.map(
          (input) => ({
            productId:
              input.productId!,
            typeId:
              input.typeId!,
            variantId:
              input.variantId,
            quantity:
              input.quantity!,
          })
        ),

        outputQuantity:
          values.outputQuantity,

        date: values.date.format(
          "YYYY-MM-DD"
        ),
      });

      message.success(
        "Production record added successfully."
      );

      form.resetFields();

      setInputForms([{}]);

      setSelectedOutputProductId(
        undefined
      );

      setSelectedOutputTypeId(
        undefined
      );
    } catch {
      // Ant Design handles form validation.
    }
  };

  const selectedOutputType =
    products
      .find(
        (product) =>
          product.id === selectedOutputProductId
      )
      ?.types.find(
        (type) =>
          type.id === selectedOutputTypeId
      );

  const hasOutputVariants =
    (selectedOutputType?.variants.length ?? 0) > 0;

  return (
    <div style={{ padding: 24 }}>
      <Space
        direction="vertical"
        size={4}
        style={{
          width: "100%",
          marginBottom: 24,
        }}
      >
        <Title
          level={2}
          style={{ margin: 0 }}
        >
          Production
        </Title>

        <Text type="secondary">
          Record products produced from raw
          materials.
        </Text>
      </Space>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(),
        }}
      >
        {/* INPUTS */}

        <Card
          title="Raw Materials"
          style={{ marginBottom: 24 }}
        >
          {inputForms.map(
            (input, index) => {
              const inputTypes = getInputTypes(
                  input.productId
                );

              const inputVariants = getInputVariants(
                  input.productId,
                  input.typeId
                );
              
                const selectedInputType =
                  products
                    .find(
                      (product) =>
                        product.id === input.productId
                    )
                    ?.types.find(
                      (type) =>
                        type.id === input.typeId
                    );

                const hasInputVariants =
                  (selectedInputType?.variants.length ?? 0) > 0;

              // Calculate available quantity for this row.
              const availableQuantity =
                input.productId !==
                    undefined &&
                input.typeId !==
                    undefined
                  ? getAvailableQuantity(
                      input.productId,
                      input.typeId,
                      input.variantId
                    )
                  : undefined;

              return (
                <Card
                  key={index}
                  size="small"
                  style={{
                    marginBottom:
                      index ===
                      inputForms.length - 1
                        ? 0
                        : 16,
                  }}
                >
                  <Row
                    gutter={16}
                    align="bottom"
                  >
                    {/* PRODUCT */}

                    <Col
                      xs={24}
                      md={6}
                    >
                      <Form.Item
                        label="Product"
                        style={{
                          marginBottom: 0,
                        }}
                      >
                        <Select
                          placeholder="Select raw material"
                          value={
                            input.productId
                          }
                          onChange={(
                            value
                          ) =>
                            updateInput(
                              index,
                              "productId",
                              value
                            )
                          }
                          options={receivedProducts.map(
                            (product) => ({
                              value:
                                product.id,
                              label:
                                product.name,
                            })
                          )}
                        />
                      </Form.Item>
                    </Col>

                    {/* TYPE */}

                    <Col
                      xs={24}
                      md={6}
                    >
                      <Form.Item
                        label="Type"
                        style={{
                          marginBottom: 0,
                        }}
                      >
                        <Select
                          placeholder={
                            input.productId
                              ? "Select type"
                              : "Select product first"
                          }
                          disabled={
                            !input.productId
                          }
                          value={
                            input.typeId
                          }
                          onChange={(
                            value
                          ) =>
                            updateInput(
                              index,
                              "typeId",
                              value
                            )
                          }
                          options={inputTypes.map(
                            (type) => ({
                              value:
                                type.id,
                              label:
                                type.name,
                            })
                          )}
                        />
                      </Form.Item>
                    </Col>

                    {/* VARIANT */}

                    <Col
                      xs={24}
                      md={5}
                    >
                      <Form.Item
                        label="Variant"
                        required={hasInputVariants}
                        style={{
                          marginBottom: 0,
                        }}
                      >
                        <Select
                          allowClear={!hasInputVariants}
                          placeholder={
                            hasInputVariants
                              ? "Select variant"
                              : "No variant required"
                          }
                          disabled={
                            !input.typeId ||
                            !hasInputVariants
                          }
                          options={inputVariants.map(
                            (variant) => ({
                              value: variant.id,
                              label: variant.name,
                            })
                          )}
                          value={input.variantId}
                          onChange={(value) =>
                            updateInput(
                              index,
                              "variantId",
                              value
                            )
                          }
                        />
                      </Form.Item>
                    </Col>

                    {/* QUANTITY */}

                    <Col
                      xs={24}
                      md={5}
                    >
                      <Form.Item
                        label="Quantity(L)"
                        style={{
                          marginBottom: 0,
                        }}
                      >
                        <InputNumber
                          min={0.01}
                          style={{
                            width: "100%",
                          }}
                          placeholder="Quantity"
                          value={
                            input.quantity
                          }
                          onChange={(
                            value
                          ) =>
                            updateInput(
                              index,
                              "quantity",
                              value ??
                                undefined
                            )
                          }
                        />

                        {/* AVAILABLE STOCK */}
                        {availableQuantity !==
                          undefined && (
                          <Text
                            type={
                              input.quantity !==
                                undefined &&
                              input.quantity >
                                availableQuantity
                                ? "danger"
                                : "secondary"
                            }
                            style={{
                              display:
                                "block",
                              marginTop: 4,
                              fontSize: 12,
                            }}
                          >
                            Available:{" "}
                            {
                              availableQuantity
                            }L
                          </Text>
                        )}
                      </Form.Item>
                    </Col>

                    {/* DELETE */}

                    <Col
                      xs={24}
                      md={2}
                    >
                      <Button
                        danger
                        icon={
                          <DeleteOutlined />
                        }
                        disabled={
                          inputForms.length ===
                          1
                        }
                        onClick={() =>
                          removeInput(
                            index
                          )
                        }
                        style={{
                          width: "100%",
                          marginTop:
                            "15px",
                        }}
                      >
                        Delete
                      </Button>
                    </Col>
                  </Row>
                </Card>
              );
            }
          )}
          <Divider />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addInput}
            block
          >
            Add Raw Material
          </Button>
        </Card>

        {/* OUTPUT */}

        <Card
          title={
            <Space>
              <SwapOutlined />
              <span>
                Produced Product
              </span>
            </Space>
          }
          style={{
            marginBottom: 24,
          }}
        >
          <Row gutter={16}>
            {/* OUTPUT PRODUCT */}

            <Col
              xs={24}
              md={8}
            >
              <Form.Item
                label="Product"
                name="outputProductId"
                rules={[
                  {
                    required: true,
                    message:
                      "Select the product being produced.",
                  },
                ]}
              >
                <Select
                  placeholder="Select product"
                  onChange={
                    handleOutputProductChange
                  }
                  options={producedProducts.map(
                    (product) => ({
                      value:
                        product.id,
                      label:
                        product.name,
                    })
                  )}
                />
              </Form.Item>
            </Col>

            {/* OUTPUT TYPE */}
            <Col
              xs={24}
              md={8}
            >
              <Form.Item
                label="Type"
                name="outputTypeId"
                rules={[
                  {
                    required: true,
                    message:
                      "Select the produced type.",
                  },
                ]}
              >
                <Select
                  placeholder={
                    selectedOutputProductId
                      ? "Select type"
                      : "Select product first"
                  }
                  disabled={
                    !selectedOutputProductId
                  }
                  onChange={
                    handleOutputTypeChange
                  }
                  options={outputTypes.map(
                    (type) => ({
                      value: type.id,
                      label:
                        type.name,
                    })
                  )}
                />
              </Form.Item>
            </Col>

            {/* OUTPUT VARIANT */}

            <Col
              xs={24}
              md={8}
            >
              <Form.Item
                label="Variant"
                name="outputVariantId"
                required={hasOutputVariants}
              >
                <Select
                  allowClear={!hasOutputVariants}
                  placeholder={
                    hasOutputVariants
                      ? "Select variant"
                      : "No variant required"
                  }
                  disabled={
                    !selectedOutputTypeId ||
                    !hasOutputVariants
                  }
                  options={getOutputVariants(
                    selectedOutputProductId,
                    selectedOutputTypeId
                  ).map((variant) => ({
                    value: variant.id,
                    label: variant.name,
                  }))}
                />
              </Form.Item>
            </Col>

            {/* OUTPUT QUANTITY */}
            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                label="Output Quantity"
                name="outputQuantity"
                rules={[
                  {
                    required: true,
                    message:
                      "Enter the output quantity.",
                  },
                  {
                    type: "number",
                    min: 0.01,
                    message:
                      "Quantity must be greater than 0.",
                  },
                ]}
              >
                <InputNumber
                  min={0.01}
                  style={{
                    width: "100%",
                  }}
                  placeholder="Enter quantity"
                />
              </Form.Item>
            </Col>

            {/* DATE */}

            <Col
              xs={24}
              md={12}
            >
              <Form.Item
                label="Production Date"
                name="date"
                rules={[
                  {
                    required: true,
                    message:
                      "Select a production date.",
                  },
                ]}
              >
                <DatePicker
                  style={{
                    width: "100%",
                  }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </Row>
          {/* ACTION */}
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
            >
              Record Production
            </Button>
        </Card>

        {/* SUMMARY */}

        <Card
          style={{
            marginBottom: 24,
          }}
        >
          <Space
            direction="vertical"
            size={8}
          >
            <Text strong>
              Production rule
            </Text>

            <Text type="secondary">
              Received products are used as
              raw materials and the selected
              produced product becomes the
              output.
            </Text>

            <Space wrap>
              <Tag color="blue">
                Received = Raw Material
              </Tag>

              <Tag color="purple">
                Produced = Output
              </Tag>
            </Space>
          </Space>
        </Card>
      </Form>
    </div>
  );
}

export default Production;