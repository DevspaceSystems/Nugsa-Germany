// app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [status, setStatus] = useState('Processing...');
  const router = useRouter();

  useEffect(() => {
    const completeSignup = async () => {
      try {
        // Get the session after email confirmation
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setStatus('No active session found. Please try signing in.');
          setTimeout(() => router.push('/auth'), 3000);
          return;
        }

        // Check if we have pending signup data
        const pendingSignup = localStorage.getItem('pendingSignup');
        
        if (pendingSignup) {
          const signupData = JSON.parse(pendingSignup);
          
          if (signupData.userId === session.user.id) {
            // Complete the profile setup here
            // You'll need to re-upload files and update the profile
            setStatus('Completing your profile...');
            
            // Remove the pending signup data
            localStorage.removeItem('pendingSignup');
            
            // Redirect to complete profile page or dashboard
            router.push('/complete-profile');
          }
        } else {
          // No pending signup, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        setStatus('Error completing signup. Please contact support.');
      }
    };

    completeSignup();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>{status}</p>
      </div>
    </div>
  );
}