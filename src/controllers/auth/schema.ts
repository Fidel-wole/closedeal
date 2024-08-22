import { z } from "zod";

export const SignUpSchema = z
  .object({
    firstname: z.string().min(1).max(255),
    middlename: z.string().min(1).max(255),
    lastname: z.string().min(1).max(255),
    email: z.string().email(),
    password: z.string().min(8).max(255)
  })


export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(255),
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export type SignInSchemaType = z.infer<typeof SignInSchema>;
