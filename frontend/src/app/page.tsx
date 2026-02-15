'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/books');
    } else {
      router.push('/login');
    }
  }, [router]);

  return <Loading />;
}
