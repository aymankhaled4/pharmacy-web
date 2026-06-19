import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: LoginFormValues) => login(values);

  return (
    <div className="w-full rounded-2xl border bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Access your pharmacy management dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              {...register('email')}
              type="email"
              placeholder="pharmacy@example.com"
              className={cn('pl-9', errors.email && 'border-destructive')}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className={cn('pl-9', errors.password && 'border-destructive')}
            />
          </div>
          {errors.password && (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          )}
        </div>

        {/* API error */}
        {error && (
          <p className="text-destructive rounded-md bg-red-50 px-3 py-2 text-sm">
            {typeof error === 'string' ? error : (error as Error).message ?? 'Login failed. Please try again.'}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#014AB3] hover:bg-[#0140a0]"
          disabled={isPending}
        >
          {isPending ? 'Logging in...' : (
            <>Login <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-center text-sm">
        <span className="text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-[#014AB3] hover:underline">
            Register
          </Link>
        </span>
      </div>

      <p className="text-muted-foreground mt-6 text-center text-xs">
        By signing in you agree to our{' '}
        <span className="cursor-pointer hover:underline text-[#014AB3]">Terms of Service</span> and{' '}
        <span className="cursor-pointer hover:underline text-[#014AB3]">Privacy Policy</span>.
      </p>
    </div>
  );
}