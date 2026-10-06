import {auth} from '@/auth';import {redirect} from 'next/navigation';import FeedbackAdmin from '@/components/FeedbackAdmin';
export default async function FeedbackAdminPage(){const s=await auth();if(!s?.user)redirect('/login');if(!['admin','moderator'].includes(s.user.role))redirect('/');return <FeedbackAdmin/>}
