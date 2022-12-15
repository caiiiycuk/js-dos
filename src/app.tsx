import { initAuthToken } from "./auth/auth";
import { Login } from "./auth/login";

initAuthToken()
    .then((token) => console.log("auth token", token))
    .catch(console.error);

export function App() {
    return <>
        <Login />
    </>;
}
