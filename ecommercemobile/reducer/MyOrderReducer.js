export const initialOrderState = {
   orders: [],
   loading: false,
   error: null,
};

const MyOrderReducer = (state, action) => {
    switch (action.type) {
        case "set_order":
            return { ...state, orders: action.payload };
        case "set_order_loading":
            return { ...state, loading: action.payload };
        case "set_order_error":
            return { ...state, error: action.payload };
        case "reset_order":
            return initialOrderState;
        case "add_order":
            return { ...state, orders: [...state.orders, action.payload] };
        case "remove_order":
            return { ...state, orders: state.orders.filter(order => order.id !== action.payload) };
        case "cancel_order":
            return {
                ...state,
                orders: state.orders.map(order =>
                  order.id === action.payload.id ? action.payload : order
                )
              };
        default:
            return state;
    } 
};

export default MyOrderReducer;
