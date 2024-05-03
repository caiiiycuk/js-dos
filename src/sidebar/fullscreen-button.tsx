import { useSelector, useStore } from "react-redux";
import { State, Store } from "../store";
import { browserSetFullScreen } from "../host/fullscreen";

export function FullscreenButton(props: {
    class?: string,
}) {
    const fullScreen = useSelector((state: State) => state.ui.fullScreen);
    const store = useStore() as Store;

    function onClick() {
        browserSetFullScreen(!fullScreen, store);
    }
    /* eslint-disable max-len */
    return <div class={"fullscreen-button sidebar-button " + props.class} onClick={onClick}>
        <div class={"w-full h-full scale-75 hover:scale-90"}>
            {!fullScreen &&
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                    viewBox="0 0 16 16" fill="currentColor" stroke="none" enable-background="new 0 0 16 16" >
                    <g>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.99,8.99c-0.28,0-0.53,0.11-0.71,0.29l-3.29,3.29v-1.59c0-0.55-0.45-1-1-1
                                s-1,0.45-1,1v4c0,0.55,0.45,1,1,1h4c0.55,0,1-0.45,1-1s-0.45-1-1-1H3.41L6.7,10.7c0.18-0.18,0.29-0.43,0.29-0.71
                                C6.99,9.44,6.54,8.99,5.99,8.99z M14.99-0.01h-4c-0.55,0-1,0.45-1,1s0.45,1,1,1h1.59L9.28,5.29C9.1,5.47,8.99,5.72,8.99,5.99
                                c0,0.55,0.45,1,1,1c0.28,0,0.53-0.11,0.71-0.29l3.29-3.29v1.59c0,0.55,0.45,1,1,1s1-0.45,1-1v-4C15.99,0.44,15.54-0.01,14.99-0.01
                                z"/>
                    </g>
                </svg>
            }
            {fullScreen &&
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                    viewBox="0 0 16 16" fill="currentColor" stroke="none" enable-background="new 0 0 16 16">
                    <g>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M15.99,0.99c0-0.55-0.45-1-1-1c-0.28,0-0.53,0.11-0.71,0.29l-3.29,3.29V1.99
                            c0-0.55-0.45-1-1-1s-1,0.45-1,1v4c0,0.55,0.45,1,1,1h4c0.55,0,1-0.45,1-1s-0.45-1-1-1h-1.59L15.7,1.7
                            C15.88,1.52,15.99,1.27,15.99,0.99z M5.99,8.99h-4c-0.55,0-1,0.45-1,1s0.45,1,1,1h1.59l-3.29,3.29c-0.18,0.18-0.29,0.43-0.29,0.71
                            c0,0.55,0.45,1,1,1c0.28,0,0.53-0.11,0.71-0.29l3.29-3.29v1.59c0,0.55,0.45,1,1,1s1-0.45,1-1v-4C6.99,9.44,6.54,8.99,5.99,8.99z"
                        />
                    </g>
                </svg>
            }
        </div>
    </div >;
    /* eslint-enable max-len */
}
