import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .min(2, "Name is too short."),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Please enter a valid email.")
      .toLowerCase(),
    password: z
      .string()
      .min(1, "Password is required.")
      .min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email.")
    .toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email.")
    .toLowerCase(),
});

export type EmailInput = z.infer<typeof emailSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .min(1, "OTP is required.")
    .length(6, "OTP must be 6 digits."),
});

export type OtpInput = z.infer<typeof otpSchema>;

export const resetPasswordSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Please enter a valid email.")
      .toLowerCase(),
    otp: z
      .string()
      .trim()
      .min(1, "OTP is required.")
      .length(6, "OTP must be 6 digits."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    logoutAll: z.boolean().default(false),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const totpSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .length(6, "Code must be 6 digits."),
});

export type TotpInput = z.infer<typeof totpSchema>;
