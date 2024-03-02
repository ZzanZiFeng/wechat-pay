import { useEffect, useState } from "react";
import { request } from "@/utils/request";
import { Card, Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { scanQRCodePay } from "./helpers";

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const fetchProducts = () => {
    request.fetch({ url: "/api/products" }).then((res: any) => {
      setProducts(res);
    });
  };
  useEffect(fetchProducts, []);
  const handleBuy = (product) => {
    request
      .fetch({
        url: `/api/payment/native/${product.id}`,
        method: "Get",
      })
      .then((res: any) => {
        const { orderNo, code_url } = res;
        scanQRCodePay({
          orderNo,
          code_url,
          // callback: () => navigate("/orders"),
        });
      })
      .catch((error) => {
        console.log(`下单失败`, error);
        Modal.error({
          title: "下单失败",
          content: "无法下单，清稍后重试",
        });
      });
  };
  return (
    <>
      {products.map((product) => (
        <Card
          key={product.id}
          hoverable
          style={{ width: 240, float: "left", margin: "16px" }}
          cover={<img alt="example" src={product.cover} />}
          actions={[
            <Button type="primary" onClick={() => handleBuy(product)}>
              购买
            </Button>,
          ]}
        >
          <Card.Meta
            title={product.name}
            description={`价格：￥${(product.price / 100).toFixed(2)}`}
          ></Card.Meta>
        </Card>
      ))}
    </>
  );
}

export default Products;
