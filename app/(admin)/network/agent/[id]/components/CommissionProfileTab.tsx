"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { SingleValue } from "react-select";
import Select from "react-select";
import Button from "@/components/ui/button/Button";
import { useTheme } from "@/context/ThemeContext";
import { reactSelectStyles } from "@/utils/reactSelectStyles";
import type { Agency } from "@/app/(admin)/network/agency-list/columns";
import { asRecord, clientId, rowValue } from "@/app/(admin)/tickets/components/ticketApiHelpers";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { toast } from "sonner";

type ProfileOption = { value: string; label: string };

type CommissionProfile = {
  id?: string | number;
  name?: string;
  providerGroup?: string;
  provider_group?: string;
  period?: string;
  commissionType?: string | number;
  commission_type?: string | number;
  calculationType?: string;
  calculation_type?: string;
  percentage?: string | number;
};

type ActiveProfile = {
  id?: string | number;
  profile?: CommissionProfile;
  [key: string]: unknown;
};

interface CommissionProfileTabProps {
  agentId: string;
  agent: Agency;
}

function recordsFrom(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter((item) => item && typeof item === "object") as Record<string, unknown>[];

  const body = asRecord(data);
  if (Array.isArray(body.data)) return recordsFrom(body.data);
  if (Array.isArray(body.items)) return recordsFrom(body.items);
  if (body.data && typeof body.data === "object") {
    const nested = asRecord(body.data);
    if (Array.isArray(nested.data)) return recordsFrom(nested.data);
    if (Array.isArray(nested.items)) return recordsFrom(nested.items);
  }

  return [];
}

function profileFrom(active: ActiveProfile): CommissionProfile {
  return active.profile ?? active;
}

function profileId(profile: CommissionProfile) {
  return String(profile.id ?? "");
}

function commissionTypeLabel(profile: CommissionProfile) {
  const period = String(rowValue(profile as Record<string, unknown>, ["period"], "-"));
  const type = profile.commissionType ?? profile.commission_type;
  if (type === 1 || type === "1" || type === 2 || type === "2" || type === 3 || type === "3") {
    return `Turnover (${period})`;
  }
  return type ? String(type) : `Turnover (${period})`;
}

function responseSucceeded(data: unknown) {
  const body = asRecord(data);
  return body.success !== false;
}

function responseMessage(data: unknown, fallback: string) {
  const body = asRecord(data);
  return String(body.message || body.error || fallback);
}

function CommissionProfileTab({ agentId }: CommissionProfileTabProps) {
  const { theme } = useTheme();
  const [profiles, setProfiles] = useState<CommissionProfile[]>([]);
  const [activeProfiles, setActiveProfiles] = useState<ActiveProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingProfileId, setRemovingProfileId] = useState<string | null>(null);

  const profileOptions = useMemo<ProfileOption[]>(
    () =>
      profiles
        .filter((profile) => profile.id !== undefined && profile.id !== null)
        .map((profile) => ({
          value: String(profile.id),
          label: String(rowValue(profile as Record<string, unknown>, ["name"], `Profile ${profile.id}`)),
        })),
    [profiles]
  );

  async function loadProfiles() {
    setLoading(true);
    const [profilesResponse, activeResponse] = await Promise.all([
      GETREQUEST<any>(`/commission/${clientId()}/profile`),
      GETREQUEST<any>(`/commission/${clientId()}/profile/users/${agentId}`),
    ]);
    setLoading(false);

    const profilesBody = asRecord(profilesResponse.data);
    if (!profilesResponse.ok || profilesBody.success === false) {
      toast.error(profilesResponse.error || profilesBody.message || "Unable to fetch commission profiles");
    } else {
      setProfiles(recordsFrom(profilesResponse.data) as CommissionProfile[]);
    }

    const activeBody = asRecord(activeResponse.data);
    if (!activeResponse.ok || activeBody.success === false) {
      toast.error(activeResponse.error || activeBody.message || "Unable to fetch active commission profiles");
    } else {
      setActiveProfiles(recordsFrom(activeResponse.data) as ActiveProfile[]);
    }
  }

  useEffect(() => {
    if (agentId) void loadProfiles();
  }, [agentId]);

  const handleProfileChange = (option: SingleValue<ProfileOption>) => {
    setSelectedProfile(option ?? null);
  };

  async function handleSave() {
    if (!selectedProfile) {
      toast.error("Please select a profile");
      return;
    }

    setSaving(true);
    const response = await POSTREQUEST<any>(`/commission/${clientId()}/profile/assign-user`, {
      userId: agentId,
      profileId: selectedProfile.value,
    });
    setSaving(false);

    if (!response.ok || !responseSucceeded(response.data)) {
      toast.error(response.error || responseMessage(response.data, "An Error occurred!"));
      await loadProfiles();
      return;
    }

    toast.success(responseMessage(response.data, "Profile saved!"));
    setSelectedProfile(null);
    await loadProfiles();
  }

  async function handleRemove(activeProfile: ActiveProfile) {
    const profile = profileFrom(activeProfile);
    const id = profileId(profile);
    if (!id) {
      toast.error("Unable to determine profile id");
      return;
    }

    setRemovingProfileId(id);
    const response = await POSTREQUEST<any>(`/commission/${clientId()}/profile/remove-profile`, {
      userId: agentId,
      profileId: id,
    });
    setRemovingProfileId(null);

    if (!response.ok || !responseSucceeded(response.data)) {
      toast.error(response.error || responseMessage(response.data, "An Error occurred!"));
      await loadProfiles();
      return;
    }

    toast.success(responseMessage(response.data, "Profile removed!"));
    setSelectedProfile(null);
    await loadProfiles();
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Active Commission Profile
          </h3>
        </div>
        <div className="space-y-4 p-5">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading profiles</div>
          ) : activeProfiles.length ? (
            activeProfiles.map((activeProfile, index) => {
              const profile = profileFrom(activeProfile);
              const id = profileId(profile) || String(index);
              return (
                <div key={id} className="rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                      <ProfileRow label="Name" value={String(rowValue(profile as Record<string, unknown>, ["name"], "-"))} />
                      <ProfileRow label="Provider Group" value={String(rowValue(profile as Record<string, unknown>, ["providerGroup", "provider_group"], "-"))} />
                      <ProfileRow label="Period" value={String(rowValue(profile as Record<string, unknown>, ["period"], "-"))} />
                      <ProfileRow label="Commission Type" value={commissionTypeLabel(profile)} />
                      <ProfileRow label="Type" value={String(rowValue(profile as Record<string, unknown>, ["calculationType", "calculation_type"], "-"))} />
                      {(profile.calculationType ?? profile.calculation_type) === "flat" ? (
                        <ProfileRow label="Percentage" value={String(rowValue(profile as Record<string, unknown>, ["percentage"], "-"))} />
                      ) : null}
                    </tbody>
                  </table>
                  <div className="p-4">
                    <Button
                      variant="error"
                      size="md"
                      onClick={() => void handleRemove(activeProfile)}
                      disabled={removingProfileId === id}
                      className="w-full"
                    >
                      {removingProfileId === id ? "Removing..." : "Remove Profile"}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              No active profile
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Set Commission Profile
          </h3>
        </div>
        <div className="space-y-5 p-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Choose Profile
            </span>
            <Select<ProfileOption>
              styles={reactSelectStyles(theme)}
              options={profileOptions}
              placeholder={loading ? "Loading profiles" : "Select profile"}
              value={selectedProfile}
              onChange={handleProfileChange}
              isDisabled={loading || saving}
              isLoading={loading}
            />
          </label>
          <Button
            variant="primary"
            size="md"
            onClick={() => void handleSave()}
            disabled={loading || saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="w-1/2 px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{label}</td>
      <td className="px-4 py-3 text-gray-900 dark:text-white">{value}</td>
    </tr>
  );
}

export default CommissionProfileTab;
