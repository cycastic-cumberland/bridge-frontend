import {RefObject, useEffect, useRef} from "react";

export const useInterval = (callback: () => void, delay: number) => {
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

export type QueryResponse<T> = {
    items: T[],
    pageNumber: number,
    totalSize: number,
};

export const POLL_INTERVAL = 1000;