"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { KeyRound, LogOut, Mail, Shield, User, Users } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/AuthContext";
import { withAuth } from "@/utils/withAuth";

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return "-";
}

function imageSource(value: unknown) {
  if (typeof value === "string" && value.trim()) return value;
  return "/images/user/owner.jpg";
}

function ProfilePage() {
  const { session, signOut } = useAuth();
  const user = session?.user;
  const roles = session?.roles ?? [];
  const permissions = session?.permissions ?? [];

  const displayName = firstText(user?.name, user?.username, user?.email, "User");
  const username = firstText(user?.username, user?.name);
  const email = firstText(user?.email);
  const roleNames = roles
    .map((role) => firstText(role.name, role.id))
    .filter((role) => role !== "-");

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Profile" />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
              <Image
                src={imageSource(user?.picture ?? user?.avatar ?? user?.image)}
                alt={displayName}
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            </div>

            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">{displayName}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{username}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant="light" color={session?.token ? "success" : "warning"} size="sm">
                {session?.token ? "Authenticated" : "Session unavailable"}
              </Badge>
              {firstText(user?.role) !== "-" ? (
                <Badge variant="light" color="primary" size="sm">
                  {firstText(user?.role)}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 dark:border-gray-800">
            <ProfileLine icon={<User size={16} />} label="Username" value={username} />
            <ProfileLine icon={<Mail size={16} />} label="Email" value={email} />
            <ProfileLine icon={<Shield size={16} />} label="Permissions" value={String(permissions.length)} />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account Access</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Review the active admin session and use the account shortcuts for common access tasks.
              </p>
            </div>
            <Button type="button" variant="outline" startIcon={<LogOut size={16} />} onClick={signOut}>
              Sign out
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ActionLink href="/user-management/users" icon={<Users size={18} />} title="User Management" detail="Open the admin user list." />
            <ActionLink href="/change-password" icon={<KeyRound size={18} />} title="Change Password" detail="Update account credentials." />
            <ActionLink href="/account-settings" icon={<Shield size={18} />} title="Account Settings" detail="Review local account preferences." />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <InfoPanel title="Roles" emptyText="No roles were returned with this session.">
              {roleNames.map((role) => (
                <span key={role} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {role}
                </span>
              ))}
            </InfoPanel>

            <InfoPanel title="Permissions" emptyText="No explicit permissions were returned with this session.">
              {permissions.slice(0, 24).map((permission) => (
                <span key={permission} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {permission}
                </span>
              ))}
              {permissions.length > 24 ? (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
                  +{permissions.length - 24} more
                </span>
              ) : null}
            </InfoPanel>
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        {icon}
        {label}
      </span>
      <span className="max-w-[180px] truncate font-medium text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}

function ActionLink({
  href,
  icon,
  title,
  detail,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-gray-800 dark:hover:border-brand-700 dark:hover:bg-brand-500/10"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {icon}
      </span>
      <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{detail}</p>
    </Link>
  );
}

function InfoPanel({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.some(Boolean) : Boolean(children);

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {hasItems ? children : <p className="text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>}
      </div>
    </div>
  );
}

export default withAuth(ProfilePage);
