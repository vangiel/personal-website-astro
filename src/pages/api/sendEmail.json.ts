import type { EmailBody } from "@/types/email";
import type { APIRoute } from "astro";
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	const { Resend } = await import("resend");
	const resend = new Resend(import.meta.env.RESEND_API_KEY);
	if (request.headers.get("Content-Type") === "application/json") {
		const body: EmailBody = await request.json();
		const { name, email, subject, phone, message } = body;

		if (!name || !email || !subject || !message) {
			return new Response(null, {
				status: 400,
				statusText: "Did not provide all required fields",
			});
		}

		const send = await resend.emails.send({
			from: "delivered@resend.dev",
			to: "dani1610@hotmail.com",
			subject: subject,
			html: createEmail(name, email, phone, message, true),
			text: createEmail(name, email, phone, message, false),
		});

		if (send.error) {
			return new Response(JSON.stringify(send.error), {
				status: 500,
				statusText: "Internal Server Error",
			});
		} else {
			return new Response(JSON.stringify(send.data), {
				status: 200,
				statusText: "OK",
			});
		}
	} else {
		return new Response(null, {
			status: 400,
			statusText: "Bad Request",
		});
	}
};

function createEmail(name: string, email: string, phone: string, message: string, html: boolean) {
	if (html) {
		return `
			<html>
				<body>
					<h1>Name: ${name}</h1>
					<h1>Email: ${email}</h1>
					<h1>Phone: ${phone}</h1>
					<p>${message}<p>
				</body>
			</html>
			`;
	} else {
		return `
			Name: ${name}
			Email: ${email}
			Phone: ${phone}
			Message: ${message}
			`;
	}
}
