import { awsRegions } from "./jj-config";

const timeoutMs = 500;
const latencyCheckMethod = getLatencyForRegionWithImg;

const regionLatency: { [region: string]: number[] } = (() => {
    const latency: { [region: string]: number[] } = {};
    for (const { value } of awsRegions) {
        latency[value] = [];
    }
    return latency;
})();

export async function getAutoRegion(onLatencyUpdate: (region: string) => void) {
    const regions = [...awsRegions];
    const blackListedRegions: { [region: string]: boolean } = {};

    // estimation
    for (const { value } of regions) {
        for (let i = 0; i < 5; ++i) {
            if (blackListedRegions[value] === true) {
                continue;
            }
            regionLatency[value].push(await latencyCheckMethod(value).catch(() => {
                blackListedRegions[value] = true;
                return 9999;
            }));
            onLatencyUpdate(value + " (" + min(regionLatency[value]) + " ms)");
        }
    }

    let region = "eu-central-1";
    let minLatency = -1;
    let debugInfo = "";
    for (const next of Object.keys(regionLatency)) {
        if (blackListedRegions[next]) {
            debugInfo += next + ": blacklisted\n";
        } else {
            const latency = min(regionLatency[next]);
            if (latency > 0 && (minLatency === -1 || minLatency > latency)) {
                region = next;
                minLatency = latency;
            }
            debugInfo += next + ": " + latency + "\n";
        }
    }

    console.log("Latency estimation:\n" + debugInfo);
    console.log("Auto region:", region);


    return region;
}

const pingImage = document.createElement("img");
function getLatencyForRegionWithImg(region: string) {
    return new Promise<number>((resolve, reject) => {
        const url = "http://dynamodb." + region + ".amazonaws.com/?time=" + Date.now();
        let startedAt = 0;
        let timeoutId: any = 0;
        pingImage.onload = () => {
            resolve(Date.now() - startedAt);
            clearTimeout(timeoutId);
        };
        pingImage.onerror = () => {
            resolve(Date.now() - startedAt);
            clearTimeout(timeoutId);
        };
        timeoutId = setTimeout(() => {
            reject(new Error("timeout while getting aws region {" + region + "} latency"));
            pingImage.src = "";
        }, timeoutMs);
        startedAt = Date.now();
        pingImage.src = url;
    });
}

const asc = (arr: number[]) => arr.sort((a, b) => a - b);

const min = (arr: number[]) => {
    if (arr.length === 0) {
        return 0;
    }

    return asc(arr)[0];
};
