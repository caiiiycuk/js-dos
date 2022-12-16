import { render } from "preact";
import "./index.css";

import { Provider } from "react-redux";
import { App } from "./app";
import { authenticate } from "./auth/auth";
import { makeStore } from "./store";

const store = makeStore();

render(
    <Provider store={store}>
        {<App /> as any}
    </Provider>,
    document.getElementById("app") as HTMLElement,
);

authenticate(store);
