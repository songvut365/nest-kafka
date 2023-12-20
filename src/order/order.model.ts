export type OrderMessage = {
  orderId: string;
  customerId: string;
  items: OrderItem[];
  timestamp: string;
};

export type OrderItem = {
  productId: string;
  amount: number;
};

export type OrderResult = {
  code: number;
  description: string;
  orderRequest?: OrderMessage;
};
