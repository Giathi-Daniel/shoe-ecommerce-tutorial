exports.calculateTotal = (cart) => {
    if (!cart || !Array.isArray(cart.items)) return 0;

    return cart.items.reduce((sum, item) => {
        const product = item.productId;
        const price = product?.price || 0;
        return sum + (price * item.quantity);
    }, 0);
};