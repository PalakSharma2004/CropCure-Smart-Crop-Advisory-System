import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  displayNameSchema,
  phoneSchema,
  chatMessageSchema,
  signUpSchema,
  signInSchema,
  validateAndSanitize,
  sanitizeString,
} from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("emailSchema", () => {
    it("should accept valid email addresses", () => {
      expect(emailSchema.safeParse("test@example.com").success).toBe(true);
      expect(emailSchema.safeParse("user.name@domain.co.in").success).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(emailSchema.safeParse("invalid").success).toBe(false);
      expect(emailSchema.safeParse("@example.com").success).toBe(false);
      expect(emailSchema.safeParse("test@").success).toBe(false);
    });

    it("should trim whitespace", () => {
      const result = emailSchema.parse("  test@example.com  ");
      expect(result).toBe("test@example.com");
    });
  });

  describe("passwordSchema", () => {
    it("should accept valid passwords", () => {
      expect(passwordSchema.safeParse("Password123").success).toBe(true);
      expect(passwordSchema.safeParse("MySecure1Pass").success).toBe(true);
    });

    it("should reject passwords without uppercase", () => {
      expect(passwordSchema.safeParse("password123").success).toBe(false);
    });

    it("should reject passwords without lowercase", () => {
      expect(passwordSchema.safeParse("PASSWORD123").success).toBe(false);
    });

    it("should reject passwords without numbers", () => {
      expect(passwordSchema.safeParse("PasswordABC").success).toBe(false);
    });

    it("should reject passwords that are too short", () => {
      expect(passwordSchema.safeParse("Pass1").success).toBe(false);
    });
  });

  describe("displayNameSchema", () => {
    it("should accept valid names", () => {
      expect(displayNameSchema.safeParse("John Doe").success).toBe(true);
      expect(displayNameSchema.safeParse("राम").success).toBe(true); // Hindi
    });

    it("should reject names with numbers", () => {
      expect(displayNameSchema.safeParse("John123").success).toBe(false);
    });

    it("should reject names with special characters", () => {
      expect(displayNameSchema.safeParse("John@Doe").success).toBe(false);
    });
  });

  describe("phoneSchema", () => {
    it("should accept valid phone numbers", () => {
      expect(phoneSchema.safeParse("+91 9876543210").success).toBe(true);
      expect(phoneSchema.safeParse("9876543210").success).toBe(true);
    });

    it("should allow empty string", () => {
      expect(phoneSchema.safeParse("").success).toBe(true);
    });
  });

  describe("chatMessageSchema", () => {
    it("should accept valid messages", () => {
      expect(chatMessageSchema.safeParse("Hello, how are you?").success).toBe(true);
    });

    it("should reject empty messages", () => {
      expect(chatMessageSchema.safeParse("").success).toBe(false);
      expect(chatMessageSchema.safeParse("   ").success).toBe(false);
    });

    it("should reject messages that are too long", () => {
      const longMessage = "a".repeat(5001);
      expect(chatMessageSchema.safeParse(longMessage).success).toBe(false);
    });
  });

  describe("signUpSchema", () => {
    it("should validate complete sign up data", () => {
      const result = signUpSchema.safeParse({
        email: "test@example.com",
        password: "Password123",
        fullName: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
      const result = signUpSchema.safeParse({
        email: "invalid",
        password: "Password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("signInSchema", () => {
    it("should validate sign in data", () => {
      const result = signInSchema.safeParse({
        email: "test@example.com",
        password: "anypassword",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with missing password", () => {
      const result = signInSchema.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Utility Functions", () => {
  describe("sanitizeString", () => {
    it("should escape HTML characters", () => {
      expect(sanitizeString("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;"
      );
    });

    it("should escape quotes", () => {
      expect(sanitizeString('test "quoted"')).toBe("test &quot;quoted&quot;");
    });

    it("should trim whitespace", () => {
      expect(sanitizeString("  hello  ")).toBe("hello");
    });
  });

  describe("validateAndSanitize", () => {
    it("should return success with valid data", () => {
      const result = validateAndSanitize(emailSchema, "test@example.com");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("test@example.com");
      }
    });

    it("should return errors with invalid data", () => {
      const result = validateAndSanitize(emailSchema, "invalid");
      expect(result.success).toBe(false);
      if (result.success === false) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });
});
