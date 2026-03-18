import { io } from "socket.io-client";
import { BASE_URL } from "../constants/commonData";

export const createSocketConnection = (token) => {
    return io(BASE_URL, {
        withCredentials: true, 
        auth: {
            token 
        },
        transports: ["websocket"] 
    });
};