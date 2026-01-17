import nodemailer from 'nodemailer'
import type { EmailConfig } from '../types/email-sender'

export const createTransporter = (config: EmailConfig) => {
  return nodemailer.createTransport({
    host: config.host || 'smtp.gmail.com',
    port: config.port || 587,
    secure: config.secure ?? false,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })
}
