import type { EmailConfig, SendEmailParams } from '../types/email-sender'
import { createTransporter } from './create-transporter'

export const sendEmail = async (config: EmailConfig, params: SendEmailParams) => {
  const transporter = createTransporter(config)

  return transporter.sendMail({
    from: params.from || `"Support" <${config.user}>`,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  })
}
