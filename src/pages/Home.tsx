import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

function Home() {
  const navigate = useNavigate();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5FAFC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "390px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #DCE8EE",
          borderRadius: "16px",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <Title
          level={2}
          style={{
            color: "#1F5E85",
            marginBottom: "8px",
          }}
        >
          Enat Milk Shop
        </Title>

        <Text
          style={{
            color: "#607D8B",
            display: "block",
            marginBottom: "24px",
          }}
        >
          Simple business management for your shop.
        </Text>

        <Button
          type="primary"
          size="large"
          block
          onClick={() => navigate("/login")}
        >
          Get Started
        </Button>
      </section>
    </main>
  );
}

export default Home;