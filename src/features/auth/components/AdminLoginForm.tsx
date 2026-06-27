'use client';

import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/login.schema';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { adminAuthApi } from '@/lib/api';
import { config } from '@/lib/config';
import { ADMIN_DEMO_CREDENTIALS } from '@/mocks/admin-data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { healthApi } from '@/lib/api';

interface AdminLoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function AdminLoginForm({ onSuccess, className }: AdminLoginFormProps) {
  const { isOnline } = useNetworkStatus();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const healthQuery = useQuery({
    queryKey: queryKeys.admin.health(),
    queryFn: () => healthApi.getApiHealth().catch(() => null),
    retry: false,
    staleTime: 30_000,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: false },
  });

  const remember = watch('remember');
  const apiOnline = healthQuery.data?.success ?? false;

  const onSubmit = async (values: LoginFormValues) => {
    if (!isOnline) {
      setSubmitError('You are offline. Connect to sign in to the admin console.');
      return;
    }
    setSubmitError(null);
    try {
      const session = await adminAuthApi.adminLogin({
        identifier: values.identifier,
        password: values.password,
        remember: values.remember,
      });
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
      onSuccess?.();
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Invalid administrator credentials.';
      setSubmitError(message);
    }
  };

  const showDemoCreds = config.useMockData || config.isDemoMode;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5', className)} noValidate>
      <div
        role="status"
        className={cn(
          'flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm',
          apiOnline
            ? 'border-leaf-green/30 bg-leaf-green/10 text-farm-green'
            : 'border-clay-orange/30 bg-clay-orange/10 text-clay-orange',
        )}
      >
        <span
          className={cn('size-2 rounded-full', apiOnline ? 'bg-leaf-green' : 'bg-clay-orange')}
          aria-hidden
        />
        {healthQuery.isLoading
          ? 'Checking platform health…'
          : apiOnline
            ? 'API online — ready for administrator sign-in'
            : 'API unreachable — demo credentials may still work'}
      </div>

      {!isOnline && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-clay-orange/40 bg-clay-orange/10 px-4 py-3 text-sm"
        >
          <WifiOff className="mt-0.5 size-5 shrink-0 text-clay-orange" aria-hidden />
          <p>You are offline. Admin sign-in requires an internet connection.</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="admin-identifier">Administrator email</Label>
        <Input
          id="admin-identifier"
          type="email"
          autoComplete="username"
          placeholder="admin@farmlink.local"
          aria-invalid={Boolean(errors.identifier)}
          {...register('identifier')}
        />
        {errors.identifier && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.identifier.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <div className="relative">
          <Input
            id="admin-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="pr-12"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="admin-remember"
          checked={remember}
          onCheckedChange={(checked) =>
            setValue('remember', checked === true, { shouldDirty: true })
          }
        />
        <Label htmlFor="admin-remember" className="cursor-pointer font-normal">
          Keep me signed in on this workstation
        </Label>
      </div>

      {submitError && (
        <div className="rounded-lg border border-tomato-red/30 bg-tomato-red/10 px-4 py-3 text-sm text-tomato-red" role="alert">
          {submitError}
        </div>
      )}

      <Button type="submit" className="w-full admin-primary-btn" size="lg" disabled={isSubmitting || !isOnline}>
        {isSubmitting ? 'Authenticating…' : 'Enter command centre'}
      </Button>

      {showDemoCreds && (
        <p className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 py-3 text-center text-xs text-muted-foreground">
          Demo admin: {ADMIN_DEMO_CREDENTIALS.email} · {ADMIN_DEMO_CREDENTIALS.password}
        </p>
      )}
    </form>
  );
}
