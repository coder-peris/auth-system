import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Contact email is required.")
  .email("Please enter a valid email.")
  .toLowerCase();

export const supportSchema = z.object({
  contactEmail: email,
  subject: z
    .string()
    .trim()
    .min(1, "Subject is required.")
    .min(5, "Subject must be at least 5 characters.")
    .max(100, "Subject cannot exceed 100 characters."),
  problemDescription: z
    .string()
    .trim()
    .min(1, "Problem description is required.")
    .min(
      20,
      "Please provide more details about your issue (at least 20 characters).",
    )
    .max(1000, "Problem description cannot exceed 1000 characters."),
  issueType: z.enum(["login", "account", "technical", "other"], {
    message: "Please select an issue type.",
  }),
});

export type SupportInput = z.infer<typeof supportSchema>;
