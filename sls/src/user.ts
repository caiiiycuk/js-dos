export function validateUser(namespace: string, id: string): boolean {
	return typeof namespace === "string" && typeof id === "string" && namespace.length > 0 && id.length > 0;
}