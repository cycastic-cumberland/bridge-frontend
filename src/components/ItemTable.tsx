import {ChangeEvent, FC, useEffect, useState} from "react";
import axios, {AxiosError, AxiosProgressEvent} from "axios";
import {FaDownload} from "react-icons/fa6";
import {Line} from "rc-progress";
import {POLL_INTERVAL, QueryResponse, useInterval} from "../Helpers.tsx";
import {useNavigate} from "react-router-dom";
import {useBridge} from "../contexts/BridgeContext.tsx";

const BACKEND_URL: string = import.meta.env.VITE_BACKEND_ORIGIN;

type UploadPreSignedDto = {
    itemId: number,
    uploadUrl: string
}

type ItemDto = {
    id: number,
    roomId: string,
    fileName: string
}


type ItemQueryResponse = QueryResponse<ItemDto>;


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
            link.href = response.data as string;
            link.click();
        }
        finally {
            setLoading(false);
        }
    }

    return <button disabled={isLoading} onClick={handleDownload} className={"flex flex-row w-full px-5 cursor-pointer p-1"}>
        <div className={"flex flex-col pt-1 pr-2"}>
            <FaDownload size={14}/>
        </div>
        <p className={"h-8 text-left truncate"}>
            {item.fileName}
        </p>
    </button>
}

const ItemTable: FC<{ roomId: string }> = ({ roomId }) => {
    const navigate = useNavigate()
    const [items, setItems] = useState([] as ItemDto[])
    const [totalItemSize, setTotalItemSize] = useState(0)
    const [pageNumber, setPageNumber] = useState(1)
    const [itemPerPage, setItermPerPage] = useState(5)
    const [isDownloading, setDownloading] = useState(false)
    const [isUploading, setUploading] = useState(false)
    const [uploaded, setUploaded] = useState(0)
    const {setBridgeUrlCopied} = useBridge()

    useEffect(() => {
        // Shutting off annoying warnings
        setPageNumber(pageNumber)
        setItermPerPage(itemPerPage)
        setTotalItemSize(totalItemSize)
    }, []);

    const pollItems = async () => {
        if (isDownloading){
            return;
        }

        setDownloading(true);
        try {
            const itemsResponse = await axios.get(`${BACKEND_URL}/api/Items?roomId=${roomId}&pageNumber=${pageNumber}&itemPerPage=${itemPerPage}`)
            const itemsResponseData = itemsResponse.data as ItemQueryResponse;

            setItems(itemsResponseData.items)
            setTotalItemSize(itemsResponseData.totalSize)
        }
        finally {
            setDownloading(false);
        }
    }

    useInterval(pollItems, POLL_INTERVAL);

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
        setBridgeUrlCopied(false);
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

    return <>
        <div className={"flex flex-col max-w-96 p-1"}>
            <div className={"w-full"}>
                <button disabled={isUploading} className={"box-layout w-full"}>
                    <input disabled={isUploading} className={"text-center cursor-pointer py-3 px-5 max-w-80 truncate"} type={"file"} onChange={handleFileChange} />
                </button>
            </div>
            <div className={"w-full"}>
                <Line percent={uploaded} strokeWidth={3} strokeColor={'#646cff'}/>
            </div>
            { items.length === 0 ? undefined : (<div className={"box-layout flex flex-col max-w-80 cursor-text mt-2 pt-2"}>
                { items.map((v, i) => {
                    return <div>
                        { <ItemEntry item={v} roomId={roomId} key={i}/> }
                    </div>
                }) }
            </div>) }
        </div>
    </>
}

export default ItemTable;
