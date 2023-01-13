import { Login } from "./auth/login";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";
import { Window } from "./window/window";

export function Ui() {
    return <div class="w-full h-full relative">
        <Window />
        <Frame />
        <SideBar />
        <Login />
    </div>;
};

