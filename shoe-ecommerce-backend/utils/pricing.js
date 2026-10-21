const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING_RATE = 5.99;
const TAX_RATE = 0.08;

const round = (value) => Math.round(value * 100) / 100;

const calculatePricing = (items) => {
  const itemsPrice = round(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const shippingPrice = itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const taxPrice = round(itemsPrice * TAX_RATE);
  const totalAmount = round(itemsPrice + shippingPrice + taxPrice);

  return { itemsPrice, shippingPrice, taxPrice, totalAmount };
};

module.exports = { calculatePricing, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_RATE, TAX_RATE };
