import { getPersonalBundleUrl as impl } from "../sls/src/personal";
import { SEND, POST_OBJECT } from "./xhr";

const endpointBase = "https://kdhkdsv558.execute-api.eu-central-1.amazonaws.com/dev";
const perosnalPut = endpointBase + "/personal/put";
const personalAcl = endpointBase + "/personal/acl";

export function getPersonalBundleUrl(namespace: string, id: string, bundleUrl: string): string {
	return impl(namespace, id, bundleUrl);
}

export async function putPersonalBundle(namespace: string, id: string, bundleUrl: string, data: Uint8Array): Promise<void> {
	const result = await POST_OBJECT(perosnalPut + "?namespace=" + namespace + "&id=" + id +
		"&bundleUrl=" + encodeURIComponent(bundleUrl));

	if (!result.success) {
		throw new Error("Unable to put personal bundle");
	}

	const payload = JSON.parse(result.payload);
	const headers = payload.signature as { [name: string]: string };
	const url = payload.url as string;

	headers["x-amz-content-sha256"] = "UNSIGNED-PAYLOAD";
	await SEND("put",
		url,
		"text",
		data.buffer,
		undefined,
		headers);

	if (!(await POST_OBJECT(personalAcl + "?namespace=" + namespace + "&id=" + id +
		"&bundleUrl=" + bundleUrl)).success) {
		throw new Error("Can't set ACL to personal bundle");
	}
}