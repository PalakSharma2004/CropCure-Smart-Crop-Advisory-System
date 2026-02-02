import { z } from "zod";

// Common validation schemas for user inputs

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .max(255, "Email must be less than 255 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s\u0900-\u097F]+$/, "Name can only contain letters and spaces");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[+]?[\d\s-]{10,15}$/, "Please enter a valid phone number")
  .optional()
  .or(z.literal(""));

export const locationSchema = z
  .string()
  .trim()
  .max(200, "Location must be less than 200 characters")
  .optional()
  .or(z.literal(""));

export const cropTypeSchema = z
  .string()
  .trim()
  .min(1, "Crop type is required")
  .max(100, "Crop type must be less than 100 characters")
  .regex(/^[a-zA-Z\s\u0900-\u097F]+$/, "Invalid crop type");

export const chatMessageSchema = z
  .string()
  .trim()
  .min(1, "Message cannot be empty")
  .max(5000, "Message is too long (max 5000 characters)");

// Sign up form schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: displayNameSchema.optional(),
  phone: phoneSchema,
  location: locationSchema,
});

// Sign in form schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  display_name: displayNameSchema.optional(),
  phone: phoneSchema,
  location: locationSchema,
  preferred_language: z.enum(["en", "hi"]).optional(),
  crops: z.array(z.string().max(100)).max(20).optional(),
});

// Image upload validation
export const imageFileSchema = z.object({
  size: z.number().max(10 * 1024 * 1024, "Image must be less than 10MB"),
  type: z.enum(
    ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    { errorMap: () => ({ message: "Only JPEG, PNG, and WebP images are allowed" }) }
  ),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// Utility function to sanitize HTML strings
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Validate and sanitize user input
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((issue) => issue.message),
    };
  }
  
  return { success: true, data: result.data };
}
