import MainLayout from "./MainLayout.tsx";
import CreateNewRoomButton from "./CreateNewRoomButton.tsx";

const Index = () => {
    return <MainLayout>
        <div className={"w-56"}>
            <CreateNewRoomButton />
        </div>
    </MainLayout>
}

export default Index;