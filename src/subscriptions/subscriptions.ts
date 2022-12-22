import { xsollaPremiumId, xsollaSubscriptons } from "../conf";

export async function linkToBuy(token: string): Promise<string | null> {
    const response = await fetch(xsollaSubscriptons + "/buy", {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            plan_external_id: xsollaPremiumId,
        }),
    });

    const json = await response.json();

    if (json.link_to_ps === undefined) {
        console.error("Unexpected subscriptions response:", json);
        return null;
    }

    return json.link_to_ps;
}

export async function havePremium(token: string): Promise<boolean> {
    const response = await fetch(xsollaSubscriptons, {
        method: "GET",
        cache: "no-cache",
        headers: {
            "Authorization": "Bearer " + token,
        },
    });

    const json = await response.json();
    if (json.items === undefined) {
        console.error("Unexpected subscriptions response:", json);
        return false;
    }

    return json.items.size > 0 && json.items[0] === xsollaPremiumId;
}
