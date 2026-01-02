'use client';

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

const MIN_LENGTH = 8;
const strengthMessages = [
  "Add more characters",
  "Include numbers or symbols",
  "Looks strong",
];

function evaluateStrength(password: string) {
  let score = 0;
  if (password.length >= MIN_LENGTH) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  return Math.min(score, 3);
}

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strengthScore = useMemo(
    () => evaluateStrength(newPassword),
    [newPassword]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: string[] = [];

    if (!currentPassword.trim()) nextErrors.push("Enter your current password.");
    if (!newPassword.trim()) nextErrors.push("Enter a new password.");
    if (!confirmPassword.trim()) nextErrors.push("Confirm your new password.");

    if (newPassword && newPassword.length < MIN_LENGTH) {
      nextErrors.push(`Passwords must be at least ${MIN_LENGTH} characters.`);
    }

    if (newPassword && !/[0-9]/.test(newPassword)) {
      nextErrors.push("Include at least one number in your new password.");
    }

    if (newPassword && !/[A-Z]/.test(newPassword)) {
      nextErrors.push("Use at least one uppercase letter.");
    }

    if (newPassword && newPassword === currentPassword) {
      nextErrors.push("New password must differ from the current password.");
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      nextErrors.push("New passwords do not match.");
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setSuccessMessage(null);
      return;
    }

    setErrors([]);
    setIsSaving(true);
    setSuccessMessage(null);

    window.setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage("Password updated successfully. For security, log in again on other devices.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 600);
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Change Password" />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Change Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your credentials to keep platform access protected. Strong passwords prevent account takeovers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="light" color="info" size="sm">
              Last changed 58 days ago
            </Badge>
            <Badge variant="light" color="warning" size="sm">
              MFA Enabled
            </Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Secure accounts
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Rotate passwords every 60 days.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Complexity required
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Include upper, lower, number, and symbol.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Session hygiene
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Logout stale sessions after reset.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className={`${inputClassName} pr-12`}
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-brand-500 dark:text-gray-500"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  New Password
                </label>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Minimum {MIN_LENGTH} characters
                </span>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className={`${inputClassName} pr-12`}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-brand-500 dark:text-gray-500"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      strengthScore === 0
                        ? "w-1/5 bg-rose-500"
                        : strengthScore === 1
                        ? "w-2/5 bg-orange-500"
                        : strengthScore === 2
                        ? "w-4/5 bg-amber-500"
                        : "w-full bg-emerald-500"
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {strengthMessages[strengthScore] ?? "Add more characters"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`${inputClassName} pr-12`}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 transition hover:text-brand-500 dark:text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {errors.length > 0 ? (
              <div className="space-y-2 rounded-xl border border-rose-200 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                <p className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  Review the following:
                </p>
                <ul className="list-disc space-y-1 pl-5 text-xs">
                  {errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {successMessage ? (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
                <p>{successMessage}</p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" type="button" onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setErrors([]);
                setSuccessMessage(null);
              }}>
                Clear
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Updating..." : "Change Password"}
              </Button>
            </div>
          </form>
        </section>

        <aside className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
              <ShieldQuestion className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Password hygiene tips
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A few reminders to keep your admin access locked down.
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/40">
              Avoid using the same password for multiple platforms.
            </li>
            <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/40">
              Use passphrases to create long but memorable passwords.
            </li>
            <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/40">
              After updating, sign out of shared terminals to clear sessions.
            </li>
            <li className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/40">
              Store credentials in your corporate password manager.
            </li>
          </ul>
        </aside>

      </div>
    </div>
  );
}
