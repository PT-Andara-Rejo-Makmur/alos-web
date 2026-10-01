import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as requestPasswordReset } from "@/app/api/session/password-reset/request/route";
import { POST as confirmPasswordReset } from "@/app/api/session/password-reset/confirm/route";
import { ForgotPasswordForm } from "@/features/session/forgot-password-form";
import { ResetPasswordForm } from "@/features/session/reset-password-form";
import * as api from "@/lib/api";

const originalInternalUrl = process.env.ALOS_BACKEND_INTERNAL_URL;

beforeEach(() => {
  process.env.ALOS_BACKEND_INTERNAL_URL = "http://backend.test";
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  if (originalInternalUrl === undefined) delete process.env.ALOS_BACKEND_INTERNAL_URL;
  else process.env.ALOS_BACKEND_INTERNAL_URL = originalInternalUrl;
});

describe("Password Reset Web Flow", () => {
  describe("ForgotPasswordForm", () => {
    it("submits email and displays generic success message", async () => {
      const apiSpy = vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        message: "Jika email terdaftar, instruksi pemulihan telah dikirim.",
      });

      render(<ForgotPasswordForm />);

      fireEvent.change(screen.getByLabelText(/Email Akun/i), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Kirim Instruksi Pemulihan/i }));

      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/password-reset/request", {
          method: "POST",
          body: { email: "user@example.com" },
        });
        expect(screen.getByRole("status")).toHaveTextContent(
          "Jika email terdaftar, instruksi pemulihan telah dikirim."
        );
      });
    });

    it("displays error when request fails", async () => {
      vi.spyOn(api, "sessionApiRequest").mockRejectedValue(
        new Error("Layanan belum dapat memproses permintaan.")
      );

      render(<ForgotPasswordForm />);

      fireEvent.change(screen.getByLabelText(/Email Akun/i), {
        target: { value: "user@example.com" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Kirim Instruksi Pemulihan/i }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Layanan belum dapat memproses permintaan."
      );
    });
  });

  describe("ResetPasswordForm", () => {
    const validToken = "reset-token-with-sufficient-length-abc123xyz";

    it("hides token from url and submits new password", async () => {
      window.history.replaceState(null, "", `/atur-ulang-sandi?token=${validToken}`);
      const apiSpy = vi.spyOn(api, "sessionApiRequest").mockResolvedValue({
        message: "Kata sandi berhasil diperbarui.",
      });

      render(<ResetPasswordForm />);

      await waitFor(() => expect(window.location.search).toBe(""));

      fireEvent.change(screen.getByLabelText("Kata Sandi Baru *"), {
        target: { value: "NewSecurePassword123!" },
      });
      fireEvent.change(screen.getByLabelText("Konfirmasi Kata Sandi Baru *"), {
        target: { value: "NewSecurePassword123!" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Simpan Kata Sandi Baru/i }));

      await waitFor(() => {
        expect(apiSpy).toHaveBeenCalledWith("/password-reset/confirm", {
          method: "POST",
          body: {
            token: validToken,
            password: "NewSecurePassword123!",
            password_confirmation: "NewSecurePassword123!",
          },
        });
        expect(screen.getByRole("status")).toHaveTextContent("Kata Sandi Diperbarui");
      });
    });

    it("validates password confirmation match before request", async () => {
      window.history.replaceState(null, "", `/atur-ulang-sandi?token=${validToken}`);
      const apiSpy = vi.spyOn(api, "sessionApiRequest");

      render(<ResetPasswordForm />);

      fireEvent.change(screen.getByLabelText("Kata Sandi Baru *"), {
        target: { value: "NewSecurePassword123!" },
      });
      fireEvent.change(screen.getByLabelText("Konfirmasi Kata Sandi Baru *"), {
        target: { value: "DifferentPassword123!" },
      });
      fireEvent.click(screen.getByRole("button", { name: /Simpan Kata Sandi Baru/i }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Konfirmasi kata sandi tidak cocok.");
      expect(apiSpy).not.toHaveBeenCalled();
    });

    it("shows error when token is missing", async () => {
      window.history.replaceState(null, "", "/atur-ulang-sandi");

      render(<ResetPasswordForm />);

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Tautan atur ulang kata sandi tidak valid atau telah kedaluwarsa."
      );
      expect(screen.getByRole("button", { name: /Simpan Kata Sandi Baru/i })).toBeDisabled();
    });
  });

  describe("Server Boundary for Password Reset", () => {
    it("handles request route correctly", async () => {
      const backendFetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Jika email terdaftar, instruksi pemulihan telah dikirim." }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      );
      vi.stubGlobal("fetch", backendFetch);

      const response = await requestPasswordReset(
        new NextRequest("http://web.test/api/session/password-reset/request", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: "test@example.com" }),
        })
      );

      expect(response.status).toBe(200);
      expect(backendFetch).toHaveBeenCalled();
    });

    it("rejects invalid request body without forwarding", async () => {
      const backendFetch = vi.fn();
      vi.stubGlobal("fetch", backendFetch);

      const response = await requestPasswordReset(
        new NextRequest("http://web.test/api/session/password-reset/request", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: "invalid-email" }),
        })
      );

      expect(response.status).toBe(400);
      expect(backendFetch).not.toHaveBeenCalled();
    });

    it("rejects password mismatch in confirm without forwarding", async () => {
      const backendFetch = vi.fn();
      vi.stubGlobal("fetch", backendFetch);

      const response = await confirmPasswordReset(
        new NextRequest("http://web.test/api/session/password-reset/confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            token: "some-token-with-length-25",
            password: "NewPassword123!",
            password_confirmation: "Mismatch123!",
          }),
        })
      );

      expect(response.status).toBe(422);
      expect(backendFetch).not.toHaveBeenCalled();
    });
  });
});
