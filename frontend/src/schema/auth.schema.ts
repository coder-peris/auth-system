import { z } from "zod";

const NO_EMOJI_REGEX = /^[^\p{Extended_Pictographic}]*$/u;

const email = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please enter a valid email.")
  .toLowerCase();

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .min(2, "Name is too short.")
      .regex(NO_EMOJI_REGEX, "Name cannot contain emojis."),
    email,
    password: z
      .string()
      .min(1, "Password is required.")
      .min(8, "Password must be at least 8 characters.")
      .max(25, "Password cannot exceed 25 characters.")
      .regex(NO_EMOJI_REGEX, "Password cannot contain emojis."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, "Password is required.")
    .regex(NO_EMOJI_REGEX, "Password cannot contain emojis."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const emailSchema = z.object({
  email,
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
    email,
    otp: z
      .string()
      .trim()
      .min(1, "OTP is required.")
      .length(6, "OTP must be 6 digits."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(25, "Password cannot exceed 25 characters.")
      .regex(NO_EMOJI_REGEX, "Password cannot contain emojis."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    logoutAll: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .regex(NO_EMOJI_REGEX, "Password cannot contain emojis."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(25, "Password cannot exceed 25 characters.")
      .regex(NO_EMOJI_REGEX, "Password cannot contain emojis."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    sessionOption: z.enum(["LOGOUT_ALL", "LOGOUT_OTHERS", "DONT_LOGOUT"]),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const changeEmailSchema = z.object({
  newEmail: email,
  otp: z.string().optional(),
  password: z.string().optional(),
});

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;

export const totpSchema = z.object({
  code: z.string().min(6, "Code must be 6 characters."),
});

export type TotpInput = z.infer<typeof totpSchema>;
