import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_API_URL: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

export function getClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse({
    VITE_API_URL: import.meta.env.VITE_API_URL,
  });

  if (!result.success) {
    console.warn("Client environment validation failed:", result.error.flatten());
    return { VITE_API_URL: undefined };
  }

  return result.data;
}
