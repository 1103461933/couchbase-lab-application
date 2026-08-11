function createOrder({
  id,
  customerId,
  products = [],
  total = 0,
  status = 'pending',
}) {
  return {
    type: 'order',
    id,
    customerId,
    products,
    total,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  createOrder,
};