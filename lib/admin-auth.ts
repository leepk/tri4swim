import crypto from 'crypto'
export const ADMIN_COOKIE='tri4swim_admin'
const secret=()=>process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD||'change-me'
export function sessionToken(){return crypto.createHmac('sha256',secret()).update('tri4swim-admin-v1').digest('hex')}
export function validSession(value?:string){if(!value)return false;const expected=sessionToken();if(value.length!==expected.length)return false;return crypto.timingSafeEqual(Buffer.from(value),Buffer.from(expected))}
