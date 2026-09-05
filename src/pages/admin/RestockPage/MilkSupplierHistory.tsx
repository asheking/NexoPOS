import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Collapse,
  Empty,
  Space,
  Tag,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import {
  DownOutlined,
  RightOutlined,
  EditOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useSuppliers } from "../../../context/SupplierContext";
import { useMilkReceipts } from "../../../context/MilkReceiptContext";
import { useSupplierContracts } from "../../../context/SupplierContractContext";

const { Title, Text } = Typography;

function MilkSupplierHistory() {
  const { suppliers, toggleSupplierStatus, addSupplier, updateSupplier, } = useSuppliers();
  const { receipts: milkReceipts } = useMilkReceipts();
  const { contracts, addContract, updateContract, } = useSupplierContracts();

  const [editModalOpen, setEditModalOpen] = useState(false);

  const [expandedSuppliers, setExpandedSuppliers] = useState<number[]>(
    []
  );

  const [editingSupplierId, setEditingSupplierId] = useState<
    number | null
  >(null);

  const [addSupplierModalOpen, setAddSupplierModalOpen] =
    useState(false);
  const [addSupplierForm] = Form.useForm();

  const [creatingContract, setCreatingContract] = useState(false);
  const [contractHasReceipts, setContractHasReceipts] = useState(false);

  const [supplierSearch, setSupplierSearch] = useState("");
  
  const [editForm] = Form.useForm();

  const navigate = useNavigate();

  const activeSuppliers = useMemo(() => {
    return suppliers.filter(
        (supplier) => supplier.status === "active"
    );
  }, [suppliers]);

  const deactivatedSuppliers = useMemo(() => {
    return suppliers.filter(
        (supplier) => supplier.status === "inactive"
    );
  }, [suppliers]);

  const buildSupplierHistory = (supplierList: typeof suppliers) => {
    return supplierList.map((supplier) => {
      const receipts = milkReceipts
        .filter((receipt) => receipt.supplierId === supplier.id)
        .sort((a, b) => b.date.localeCompare(a.date));

      const supplierContracts = contracts
        .filter((contract) => contract.supplierId === supplier.id)
        .sort((a, b) => b.startDate.localeCompare(a.startDate));

      const currentContract = supplierContracts.find(
        (contract) => contract.status === "active"
        );

      // Calculate every receipt using the contract
      // that was actually attached to that receipt.
      const totalQuantity = receipts.reduce(
        (sum, receipt) => sum + receipt.quantity,
        0
        );

      const totalAmount = receipts.reduce((sum, receipt) => {
      const receiptContract = contracts.find(
            (contract) => contract.id === receipt.contractId
        );

      if (!receiptContract) {
            return sum;
        }

        return sum + receipt.quantity * receiptContract.pricePerLiter;
        }, 0);

        const currentContractReceipts = currentContract
        ? receipts.filter(
            (receipt) => receipt.contractId === currentContract.id
            )
        : [];

        const currentContractQuantity = currentContractReceipts.reduce(
        (sum, receipt) => sum + receipt.quantity,
        0
        );

        const currentContractAmount = currentContract
        ? currentContractQuantity * currentContract.pricePerLiter
        : 0;

        return {
        supplier,
        receipts,
        totalQuantity,
        totalAmount,
        currentContract,
        currentContractQuantity,
        currentContractAmount,
        };
    });
    };

    const supplierHistory = useMemo(
    () => buildSupplierHistory(activeSuppliers),
    [activeSuppliers, milkReceipts, contracts]
    );

    const deactivatedSupplierHistory = useMemo(
    () => buildSupplierHistory(deactivatedSuppliers),
    [deactivatedSuppliers, milkReceipts, contracts]
    );

  const toggleSupplier = (supplierId: number) => {
    setExpandedSuppliers((current) =>
      current.includes(supplierId)
        ? current.filter((id) => id !== supplierId)
        : [...current, supplierId]
    );
  };

  const handleEditSupplier = (supplierId: number) => {
    const supplier = suppliers.find(
        (item) => item.id === supplierId
    );

    if (!supplier) return;

    const currentContract = contracts
        .filter((contract) => contract.supplierId === supplier.id)
        .sort((a, b) => b.startDate.localeCompare(a.startDate))
        .find((contract) => contract.status === "active");

    const hasReceipts = currentContract
        ? milkReceipts.some(
            (receipt) => receipt.contractId === currentContract.id
            )
        : false;

    setContractHasReceipts(hasReceipts);
    setCreatingContract(false);

    if (!supplier) return;

    setEditingSupplierId(supplierId);

    editForm.setFieldsValue({
        supplierName: supplier.name,
        pricePerLiter: currentContract?.pricePerLiter,
        startDate: currentContract
        ? dayjs(currentContract.startDate)
        : undefined,
        endDate: currentContract
        ? dayjs(currentContract.endDate)
        : undefined,
    });

    setEditModalOpen(true);

    };

  const handleSaveEdit = (values: {
    supplierName: string;
    pricePerLiter?: number;
    startDate?: dayjs.Dayjs;
    endDate?: dayjs.Dayjs;
    }) => {
    if (editingSupplierId === null) return;

    const supplier = suppliers.find(
        (item) => item.id === editingSupplierId
    );

    if (!supplier) return;

    // Update supplier name
    updateSupplier({
        ...supplier,
        name: values.supplierName,
    });

    // Find the supplier's current active contract
    const currentContract = contracts
        .filter(
        (contract) =>
            contract.supplierId === editingSupplierId &&
            contract.status === "active"
        )
        .sort((a, b) =>
        b.startDate.localeCompare(a.startDate)
        )[0];

    // Update the contract if one exists
    if (currentContract && !contractHasReceipts) {
        updateContract({
        ...currentContract,
        pricePerLiter: values.pricePerLiter ?? currentContract.pricePerLiter,
        startDate:
            values.startDate?.format("YYYY-MM-DD") ??
            currentContract.startDate,
        endDate:
            values.endDate?.format("YYYY-MM-DD") ??
            currentContract.endDate,
        });
    }

    setEditingSupplierId(null);
    editForm.resetFields();
    setEditModalOpen(false);
    
};

  const handleCreateNewContract = () => {
    if (editingSupplierId === null) return;

    const supplier = suppliers.find(
        (item) => item.id === editingSupplierId
    );

    if (!supplier) return;

    const currentContract = contracts
        .filter((contract) => contract.supplierId === supplier.id)
        .sort((a, b) => b.startDate.localeCompare(a.startDate))
        .find((contract) => contract.status === "active");

    if (!currentContract) return;

    // Close the old contract.
    updateContract({
        ...currentContract,
        status: "completed",
    });

    // Create a new contract with the values currently in the form.
    const values = editForm.getFieldsValue();

    addContract({
        id: Date.now(),
        supplierId: supplier.id,
        pricePerLiter: values.pricePerLiter,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        status: "active",
    });

    setCreatingContract(false);
    setContractHasReceipts(false);
    setEditModalOpen(false);
    setEditingSupplierId(null);
    editForm.resetFields();
  };

  const handleAddSupplier = (values: {
    name: string;
    phone?: string;
    }) => {
    addSupplier({
        id: Date.now(),
        name: values.name,
        phone: values.phone,
        status: "active",
    });

    setAddSupplierModalOpen(false);
    addSupplierForm.resetFields();
  };

  const filteredSupplierHistory = supplierHistory.filter(
    ({ supplier }) => {
        const search = supplierSearch.trim().toLowerCase();

        if (!search) return true;

        return (
        supplier.name.toLowerCase().includes(search) ||
        supplier.phone?.toLowerCase().includes(search)
        );
    }
  );

  return (
    <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 32 }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                }}
                >
                <Title level={2} style={{ margin: 0 }}>
                    Milk Supplier History
                </Title>

                <Button 
                    onClick={() => navigate("/receive-stock")}
                    icon={<ArrowLeftOutlined />}
                >
                    Back
                </Button>
                </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                width: "100%",
            }}
            >
            <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Search supplier by name or phone..."
                value={supplierSearch}
                onChange={(e) => setSupplierSearch(e.target.value)}
                size="large"
                style={{ flex: 1 }}
            />

            <Button
                type="primary"
                size="large"
                onClick={() => setAddSupplierModalOpen(true)}
            >
                Add Supplier
            </Button>
          </div>
        </div>
        <Space
            direction="vertical"
            size={16}
            style={{ width: "100%" }}
        >
        <Typography.Title level={4} style={{ marginTop: 24 }}>
            Active Suppliers
        </Typography.Title>
        
        {filteredSupplierHistory.map(
            ({
                supplier,
                receipts,
                totalQuantity,
                totalAmount,
                currentContract,
            }) => {
            const isExpanded = expandedSuppliers.includes(
              supplier.id
            );

            return (
              <Card
                key={supplier.id}
                hoverable
                onClick={() => toggleSupplier(supplier.id)}
                style={{ cursor: "pointer" }}
              >
                <Space
                  direction="vertical"
                  size={12}
                  style={{ width: "100%" }}
                >
                  <Space
                    style={{
                        width: "100%",
                        justifyContent: "space-between",
                    }}
                    >
                    <Text strong style={{ fontSize: 18 }}>
                        {supplier.name}
                    </Text>

                    <Space>
                        <Button
                            size="small"
                            type="text"
                            icon={<EditOutlined />}
                            onClick={(event) => {
                            event.stopPropagation();
                            handleEditSupplier(supplier.id);
                            }}
                        >
                            Edit
                        </Button>

                        <Button
                            size="small"
                            danger={supplier.status === "active"}
                            type="text"
                            onClick={(event) => {
                            event.stopPropagation();
                            toggleSupplierStatus(supplier.id);
                            }}
                        >
                            {supplier.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </Button>

                        <Text style={{ fontSize: 20 }}>
                            {isExpanded ? (
                            <DownOutlined />
                            ) : (
                            <RightOutlined />
                            )}
                        </Text>
                        </Space>
                    </Space>

                  <Space direction="vertical" size={4}>
                    {currentContract ? (
                        <>
                        <Space>
                            <Text type="secondary">
                            Contract:
                            </Text>

                            <Tag color="blue">
                            {currentContract.pricePerLiter} ETB / L
                            </Tag>
                        </Space>

                        <Text type="secondary">
                            Contract period:{" "}
                            {currentContract.startDate} →{" "}
                            {currentContract.endDate}
                        </Text>
                        <Space>
                            <Text type="secondary">
                                Contract amount:
                            </Text>

                            <Tag color="gold">
                                {totalAmount} ETB
                            </Tag>
                        </Space>
                        </>
                    ) : (
                        <Text type="secondary">
                        No active contract
                        </Text>
                    )}

                    <Space>
                        <Text type="secondary">
                        Total received:
                        </Text>

                        <Tag color="green">
                        {totalQuantity} L
                        </Tag>
                    </Space>
                    </Space>

                  {isExpanded && (
                    <div
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
                      {receipts.length === 0 ? (
                        <Empty
                          description="No milk received from this supplier yet"
                        />
                      ) : (
                        <Collapse
                          items={[
                            {
                              key: "history",
                              label: "Receive History",
                              children: (
                                <Space
                                  direction="vertical"
                                  style={{
                                    width: "100%",
                                  }}
                                  size={8}
                                >
                                  {receipts.map((receipt) => (
                                    <Card
                                      key={receipt.id}
                                      size="small"
                                    >
                                      <Space
                                        style={{
                                          width: "100%",
                                          justifyContent:
                                            "space-between",
                                        }}
                                      >
                                        <Text>
                                          {receipt.date}
                                        </Text>

                                        <Text>
                                          {receipt.session ===
                                          "morning"
                                            ? "Morning"
                                            : "Afternoon"}
                                        </Text>

                                        <Text strong>
                                          {receipt.quantity} L
                                        </Text>
                                      </Space>
                                    </Card>
                                  ))}
                                </Space>
                              ),
                            },
                          ]}
                        />
                      )}
                    </div>
                  )}
                </Space>
              </Card>
            );
          }
        
        )}

        {deactivatedSupplierHistory.map(
            ({ supplier, receipts, totalQuantity, totalAmount }) => {
                const isExpanded = expandedSuppliers.includes(supplier.id);

                return (
                    <Card
                        key={supplier.id}
                        hoverable
                        onClick={() => toggleSupplier(supplier.id)}
                        style={{
                        width: "100%",
                        cursor: "pointer",
                        background: "#F5F5F5",
                        border: "1px solid #D9D9D9",
                        }}
                    >
                        <Space
                        direction="vertical"
                        size={12}
                        style={{ width: "100%" }}
                        >
                        {/* Supplier header */}
                        <Space
                            style={{
                            width: "100%",
                            justifyContent: "space-between",
                            }}
                        >
                        <Space size={12}>
                            <Space direction="vertical" size={4}>
                                <Space size={8}>
                                    <Text
                                    strong
                                    style={{
                                        fontSize: 17,
                                        color: "#8C8C8C",
                                    }}
                                    >
                                    {supplier.name}
                                    </Text>

                                    <Tag
                                    color="error"
                                    style={{
                                        fontWeight: 600,
                                        margin: 0,
                                    }}
                                    >
                                    DEACTIVATED
                                    </Tag>
                                </Space>

                                <Text type="secondary">
                                    Supplier is currently inactive
                                </Text>
                                </Space>
                            </Space>

                            <Space>
                            <Button
                                size="small"
                                type="text"
                                onClick={(event) => {
                                event.stopPropagation();
                                toggleSupplierStatus(supplier.id);
                                }}
                            >
                                Activate
                            </Button>
                            <Text style={{ fontSize: 20 }}>
                                {isExpanded ? (
                                    <DownOutlined />
                                ) : (
                                    <RightOutlined />
                                )}
                            </Text>
                            </Space>
                        </Space>

                        {/* Historical summary */}
                        <Space direction="vertical" size={4}>
                            <Space>
                            <Text type="secondary">
                                Total received:
                            </Text>

                            <Tag color="green">
                                {totalQuantity} L
                            </Tag>
                            </Space>

                            <Space>
                            <Text type="secondary">
                                Historical amount:
                            </Text>

                            <Tag color="gold">
                                {totalAmount} ETB
                            </Tag>
                            </Space>
                        </Space>

                        {/* Expanded history */}
                        {isExpanded && (
                            <div
                            style={{ marginTop: 8 }}
                            onClick={(event) => event.stopPropagation()}
                            >
                            {receipts.length === 0 ? (
                                <Empty
                                description="No milk received from this supplier"
                                />
                            ) : (
                                <Collapse
                                items={[
                                    {
                                    key: "history",
                                    label: "Receive History",
                                    children: (
                                        <Space
                                        direction="vertical"
                                        style={{ width: "100%" }}
                                        size={8}
                                        >
                                        {receipts.map((receipt) => (
                                            <Card
                                            key={receipt.id}
                                            size="small"
                                            >
                                            <Space
                                                style={{
                                                width: "100%",
                                                justifyContent:
                                                    "space-between",
                                                }}
                                            >
                                                <Text>
                                                {receipt.date}
                                                </Text>

                                                <Text>
                                                {receipt.session ===
                                                "morning"
                                                    ? "Morning"
                                                    : "Afternoon"}
                                                </Text>

                                                <Text strong>
                                                {receipt.quantity} L
                                                </Text>
                                            </Space>
                                            </Card>
                                        ))}
                                        </Space>
                                    ),
                                    },
                                ]}
                                />
                            )}
                            </div>
                        )}
                        </Space>
                    </Card>
                );
            }
        )}

        {supplierHistory.length === 0 && (
          <Empty description="No active milk suppliers" />
        )}
      </Space>
      <Modal
        title={
            creatingContract
                ? "Create New Milk Contract"
                : "Edit Milk Supplier"
            }
        open={editModalOpen}
        onCancel={() => {
            setEditModalOpen(false);
            setEditingSupplierId(null);
            editForm.resetFields();
        }}
        onOk={() => {
            if (creatingContract) {
                handleCreateNewContract();
            } else {
                editForm.submit();
            }
        }}
        okText={creatingContract ? "Create Contract" : "Save Changes"}
        >
        <Form
            form={editForm}
            layout="vertical"
            onFinish={handleSaveEdit}
        >
            <Form.Item
            name="supplierName"
            label="Supplier Name"
            rules={[
                {
                required: true,
                message: "Please enter the supplier name",
                },
            ]}
            >
            <Input />
            </Form.Item>

            {contractHasReceipts && !creatingContract && (
                <Typography.Text type="warning">
                    This contract has receiving history. Its financial terms are locked.
                    Create a new contract if the price or contract dates have changed.
                </Typography.Text>
            )}
            <Form.Item
            name="pricePerLiter"
            label="Price per Liter"
            rules={[
                {
                required: true,
                message: "Please enter the price per liter",
                },
            ]}
            >
            <InputNumber
                min={0}
                style={{ width: "100%" }}
                addonAfter="ETB/L"
                disabled={contractHasReceipts && !creatingContract}
            />
            </Form.Item>

            <Form.Item
            name="startDate"
            label="Contract Start Date"
            rules={[
                {
                required: true,
                message: "Please select the start date",
                },
            ]}
            >
            <DatePicker 
                style={{ width: "100%" }}
                disabled={contractHasReceipts && !creatingContract}
            />
            </Form.Item>

            <Form.Item
            name="endDate"
            label="Contract End Date"
            rules={[
                {
                required: true,
                message: "Please select the end date",
                },
            ]}
            >
            <DatePicker
                style={{ width: "100%" }}
                disabled={contractHasReceipts && !creatingContract}
            />
            </Form.Item>
        </Form>
        {contractHasReceipts && !creatingContract && (
            <Button
                onClick={() => setCreatingContract(true)}
            >
                Create New Contract
            </Button>
        )}
      </Modal>
      <Modal
        title="Add Milk Supplier"
        open={addSupplierModalOpen}
        onCancel={() => {
            setAddSupplierModalOpen(false);
            addSupplierForm.resetFields();
        }}
        onOk={() => addSupplierForm.submit()}
        okText="Add Supplier"
        >
        <Form
            form={addSupplierForm}
            layout="vertical"
            onFinish={handleAddSupplier}
        >
            <Form.Item
                name="name"
                label="Supplier Name"
                rules={[
                  {
                    required: true,
                    message: "Please enter the supplier name",
                  },
                ]}
            >
                <Input placeholder="Enter supplier name" />
            </Form.Item>

            <Form.Item
                name="phone"
                label="Phone Number"
            >
                <Input placeholder="Enter phone number" />
            </Form.Item>
            </Form>
        </Modal>
     </div>
  );
}

export default MilkSupplierHistory;