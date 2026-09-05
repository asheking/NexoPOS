import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/admin/Dashboard";
import ProductDefinition from "./pages/admin/ProductDefinition";
import ReceiveStock from "./pages/admin/RestockPage/ReceiveStock";
import Production from "./pages/admin/Production/Production";
import Inventory from "./pages/admin/Inventory";
import Sales from "./pages/admin/Sales";
import MilkContracts from "./pages/admin/MilkContracts";
import Finance from "./pages/admin/Finance";
import Workers from "./pages/admin/Workers";
import Settings from "./pages/admin/Settings";
import TypeConfiguration from "./pages/admin/TypeConfiguration";
import ProductInformation from "./pages/admin/ProductInformation";
import CategoryManagement from "./pages/admin/CategoryManagement";
import { CategoryProvider } from "./context/CategoryContext";
import { ProductProvider } from "./context/ProductContext";
import { SupplierProvider } from "./context/SupplierContext";
import { SupplierContractProvider } from "./context/SupplierContractContext";
import { MilkReceiptProvider } from "./context/MilkReceiptContext";
import { StockReceiptProvider } from "./context/StockReceiptContext";
import { ProductionProvider } from "./context/ProductionContext";
import { InventoryProvider } from "./context/InventoryContext";
import { SalesProvider } from "./context/SalesContext";
import MilkSupplierHistory from "./pages/admin/RestockPage/MilkSupplierHistory";

import AppLayout from "./layouts/AppLayout";

function App() {
  return (
    <BrowserRouter>
     <CategoryProvider>
      <ProductProvider>
        <SupplierProvider>
          <SupplierContractProvider>
            <MilkReceiptProvider>
              <StockReceiptProvider>
                <ProductionProvider>
                  <SalesProvider>
                    <InventoryProvider>
                      <Routes>

                        {/* Public */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />

                        {/* Superadmin */}
                        <Route
                          path="/dashboard"
                          element={
                            <AppLayout>
                              <Dashboard />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/products"
                          element={
                            <AppLayout>
                              <ProductDefinition />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/categories"
                          element={
                            <AppLayout>
                              <CategoryManagement />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/products/:productId/info"
                          element={
                            <AppLayout>
                              <ProductInformation />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/products/:productId/types/:typeId/configuration"
                          element={
                            <AppLayout>
                              <TypeConfiguration />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/receive-stock"
                          element={
                            <AppLayout>
                              <ReceiveStock />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/milk-supplier-history"
                          element={
                            <AppLayout>
                              <MilkSupplierHistory />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/production"
                          element={
                            <AppLayout>
                              <Production />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/inventory"
                          element={
                            <AppLayout>
                              <Inventory />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/sales"
                          element={
                            <AppLayout>
                              <Sales />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/milk-contracts"
                          element={
                            <AppLayout>
                              <MilkContracts />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/finance"
                          element={
                            <AppLayout>
                              <Finance />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/workers"
                          element={
                            <AppLayout>
                              <Workers />
                            </AppLayout>
                          }
                        />

                        <Route
                          path="/settings"
                          element={
                            <AppLayout>
                              <Settings />
                            </AppLayout>
                          }
                        />

                      </Routes>
                    </InventoryProvider>
                  </SalesProvider>
                </ProductionProvider>
              </StockReceiptProvider>
            </MilkReceiptProvider>
          </SupplierContractProvider>
        </SupplierProvider>
      </ProductProvider>
     </CategoryProvider>
    </BrowserRouter>
  );
}

export default App;