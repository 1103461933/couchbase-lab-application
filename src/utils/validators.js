const Joi = require('joi');

const customerSchema = Joi.object({
  customerId: Joi.string().required().pattern(/^[A-Z0-9-]+$/),
  firstName: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  email: Joi.string().required().email(),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/),
  country: Joi.string().required(),
  city: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive', 'suspended'),
  createdAt: Joi.string().isoDate()
});

const orderSchema = Joi.object({
  orderId: Joi.string().required().pattern(/^[A-Z0-9-]+$/),
  customerId: Joi.string().required(),
  orderDate: Joi.string().isoDate(),
  status: Joi.string().valid('pending', 'processing', 'completed', 'shipped', 'cancelled'),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().required().min(1),
      unitPrice: Joi.number().required().min(0)
    })
  ).required().min(1),
  shippingAddress: Joi.string(),
  paymentId: Joi.string()
});

const productSchema = Joi.object({
  productId: Joi.string().required().pattern(/^[A-Z0-9-]+$/),
  name: Joi.string().required().min(2).max(100),
  category: Joi.string().required(),
  price: Joi.number().required().min(0),
  description: Joi.string().max(500),
  createdAt: Joi.string().isoDate()
});

function validateCustomer(data) {
  return customerSchema.validate(data, { abortEarly: false });
}

function validateOrder(data) {
  return orderSchema.validate(data, { abortEarly: false });
}

function validateProduct(data) {
  return productSchema.validate(data, { abortEarly: false });
}

module.exports = {
  validateCustomer,
  validateOrder,
  validateProduct
};