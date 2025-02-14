import {useEffect} from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";

const BACKEND_URL: string = import.meta.env.VITE_BACKEND_ORIGIN

const NewRoomPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/Rooms/new-room`)
            .then(r => {
                navigate(`/${r.data}`)
            })
    }, [])

    return <></>
}

export default NewRoomPage;
