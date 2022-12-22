import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { State } from "./store";

const translations: {[lang: string]: {[key: string]: string} } = {
    ru: {
        logout: "Выйти",
        features: "Функции",
        premium: "Премиум",
        buy: "Купить",
        experimental_features: "Доступ к экспериентальным функциям",
        cloud_saves: "Облачные сохранения",
        game_no_limits: "Любой размер игры",
        net_no_limits: "Безлимитные сетевые игры",
        unlock_options: "Доступ ко всем настройкам",
    },
    en: {
        logout: "Logout",
        features: "Features",
        premium: "Premium",
        buy: "Buy",
        experimental_features: "Access to all experimental features",
        cloud_saves: "Cloud saves",
        game_no_limits: "Unlimited game size",
        net_no_limits: "No limits for multiplayer games",
        unlock_options: "Unlock all configuration options",
    },
};

const initialLang = navigator.language.startsWith("ru") ? "ru" : "en";

const initialState: {
    lang: "ru" | "en",
    keys: {[key: string]: string},
} = {
    lang: initialLang,
    keys: translations[initialLang],
};

export const i18nSlice = createSlice({
    name: "i18n",
    initialState,
    reducers: {
        setLang: (state, action: { payload: "ru" | "en" }) => {
            state.lang = action.payload;
            state.keys = translations[action.payload];
        },
    },
});

export function useT() {
    const keys = useSelector((state: State) => state.i18n.keys);
    return (key: string) => {
        return keys[key] ?? key;
    };
};

