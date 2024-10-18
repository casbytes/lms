import { sendEmail } from './index.server'
import { MagicLinkTemplate, Welcome } from './templates/index.server'

interface ISendVerificationEmail {
	email: string
	link: string
}

interface ISendWelcomeEmail {
	email: string
	name: string
}

export class Emails {
	static async sendMagicLink({ email, link }: ISendVerificationEmail) {
		return sendEmail({
			to: email,
			subject: 'Here is your ✨ magic sign in link for casbytes.com',
			react: await MagicLinkTemplate({ link }),
		})
	}

	// static async sendWelcomeEmail({ email, name }: ISendWelcomeEmail) {
	//   return sendEmail({
	//     to: email,
	//     subject: "Welcome to casbytes.com",
	//     react: Welcome({ name, email }),
	//   });
	// }
}
