import { MAX_CHECKOUT_COUNT, TRADE_STATE } from "@/utils/constants";
import { request } from "@/utils/request";
import { Modal } from "antd";
import { QRCode } from "react-qrcode-logo";

function scanQRCodePay({ orderNo, code_url, callback = () => {} }) {
  const modal = Modal.info({
    title: "请支付",
    content: <QRCode value={code_url} />,
    okText: "取消",
    width: 280,
    onOk: () => {
      closeModal();
    },
  });
  const closeModal = () => {
    modal.destroy();
    callback?.();
    clearTimeout(timer!);
  };
  let timer: NodeJS.Timeout | null = null;
  let checkCount = 0;

  const queryOrders = () => {
    timer = setTimeout(() => {
      //如果检查次数已经大于最大检查次数，直接关闭跳回订单页
      if (++checkCount > MAX_CHECKOUT_COUNT) {
        closeModal();
      }
      request
        .fetch({
          url: `/api/payment/order/${orderNo}`,
        })
        .then((res: any) => {
          if (res.trade_state !== TRADE_STATE.NOTPAY) {
            closeModal();
            return;
          }
          queryOrders();
        })
        .catch((error) => {
          console.error("查询订单支付失败", error);
          closeModal();
        });
    }, 3000);
  };
  queryOrders();
}

export { scanQRCodePay };
