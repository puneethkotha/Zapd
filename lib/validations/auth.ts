import { z } from "zod"

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const roleSelectionSchema = z.object({
  role: z.enum(["driver", "host"]),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type RoleSelectionInput = z.infer<typeof roleSelectionSchema>

// Aliases for page imports
export const loginSchema = signInSchema
export type LoginInput = SignInInput
export const signupSchema = signUpSchema
export type SignupInput = SignUpInput
