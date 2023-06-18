import { createContext, useState } from "react";

const defaultContextValues = {
    sidebarVisible: false,
    handlerSelected: -1,
}

export interface ContextValueType {
    sidebarVisible?: boolean,
    setSidebarVisible?: (todo: boolean) => void,
    handlerSelected: number,
    setHandlerSelected?: (todo: number) => void
}
export const UIContext = createContext<ContextValueType>(defaultContextValues);

export const UIContextProvider = (props: any) => {
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
    const [handlerSelected, setHandlerSelected] = useState<number>(-1);
    return (
        <UIContext.Provider value={{ sidebarVisible, setSidebarVisible, handlerSelected, setHandlerSelected }}>
            {props.children}
        </UIContext.Provider>
    )
}