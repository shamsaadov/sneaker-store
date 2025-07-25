import type React from "react";
import { useState, useEffect } from "react";
import { LogIn, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError, isAuthenticated, user } =
    useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      onLoginSuccess();
    }
  }, [isAuthenticated, user, onLoginSuccess]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await login(email, password);
      if (user?.role !== "admin") {
        clearError();
        // Handle non-admin login
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@sneakerstore.com");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-dark flex items-center justify-center p-4">
      <div className="bg-neutral-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-neutral-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-black">
            Админ-панель
          </h1>
          <p className="text-neutral-gray-600 mt-2">
            Войдите для управления магазином
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-brand-dark mb-2">
            Демо-доступ:
          </h3>
          <div className="text-sm text-neutral-gray-700 space-y-1">
            <div>Email: admin@sneakerstore.com</div>
            <div>Пароль: admin123</div>
          </div>
          <button
            onClick={fillDemoCredentials}
            className="mt-2 text-xs text-brand-primary hover:text-brand-dark transition-colors"
          >
            Заполнить автоматически
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-black mb-2">
              Email адрес
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                placeholder="admin@steepstep.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-neutral-black mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-neutral-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-colors"
                placeholder="Введите пароль"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-400 hover:text-neutral-gray-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-brand-primary text-neutral-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-white" />
                <span>Вход...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Войти в админ-панель</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-gray-500">
            Steep step © 2024. Безопасный вход.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
