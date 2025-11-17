'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAdminAuth = () => {
    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('adminAuth');

        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [router]);
};
