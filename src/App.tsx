import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {AppRoutes} from "./AppRoutes.tsx";
import {BridgeProvider} from "./contexts/BridgeContext.tsx";

const App = () => {
  return (
    <>
        <BridgeProvider>
            <BrowserRouter>
                <Routes>
                    { AppRoutes.map((route, index) => {
                        const { element, ...rest } = route;
                        return <Route key={index} {...rest} element={element} />
                    }) }
                </Routes>
            </BrowserRouter>
        </BridgeProvider>
    </>
  )
}

export default App
