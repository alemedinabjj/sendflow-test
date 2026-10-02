import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router';
import { Alert, Button, Link, TextField } from '@mui/material';
import { AuthCard } from './AuthCard';
import { errorCode, signUp } from './api';
import { authErrorMessage, signupSchema, type SignupInput } from './schema';

export const SignupPage = () => {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = handleSubmit(async (input) => {
    setError(null);
    try {
      await signUp(input);
    } catch (e) {
      setError(authErrorMessage(errorCode(e)));
    }
  });

  return (
    <AuthCard
      title="Criar conta"
      subtitle="Cada conta é um cliente com seus próprios dados."
      footer={
        <>
          Já tem conta?{' '}
          <Link component={RouterLink} to="/login">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Nome"
          autoComplete="name"
          autoFocus
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button type="submit" variant="contained" size="large" loading={isSubmitting}>
          Criar conta
        </Button>
      </form>
    </AuthCard>
  );
};
