import MainLayout from "./MainLayout.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {ChangeEvent, Dispatch, FC, RefObject, SetStateAction, useEffect, useRef, useState} from "react";
import axios, {AxiosError, AxiosProgressEvent} from 'axios';
import { FaDownload } from "react-icons/fa6";
import {Line} from "rc-progress";

const BACKEND_URL: string = import.meta.env.VITE_BACKEND_ORIGIN

type UploadPreSignedDto = {
    itemId: number,
    uploadUrl: string
}

type ItemDto = {
    id: number,
    roomId: string,
    fileName: string
}

type ItemQueryResponse = {
    items: ItemDto[],
    pageNumber: number,
    totalSize: number,
}

const useInterval = (callback: () => void, delay: number) => {
    const savedCallback: RefObject<null | (() => void)> = useRef(null);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);


    useEffect(() => {
        function tick() {
            const f = savedCallback.current;
            if (f){
                f();
            }
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

const ItemEntry: FC<{ item: ItemDto, roomId: string }> = ({ item, roomId }) => {
    const [isLoading, setLoading] = useState(false)

    const handleDownload = async () => {
        if (isLoading){
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/Items/download-presigned?roomId=${roomId}&itemId=${item.id}`)
            const link = document.createElement('a');
            // link.target = '_blank';
            link.href = response.data as string;
            link.click();
        }
        finally {
            setLoading(false);
        }
    }

    return <button disabled={isLoading} onClick={handleDownload} className={"flex flex-row w-full px-5 cursor-pointer"}>
        <div className={"flex flex-col pt-1 pr-2"}>
            <FaDownload size={14}/>
        </div>
        <div className={"w-full h-8 text-left"}>
            {item.fileName}
        </div>
    </button>
}

const ItemTable: FC<{
    items: ItemDto[],
    roomId: string,
    pageNumber: number,
    totalSize: number,
    setPageNumber: Dispatch<SetStateAction<number>>,
    itemPerPage: number,
    setItemPerPage: Dispatch<SetStateAction<number>>
}> = ({ items, roomId }) => {
    return <div className={"box-layout flex flex-col cursor-text mt-2"}>
        { items.map((v, i) => {
            return <div>
                { <ItemEntry item={v} roomId={roomId} key={i}/> }
                <div className={"p-1"}/>
            </div>
        }) }
    </div>
}

const RoomPage = () => {
    const pollInterval = 500;
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [isUploading, setUploading] = useState(false)
    const [isDownloading, setDownloading] = useState(false)
    const [items, setItems] = useState([] as ItemDto[])
    const [totalSize, setTotalSize] = useState(0)
    const [pageNumber, setPageNumber] = useState(1)
    const [itemPerPage, setItermPerPage] = useState(5)
    const [uploaded, setUploaded] = useState(0)

    useInterval(async () => {
        if (isDownloading){
            return;
        }

        setDownloading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/Items?roomId=${roomId}&pageNumber=${pageNumber}&itemPerPage=${itemPerPage}`)
            const responseData = response.data as ItemQueryResponse;
            setItems(responseData.items)
            setTotalSize(responseData.totalSize)
        }
        finally {
            setDownloading(false);
        }
    }, pollInterval)
    
    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/Rooms/exists/${roomId}`)
            .then(r => {
                if (!r.data){
                    navigate(`/room-expired/${roomId}`)
                }
            })
    }, [])

    const uploadEvent = (progressEvent: AxiosProgressEvent) => {
        const total = progressEvent.total ?? 1;
        let percentCompleted = Math.round((progressEvent.loaded * 100) / total);
        percentCompleted = percentCompleted > 100 ? 10 : percentCompleted;
        setUploaded(percentCompleted);
        console.debug('Uploaded:', percentCompleted)
    }
    
    const uploadFilePreSigned = async (file: File) => {
        const preSignedUploadUrlResponse = await axios.get(`${BACKEND_URL}/api/Items/upload-presigned?roomId=${roomId}&fileName=${encodeURIComponent(file.name)}`);
        const {itemId, uploadUrl} = preSignedUploadUrlResponse.data as UploadPreSignedDto;

        await axios.put(uploadUrl, file, {
            headers: {
                'Content-Type': 'application/octet-stream'
            },

            onUploadProgress: uploadEvent
        })
        await axios.post(`${BACKEND_URL}/api/Items/ready?roomId=${roomId}&itemId=${itemId}`)
    }

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files === null ? null : event.target.files[0];
        if (file === null){
            return;
        }

        if (isUploading){
            return
        }
        
        setUploading(true);
        try {
            await uploadFilePreSigned(file)
        }
        catch (e){
            const error = e as AxiosError;
            if (error.status === 404){
                navigate(`/room-expired/${roomId}`)
                return;
            }

            throw error;
        }
        finally {
            setUploading(false);
        }
    };

    return <MainLayout>
        <div className={"flex flex-row w-full justify-center"}>
            <img alt={'qr'} className={"w-56 m-5"} src={`${BACKEND_URL}/api/Rooms/qr/${roomId}`}/>
        </div>
        <div className={"flex flex-col w-full"}>
            <div className={"w-full"}>
                <button disabled={isUploading} className={"box-layout w-full"}>
                    <input disabled={isUploading} className={"text-center cursor-pointer"} type={"file"} onChange={handleFileChange} />
                </button>
            </div>
            <div className={"w-full"}>
                <Line percent={uploaded} strokeWidth={3} strokeColor={'#646cff'}/>
            </div>
        </div>
        <div className={"p-5"}/>
        <ItemTable items={items} roomId={roomId as string} pageNumber={pageNumber} totalSize={totalSize} setPageNumber={setPageNumber} itemPerPage={itemPerPage} setItemPerPage={setItermPerPage}/>
        <button className={"new-room-btn mt-10"}>
            <a href={"/"} className={"w-full h-full block"}>
                Create new room
            </a>
        </button>
    </MainLayout>
}

export default RoomPage;