// app/(auth)/login/page.tsx
'use client';
import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get ID token untuk middleware
      const token = await user.getIdToken();
      
      // Set cookie via API route
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        // Redirect ke admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError('Login gagal. Silakan coba lagi.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSSO = async () => {
    setIsLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const token = await user.getIdToken();
      
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('SSO login gagal.');
      }
    } catch (error: any) {
      console.error('Google SSO error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Format email tidak valid';
      case 'auth/user-disabled':
        return 'Akun ini dinonaktifkan';
      case 'auth/user-not-found':
        return 'Email tidak terdaftar';
      case 'auth/wrong-password':
        return 'Password salah';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan. Coba lagi nanti.';
      default:
        return 'Terjadi kesalahan. Silakan coba lagi.';
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-3 sm:p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #C5A059 1px, transparent 0)`,
          backgroundSize: '30px 30px'
        }}></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Logo & Brand */}
        <div className="text-center mb-6 sm:mb-7">
          <div className="inline-flex items-center justify-center w-50 h-auto sm:w-28 sm:h-28 bg-white backdrop-blur-sm rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 p-3 sm:p-4 border-2 border-[#C5A059]/30">
            <img 
              src="/logo-alfajr.png" 
              alt="Alfajr Umroh Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Alfajr E-learning</h1>
          <p className="text-[#C5A059] font-semibold text-sm sm:text-lg hidden sm:block">Learning Management System</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">Silahkan Login Dengan Akun Pegawai Alfajr Anda</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-5 sm:p-8 mx-2">
          <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Selamat Datang</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Silakan login untuk melanjutkan</p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-3 sm:mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-black mb-1 sm:mb-2">Email Korporat</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="nama@alfajrumroh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full text-black text-sm sm:text-base pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-black mb-1 sm:mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full text-black text-sm sm:text-base pl-10 sm:pl-11 pr-10 sm:pr-11 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C5A059] focus:border-transparent outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  className="w-4 h-4 text-[#C5A059] rounded focus:ring-[#C5A059] border-gray-300 disabled:opacity-50"
                />
                <span className="text-xs sm:text-sm text-gray-600">Ingat saya</span>
              </label>
              <button 
                type="button"
                className="text-xs sm:text-sm text-[#C5A059] hover:text-[#B08F4A] font-semibold disabled:opacity-50"
                disabled={isLoading}
              >
                Lupa password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-[#C5A059] text-black font-bold py-2.5 sm:py-3 rounded-lg hover:bg-[#B08F4A] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  <span>Loading...</span>
                </>
              ) : (
                'Login'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 sm:px-4 bg-white text-gray-500 text-xs sm:text-sm">Atau login dengan</span>
              </div>
            </div>

            {/* Google SSO Button */}
            <button
              type="button"
              onClick={handleGoogleSSO}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 sm:space-x-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 text-sm sm:text-base"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-xs sm:text-sm">Login with Google</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 px-2">
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2025 Alfajr Umroh. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;