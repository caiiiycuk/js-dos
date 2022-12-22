import { render } from "preact";
import "./index.css";

import { Provider } from "react-redux";
import { App } from "./app";
import { authenticate } from "./auth/auth";
import { store } from "./store";
import { initEmulators } from "./dos/dom/dos";

render(
    <Provider store={store}>
        {<App /> as any}
    </Provider>,
    document.getElementById("app") as HTMLElement,
);

authenticate(store);
initEmulators(store);
