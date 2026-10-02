import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router';
import { Alert, Button, Link, TextField } from '@mui/material';
import { AuthCard } from './AuthCard';
import { errorCode, signIn } from './api';
import { authErrorMessage, loginSchema, type LoginInput } from './schema';

export const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (input) => {
    setError(null);
    try {
      await signIn(input);
    } catch (e) {
      setError(authErrorMessage(errorCode(e)));
    }
  });

  return (
    <AuthCard
      title="Entrar"
      subtitle="Acesse sua conta para gerenciar seus disparos."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link component={RouterLink} to="/signup">
            Cadastre-se
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          autoFocus
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
          Entrar
        </Button>
      </form>
    </AuthCard>
  );
};
