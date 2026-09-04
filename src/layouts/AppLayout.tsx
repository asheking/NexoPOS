import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Layout,
  Typography,
  Button,
  Drawer,
  Menu,
} from "antd";
import {
  MenuOutlined,
  BellOutlined,
  DashboardOutlined,
  InboxOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  DollarOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();

  const openDrawer = () => {
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5FAFC",
      }}
    >
      {/* HEADER */}
      <Header
        style={{
          height: "64px",
          padding: "0 16px",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #DCE8EE",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Hamburger */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={openDrawer}
          aria-label="Open menu"
          style={{
            width: "44px",
            height: "44px",
            color: "#1F5E85",
            fontSize: "20px",
          }}
        />

        {/* Shop name */}
        <Text
          strong
          style={{
            color: "#1F5E85",
            fontSize: "18px",
          }}
        >
          Enat Milk Shop
        </Text>

        {/* Notification */}
        <Button
          type="text"
          icon={<BellOutlined />}
          aria-label="Notifications"
          style={{
            width: "44px",
            height: "44px",
            color: "#1F5E85",
            fontSize: "19px",
          }}
        />
      </Header>

      {/* DRAWER */}
      <Drawer
        title={
          <div>
            <div
              style={{
                color: "#1F5E85",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              Enat Milk Shop
            </div>

            <div
              style={{
                color: "#607D8B",
                fontSize: "13px",
                marginTop: "4px",
                fontWeight: 400,
              }}
            >
              Superadmin
            </div>
          </div>
        }
        placement="left"
        onClose={closeDrawer}
        open={drawerOpen}
        width={280}
        styles={{
          body: {
            padding: "8px 0",
          },
        }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          onClick={({ key }) => {
            const routes: Record<string, string> = {
              dashboard: "/dashboard",
              products: "/products",
              "receive-stock": "/receive-stock",
              production: "/production",
              "inventory-overview": "/inventory",
              sales: "/sales",
              "milk-contracts": "/milk-contracts",
              finance: "/finance",
              workers: "/workers",
              settings: "/settings",
            };

            const route = routes[key];

            if (route) {
              navigate(route);
              closeDrawer();
            }
          }}
          items={[
            {
              key: "dashboard",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "inventory",
              icon: <InboxOutlined />,
              label: "Inventory",
              children: [
                {
                  key: "products",
                  label: "Product Definition",
                },
                {
                  key: "receive-stock",
                  label: "Receive Stock",
                },
                {
                  key: "production",
                  label: "Production",
                },
                {
                  key: "inventory-overview",
                  label: "Inventory Overview",
                },
              ],
            },
            {
              key: "sales",
              icon: <ShoppingOutlined />,
              label: "Sales",
            },
            {
              key: "milk-contracts",
              icon: <FileTextOutlined />,
              label: "Milk Contracts",
            },
            {
              key: "finance",
              icon: <DollarOutlined />,
              label: "Finance",
            },
            {
              key: "workers",
              icon: <TeamOutlined />,
              label: "Workers",
            },
            {
              key: "settings",
              icon: <SettingOutlined />,
              label: "Settings",
            },
          ]}
        />

        {/* Logout */}
        <div
          style={{
            borderTop: "1px solid #DCE8EE",
            marginTop: "16px",
            paddingTop: "8px",
          }}
        >
          <Menu
            mode="inline"
            items={[
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Logout",
                danger: true,
              },
            ]}
          />
        </div>
      </Drawer>

      {/* PAGE CONTENT */}
      <Content
        style={{
          padding: "16px",
          backgroundColor: "#F5FAFC",
        }}
      >
        {children}
      </Content>
    </Layout>
  );
}

export default AppLayout;