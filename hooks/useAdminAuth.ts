'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export const useAdminAuth = () => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function checkSession() {
            try {
                const response = await fetch('/api/admin/session');
                const data = await response.json() as { authenticated?: boolean };

                if (cancelled) return;

                if (!data.authenticated) {
                    router.replace('/admin/login');
                    return;
                }

                setIsAuthenticated(true);
            } catch {
                if (!cancelled) router.replace('/admin/login');
            } finally {
                if (!cancelled) setIsChecking(false);
            }
        }

        checkSession();

        return () => {
            cancelled = true;
        };
    }, [router]);

    return { isAuthenticated, isChecking };
};
