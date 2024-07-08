export const prerender = false;

export async function POST({ request }: { request: Request }) {
	const data = await request.json();

	const recaptchaURL = "https://www.google.com/recaptcha/api/siteverify";
	const requestHeaders = {
		"Content-Type": "application/x-www-form-urlencoded",
	};
	const requestBody = new URLSearchParams({
		secret: import.meta.env.RECAPTCHA_SECRET_KEY, // This can be an environment variable
		// @ts-ignore
		response: data.recaptcha, // The token passed in from the client
	});

	const response = await fetch(recaptchaURL, {
		method: "POST",
		headers: requestHeaders,
		body: requestBody.toString(),
	});

	const responseData = await response.json();

	return new Response(JSON.stringify(responseData), { status: 200 });
}
