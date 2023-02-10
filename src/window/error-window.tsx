import { useSelector } from "react-redux";
import { Error } from "../components/error";
import { State } from "../store";

export function ErrorWindow() {
    const error = useSelector((state: State) => state.dos.error);
    return <Error error={error} />;
}

