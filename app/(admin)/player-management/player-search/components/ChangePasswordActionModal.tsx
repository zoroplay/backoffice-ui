"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal/Modal";
import { Eye, EyeOff } from "lucide-react";
import type { ActionModalBaseProps } from "./types";

type ChangePasswordActionModalProps = ActionModalBaseProps & {
  onSubmit: (payload: { password: string; conf_password: string }) => Promise<void>;
};

export function ChangePasswordActionModal({
  isOpen,
  user,
  isSubmitting = false,
  onClose,
  onSubmit,
}: ChangePasswordActionModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetForm = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) return;
    if (password !== confirmPassword) return;

    await onSubmit({
      password,
      conf_password: confirmPassword,
    });
    resetForm();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>Change Password</ModalHeader>
        <ModalBody className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set a new password for{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {user?.username ?? "-"}
            </span>
            .
          </p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {password.length > 0 && password.length < 8 ? (
              <p className="text-xs text-error-500">Minimum 8 characters.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            
            {confirmPassword.length > 0 && password !== confirmPassword ? (
              <p className="text-xs text-error-500">Passwords do not match.</p>
            ) : null}
          </div>

        </ModalBody>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              password.length < 8 ||
              confirmPassword.length < 8 ||
              password !== confirmPassword
            }
          >
            {isSubmitting ? "Saving..." : "Save Password"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default ChangePasswordActionModal;
