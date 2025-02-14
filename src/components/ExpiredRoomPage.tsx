import MainLayout from "./MainLayout.tsx";

const ExpiredRoomPage = () => {
    return <MainLayout>
        <h1 className={"p-5"}>
            This room has expired
        </h1>
        <button className={"new-room-btn"}>
            <a href={"/"} className={"w-full h-full block"}>
                Create new room
            </a>
        </button>
    </MainLayout>
}

export default ExpiredRoomPage;