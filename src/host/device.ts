
interface IDeviceInfo {
    cpu: string;
    width: number;
    height: number;
    model: string;
}

const iPhones: IDeviceInfo[] = [
    { cpu: "a7", width: 640, height: 1136, model: "iPhone 5/iPhone 5s" },
    { cpu: "a7", width: 1536, height: 2048, model: "iPad Air/iPad Mini 2/iPad Mini 3" },
    { cpu: "a8", width: 640, height: 1136, model: "iPod touch (6th gen)" },
    { cpu: "a8", width: 750, height: 1334, model: "iPhone 6" },
    { cpu: "a8", width: 1242, height: 2208, model: "iPhone 6 Plus" },
    { cpu: "a8", width: 1536, height: 2048, model: "iPad Air 2/iPad Mini 4" },
    { cpu: "a9", width: 640, height: 1136, model: "iPhone SE" },
    { cpu: "a9", width: 750, height: 1334, model: "iPhone 6s" },
    { cpu: "a9", width: 1242, height: 2208, model: "iPhone 6s Plus" },
    { cpu: "a9x", width: 1536, height: 2048, model: "iPad Pro (1st gen 9.7-inch)" },
    { cpu: "a9x", width: 2048, height: 2732, model: "iPad Pro (1st gen 12.9-inch)" },
    { cpu: "a10", width: 750, height: 1334, model: "iPhone 7" },
    { cpu: "a10", width: 1242, height: 2208, model: "iPhone 7 Plus" },
    { cpu: "a10x", width: 1668, height: 2224, model: "iPad Pro (2th gen 10.5-inch)" },
    { cpu: "a10x", width: 2048, height: 2732, model: "iPad Pro (2th gen 12.9-inch)" },
    { cpu: "a11", width: 750, height: 1334, model: "iPhone 8" },
    { cpu: "a11", width: 1242, height: 2208, model: "iPhone 8 Plus" },
    { cpu: "a11", width: 1125, height: 2436, model: "iPhone X" },
    { cpu: "a12", width: 828, height: 1792, model: "iPhone Xr" },
    { cpu: "a12", width: 1125, height: 2436, model: "iPhone Xs" },
    { cpu: "a12", width: 1242, height: 2688, model: "iPhone Xs Max" },
    { cpu: "a12x", width: 1668, height: 2388, model: "iPad Pro (3rd gen 11-inch)" },
    { cpu: "a12x", width: 2048, height: 2732, model: "iPad Pro (3rd gen 12.9-inch)" },
    { cpu: "a13", width: 828, height: 1792, model: "iPhone 11" },
    { cpu: "a13", width: 1125, height: 2436, model: "iPhone 11 Pro" },
    { cpu: "a13", width: 1242, height: 2688, model: "iPhone 11 Pro Max" },
    { cpu: "a14", width: 1080, height: 2340, model: "iPhone 12 Mini" },
    { cpu: "a14", width: 1170, height: 2532, model: "iPhone 12" },
    { cpu: "a14", width: 1284, height: 2778, model: "iPhone 12 Pro Max" },
    { cpu: "a15", width: 1080, height: 2340, model: "iPhone 13 Mini" },
    { cpu: "a15", width: 1170, height: 2532, model: "iPhone 13" },
    { cpu: "a15", width: 1284, height: 2778, model: "iPhone 13 Pro Max" },
    { cpu: "a15", width: 1170, height: 2532, model: "iPhone 14" },
    { cpu: "a15", width: 1284, height: 2778, model: "iPhone 14 Plus" },
    { cpu: "a16", width: 1179, height: 2556, model: "iPhone 14 Pro" },
    { cpu: "a16", width: 1290, height: 2796, model: "iPhone 14 Pro Max" },
    { cpu: "a16", width: 1179, height: 2556, model: "iPhone 15" },
    { cpu: "a16", width: 1290, height: 2796, model: "iPhone 15 Plus" },
    { cpu: "a17", width: 1179, height: 2556, model: "iPhone 15 Pro" },
    { cpu: "a17", width: 1290, height: 2796, model: "iPhone 15 Pro Max" },
    { cpu: "a18", width: 1179, height: 2556, model: "iPhone 16" },
    { cpu: "a18", width: 1290, height: 2796, model: "iPhone 16 Plus" },
    { cpu: "a18", width: 1206, height: 2622, model: "iPhone 16 Pro" },
    { cpu: "a18", width: 1320, height: 2868, model: "iPhone 16 Pro Max" },
];

export interface ISystemInfo {
    browser: string;
    browserVersion: string;
    mobile: boolean;
    os: string;
    osVersion: string;
    gpu: string;
    deviceModel: string;
    cpu: string;
    emscripten: string;
}


export function systemInfo(ctx: WebGLRenderingContext): ISystemInfo {
    const userAgent = navigator.userAgent + " ";

    function extractRe(pattern: string | RegExp, value: string, index: number) {
        const re = RegExp(pattern, "i").exec(value);
        return re && re[index];
    }

    function getBrowserInfo() {
        const browsers: { [name: string]: { prefixs: string[], regExp?: string } } = {
            "Yandex": { prefixs: ["YaApp", "YaBrowser"] },
            "Firefox": { prefixs: ["Firefox"] },
            "Opera": { prefixs: ["OPR"] },
            "Edge": { prefixs: ["Edg"] },
            "Samsung Browser": { prefixs: ["SamsungBrowser"] },
            "Internet Explorer": { prefixs: ["Trident", "MSIE"] },
            "Chrome": { prefixs: ["Chrome"] },
            "Chrome on iOS": { prefixs: ["CriOS"] },
            "Firefox on iOS": { prefixs: ["FxiOS"] },
            "Safari": { prefixs: ["Safari"] },
            "Facebook": { prefixs: ["FBSV"], regExp: "[\/;](.*?)[;\\)]" },
        };

        for (const [name, regExpParts] of Object.entries(browsers)) {
            for (const prefix of regExpParts.prefixs) {
                const pattern = prefix + (regExpParts.regExp || "[\/ ](.*?)[ \\)]");
                let version = extractRe(pattern, userAgent, 1);
                if (version !== null) {
                    if (name === "Safari") {
                        version = extractRe("Version\/(.*?) ", userAgent, 1);
                    }
                    if (name === "Internet Explorer") {
                        version = extractRe("rv:(.*?)\\)? ", userAgent, 1) || version;
                    }
                    return { name, version };
                }
            }
        }
        return { name: "", version: "" };
    }

    function getOSInfo() {
        const oses: { [name: string]: string[] } = {
            "Android": ["Android ([0-9_\.]+)"],
            "Windows": ["Windows (.*?)[;\)]"],
            "iOS": ["iPhone OS ([0-9_\.]+)", "iPad.*? OS ([0-9_\.]+)"],
            "macOS": ["Mac OS X ([0-9_\.]+)"],
            "Linux": ["FreeBSD( )", "OpenBSD( )", "Linux|X11()"],
            "Search Bot": ["bot|google|baidu|bing|msn|teoma|slurp|yandex"],
        };

        for (const [name, patterns] of Object.entries(oses)) {
            for (const pattern of patterns) {
                let version = extractRe(pattern, userAgent, 1);
                if (version != null) {
                    version = version.replace(/_/g, ".");
                    if (name === "Windows") {
                        const windowsVersions: { [pattern: string]: string } = {
                            "NT 5.0": "2000",
                            "NT 5.1": "XP",
                            "NT 5.2": "Server 2003",
                            "NT 6.0": "Vista",
                            "NT 6.1": "7",
                            "NT 6.2": "8",
                            "NT 6.3": "8.1",
                            "NT 10.0": "10",
                        };
                        version = windowsVersions[version] || version;
                    }
                    return { name, version };
                }
            }
        }
        return { name: "", version: "" };
    }

    const browserInfo = getBrowserInfo();
    const osInfo = getOSInfo();
    const mobile: boolean = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.appVersion) ||
        /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.userAgent) ||
        (/MacIntel/.test(navigator.platform) && navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 2);
    const cores = navigator.hardwareConcurrency;

    const gpu = gpuNameOf(ctx);
    const screen = getPortraitScreenResolution();
    const screenHeight = screen.height;
    const screenWidth = screen.width;

    return {
        browser: browserInfo.name,
        browserVersion: browserInfo.version ?? "???",
        mobile: mobile,
        os: osInfo.name,
        osVersion: osInfo.version,
        gpu,
        deviceModel: getDeviceModel(
            mobile,
            gpu,
            { width: screenWidth, height: screenHeight },
        ),
        cpu: (cores || 0).toString(),
        emscripten: "3.1.68",
    };
}

function getDeviceModel(isMobile: boolean, gpu: string, screen: { width: number, height: number }) {
    if (!isMobile) {
        return "desktop/laptop";
    }

    const matchesIphone = gpu.match(/^apple+[a-zA-Z0-9_\s]+gpu$/i);
    if (matchesIphone) {
        return getAppleDeviceModel(screen);
    }
    return getAndroidDeviceModel(navigator.userAgent);
}


function gpuNameOf(ctx: WebGLRenderingContext) {
    const renderInfoExt = ctx.getExtension("WEBGL_debug_renderer_info");
    if (renderInfoExt) {
        return ctx.getParameter(renderInfoExt.UNMASKED_RENDERER_WEBGL) || "-";
    }
    return "-";
}

function getPortraitScreenResolution() {
    const ratio = window.devicePixelRatio || 1;
    return {
        width: Math.min(screen.width, screen.height) * ratio,
        height: Math.max(screen.width, screen.height) * ratio,
    };
}

function getAppleDeviceModel(screen: { width: number, height: number }) {
    let model = "";
    for (const iPhone of iPhones) {
        if (screen.width === Math.min(iPhone.width, iPhone.height) &&
            screen.height === Math.max(iPhone.width, iPhone.height)) {
            model += model.length > 0 ? "/" + iPhone.model : iPhone.model;
        }
    }
    return model.length > 0 ? model : "unknown iPhone";
}

function getAndroidDeviceModel(browserIdentifier: string) {
    const androidRegExps = [/Android[\s][\d]+\.[\d]+\.[\d]+; [A-Za-z]{2}\-[A-Za-z]{2}\; (.+) Build/,
        /Android[\s][\d]+\.[\d]+\.[\d]+; (.+) Build/,
        /Android(.+)Build/];

    for (const regExp of androidRegExps) {
        const matchesAndroid = browserIdentifier.match(regExp);
        if (matchesAndroid && matchesAndroid.length > 0) {
            return matchesAndroid[1];
        }
    }
    return "unknown Android";
}
