export const initialCartState = {
    items: [],
    total_items: 0,
    total_quantity: 0,
    total_price: 0,
    total_discount: 0,
    total_tax: 0,
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case "set_cart":
            return {
                ...state,
                items: action.payload.items || [],
                total_items: action.payload.total_items || 0,
                total_quantity: action.payload.total_quantity || 0,
                total_price: action.payload.total_price || 0,
                total_discount: action.payload.total_discount || 0,
                total_tax: action.payload.total_tax || 0,
            };

            case "add_item": {
                const itemToAdd = action.payload;
                const existingItemIndex = state.items.findIndex(item => item.id === itemToAdd.id);
            
                let updatedItems;
            
                if (existingItemIndex >= 0) {
                    // Item đã có trong giỏ, cập nhật quantity
                    updatedItems = [...state.items];
                    updatedItems[existingItemIndex] = {
                        ...updatedItems[existingItemIndex],
                        quantity: updatedItems[existingItemIndex].quantity + (itemToAdd.quantity || 1)
                    };
                } else {
                    // Thêm mới item
                    updatedItems = [...state.items, itemToAdd];
                }
            
                // Tính lại tổng số lượng và tổng tiền (nên tính lại từ đầu để tránh sai số)
                const total_quantity = updatedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                const total_price = updatedItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
            
                return {
                    ...state,
                    items: updatedItems,
                    total_quantity,
                    total_price,
                    total_items: updatedItems.length,
                };
            }

        case "remove_item": {
            const filteredItems = state.items.filter(item => item.id !== action.payload.id);
            const removedItem = state.items.find(item => item.id === action.payload.id);
            const quantityRemoved = removedItem?.quantity || 1;
            const priceRemoved = (removedItem?.price || 0) * quantityRemoved;

            return {
                ...state,
                items: filteredItems,
                total_quantity: state.total_quantity - quantityRemoved,
                total_price: state.total_price - priceRemoved,
                total_items: filteredItems.length,
            };
        }

        case "clear_cart":
            return { ...initialCartState };

        default:
            return state;
    }
};

export default cartReducer;
