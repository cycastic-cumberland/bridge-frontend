import {FC, ReactNode} from "react";

const MainLayout: FC<{ children?: ReactNode[] | ReactNode }> = ({ children }) => {
    return <div className={"flex flex-col w-full"}>
        { children }
    </div>
}

export default MainLayout;