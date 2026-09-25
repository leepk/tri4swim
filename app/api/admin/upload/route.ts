import {NextRequest,NextResponse} from 'next/server'
import {ADMIN_COOKIE,validSession} from '@/lib/admin-auth'
import {mkdir,writeFile} from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const runtime='nodejs'
const allowed=new Map([['image/jpeg','jpg'],['image/png','png'],['image/webp','webp'],['image/gif','gif']])
export async function POST(r:NextRequest){
  if(!validSession(r.cookies.get(ADMIN_COOKIE)?.value))return NextResponse.json({error:'Unauthorized'},{status:401})
  const form=await r.formData(),file=form.get('file')
  if(!(file instanceof File))return NextResponse.json({error:'Image file is required'},{status:400})
  const ext=allowed.get(file.type)
  if(!ext)return NextResponse.json({error:'Only JPG, PNG, WEBP and GIF images are allowed'},{status:400})
  if(file.size>8*1024*1024)return NextResponse.json({error:'Image must be 8 MB or smaller'},{status:400})
  const dir=process.env.UPLOAD_DIR||path.join(process.cwd(),'uploads')
  await mkdir(dir,{recursive:true})
  const name=`${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`
  await writeFile(path.join(dir,name),Buffer.from(await file.arrayBuffer()))
  return NextResponse.json({url:`/uploads/${name}`})
}
