import { Button, Form, Input, Typography } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

function Login() {
  const navigate = useNavigate();

  const handleLogin = (values: LoginFormValues) => {
    console.log("Login values:", values);

    // Temporary navigation.
    // Later this will call our backend.
    navigate("/dashboard");
  };

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
          boxShadow: "0 4px 20px rgba(31, 94, 133, 0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
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
            }}
          >
            Sign in to manage your shop
          </Text>
        </div>

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={handleLogin}
          requiredMark={false}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email",
              },
              {
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: "12px" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Text style={{ color: "#607D8B" }}>
            Don't have an account?{" "}
          </Text>

          <Button
            type="link"
            style={{
              padding: 0,
              color: "#3A86B8",
            }}
            onClick={() => navigate("/signup")}
          >
            Sign up
          </Button>
        </div>
      </section>
    </main>
  );
}

export default Login;