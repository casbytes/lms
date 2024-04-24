import { MailtrapClient } from "mailtrap";

const { MAILTRAP_TOKEN } = process.env!;

const client = new MailtrapClient({
  token: MAILTRAP_TOKEN!,
});

interface ISendMail {
  recipient: string;
  template_uuid: string;
  template_variables: Record<string, string>;
}

export async function sendMail({
  recipient,
  template_uuid,
  template_variables,
}: ISendMail) {
  try {
    const response = await client.send({
      from: {
        email: "noreply@casbytes.com",
        name: "CASBytes",
      },
      to: [
        {
          email: recipient,
        },
      ],
      template_uuid,
      template_variables: {
        ...template_variables,
        company_name: "CASBytes",
        company_legal_name: "CASDev. Labs.",
        company_legal_address: "Sabon Tasha, Kaduna, Nigeria.",
      },
    });
    return response;
  } catch (error) {
    console.error(error);
    throw new Error("Error sending email");
  }
}

/**
 * Send welcome email to new user
 * @param {String} name
 * @param {String} email
 * @returns {Record<string, any>}
 */
export async function sendWelcomeEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}): Promise<Record<string, any>> {
  const baseUrl = "https://casbytes.com";

  const response = await sendMail({
    recipient: email,
    template_uuid: "13f7ba9b-fb23-48b8-9dd9-6c1e06353f51",
    template_variables: {
      user_name: name,
      next_step_link: `${baseUrl}/onboarding`,
      course_page_link: `${baseUrl}/courses`,
      faqs_page_link: `${baseUrl}/faqs`,
      support_email: "support@casbytes.com",
    },
  });
  if (!response.success) {
    throw new Error("Error sending welcome email");
  }
  return response;
}
