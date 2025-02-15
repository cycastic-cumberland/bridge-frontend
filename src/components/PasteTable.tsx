import {FC, useEffect, useState} from "react";
import {PasteProvider, usePaste} from "../contexts/PasteContext.tsx";
import {FaClipboard} from "react-icons/fa";
import {POLL_INTERVAL, QueryResponse, useInterval} from "../Helpers.tsx";
import axios, {AxiosProgressEvent} from "axios";
import {Line} from "rc-progress";
import {useBridge} from "../contexts/BridgeContext.tsx";

const BACKEND_URL: string = import.meta.env.VITE_BACKEND_ORIGIN;

type PasteDto = {
    id: number,
    roomId: string,
    content: string
}

type PasteQueryResponse = QueryResponse<PasteDto>;

type CopiedState = 'Idle' | 'Loading' | 'Ready' | 'Copied' | 'Error';

type PastedState = 'Idle' | 'Loading' | 'Error';

const getBtnTheme = (state: CopiedState) => {
    switch (state){
        case "Ready":
            return 'ready-btn-theme';
        case "Copied":
            return 'copied-btn-theme';
        case "Error":
            return 'error-btn-theme';
    }
    return '';
}

const getContent = (truncated: string, state: CopiedState) => {
    switch (state){
        case "Ready":
            return 'Press again to copy';
        case "Copied":
            return 'Copied!';
        case "Error":
            return 'Error!';
    }
    return truncated;
}

const PasteItem: FC<{ paste: PasteDto }> = ({ paste }) => {
    const [fullPaste, setFullPaste] = useState(null as string | null)
    const [copyState, setCopyState] = useState('Idle' as CopiedState)
    const {roomId} = usePaste()

    const onButtonClicked = async () => {
        if (copyState === 'Ready' || copyState === 'Copied'){
            await navigator.clipboard.writeText(fullPaste as string);
            setCopyState('Copied');
            return;
        }

        if (copyState === 'Loading'){
            return;
        }

        setCopyState('Loading')
        try {
            const response = await axios.get(`${BACKEND_URL}/api/Pastes/paste?roomId=${roomId}&pasteId=${paste.id}&truncate=false`);
            const responseData = response.data as PasteDto;
            setFullPaste(responseData.content);
            setCopyState('Ready');
        }
        catch (e){
            setCopyState('Error');
            throw e;
        }
    }

    return <button disabled={copyState === 'Loading'} onClick={onButtonClicked} className={`flex flex-row w-full px-5 cursor-pointer p-1 ${getBtnTheme(copyState)}`}>
        <div className={"flex flex-col pt-1 pr-2"}>
            <FaClipboard size={14}/>
        </div>
        <p className={"h-8 text-left truncate"}>
            { getContent(paste.content, copyState) }
        </p>
    </button>
}

const PasteInput = () => {
    const {roomId} = usePaste()
    const [pasteState, setPasteState] = useState('Idle' as PastedState)
    const [pastePercent, setPastePercent] = useState(0)
    const {setBridgeUrlCopied} = useBridge()

    const uploadEvent = (progressEvent: AxiosProgressEvent) => {
        const total = progressEvent.total ?? 1;
        let percentCompleted = Math.round((progressEvent.loaded * 100) / total);
        percentCompleted = percentCompleted > 100 ? 10 : percentCompleted;
        setPastePercent(percentCompleted);
        console.debug('Uploaded:', percentCompleted)
    }

    const handleUpload = async () => {
        let text = '';
        try {
            text = await navigator.clipboard.readText();
        }
        catch (e){
            console.warn('Paste denied', e)
            setPasteState('Error')
            return;
        }
        finally {
            setBridgeUrlCopied(false)
        }

        if (pasteState === 'Loading'){
            return;
        }

        setPasteState('Loading')
        try {
            await axios.put(`${BACKEND_URL}/api/Pastes?roomId=${roomId}`, { content: text }, {
                onUploadProgress: uploadEvent
            })
        }
        finally {
            setPasteState('Idle');
        }
    }

    return <>
        <div className={"w-full"}>
            <button disabled={pasteState === 'Loading'} className={`${pasteState === 'Error' ? 'error-btn-theme' : 'box-layout'} w-full`} onClick={handleUpload}>
                <p className={"text-center cursor-pointer py-3 px-5 max-w-80"}>
                    { pasteState === 'Error' ? 'Paste denied by browser' : 'Press to paste' }
                </p>
            </button>
        </div>
        <div className={"w-full"}>
            <Line percent={pastePercent} strokeWidth={3} strokeColor={'#646cff'}/>
        </div>
    </>
}

const isPolledPastesChanged = (oldPastes: PasteDto[], newPastes: PasteDto[]) => {
    if (oldPastes.length !== newPastes.length){
        return true;
    }

    for (let i = 0; i < oldPastes.length; i++){
        if (oldPastes[i].id !== newPastes[i].id){
            return true;
        }
    }

    return false;
}

const PasteTable: FC<{ roomId: string }> = ({ roomId }) => {
    const [pastes, setPastes] = useState([] as PasteDto[])
    const [totalItemSize, setTotalItemSize] = useState(0)
    const [pageNumber, setPageNumber] = useState(1)
    const [itemPerPage, setItermPerPage] = useState(5)
    const [isDownloading, setDownloading] = useState(false)

    const pollPastes = async () => {
        if (isDownloading){
            return;
        }

        setDownloading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/api/Pastes/pastes?roomId=${roomId}&pageNumber=${pageNumber}&itemPerPage=${itemPerPage}`)
            const responseData = response.data as PasteQueryResponse;
            if (!isPolledPastesChanged(pastes, responseData.items)){
                return;
            }

            setPastes(responseData.items);
            setTotalItemSize(responseData.totalSize);
        }
        finally {
            setDownloading(false);
        }
    }

    useInterval(() => setTimeout(pollPastes, POLL_INTERVAL / 2), POLL_INTERVAL);

    useEffect(() => {
        // Shutting off annoying warnings
        setPageNumber(pageNumber)
        setItermPerPage(itemPerPage)
        setTotalItemSize(totalItemSize)
    }, []);

    return <PasteProvider roomId={roomId}>
        <div className={"flex flex-col max-w-96 p-1"}>
            <PasteInput />
            { pastes.length === 0 ? undefined : (<div className={"box-layout flex flex-col max-w-80 cursor-text mt-2 pt-2"}>
                { pastes.map((p) => {
                    return <PasteItem paste={p} key={p.id} />
                }) }
            </div>) }
        </div>
    </PasteProvider>
}

export default PasteTable;