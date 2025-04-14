import { KBD_up, KBD_left, KBD_down, KBD_right,KBD_kp8, KBD_kp4, KBD_kp2, KBD_kp6, KBD_kp7, KBD_kp9 } from "./keys";

type Mapper = { [key: number]: number };

// Static maps only.
// Customizable stored somewhere else, probably Layers to account for input from outside?
// Saving the custom mapping, per game?

export const keyMapWASD: Mapper = {
    87: KBD_up,      // W → ArrowUp
    65: KBD_left,    // A → ArrowLeft
    83: KBD_down,    // S → ArrowDown
    68: KBD_right,   // D → ArrowRight
};

export const keyMapWASDQE: Mapper = {
    87: KBD_kp8,     // W → Numpad8
    65: KBD_kp4,     // A → Numpad4
    83: KBD_kp2,     // S → Numpad2
    68: KBD_kp6,     // D → Numpad6
    81: KBD_kp7,     // Q → Numpad7
    69: KBD_kp9      // E → Numpad9
};