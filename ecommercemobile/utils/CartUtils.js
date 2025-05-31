// Hàm tăng số lượng
export const handleIncreaseQuantity = (quantity) => {
    const newQuantity = quantity + 1;
    console.log("Tăng số lượng:", newQuantity);
    return newQuantity;
};

// Hàm giảm số lượng
export const handleDecreaseQuantity = (quantity) => {
    if (quantity > 1) {
        const newQuantity = quantity - 1;
        console.log("Giảm số lượng:", newQuantity);
        return newQuantity;
    }
    return quantity;
}; 