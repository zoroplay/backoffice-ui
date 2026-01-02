"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Globe,
  Moon,
  Sun,
  Shield,
  Mail,
  Smartphone,
  Save,
  CheckCircle2,
  LockIcon,
  XCircleIcon,
} from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Select, { type SingleValue } from "react-select";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import { withAuth } from "@/utils/withAuth";

type SelectOption = {
  value: string;
  label: string;
};

function AccountSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    language: "English",
    timezone: "Africa/Lagos",
    twoFactorAuth: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("accountSettings");
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings));
        } catch (error) {
          console.warn("Failed to parse saved settings");
        }
      }
    }
  }, []);

  const handleToggle = (field: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSelectChange = (field: keyof typeof settings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleLanguageChange = (option: SingleValue<SelectOption>) => {
    if (option) {
      handleSelectChange("language", option.value);
    }
  };

  const handleTimezoneChange = (option: SingleValue<SelectOption>) => {
    if (option) {
      handleSelectChange("timezone", option.value);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage("Settings saved successfully!");
      if (typeof window !== "undefined") {
        localStorage.setItem("accountSettings", JSON.stringify(settings));
      }
    }, 600);
  };

  const languageOptions: SelectOption[] = [
    { value: "English", label: "English" },
    { value: "French", label: "French" },
    { value: "Spanish", label: "Spanish" },
    { value: "Portuguese", label: "Portuguese" },
  ];

  const timezoneOptions: SelectOption[] = [
    { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
    { value: "Africa/Accra", label: "Africa/Accra (GMT)" },
    { value: "Africa/Nairobi", label: "Africa/Nairobi (EAT)" },
    { value: "UTC", label: "UTC" },
  ];

  const selectedLanguage = languageOptions.find((opt) => opt.value === settings.language) || null;
  const selectedTimezone = timezoneOptions.find((opt) => opt.value === settings.timezone) || null;

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Account Settings" />

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="mb-6 w-full justify-start bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-brand-600 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-brand-400 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-brand-600 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-brand-400 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <Globe className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-brand-600 dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-brand-400 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notifications Section */}
          <TabsContent value="notifications" className="mt-0">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Notifications
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage how you receive notifications and updates.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Email Notifications
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive updates via email
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={() => handleToggle("emailNotifications")}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700 dark:peer-checked:bg-brand-500 dark:after:bg-gray-300" />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Push Notifications
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive browser push notifications
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={() => handleToggle("pushNotifications")}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700 dark:peer-checked:bg-brand-500 dark:after:bg-gray-300" />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        SMS Notifications
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive important alerts via SMS
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={() => handleToggle("smsNotifications")}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700 dark:peer-checked:bg-brand-500 dark:after:bg-gray-300" />
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Marketing Emails
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Receive promotional and marketing emails
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.marketingEmails}
                      onChange={() => handleToggle("marketingEmails")}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700 dark:peer-checked:bg-brand-500 dark:after:bg-gray-300" />
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Preferences Section */}
          <TabsContent value="preferences" className="mt-0">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Preferences
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customize your application preferences.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Theme
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 transition ${
                        theme === "light"
                          ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:border-brand-400 dark:bg-brand-500/20 dark:text-brand-400"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-lg border p-3 transition ${
                        theme === "dark"
                          ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:border-brand-400 dark:bg-brand-500/20 dark:text-brand-400"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                  </div>
                </div>
 
                <div className="grid gap-6 md:grid-cols-2"> 
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Language
                    </label>
                    <Select<SelectOption, false>
                      styles={reactSelectStyles(theme)}
                      options={languageOptions}
                      value={selectedLanguage}
                      placeholder="Select language"
                      onChange={handleLanguageChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Timezone
                    </label>
                    <Select<SelectOption, false>
                      styles={reactSelectStyles(theme)}
                      options={timezoneOptions}
                      value={selectedTimezone}
                      placeholder="Select timezone"
                      onChange={handleTimezoneChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Section */}
          <TabsContent value="security" className="mt-0">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Security
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage your account security settings.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {settings.twoFactorAuth && (
                      <Badge variant="light" color="success" size="sm">
                        Enabled
                      </Badge>
                    )}
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={() => handleToggle("twoFactorAuth")}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-checked:after:border-white dark:bg-gray-700 dark:peer-checked:bg-brand-500 dark:after:bg-gray-300" />
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                  <div className="flex items-start gap-3">
                    <LockIcon className="mt-0.5 h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Change Password
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Update your password regularly to keep your account secure.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => (window.location.href = "/change-password")}
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {successMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              {successMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" type="button" startIcon={<XCircleIcon className="h-4 w-4" />} onClick={() => window.location.reload()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} startIcon={<Save className="h-4 w-4" />}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}

export default withAuth(AccountSettingsPage);

