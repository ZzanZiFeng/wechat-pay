import { useState, useEffect } from "react";
import { Table, Button, Tag, message, Space } from "antd";
import { request } from "@/utils/request";
import { ORDER_STATUS } from "@/utils/constants";
import { scanQRCodePay } from "./helpers";
function Order() {
  const [orders, setOrders] = useState([]);
  const fetchOrders = () => {
    request
      .fetch({
        url: "/api/orders",
      })
      .then((res: any) => {
        setOrders(res);
      })
      .catch((error) => {
        console.error("获取订单失败:", error);
        message.error("获取订单失败");
      });
  };
  useEffect(fetchOrders, []);
  const closeOrder = (orderNo) => {
    request
      .fetch({
        url: `/api/payment/order/${orderNo}/close`,
      })
      .then(
        () => {
          fetchOrders();
          message.success("订单关闭成功");
        },
        () => {
          message.error("订单关闭成功");
          console.log(`订单关闭失败`);
        }
      );
  };
  function formatDateTime(str) {
    if (!str) return "";
    const date = new Date(str);
    const pad = (number) => number.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // JavaScript中的月份是从0开始的
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  const columns = [
    { title: "订单号", dataIndex: "id", key: "id" },
    {
      title: "产品",
      dataIndex: "product",
      key: "product",
      render: (product) => product?.name,
    },
    {
      title: "总费用",
      dataIndex: "product",
      key: "price",
      render: (val) => <span>￥{(val.price / 100).toFixed(2)}</span>,
    },
    {
      title: "更新时间",
      dataIndex: "product",
      key: "updatedAt",
      render: (product) => {
        return formatDateTime(product?.updatedAt);
      },
    },
    {
      title: "更新时间2",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (val) => formatDateTime(val),
    },

    {
      title: "状态",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (text) => {
        switch (text) {
          case ORDER_STATUS.PAID:
            return <Tag color={"green"}>支付成功</Tag>;
          case ORDER_STATUS.UN_PAID:
            return <Tag color={"orange"}>未支付</Tag>;
          case ORDER_STATUS.CLOSE:
            return <Tag color={"red"}>已关闭</Tag>;
          default:
            return <Tag>{text}</Tag>;
        }
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        if (record.orderStatus === ORDER_STATUS.UN_PAID) {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() =>
                  scanQRCodePay({
                    orderNo: record.id,
                    code_url: record.code_url,
                    callback: fetchOrders,
                  })
                }
              >
                继续支付
              </Button>
              <Button danger size="small" onClick={() => closeOrder(record.id)}>
                关闭订单
              </Button>
            </Space>
          );
        } else {
          return null;
        }
      },
    },
  ];
  return (
    <div style={{ padding: 24 }}>
      <Table columns={columns} dataSource={orders} rowKey="id" />
    </div>
  );
}
export default Order;
