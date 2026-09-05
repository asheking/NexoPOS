import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Col,
  DatePicker,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  Button,
  message,
} from "antd";
import {
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";

import { useProducts } from "../../../context/ProductContext";
import { useSuppliers } from "../../../context/SupplierContext";
import { useSupplierContracts } from "../../../context/SupplierContractContext";
import { useMilkReceipts } from "../../../context/MilkReceiptContext";
import { useStockReceipts } from "../../../context/StockReceiptContext";

const { Title, Text } = Typography;

interface FormValues {
  productId: number;
  typeId?: number;
  variantId?: number;
  supplierId?: number;
  contractId?: number;
  quantity: number;
  unitCost?: number;
  date: Dayjs;
  session?: "morning" | "afternoon";
}

export default function ReceiveStock() {
  const [form] = Form.useForm<FormValues>();

  const navigate = useNavigate();

  const { products } = useProducts();
  const { suppliers } = useSuppliers();
  const { contracts } = useSupplierContracts();
  const { addReceipt: addMilkReceipt } = useMilkReceipts();
  const { addReceipt: addStockReceipt } = useStockReceipts();


  const [selectedProductId, setSelectedProductId] =
    useState<number | undefined>();

  const [selectedTypeId, setSelectedTypeId] =
    useState<number | undefined>();

  const [selectedSupplierId, setSelectedSupplierId] =
    useState<number | undefined>();

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) => product.id === selectedProductId
      ),
    [products, selectedProductId]
  );

  const selectedType = useMemo(
    () =>
      selectedProduct?.types.find(
        (type) => type.id === selectedTypeId
      ),
    [selectedProduct, selectedTypeId]
  );

  const isHomemadeMilk =
    selectedProduct?.name === "Milk" &&
    selectedType?.name === "Homemade";

  const receivedProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.status === "active" &&
        product.types.some(
          (type) =>
            type.status === "active" &&
            type.entryMethod === "received"
        )
    );
  }, [products]);

  const availableTypes = useMemo(() => {
    if (!selectedProduct) return [];

    return selectedProduct.types.filter(
      (type) =>
        type.status === "active" &&
        type.entryMethod === "received"
    );
  }, [selectedProduct]);

  const availableVariants = useMemo(() => {
    if (!selectedType) return [];

    return selectedType.variants.filter(
      (variant) => variant.status === "active"
    );
  }, [selectedType]);

  const availableContracts = useMemo(() => {
    if (!selectedProduct || !isHomemadeMilk || !selectedSupplierId) {
      return [];
    }

    return contracts.filter(
      (contract) =>
        contract.status === "active" &&
        contract.supplierId === selectedSupplierId
    );
  }, [
    contracts,
    selectedProduct,
    isHomemadeMilk,
    selectedSupplierId,
  ]);

  const handleProductChange = (productId: number) => {
    setSelectedProductId(productId);
    setSelectedTypeId(undefined);
    setSelectedSupplierId(undefined);

    form.setFieldsValue({
      typeId: undefined,
      variantId: undefined,
      supplierId: undefined,
      contractId: undefined,
      session: undefined,
    });
  };

  const handleTypeChange = (typeId: number) => {
    setSelectedTypeId(typeId);

    form.setFieldsValue({
      variantId: undefined,
      supplierId: undefined,
      contractId: undefined,
      session: undefined,
    });
  };

  const handleFinish = (values: FormValues) => {
    if (!selectedProduct || !selectedType) {
      message.error("Please select a valid product and type.");
      return;
    }

    /*
     * HOMEMADE MILK
     *
     * This goes through MilkReceipt.
     */
    if (isHomemadeMilk) {
      if (
        !values.supplierId ||
        !values.contractId ||
        !values.session
      ) {
        message.error(
          "Supplier, contract and session are required for homemade milk."
        );
        return;
      }

      addMilkReceipt({
        id: Date.now(),
        productId: selectedProduct.id,
        typeId: selectedType.id,
        supplierId: values.supplierId!,
        contractId: values.contractId!,
        date: values.date.format("YYYY-MM-DD"),
        session: values.session!,
        quantity: values.quantity,
      });

      message.success("Homemade milk receipt recorded.");

      form.resetFields();

      setSelectedProductId(undefined);
      setSelectedTypeId(undefined);
      setSelectedSupplierId(undefined);

      return;
    }

    //GENERAL RECEIVED STOCK
    addStockReceipt({
      id: Date.now(),
      productId: values.productId,
      typeId: values.typeId,
      variantId: values.variantId,
      quantity: values.quantity,
      date: values.date.format("YYYY-MM-DD"),
      supplierId: values.supplierId,
      unitCost: values.unitCost,
    });

    message.success("Stock received successfully.");

    form.resetFields();

    setSelectedProductId(undefined);
    setSelectedTypeId(undefined);
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Receive Stock
        </Title>

        <Button
          icon={<HistoryOutlined />}
          onClick={() => navigate("/milk-supplier-history")}
        >
          Milk Supplier History
        </Button>
      </div>

      <Text type="secondary">
        Record products received into the shop inventory.
      </Text>

      <Card style={{ marginTop: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            date: dayjs(),
          }}
        >
          <Row gutter={[16, 16]}>
            {/* PRODUCT */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Product"
                name="productId"
                rules={[
                  {
                    required: true,
                    message: "Please select a product.",
                  },
                ]}
              >
                <Select
                  placeholder="Select product"
                  onChange={handleProductChange}
                  options={receivedProducts.map(
                    (product) => ({
                      value: product.id,
                      label: product.name,
                    })
                  )}
                />
              </Form.Item>
            </Col>

            {/* TYPE */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Type"
                name="typeId"
                rules={[
                  {
                    required: true,
                    message: "Please select a type.",
                  },
                ]}
              >
                <Select
                  placeholder="Select type"
                  disabled={!selectedProduct}
                  onChange={handleTypeChange}
                  options={availableTypes.map(
                    (type) => ({
                      value: type.id,
                      label: type.name,
                    })
                  )}
                />
              </Form.Item>
            </Col>

            {/* VARIANT */}
            {availableVariants.length > 0 &&
              !isHomemadeMilk && (
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Variant"
                    name="variantId"
                  >
                    <Select
                      placeholder="Select variant"
                      options={availableVariants.map(
                        (variant) => ({
                          value: variant.id,
                          label: variant.name,
                        })
                      )}
                    />
                  </Form.Item>
                </Col>
              )}

            {/* HOMEMADE MILK FIELDS */}
            {isHomemadeMilk && (
              <>
                <Form.Item
                  label="Supplier"
                  name="supplierId"
                  rules={[
                    {
                      required: true,
                      message: "Please select a supplier",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select supplier"
                    onChange={(value) => {
                      setSelectedSupplierId(value);
                      form.setFieldValue("contractId", undefined);
                    }}
                    options={suppliers
                      .filter((supplier) => supplier.status === "active")
                      .map((supplier) => ({
                        label: supplier.name,
                        value: supplier.id,
                      }))}
                  />
                </Form.Item>

                {/* Supplier Contract */}
                <Form.Item
                  label="Supplier Contract"
                  name="contractId"
                  rules={[
                    {
                      required: true,
                      message: "Please select a supplier contract",
                    },
                  ]}
                >
                  <Select
                    placeholder={
                      selectedSupplierId
                        ? "Select supplier contract"
                        : "Select supplier first"
                    }
                    disabled={!selectedSupplierId}
                    options={availableContracts.map((contract) => ({
                      label: `${dayjs(contract.startDate).format(
                        "MMM D"
                      )} – ${dayjs(contract.endDate).format("MMM D")} • ${
                        contract.pricePerLiter
                      } ETB/L`,
                      value: contract.id,
                    }))}
                  />
                </Form.Item>

                {/* Session */}
                <Form.Item
                  label="Session"
                  name="session"
                  rules={[
                    {
                      required: true,
                      message: "Please select a session",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select session"
                    options={[
                      { label: "Morning", value: "morning" },
                      { label: "Afternoon", value: "afternoon" },
                    ]}
                  />
                </Form.Item>
              </>
            )}

            {/* QUANTITY */}
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  isHomemadeMilk
                    ? "Quantity (Liters)"
                    : "Quantity"
                }
                name="quantity"
                rules={[
                  {
                    required: true,
                    message: "Please enter quantity.",
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
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="Enter quantity"
                />
              </Form.Item>
            </Col>

            {/* UNIT COST */}
            {!isHomemadeMilk && (
              <Col xs={24} md={12}>
                <Form.Item
                  label="Unit Cost"
                  name="unitCost"
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Purchase cost per unit"
                    addonAfter="ETB"
                  />
                </Form.Item>
              </Col>
            )}

            {/* DATE */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Date"
                name="date"
                rules={[
                  {
                    required: true,
                    message: "Please select a date.",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Space style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={
                !selectedProduct ||
                !selectedType
              }
            >
              {isHomemadeMilk
                ? "Record Milk Receipt"
                : "Receive Stock"}
            </Button>

            <Button
              onClick={() => {
                form.resetFields();
                setSelectedProductId(undefined);
                setSelectedTypeId(undefined);
              }}
            >
              Clear
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}