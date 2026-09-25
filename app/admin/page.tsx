import {cookies} from 'next/headers';import {redirect} from 'next/navigation';import {ADMIN_COOKIE,validSession} from '@/lib/admin-auth';import AdminClient from './AdminClient';
export default async function Page(){const c=await cookies();if(!validSession(c.get(ADMIN_COOKIE)?.value))redirect('/admin/login');return <AdminClient/>}
