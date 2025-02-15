import MainLayout from "./MainLayout.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect} from "react";
import CreateNewRoomButton from "./CreateNewRoomButton.tsx";
import ItemTable from "./ItemTable.tsx";
import {useBridge} from "../contexts/BridgeContext.tsx";
import axios from "axios";
import PasteTable from "./PasteTable.tsx";

const BACKEND_URL: string = import.meta.env.VITE_BACKEND_ORIGIN
const FRONTEND_URL: string = import.meta.env.VITE_FRONTEND_ORIGIN

const RoomPage = () => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const {bridgeUrlCopied, setBridgeUrlCopied} = useBridge();
    
    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/Rooms/exists/${roomId}`)
            .then(r => {
                if (!r.data){
                    navigate(`/room-expired/${roomId}`)
                }
            });
    }, [])

    const onCopyRoomUrl = async () => {
        await navigator.clipboard.writeText(`${FRONTEND_URL}/${roomId}`);
        setBridgeUrlCopied(true)
    }

    return <MainLayout>
        <div className={"flex flex-row w-full justify-center"}>
            <img alt={'qr'} className={"w-56 m-5"} src={`${BACKEND_URL}/api/Rooms/qr/${roomId}`}/>
        </div>
        <div className={"w-full flex flex-col"}>
            <ItemTable roomId={roomId as string} />
            <PasteTable roomId={roomId as string} />
        </div>
        <button className={`${bridgeUrlCopied ? 'copied-btn-theme' : 'new-room-btn'} w-full mt-3`} onClick={onCopyRoomUrl}>
            <p className={"w-full h-full block p-3"}>
                { bridgeUrlCopied ? 'Copied!' : 'Copy bridge URL' }
            </p>
        </button>
        <div className={"mt-3 w-full"}>
            <CreateNewRoomButton />
        </div>
    </MainLayout>
}

export default RoomPage;