export const endpointBase = "https://kdhkdsv558.execute-api.eu-central-1.amazonaws.com/dev";

export const personalPut = endpointBase + "/personal/put";
export const personalAcl = endpointBase + "/personal/acl";

export const createTokenEndpoint = endpointBase + "/token/create";
export const tokeInfoGetEndpoint = endpointBase + "/token/info/get";
export const addFreeTimeTierEndpoint = endpointBase + "/token/add/free";

export const startIpx = endpointBase + "/token/ipx/start";
export const stopIpx = endpointBase + "/token/ipx/stop";

export const checkoutCreateTokenEndpoint = endpointBase + "/checkout/token/create";
export const checkoutEndpoint = "https://js-dos.com/checkout/index.html";

export interface AwsRegion {
    label: string,
    name: string,
    ok: string,
};

export const awsRegions: AwsRegion[] = [
    { label: "US East (N. Virginia)", name: "us-east-1",
        ok: "https://387k8l2vgf.execute-api.us-east-1.amazonaws.com/dev/ok" },
    { label: "US East (Ohio)", name: "us-east-2",
        ok: "https://q32vlaa5ji.execute-api.us-east-2.amazonaws.com/dev/ok" },
    { label: "US West (N. California)", name: "us-west-1",
        ok: "https://zittdd8vr2.execute-api.us-west-1.amazonaws.com/dev/ok" },
    { label: "US West (Oregon)", name: "us-west-2",
        ok: "https://aw3gj5315i.execute-api.us-west-2.amazonaws.com/dev/ok" },
    { label: "Europe (Frankfurt)", name: "eu-central-1",
        ok: "https://pdxnceto92.execute-api.eu-central-1.amazonaws.com/dev/ok" },
    { label: "Europe (Ireland)", name: "eu-west-1",
        ok: "https://yjm6n35ii4.execute-api.eu-west-1.amazonaws.com/dev/ok" },
    { label: "Europe (London)", name: "eu-west-2",
        ok: "https://u8k6qhll5d.execute-api.eu-west-2.amazonaws.com/dev/ok" },
    { label: "Europe (Milan)", name: "eu-south-1",
        ok: "https://hn4uxbiro0.execute-api.eu-south-1.amazonaws.com/dev/ok" },
    { label: "Europe (Paris)", name: "eu-west-3",
        ok: "https://oce5khcznd.execute-api.eu-west-3.amazonaws.com/dev/ok" },
    { label: "Europe (Stockholm)", name: "eu-north-1",
        ok: "https://f3j2j43580.execute-api.eu-north-1.amazonaws.com/dev/ok" },
    { label: "Asia Pacific (Hong Kong)", name: "ap-east-1",
        ok: "https://2dji6qhipb.execute-api.ap-east-1.amazonaws.com/dev/ok" },
    { label: "Asia Pacific (Mumbai)", name: "ap-south-1",
        ok: "https://0htlj8u1m9.execute-api.ap-south-1.amazonaws.com/dev/ok" },
    { label: "Asia Pacific (Osaka)", name: "ap-northeast-3",
        ok: "https://4z9rh02y37.execute-api.ap-northeast-3.amazonaws.com/dev/ok" },
    { label: "Asia Pacific (Seoul)", name: "ap-northeast-2",
        ok: "https://dv8crqb5j6.execute-api.ap-northeast-2.amazonaws.com/dev/ok" },
    { label: "Asia Pacific (Singapore)", name: "ap-southeast-1",
        ok: "https://e0w35dr520.execute-api.ap-southeast-1.amazonaws.com/dev/ok" },
    { label: "Asia Pacific (Sydney)", name: "ap-southeast-2",
        ok: "https://a2bnpow0ul.execute-api.ap-southeast-2.amazonaws.com/dev/ok" },
    { label: "Asia Pacific (Tokyo)", name: "ap-northeast-1",
        ok: "https://snvzlstk05.execute-api.ap-northeast-1.amazonaws.com/dev/ok" },
    { label: "Canada", name: "ca-central-1",
        ok: "https://wqwl5he8y7.execute-api.ca-central-1.amazonaws.com/dev/ok" },
    { label: "Middle East (Bahrain)", name: "me-south-1",
        ok: "https://g480v58gnk.execute-api.me-south-1.amazonaws.com/dev/ok" },
    { label: "South America (São Paulo)", name: "sa-east-1",
        ok: "https://wvhym3rtc1.execute-api.sa-east-1.amazonaws.com/dev/ok" },
    { label: "Africa (Cape Town)", name: "af-south-1",
        ok: "https://r0atydfi7k.execute-api.af-south-1.amazonaws.com/dev/ok" },
];
