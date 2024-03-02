import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import AppHeader from "@/components/AppHeader";
import Products from "@/pages/Products";
import Orders from "@/pages/Orders";
const { Content } = Layout;

function App() {
  const [count, setCount] = useState(0);

  return (
    <Layout>
      <AppHeader />
      <Content>
        <Routes>
          <Route path="/" element={<Products />}></Route>
          <Route path="/orders" element={<Orders />}></Route>
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
