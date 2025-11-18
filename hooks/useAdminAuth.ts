'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAdminAuth = () => {
    const router = useRouter();

    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('adminAuth');

        if (!isAuthenticated) {
            // Immediate redirect, no delay
            router.replace('/admin/login');
        }
    }, [router]);

    // Return auth status
    return typeof window !== 'undefined' ? sessionStorage.getItem('adminAuth') === 'true' : false;
};