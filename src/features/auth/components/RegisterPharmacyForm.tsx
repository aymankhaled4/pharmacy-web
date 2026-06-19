import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, Building2, Phone, FileText, MapPin, ArrowRight } from 'lucide-react';
import { useRegisterPharmacy } from '../hooks/useRegisterPharmacy';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  pharmacy_name: z.string().min(2, 'Pharmacy name is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  license_number: z.string().min(2, 'License number is required'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPharmacyForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending, error } = useRegisterPharmacy();

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <div className="w-full rounded-2xl border bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partner with Dawak</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Register your pharmacy to manage inventory and digital reservations.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((v) => register(v))} className="space-y-8">

        {/* Account Credentials */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#014AB3]">
            <Lock className="h-3.5 w-3.5" />
            Account Credentials
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  {...reg('email')}
                  type="email"
                  placeholder="pharmacy@example.com"
                  className={cn('pl-9', errors.email && 'border-destructive')}
                />
              </div>
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  {...reg('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={cn('pl-9 pr-9', errors.password && 'border-destructive')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        {/* Pharmacy Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#014AB3]">
            <Building2 className="h-3.5 w-3.5" />
            Pharmacy Information
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Official Pharmacy Name</label>
              <Input
                {...reg('pharmacy_name')}
                placeholder="e.g. Central Health Pharmacy"
                className={cn(errors.pharmacy_name && 'border-destructive')}
              />
              {errors.pharmacy_name && <p className="text-destructive text-xs">{errors.pharmacy_name.message}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Contact Phone</label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    {...reg('phone')}
                    placeholder="+1 (555) 000-0000"
                    className={cn('pl-9', errors.phone && 'border-destructive')}
                  />
                </div>
                {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Business License Number</label>
                <div className="relative">
                  <FileText className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    {...reg('license_number')}
                    placeholder="PH-12345-ABC"
                    className={cn('pl-9', errors.license_number && 'border-destructive')}
                  />
                </div>
                {errors.license_number && <p className="text-destructive text-xs">{errors.license_number.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#014AB3]">
            <MapPin className="h-3.5 w-3.5" />
            Location
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Street Address</label>
              <Input
                {...reg('address')}
                placeholder="123 Medical Plaza, Suite 400"
                className={cn(errors.address && 'border-destructive')}
              />
              {errors.address && <p className="text-destructive text-xs">{errors.address.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">City</label>
              <Input
                {...reg('city')}
                placeholder="San Francisco"
                className={cn(errors.city && 'border-destructive')}
              />
              {errors.city && <p className="text-destructive text-xs">{errors.city.message}</p>}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-destructive rounded-md bg-red-50 px-3 py-2 text-sm">
            {typeof error === 'string' ? error : 'Registration failed. Please try again.'}
          </p>
        )}

        <p className="text-muted-foreground text-center text-xs">
          By submitting this form, you certify that all provided information is accurate and that
          you hold the legal authority to represent this pharmacy. Dawak performs rigorous
          background verification.
        </p>

        <Button
          type="submit"
          className="w-full bg-[#014AB3] hover:bg-[#0140a0]"
          disabled={isPending}
        >
          {isPending ? 'Submitting...' : <>Submit for Verification <ArrowRight className="ml-2 h-4 w-4" /></>}
        </Button>
      </form>

      <p className="text-muted-foreground mt-4 text-center text-sm">
        Already a partner?{' '}
        <Link to="/login" className="text-[#014AB3] font-medium hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
}