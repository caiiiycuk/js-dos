/* eslint-disable max-len */

import { html } from "./dom";

const XCircle = (props: { class: string }) => html`
    <svg fill="none" class=${props.class} viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
`;

const UserCircle = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
`;

const Mobile = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
`;

const Pause = (props: { class: string }) => html`
    <svg className=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
`;

const Play = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
`;

const VolumeUp = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
`;

const VolumeOff = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            clip-rule="evenodd" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
`;

const PencilAlt = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
`;

const ChevronDoubleLeft = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
`;

const DotsHorizontal = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
`;

const Download = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
`;

const Upload = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
`;

const Fullscreen = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="-4 -4 24 24" stroke="currentColor">
        <path
            d="M5.99 8.99c-.28 0-.53.11-.71.29l-3.29 3.29v-1.59c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H3.41L6.7 10.7a1.003 1.003 0 00-.71-1.71zm9-9h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59l-3.3 3.3a.99.99 0 00-.29.7 1.003 1.003 0 001.71.71l3.29-3.29V5c0 .55.45 1 1 1s1-.45 1-1V1c0-.56-.45-1.01-1-1.01z"
            fill-rule="evenodd">
        </path>
    </svg>
`;

const Minimize = (props: { class: string }) => html`
    <svg class=${props.class} fill="none" viewBox="-2 -4 24 24" stroke="currentColor">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8,11H3c-0.55,0-1,0.45-1,1s0.45,1,1,1h2.59l-5.29,5.29C0.11,18.47,0,18.72,0,19
                 c0,0.55,0.45,1,1,1c0.28,0,0.53-0.11,0.71-0.29L7,14.41V17c0,0.55,0.45,1,1,1s1-0.45,1-1v-5C9,11.45,8.55,11,8,11z M20,1
                c0-0.55-0.45-1-1-1c-0.28,0-0.53,0.11-0.71,0.29L13,5.59V3c0-0.55-0.45-1-1-1s-1,0.45-1,1v5c0,0.55,0.45,1,1,1h5
                c0.55,0,1-0.45,1-1s-0.45-1-1-1h-2.59l5.29-5.29C19.89,1.53,20,1.28,20,1z" />
    </svg>
`;

export const Icons = {
    XCircle,
    UserCircle,
    Mobile,
    Pause,
    Play,
    VolumeUp,
    VolumeOff,
    PencilAlt,
    Fullscreen,
    Minimize,
    ChevronDoubleLeft,
    DotsHorizontal,
    Download,
    Upload,
};
