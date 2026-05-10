import { api } from "@/lib/axios-instance";
import type { LoginInput, RegisterInput } from "@/schema/auth.schema";

export const registerUser = async (
  data: Omit<RegisterInput, "confirmPassword">,
) => {
  const { data: res } = await api.post("/auth/register", data);
  return res;
};

export const loginUser = async (data: LoginInput) => {
  const { data: res } = await api.post("/auth/login", data);
  return res;
};

export const sendMagicLink = async (email: string) => {
  const { data: res } = await api.post("/auth/magic-link", { email });
  return res;
};

export const verifyMagicLink = async (email: string, token: string) => {
  const { data: res } = await api.post("/auth/magic-link/verify", {
    email,
    token,
  });
  return res;
};

export const forgotPassword = async (email: string) => {
  const { data: res } = await api.post("/auth/forgot-password", { email });
  return res;
};

export const resetPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
  logoutAll: boolean;
}) => {
  const { data: res } = await api.post("/auth/reset-password", data);
  return res;
};

export const verifyEmail = async (email: string, otp: string) => {
  const { data: res } = await api.post("/auth/verify-email", { email, otp });
  return res;
};

export const resendVerification = async (email: string) => {
  const { data: res } = await api.post("/auth/resend-verification", { email });
  return res;
};

export const verify2FAEmail = async (pendingSessionId: string, otp: string) => {
  const { data: res } = await api.post("/auth/2fa/email/verify", {
    pendingSessionId,
    otp,
  });
  return res;
};

export const verify2FATOTP = async (pendingSessionId: string, code: string) => {
  const { data: res } = await api.post("/auth/2fa/totp/verify", {
    pendingSessionId,
    code,
  });
  return res;
};

export const logout = async () => {
  const { data: res } = await api.post("/auth/logout");
  return res;
};

export const logoutAll = async () => {
  const { data: res } = await api.post("/auth/logout-all");
  return res;
};

export const getMe = async () => {
  const { data: res } = await api.get("/auth/me");
  return res;
};

export const getCurrentUser = async () => {
  const { data: res } = await api.get("/auth/me");
  return res;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
  sessionOption: "LOGOUT_ALL" | "LOGOUT_OTHERS" | "DONT_LOGOUT";
}) => {
  const { data: res } = await api.post("/auth/change-password", data);
  return res;
};

export const requestEmailChange = async () => {
  const { data: res } = await api.post("/auth/change-email/request");
  return res;
};

export const changeEmail = async (data: {
  newEmail: string;
  otp?: string;
  password?: string;
}) => {
  const { data: res } = await api.patch("/auth/change-email", data);
  return res;
};

export const getSessions = async () => {
  const { data: res } = await api.get("/auth/sessions");
  return res;
};

export const revokeSession = async (sessionId: string) => {
  const { data: res } = await api.delete(`/auth/sessions/${sessionId}`);
  return res;
};

export const setupTotp = async () => {
  const { data: res } = await api.post("/auth/2fa/totp/setup");
  return res;
};

export const confirmTotp = async (code: string) => {
  const { data: res } = await api.post("/auth/2fa/totp/confirm", { code });
  return res;
};

export const setup2FAEmail = async () => {
  const { data: res } = await api.post("/auth/2fa/email/setup");
  return res;
};

export const confirm2FAEmail = async (otp: string) => {
  const { data: res } = await api.post("/auth/2fa/email/confirm", { otp });
  return res;
};

export const disable2FA = async () => {
  const { data: res } = await api.post("/auth/2fa/disable");
  return res;
};
