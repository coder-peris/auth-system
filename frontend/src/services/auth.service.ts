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
