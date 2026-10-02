import { z } from 'zod';

export const connectionSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(60, 'Máximo de 60 caracteres.'),
});

export type ConnectionInput = z.infer<typeof connectionSchema>;

export type Connection = {
  id: string;
  tenantId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};
