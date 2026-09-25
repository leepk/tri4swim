import {NextRequest,NextResponse} from 'next/server'
import {readFile} from 'fs/promises'
import path from 'path'

export const runtime='nodejs'
const types:Record<string,string>={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif'}
export async function GET(_r:NextRequest,{params}:{params:Promise<{path:string[]}>}){
  const p=await params,parts=p.path||[]
  if(parts.length!==1||parts[0].includes('..')||parts[0].includes('/'))return new NextResponse('Not found',{status:404})
  const dir=process.env.UPLOAD_DIR||path.join(process.cwd(),'uploads')
  try{const file=path.join(dir,parts[0]),data=await readFile(file),type=types[path.extname(file).toLowerCase()]||'application/octet-stream';return new NextResponse(new Uint8Array(data),{headers:{'content-type':type,'cache-control':'public, max-age=31536000, immutable'}})}catch{return new NextResponse('Not found',{status:404})}
}
