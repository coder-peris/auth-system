import {
  setupTotp,
  confirmTotp,
  setup2FAEmail,
  confirm2FAEmail,
  disable2FA,
} from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUser } from "@/providers/user-provider";
import { AxiosError } from "axios";

export const useTotpSetup = () => {
  const mutation = useMutation({
    mutationFn: setupTotp,
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message || "Failed to setup TOTP.";
      toast.error(message);
    },
  });

  return {
    setupTotp: mutation.mutate,
    isPending: mutation.isPending,
    data: mutation.data,
  };
};

export const useTotpConfirm = () => {
  const { refreshUser } = useUser();

  const mutation = useMutation({
    mutationFn: confirmTotp,
    onSuccess: async () => {
      toast.success("TOTP 2FA enabled successfully");
      await refreshUser();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message || "Failed to confirm TOTP.";
      toast.error(message);
    },
  });

  return {
    confirmTotp: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useEmail2FASetup = () => {
  const mutation = useMutation({
    mutationFn: setup2FAEmail,
    onSuccess: () => {
      toast.success("Verification code sent to your email");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message || "Failed to setup Email 2FA.";
      toast.error(message);
    },
  });

  return {
    setupEmail2FA: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useEmail2FAConfirm = () => {
  const { refreshUser } = useUser();

  const mutation = useMutation({
    mutationFn: confirm2FAEmail,
    onSuccess: async () => {
      toast.success("Email 2FA enabled successfully");
      await refreshUser();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message || "Failed to confirm Email 2FA.";
      toast.error(message);
    },
  });

  return {
    confirmEmail2FA: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useDisable2FA = () => {
  const { refreshUser } = useUser();

  const mutation = useMutation({
    mutationFn: disable2FA,
    onSuccess: async () => {
      toast.success("Two-factor authentication disabled");
      await refreshUser();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message = error.response?.data?.message || "Failed to disable 2FA.";
      toast.error(message);
    },
  });

  return {
    disable2FA: mutation.mutate,
    isPending: mutation.isPending,
  };
};
