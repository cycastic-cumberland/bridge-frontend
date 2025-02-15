import {createContext, FC, ReactNode, useContext} from "react";
import {PasteContextType} from "./PasteContextType.ts";

const PasteContext = createContext(null as never as PasteContextType)

export const usePaste = () => {
    return useContext(PasteContext)
}

export const PasteProvider: FC<{ roomId: string, children?: ReactNode }> = ({ roomId, children }) => {

    const value: PasteContextType = {
        roomId
    }

    return (<PasteContext.Provider value={value}>
        { children }
    </PasteContext.Provider>)
}