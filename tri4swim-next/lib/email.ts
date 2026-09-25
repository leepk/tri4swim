import nodemailer from 'nodemailer'
export async function sendBookingEmail(to:string, subject:string, html:string){
  if(!process.env.SMTP_HOST || !process.env.SMTP_USER) { console.log('SMTP not configured; email skipped:',subject); return }
  const tx=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}})
  await tx.sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to,subject,html})
}
