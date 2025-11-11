"use client";

import React, { useState } from "react";
import { Search, User } from "lucide-react";

import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";

const countries = ["Nigeria", "Ghana", "Kenya", "South Africa"];
const states = ["Lagos", "Abuja", "Rivers", "Oyo"];
const languages = ["English", "French", "Spanish"];
const currencies = ["NGN", "USD", "EUR", "KES"];
const genders = ["Female", "Male", "Other"];
const userLevels = [
  "Super Admin",
  "Risk Manager",
  "Customer Support",
  "Finance",
  "Affiliate Manager",
];

export type AddUserFormValues = {
  country: string;
  state: string;
  language: string;
  currency: string;
  name: string;
  surname: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneNumber: string;
  username: string;
  userLevel: string;
  parentUser: string;
  openingBalance: string;
  password: string;
  confirmPassword: string;
  email: string;
  confirmEmail: string;
};

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: AddUserFormValues) => void;
};

const defaultValues: AddUserFormValues = {
  country: "",
  state: "",
  language: "English",
  currency: "NGN",
  name: "",
  surname: "",
  dateOfBirth: "",
  gender: "Female",
  address: "",
  phoneNumber: "",
  username: "",
  userLevel: "Customer Support",
  parentUser: "",
  openingBalance: "",
  password: "",
  confirmPassword: "",
  email: "",
  confirmEmail: "",
};

export function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
  const [formValues, setFormValues] =
    useState<AddUserFormValues>(defaultValues);

  const handleChange = (field: keyof AddUserFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setFormValues(defaultValues);
    onClose();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (formValues.password !== formValues.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (formValues.email !== formValues.confirmEmail) {
      alert("Emails do not match");
      return;
    }
    onSubmit(formValues);
    setFormValues(defaultValues);
  };

  const renderSelect = (
    label: string,
    field: keyof AddUserFormValues,
    options: string[]
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}
      </label>
      <select
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        value={formValues[field]}
        onChange={(event) => handleChange(field, event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  const renderInput = (
    label: string,
    field: keyof AddUserFormValues,
    props?: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {label}
      </label>
      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        value={formValues[field]}
        onChange={(event) => handleChange(field, event.target.value)}
        {...props}
      />
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <span className="flex items-center gap-2">
            <User className="h-5 w-5 text-brand-500" />
            Add New User
          </span>
        </ModalHeader>
        <ModalBody className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {renderSelect("Country", "country", ["", ...countries])}
            {renderSelect("State", "state", ["", ...states])}
            {renderSelect("Language", "language", languages)}
            {renderSelect("Currency", "currency", currencies)}
            {renderInput("First Name", "name", { placeholder: "Jane" })}
            {renderInput("Surname", "surname", { placeholder: "Doe" })}
            {renderInput("Date of Birth", "dateOfBirth", { type: "date" })}
            {renderSelect("Gender", "gender", genders)}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {renderInput("Address", "address", { placeholder: "Street, City" })}
            {renderInput("Phone Number", "phoneNumber", {
              placeholder: "+234 800 000 0000",
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {renderInput("Username", "username", { placeholder: "janedoe" })}
            {renderSelect("User Level", "userLevel", userLevels)}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Parent User
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  className="w-full bg-transparent focus:outline-none"
                  placeholder="Search"
                  value={formValues.parentUser}
                  onChange={(event) =>
                    handleChange("parentUser", event.target.value)
                  }
                />
              </div>
            </div>
            {renderInput("Opening Balance", "openingBalance", {
              placeholder: "₦0.00",
              type: "number",
              min: "0",
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {renderInput("Password", "password", { type: "password" })}
            {renderInput("Confirm Password", "confirmPassword", {
              type: "password",
            })}
            {renderInput("Email", "email", {
              type: "email",
              placeholder: "user@example.com",
            })}
            {renderInput("Confirm Email", "confirmEmail", { type: "email" })}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Create User</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default AddUserModal;

