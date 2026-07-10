'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useSupermarketStore } from '../../store/useSupermarketStore';
import { X, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export default function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useSupermarketStore();
  const emailRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    emailRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (authError) throw authError;

      if (data.user) {
        setUser(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 transition-colors" aria-label="Cerrar">
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6 text-center">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="bg-red-400/10 border border-red-400/20 text-red-400 text-sm p-3 rounded-xl text-center" role="alert">
                {error}
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" aria-hidden="true" />
              <input
                ref={emailRef}
                type="email"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-zinc-500"
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Correo electrónico"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-zinc-500" aria-hidden="true" />
              <input
                type="password"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-zinc-500"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
              aria-label={loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            >
              {loading ? 'Procesando...' : isLogin ? <><LogIn size={20} /> Entrar</> : <><UserPlus size={20} /> Registrarse</>}
            </button>
          </form>

          <p className="mt-6 text-center text-zinc-400 text-sm">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
              aria-label={isLogin ? 'Ir a registro' : 'Ir a inicio de sesión'}
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
