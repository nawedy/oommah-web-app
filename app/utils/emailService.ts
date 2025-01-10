import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export function getModerationEmailTemplate(action: string, contentType: string): string {
  return `
    <html>
      <body>
        <h1>Oommah Moderation Update</h1>
        <p>Your ${contentType} has been ${action} by our moderation team.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Thank you for being a part of the Oommah community!</p>
      </body>
    </html>
  `
}

