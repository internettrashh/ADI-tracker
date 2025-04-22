// frontend/src/app/install-app/page.tsx
'use client';

import { useEffect } from 'react';
import { Loader2 } from "lucide-react";

export default function InstallAppPage() {
    useEffect(() => {
        // Check if we have GitHub user info in session
        const checkAndRedirect = async () => {
            try {
                const response = await fetch('http://localhost:3000/auth/status', {
                    credentials: 'include'
                });
                const data = await response.json();

                if (!data.authenticated) {
                    // If not authenticated, go back to login
                    window.location.href = '/';
                    return;
                }

                // Redirect to GitHub App installation
                window.location.href = 'http://localhost:3000/auth/install-app';
            } catch (error) {
                console.error('Error:', error);
                window.location.href = '/';
            }
        };

        checkAndRedirect();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <h1 className="text-2xl font-bold">Setting Up GitHub Integration</h1>
                <p className="text-gray-600">
                    Please wait while we redirect you to install the GitHub App...
                </p>
            </div>
        </div>
    );
}