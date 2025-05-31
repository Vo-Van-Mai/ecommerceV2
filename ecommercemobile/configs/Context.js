import { createContext } from "react";

export const MyUserContext = createContext();
export const MyDispatchContext = createContext();
export const MyCartContext = createContext(); // chứa thông tin mảng sản phẩm
export const MySetCartContext = createContext(); //hàm dùng để cập nhật giỏ hàng