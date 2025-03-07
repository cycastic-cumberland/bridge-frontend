import {ReactNode} from "react";
import Index from "./components/Index";
import RoomPage from "./components/RoomPage.tsx";
import ExpiredRoomPage from "./components/ExpiredRoomPage.tsx";
import NewRoomPage from "./components/NewRoomPage.tsx";

export type RouteInfo = { index?: boolean, path?: string, element: ReactNode };

export const AppRoutes : RouteInfo[] = [
    {
        element: <Index />,
        index: true
    },
    {
        element: <NewRoomPage/>,
        path: '/new-room'
    },
    {
        element: <RoomPage/>,
        path: "/:roomId"
    },
    {
        element: <ExpiredRoomPage/>,
        path: "/room-expired/:roomId"
    }
]