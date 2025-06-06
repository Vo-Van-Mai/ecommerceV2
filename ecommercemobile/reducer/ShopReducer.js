export const initialShopState = {
    shop: null
};

const ShopReducer = (state, action) => {
    switch (action.type) {
        case "set_shop":
            return { ...state, shop: action.payload };
    }
}

export default ShopReducer;