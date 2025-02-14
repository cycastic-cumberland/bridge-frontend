const CreateNewRoomButton = () => {
    return <button className={"new-room-btn w-full"}>
        <a href={"/new-room"} className={"w-full h-full block p-3"}>
            Create new bridge
        </a>
    </button>
}

export default CreateNewRoomButton;