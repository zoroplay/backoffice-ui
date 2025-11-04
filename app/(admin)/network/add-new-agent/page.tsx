"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import Input from "@/components/form/input/InputField";
import { withAuth } from "@/utils/withAuth";

type FormData = {
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

const countryOptions = [
  { value: "nigeria", label: "Nigeria" },
  { value: "ghana", label: "Ghana" },
  { value: "kenya", label: "Kenya" },
];

const stateOptions = [
  { value: "lagos", label: "Lagos" },
  { value: "abuja", label: "Abuja" },
  { value: "kano", label: "Kano" },
];

const languageOptions = [
  { value: "english", label: "English" },
  { value: "french", label: "French" },
  { value: "spanish", label: "Spanish" },
];

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const userLevelOptions = [
  { value: "master-agent", label: "Master Agent" },
  { value: "super-agent", label: "Super Agent" },
  { value: "agent", label: "Agent" },
  { value: "shop", label: "Shop" },
  { value: "cashier", label: "Cashier" },
];

function AddNewAgentPage() {
  const [formData, setFormData] = useState<FormData>({
    country: "",
    state: "",
    language: "english",
    currency: "NGN",
    name: "",
    surname: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
    phoneNumber: "",
    username: "",
    userLevel: "",
    parentUser: "",
    openingBalance: "",
    password: "",
    confirmPassword: "",
    email: "",
    confirmEmail: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // TODO: Add API call to submit form
  };

  const handleCancel = () => {
    console.log("Form cancelled");
    // TODO: Add navigation or reset logic
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Add New User" />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {/* Section Header */}
        <div className="flex items-center gap-2 rounded-t-lg bg-blue-500 px-6 py-4 text-white">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          <h2 className="text-lg font-semibold">User Details</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
             {/* Left Column */}
             <div className="space-y-4">
               {/* Country */}
               <div>
                 <Label htmlFor="country">Country</Label>
                 <Select
                   options={countryOptions}
                   placeholder="Select country"
                   defaultValue={formData.country}
                   onChange={(value) => handleInputChange("country", value)}
                 />
               </div>

               {/* State */}
               <div>
                 <Label htmlFor="state">State</Label>
                 <Select
                   options={stateOptions}
                   placeholder="Select state"
                   defaultValue={formData.state}
                   onChange={(value) => handleInputChange("state", value)}
                 />
               </div>

               {/* Language */}
               <div>
                 <Label htmlFor="language">Language</Label>
                 <Select
                   options={languageOptions}
                   placeholder="Select language"
                   defaultValue={formData.language}
                   onChange={(value) => handleInputChange("language", value)}
                 />
               </div>

               {/* Currency */}
               <div>
                 <Label htmlFor="currency">Currency</Label>
                 <Input
                   type="text"
                   id="currency"
                   name="currency"
                   defaultValue={formData.currency}
                   onChange={(e) => handleInputChange("currency", e.target.value)}
                   placeholder="NGN"
                 />
               </div>

               {/* Name */}
               <div>
                 <Label htmlFor="name">Name</Label>
                 <Input
                   type="text"
                   id="name"
                   name="name"
                   defaultValue={formData.name}
                   onChange={(e) => handleInputChange("name", e.target.value)}
                   placeholder="Enter name"
                 />
               </div>

               {/* Surname */}
               <div>
                 <Label htmlFor="surname">Surname</Label>
                 <Input
                   type="text"
                   id="surname"
                   name="surname"
                   defaultValue={formData.surname}
                   onChange={(e) => handleInputChange("surname", e.target.value)}
                   placeholder="Enter surname"
                 />
               </div>

               {/* Date of Birth */}
               <div>
                 <Label htmlFor="dateOfBirth">Date of Birth</Label>
                 <Input
                   type="date"
                   id="dateOfBirth"
                   name="dateOfBirth"
                   defaultValue={formData.dateOfBirth}
                   onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                 />
               </div>

               {/* Gender */}
               <div>
                 <Label htmlFor="gender">Gender</Label>
                 <Select
                   options={genderOptions}
                   placeholder="Select gender"
                   defaultValue={formData.gender}
                   onChange={(value) => handleInputChange("gender", value)}
                 />
               </div>

               {/* Address */}
               <div>
                 <Label htmlFor="address">Address</Label>
                 <Input
                   type="text"
                   id="address"
                   name="address"
                   defaultValue={formData.address}
                   onChange={(e) => handleInputChange("address", e.target.value)}
                   placeholder="Enter address"
                 />
               </div>

               {/* Phone Number */}
               <div>
                 <Label htmlFor="phoneNumber">Phone Number</Label>
                 <Input
                   type="tel"
                   id="phoneNumber"
                   name="phoneNumber"
                   defaultValue={formData.phoneNumber}
                   onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                   placeholder="Enter phone number"
                 />
               </div>
             </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Username */}
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  defaultValue={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              {/* User Level */}
              <div>
                <Label htmlFor="userLevel">User Level</Label>
                <Select
                  options={userLevelOptions}
                  placeholder="Select user level"
                  defaultValue={formData.userLevel}
                  onChange={(value) => handleInputChange("userLevel", value)}
                />
              </div>

              {/* Parent User */}
              <div>
                <Label htmlFor="parentUser">Parent User</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <Input
                    type="text"
                    id="parentUser"
                    name="parentUser"
                    defaultValue={formData.parentUser}
                    onChange={(e) => handleInputChange("parentUser", e.target.value)}
                    placeholder="Search"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Opening Balance */}
              <div>
                <Label htmlFor="openingBalance">Opening Balance</Label>
                <Input
                  type="number"
                  id="openingBalance"
                  name="openingBalance"
                  defaultValue={formData.openingBalance}
                  onChange={(e) => handleInputChange("openingBalance", e.target.value)}
                  placeholder="Enter opening balance"
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  defaultValue={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Enter password"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  defaultValue={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="Confirm password"
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              {/* Confirm Email */}
              <div>
                <Label htmlFor="confirmEmail">Confirm Email</Label>
                <Input
                  type="email"
                  id="confirmEmail"
                  name="confirmEmail"
                  defaultValue={formData.confirmEmail}
                  onChange={(e) => handleInputChange("confirmEmail", e.target.value)}
                  placeholder="Confirm email"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="min-w-[120px] bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="min-w-[120px] bg-blue-500 hover:bg-blue-600"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(AddNewAgentPage);

