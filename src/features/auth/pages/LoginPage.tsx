import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = location.state?.successMessage as string | undefined;

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      // Clear state so it doesn't show again on back navigation
      navigate('/login', { replace: true, state: {} });
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}