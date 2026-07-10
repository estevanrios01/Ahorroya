'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import AuthModal from '../../components/ui/AuthModal';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-colors mb-6 text-sm group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver
          </button>
          <AuthModal onClose={() => router.push('/')} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
