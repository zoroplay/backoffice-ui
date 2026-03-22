"use client";

import React, { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Shield,
  Trash2,
  UserCheck,
  CalendarDays,
} from "lucide-react";

import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";
import Button from "@/components/ui/button/Button";

import type { UserDetail } from "../types";

type EditableUser = {
  country?: string;
  state?: string;
  language?: string;
  currency?: string;
  gender?: string;
  address?: string;
};

type UserDetailsModalProps = {
  isOpen: boolean;
  user: (UserDetail & EditableUser) | null;
  onSave: (user: UserDetail & EditableUser) => void;
  onDelete: (userId: string) => void;
  onClose: () => void;
};

const statusBadgeClasses: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  suspended: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  invited: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200",
};

export function UserDetailsModal({ isOpen, user, onClose, onSave, onDelete }: UserDetailsModalProps) {
  const [formValues, setFormValues] = useState<EditableUser>({
    country: user?.country ?? "",
    state: user?.state ?? "",
    language: user?.language ?? "English",
    currency: user?.currency ?? "NGN",
    gender: user?.gender ?? "Female",
    address: user?.address ?? "",
  });

  React.useEffect(() => {
    setFormValues({
      country: user?.country ?? "",
      state: user?.state ?? "",
      language: user?.language ?? "English",
      currency: user?.currency ?? "NGN",
      gender: user?.gender ?? "Female",
      address: user?.address ?? "",
    });
  }, [user]);

  if (!user) return null;

  const handleChange = (field: keyof EditableUser, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({
      ...user,
      ...formValues,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader>User Profile</ModalHeader>
        <ModalBody>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-shrink-0">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-gray-200 bg-brand-500/10 text-2xl font-semibold text-brand-700 shadow-md dark:border-gray-700 dark:bg-brand-500/20 dark:text-brand-200">
              {(user.name || "U")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase())
                .join("") || "U"}
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user.name}
                </h3>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    statusBadgeClasses[user.status] ?? statusBadgeClasses.active
                  }`}
                >
                  {user.status.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="h-4 w-4" />
                {user.role}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Mail className="h-4 w-4 text-brand-500" />
                {user.email}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Phone className="h-4 w-4 text-brand-500" />
                {user.phone}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-brand-500" />
                {user.location}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <CalendarDays className="h-4 w-4 text-brand-500" />
                Joined {new Date(user.joinedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 p-4 dark:border-gray-700">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Teams
              </h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.teams.map((team) => (
                  <span
                    key={team}
                    className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:bg-brand-500/20 dark:text-brand-200"
                  >
                    {team}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Country
            </label>
            <input
              value={formValues.country}
              onChange={(event) => handleChange("country", event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Country"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              State
            </label>
            <input
              value={formValues.state}
              onChange={(event) => handleChange("state", event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="State"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Language
            </label>
            <input
              value={formValues.language}
              onChange={(event) => handleChange("language", event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Currency
            </label>
            <input
              value={formValues.currency}
              onChange={(event) => handleChange("currency", event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Gender
            </label>
            <input
              value={formValues.gender}
              onChange={(event) => handleChange("gender", event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Address
            </label>
            <textarea
              value={formValues.address}
              onChange={(event) => handleChange("address", event.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Street, City, Country"
            />
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="outline"
          type="button"
          className="gap-2 text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
          onClick={() => onDelete(user.id)}
        >
          <Trash2 className="h-4 w-4" />
          Delete User
        </Button>
          <Button variant="outline" type="button" onClick={onClose}>
          Close
        </Button>
        <Button type="submit" startIcon={<UserCheck className="h-4 w-4" />}>
          Save Changes
        </Button>
      </ModalFooter>
      </form>
    </Modal>
  );
}

export default UserDetailsModal;

