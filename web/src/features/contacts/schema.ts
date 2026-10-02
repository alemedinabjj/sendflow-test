import { z } from 'zod';
import { isValidPhone, normalizePhone } from './phone';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(80, 'Máximo de 80 caracteres.'),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine(isValidPhone, 'Telefone inválido. Use DDD + número, ex.: (11) 98888-7777.'),
});

export type ContactFormValues = z.input<typeof contactSchema>;
export type ContactInput = z.output<typeof contactSchema>;

export type Contact = {
  id: string;
  tenantId: string;
  connectionId: string;
  name: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
};
