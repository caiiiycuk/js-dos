import { render } from "preact";
import "./index.css";

import { Provider } from "react-redux";
import { store } from "./store";

import { App } from "./app";
import { authenticate } from "./auth/auth";

render(
    <Provider store={store}>
        {<App /> as any}
    </Provider>,
    document.getElementById("app") as HTMLElement,
);

authenticate();
