"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { RefreshCw, UserCheck } from "lucide-react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";
import { GETREQUEST, POSTREQUEST } from "@/utils/base_request";
import { withAuth } from "@/utils/withAuth";
import {
  asRecord,
  rowValue,
  type AnyRecord,
} from "@/app/(admin)/tickets/components/ticketApiHelpers";

type PendingAgentRequest = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  shopAddress: string;
  personalAddress: string;
  state: string;
  email: string;
  phone: string;
  raw: AnyRecord;
};

type ActivationForm = {
  username: string;
  opening_balance: string;
};

function listFromResponse(value: unknown) {
  if (Array.isArray(value)) return value;

  const body = asRecord(value);
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.results)) return body.results;
  if (Array.isArray(asRecord(body.data).data)) return asRecord(body.data).data;

  return [];
}

function textValue(record: AnyRecord, keys: string[]) {
  return String(rowValue(record, keys, ""));
}

function mapPendingRequest(value: unknown, index: number): PendingAgentRequest {
  const request = asRecord(value);

  return {
    id: String(rowValue(request, ["id"], `pending-agent-${index}`)),
    firstName: textValue(request, ["first_name", "firstName"]),
    lastName: textValue(request, ["last_name", "lastName"]),
    gender: textValue(request, ["gender"]),
    dateOfBirth: textValue(request, ["date_of_birth", "dateOfBirth", "dob"]),
    shopAddress: textValue(request, ["shop_address", "shopAddress"]),
    personalAddress: textValue(request, [
      "personal_address",
      "personalAddress",
      "contact_address",
    ]),
    state: textValue(request, ["state", "state_name", "stateName"]),
    email: textValue(request, ["email"]),
    phone: textValue(request, ["phone", "phone_number", "mobile"]),
    raw: request,
  };
}

function displayValue(value: string) {
  return value || "-";
}

function PendingRequestsPage() {
  const [rows, setRows] = useState<PendingAgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingAgentRequest | null>(null);
  const [form, setForm] = useState<ActivationForm>({
    username: "",
    opening_balance: "",
  });

  const selectedName = useMemo(() => {
    if (!selectedRequest) return "";

    return `${selectedRequest.firstName} ${selectedRequest.lastName}`.trim();
  }, [selectedRequest]);

  async function loadPendingRequests() {
    setLoading(true);
    const response = await GETREQUEST<any>("/api/admin/agent-management/pending-request");
    setLoading(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(response.error || body.message || "Unable to fetch pending requests.");
      return;
    }

    setRows(listFromResponse(response.data).map(mapPendingRequest));
  }

  useEffect(() => {
    loadPendingRequests();
  }, []);

  function openActivateModal(request: PendingAgentRequest) {
    setSelectedRequest(request);
    setForm({
      username: "",
      opening_balance: "",
    });
  }

  function closeActivateModal() {
    if (activating) return;

    setSelectedRequest(null);
    setForm({
      username: "",
      opening_balance: "",
    });
  }

  async function activateAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRequest) return;
    if (!form.username.trim() || !form.opening_balance.trim()) {
      toast.error("Username and opening balance are required");
      return;
    }

    setActivating(true);
    const payload = {
      id: selectedRequest.id,
      username: form.username.trim(),
      opening_balance: form.opening_balance.trim(),
    };
    const response = await POSTREQUEST<any>(
      "/api/admin/agent-management/activate",
      payload
    );
    setActivating(false);

    const body = asRecord(response.data);
    if (!response.ok || body.success === false) {
      toast.error(
        response.error ||
          body.message ||
          "Something went wrong. Unable to activate agent!"
      );
      return;
    }

    setRows((current) => current.filter((request) => request.id !== selectedRequest.id));
    toast.success(body.message || "Agent activated successfully");
    closeActivateModal();
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Pending Agent Requests" />

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              List
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pending agent applications awaiting activation.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPendingRequests}
            disabled={loading}
            startIcon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                  Name
                </th>
                <th className="px-5 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                  Gender
                </th>
                <th className="px-5 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                  D.O.B
                </th>
                <th className="min-w-[18rem] px-5 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                  Location
                </th>
                <th className="px-5 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                  Email
                </th>
                <th className="px-5 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                  Phone
                </th>
                <th className="px-5 py-3 text-left font-medium text-gray-600 dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Loading pending requests...
                    </span>
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((request) => (
                  <tr key={request.id} className="align-top">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                      {displayValue(`${request.firstName} ${request.lastName}`.trim())}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {displayValue(request.gender)}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {displayValue(request.dateOfBirth)}
                    </td>
                    <td className="space-y-1 px-5 py-4 text-gray-700 dark:text-gray-300">
                      <p>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Shop Address:
                        </span>{" "}
                        {displayValue(request.shopAddress)}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          Contact Address:
                        </span>{" "}
                        {displayValue(request.personalAddress)}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          State:
                        </span>{" "}
                        {displayValue(request.state)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {displayValue(request.email)}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-300">
                      {displayValue(request.phone)}
                    </td>
                    <td className="px-5 py-4">
                      <Button
                        size="sm"
                        onClick={() => openActivateModal(request)}
                        startIcon={<UserCheck className="h-4 w-4" />}
                      >
                        Activate
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    No pending agent request
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        isOpen={Boolean(selectedRequest)}
        onClose={closeActivateModal}
        closeOnBackdrop={false}
        size="md"
      >
        <form onSubmit={activateAgent}>
          <ModalHeader>Activate Agent</ModalHeader>
          <ModalBody className="space-y-5">
            {selectedName ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Activating{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedName}
                </span>
                .
              </p>
            ) : null}

            <div className="space-y-2">
              <label
                htmlFor="pending-agent-username"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Username <span className="text-error-500">*</span>
              </label>
              <input
                id="pending-agent-username"
                name="username"
                type="text"
                required
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                placeholder="Enter Agent Userame"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="pending-agent-opening-balance"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Opening Balance <span className="text-error-500">*</span>
              </label>
              <input
                id="pending-agent-opening-balance"
                name="opening_balance"
                type="text"
                required
                value={form.opening_balance}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    opening_balance: event.target.value,
                  }))
                }
                placeholder="Enter amount"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              type="button"
              onClick={closeActivateModal}
              disabled={activating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={activating}>
              {activating ? "Activating..." : "Save"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}

export default withAuth(PendingRequestsPage);
