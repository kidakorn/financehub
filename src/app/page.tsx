import { auth } from '@/auth';
import { getCars } from '@/actions/carActions';
import DashboardClient from '@/components/DashboardClient';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();
  if (!session) redirect('/login');
  
  const cars = await getCars();
  
  return <DashboardClient initialCars={cars} userName={session.user?.name} />;
}
