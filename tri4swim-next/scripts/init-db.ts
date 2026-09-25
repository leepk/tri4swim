import { loadProjectEnv } from './load-env'
import { Client } from 'pg'
import { execFileSync } from 'node:child_process'
import { URL } from 'node:url'

loadProjectEnv()

function safeDbName(name:string){ if(!/^[A-Za-z0-9_]+$/.test(name)) throw new Error('Invalid database name'); return name }
async function ensureDatabase(){
  const raw=process.env.DATABASE_URL; if(!raw) throw new Error('DATABASE_URL is required')
  const url=new URL(raw); const db=safeDbName(url.pathname.replace(/^\//,'')); if(!db) throw new Error('DATABASE_URL must include database name')
  const admin=new URL(raw); admin.pathname='/postgres'; admin.search=''
  const client=new Client({connectionString:admin.toString()})
  try { await client.connect(); const r=await client.query('SELECT 1 FROM pg_database WHERE datname=$1',[db]); if(!r.rowCount){ console.log(`Creating database ${db}...`); await client.query(`CREATE DATABASE "${db}"`) } else console.log(`Database ${db} exists.`) }
  catch(e:any){ console.log('Database create check skipped:',e.message) }
  finally { await client.end().catch(()=>{}) }
}
async function main(){
  await ensureDatabase()
  console.log('Synchronizing missing tables/columns (no reset)...')
  execFileSync(process.platform==='win32'?'npx.cmd':'npx',['prisma','db','push','--skip-generate'],{stdio:'inherit'})
  console.log('Seeding defaults only when missing...')
  execFileSync(process.platform==='win32'?'npx.cmd':'npx',['tsx','prisma/seed.ts'],{stdio:'inherit'})
}
main().catch(e=>{console.error(e);process.exitCode=1})
