import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

interface ISendEmail {
  from: string;
  to: string;
  subject: string;
  html: any;
}
export async function sendEmail({
  from = "noreply@casbytes.com",
  to,
  subject,
  html,
}: ISendEmail) {
  return resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}
