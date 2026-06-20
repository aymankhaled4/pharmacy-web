import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Phone, MapPin, Mail, FileText, Lock, Pencil } from 'lucide-react';
import { usePharmacyProfile, useUpdateProfile, useChangePassword } from '../hooks/useUpdateProfile';
import { useAuthStore } from '../../../../core/auth/auth.store';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { cn } from '../../../../lib/utils';

const profileSchema = z.object({
  pharmacy_name: z.string().min(2, 'Required'),
  phone: z.string().min(7, 'Required'),
  address: z.string().min(5, 'Required'),
  city: z.string().min(2, 'Required'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine((v) => v.newPassword === v.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const { user } = useAuthStore();
  const { data: profile, isLoading } = usePharmacyProfile();
  const { mutate: updateProfile, isPending: updatingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: changingPassword } = useChangePassword();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      pharmacy_name: profile?.pharmacy_name ?? '',
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      city: profile?.city ?? '',
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = (values: ProfileValues) => {
    updateProfile(values, { onSuccess: () => setEditing(false) });
  };

  const onPasswordSubmit = (values: PasswordValues) => {
    changePassword({ newPassword: values.newPassword }, {
      onSuccess: () => {
        passwordForm.reset();
        setChangingPass(false);
      },
    });
  };

  const initial = profile?.pharmacy_name?.[0]?.toUpperCase() ?? '?';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-6">
      <div className="rounded-2xl border bg-white p-8 shadow-sm space-y-8">

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#014AB3] text-3xl font-bold text-white">
              {initial}
            </div>
            <div className="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{profile?.pharmacy_name}</h2>
            <p className="text-muted-foreground flex items-center justify-center gap-1 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              {profile?.city}
            </p>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* Contact Information */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#014AB3]">
            Contact Information
          </p>

          {editing ? (
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Pharmacy Name</label>
                  <div className="relative">
                    <Building2 className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input {...profileForm.register('pharmacy_name')} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Phone</label>
                  <div className="relative">
                    <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input {...profileForm.register('phone')} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Address</label>
                  <div className="relative">
                    <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input {...profileForm.register('address')} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">City</label>
                  <div className="relative">
                    <MapPin className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input {...profileForm.register('city')} className="pl-9" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="bg-[#014AB3] hover:bg-[#0140a0]" disabled={updatingProfile}>
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setEditing(false); profileForm.reset(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Phone className="h-4 w-4 shrink-0 text-[#014AB3]" />
                <div>
                  <p className="text-muted-foreground text-xs">Primary Phone</p>
                  <p className="text-sm font-medium">{profile?.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Mail className="h-4 w-4 shrink-0 text-[#014AB3]" />
                <div>
                  <p className="text-muted-foreground text-xs">Official Email</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="col-span-full flex items-center gap-3 rounded-lg border p-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#014AB3]" />
                <div>
                  <p className="text-muted-foreground text-xs">Address</p>
                  <p className="text-sm font-medium">{profile?.address}, {profile?.city}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* License */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#014AB3]">
            License & Certification
          </p>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <FileText className="h-4 w-4 shrink-0 text-[#014AB3]" />
            <div>
              <p className="text-muted-foreground text-xs">Pharmacy License #</p>
              <p className="text-sm font-medium">{profile?.license_number}</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Account Security */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#014AB3]">
            Account Security
          </p>

          {!changingPass ? (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 shrink-0 text-[#014AB3]" />
                <div>
                  <p className="text-muted-foreground text-xs">Password</p>
                  <p className="text-sm font-medium tracking-widest">••••••••••••</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[#014AB3] text-[#014AB3] hover:bg-[#014AB3] hover:text-white"
                onClick={() => setChangingPass(true)}
              >
                <Lock className="h-3.5 w-3.5" />
                Change Password
              </Button>
            </div>
          ) : (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    {...passwordForm.register('newPassword')}
                    type="password"
                    placeholder="••••••••"
                    className={cn('pl-9', passwordForm.formState.errors.newPassword && 'border-destructive')}
                  />
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-destructive text-xs">{passwordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    {...passwordForm.register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    className={cn('pl-9', passwordForm.formState.errors.confirmPassword && 'border-destructive')}
                  />
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-destructive text-xs">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-[#014AB3] hover:bg-[#0140a0]" disabled={changingPassword}>
                  {changingPassword ? 'Saving...' : 'Save Password'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setChangingPass(false); passwordForm.reset(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}