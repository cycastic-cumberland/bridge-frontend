import {createContext, FC, ReactNode, useContext, useState} from "react";
import {BridgeContextType} from "./BridgeContextType.ts";

const BridgeContext = createContext(null as never as BridgeContextType)

export const useBridge = () => {
    return useContext(BridgeContext)
}

export const BridgeProvider: FC<{ children?: ReactNode }> = ({ children }) => {
    const [bridgeUrlCopied, setBridgeUrlCopied] = useState(false);

    const value: BridgeContextType = {
        bridgeUrlCopied,
        setBridgeUrlCopied,
    }

    return (<BridgeContext.Provider value={value}>
        { children }
    </BridgeContext.Provider>)
}