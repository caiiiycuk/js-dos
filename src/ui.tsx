import { useSelector } from "react-redux";
import { Login } from "./auth/login";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";
import { State } from "./store";
import { Window } from "./window/window";

export function Ui() {
    const theme = useSelector((state: State) => state.ui.theme);
    return <div class="w-full h-full relative" data-theme={theme}>
        <Window />
        <Frame />
        <SideBar />
        <Login />
    </div>;
};

