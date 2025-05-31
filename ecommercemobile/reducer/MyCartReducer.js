export const inittialCartState = [];

export default (state, action) => {
    switch(action.type){
        case "set_cart":
            return action.payload;
        case "add":
            return [...state, ...action.payload];
        case "remove_item": 
            return state.filter(item => item.id !== action.payload.id);
        case "clear_cart":
            return [];
    }
    return state;
}