import { remember } from '@epic-web/remember'
import { Resend } from 'resend'

const resend = remember('resend', () => new Resend(process.env.RESEND_API_KEY))

interface ISendEmail {
	to: string
	subject: string
	react: React.ReactNode
}
export async function sendEmail({ to, subject, react }: ISendEmail) {
	return resend.emails.send({
		from: 'CASBytes Team <team@casbytes.com>',
		to,
		subject,
		text: 'Please enable HTML to view this email.',
		react,
	})
}
