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
        error: "Упс... Что-то пошло не так...",
        consult_logs: "Проверьте логи браузера",
        bundle_loading: "Загрузка бандла",
        bundle_config: "Чтение конфигурации",
        try_free: "дней бесплатно",
        upload_file: "Выбирите архив jsdos/zip что бы начать...",
        emulation_backend: "Эмуляция",
        render_backend: "Рендер",
        render_aspect: "Соотношение сторон",
        worker: "Фоновый поток",
        mouse_sensitivity: "Чувст. мыши",
        mouse_lock: "Захват мыши",
        volume: "Громкость",
        pause: "Пауза",
        dosboxconf_template: "dosbox.conf шаблон:",
        preview: "Превью",
        continue: "Продолжить",
        skip: "Пропустить",
        loading: "Загрузка",
        extract_loading: "Распаковка архива",
        extract_long_time: "Может занять длительное время, пожалуйста ждите...",
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
        error: "Oops... Something went wrong...",
        consult_logs: "Please check browser logs",
        bundle_loading: "Bundle loading",
        bundle_config: "Reading config",
        try_free: "days for free",
        upload_file: "Select jsdos/zip file to start...",
        emulation_backend: "Emulation",
        render_backend: "Render",
        render_aspect: "Aspect",
        worker: "Worker thread",
        mouse_sensitivity: "Mouse sens...",
        mouse_lock: "Capture mouse",
        volume: "Volume",
        pause: "Pause",
        dosboxconf_template: "dosbox.conf template:",
        preview: "Preview",
        continue: "Continue",
        skip: "Skip",
        loading: "Loading",
        extract_loading: "Unpacking archive",
        extract_long_time: "Can take long time, please be patient...",
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
