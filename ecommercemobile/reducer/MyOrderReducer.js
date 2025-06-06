export const initialOrderState = {
    orders: {
        count: 0,
        next: null,
        previous: null,
        results: []
    },
    loading: false,
    error: null
};

const MyOrderReducer = (state, action) => {
    switch (action.type) {
        case "set_order":
            return { 
                ...state, 
                orders: action.payload
            };
            
        case "add_more_order":
            return {
                ...state,
                orders: {
                    ...action.payload,
                    results: [
                        ...state.orders.results,
                        ...action.payload.results
                    ]
                }
            };

        case "reset_order":
            return initialOrderState;

        case "add_order":
            return { ...state, orders: [...state.orders.results, action.payload] };
  
        case "remove_order":
            return {
                ...state,
                orders: {
                    ...state.orders,
                    results: state.orders.results.filter(order => order.id !== action.payload)
                }
            };

        case "cancel_order":
        case "confirm_order":
            return {
                ...state,
                orders: {
                    ...state.orders,
                    results: state.orders.results.map(order =>
                        order.id === action.payload.id ? action.payload : order
                    )
                }
            };
        case "confirm_order_shipping":
            return {
                ...state,
                orders: {
                    ...state.orders,
                    results: state.orders.results.map(order =>
                        order.id === action.payload.id ? action.payload : order
                    )
                }
            }

        default:
            return state;
    }
};

export default MyOrderReducer;
