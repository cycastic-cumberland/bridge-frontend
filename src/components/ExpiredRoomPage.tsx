import MainLayout from "./MainLayout.tsx";
import CreateNewRoomButton from "./CreateNewRoomButton.tsx";

const ExpiredRoomPage = () => {
    return <MainLayout>
        <h1 className={"p-5"}>
            This bridge has expired
        </h1>
        <CreateNewRoomButton />
    </MainLayout>
}

export default ExpiredRoomPage;