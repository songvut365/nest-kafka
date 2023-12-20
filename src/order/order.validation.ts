import { OrderMessage } from './order.model';

function validateRequiredField(value: string, fieldName: string): void {
  if (value.length <= 0) {
    throw new Error(`${fieldName} is required`);
  }
}

export function validateOrderMessage(orderMessage: OrderMessage): void {
  if (!orderMessage) {
    throw new Error('order request message is undefined');
  }

  if (orderMessage.items.length <= 0) {
    throw new Error(`order items cannot be zero`);
  }

  for (let item of orderMessage.items) {
    if (item.amount <= 0) {
      throw new Error(`amount of order items can not be or less than zero`);
    }

    validateRequiredField(item.productId, 'productId');
  }

  validateRequiredField(orderMessage.orderId, 'orderId');
  validateRequiredField(orderMessage.customerId, 'customerId');
}
