export default defineEventHandler(async event => {
	return process.env.VAPID_PUBLIC_KEY ?? "";
});
