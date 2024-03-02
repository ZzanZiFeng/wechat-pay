import { Layout, Menu } from "antd";
import { NavLink, useLocation } from "react-router-dom";
const { Header } = Layout;

function AppHeader() {
  //获取当前路径
  const location = useLocation();
  const menItems = [
    { key: "/", label: <NavLink to="/">商品列表</NavLink> },
    { key: "/orders", label: <NavLink to="/orders">订单管理</NavLink> },
  ];
  return (
    <Header style={{ background: "#fff", padding: 0 }}>
      <Menu
        theme="dark"
        mode="horizontal"
        items={menItems}
        defaultSelectedKeys={[location.pathname]}
        selectedKeys={[location.pathname]}
      ></Menu>
    </Header>
  );
}
export default AppHeader;
