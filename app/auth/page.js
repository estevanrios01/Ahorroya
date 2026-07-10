'use client';

import AuthModal from '../../components/ui/AuthModal';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();

  return <AuthModal onClose={() => router.push('/')} />;
}
