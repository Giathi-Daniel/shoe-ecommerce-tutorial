exports.calculateTotal = (cart) => {
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}