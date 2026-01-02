"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Camera, Mail, Phone, MapPin, Calendar, User, Save } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { withAuth } from "@/utils/withAuth";

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-brand-500";

function ProfilePage() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "/images/user/owner.jpg",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authData = JSON.parse(
        window.localStorage.getItem("authData") || "{}"
      );
      const savedAvatar = authData?.data?.avatar;
      setUserData({
        name: authData?.data?.name || authData?.data?.username || "User",
        email: authData?.data?.email || "user@example.com",
        phone: authData?.data?.phone || "+234 801 234 5678",
        location: authData?.data?.location || "Lagos, Nigeria",
        bio: authData?.data?.bio || "",
        avatar: savedAvatar && savedAvatar.trim() !== "" ? savedAvatar : "/images/user/owner.jpg",
      });
    }
  }, []);

  const handleChange = (field: keyof typeof userData, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage("Profile updated successfully!");
      if (typeof window !== "undefined") {
        const authData = JSON.parse(
          window.localStorage.getItem("authData") || "{}"
        );
        localStorage.setItem(
          "authData",
          JSON.stringify({
            ...authData,
            data: { ...authData.data, ...userData },
          })
        );
      }
    }, 600);
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Profile" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-gray-200 shadow-lg dark:border-gray-700">
                  <Image
                    src={userData.avatar}
                    alt={userData.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-brand-500 text-white shadow-lg transition hover:bg-brand-600 dark:border-gray-800"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {userData.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {userData.email}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Badge variant="light" color="success" size="sm">
                  Active
                </Badge>
                <Badge variant="light" color="primary" size="sm">
                  Verified
                </Badge>
              </div>

              <div className="mt-6 w-full space-y-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{userData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{userData.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Personal Information
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update your profile details and personal information.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className={`${inputClassName} pl-10`}
                      value={userData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      className={`${inputClassName} pl-10`}
                      value={userData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      className={`${inputClassName} pl-10`}
                      value={userData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className={`${inputClassName} pl-10`}
                      value={userData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="Enter your location"
                    />
                  </div>
                </div>
              </div>

             

              {successMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {successMessage}
                </div>
              )}

              <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                <Button variant="outline" type="button" onClick={() => window.location.reload()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} startIcon={<Save className="h-4 w-4" />}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);

