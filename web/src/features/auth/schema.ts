import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome.').max(80, 'Máximo de 80 caracteres.'),
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

const messages: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha inválidos.',
  'auth/wrong-password': 'E-mail ou senha inválidos.',
  'auth/user-not-found': 'E-mail ou senha inválidos.',
  'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns instantes.',
  'auth/network-request-failed': 'Sem conexão com o servidor.',
};

export const authErrorMessage = (code: string): string =>
  messages[code] ?? 'Não foi possível concluir. Tente novamente.';
