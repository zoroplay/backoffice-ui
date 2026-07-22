"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, ReactNode, RefObject } from "react";
import { Edit2, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

type Segment = {
  id: string;
  name: string;
};

type CmsMessage = {
  id: string;
  title: string;
  segmentId: string;
  segment: string;
  imageUrl: string;
  content: string;
};

type SmsSetting = {
  id: string;
  displayName: string;
  gatewayName: string;
  senderId: string;
  apiKey: string;
  username: string;
  password: string;
  status: boolean;
};

const segments: Segment[] = [
  { id: "1", name: "New players" },
  { id: "2", name: "Dormant players" },
  { id: "3", name: "Retail agents" },
  { id: "4", name: "VIP players" },
];

const initialMessages: CmsMessage[] = [
  {
    id: "MSG-1001",
    title: "Welcome bonus reminder",
    segmentId: "1",
    segment: "New players",
    imageUrl: "/images/sportbook.png",
    content: "Claim your welcome offer before your first weekend accumulator.",
  },
  {
    id: "MSG-1002",
    title: "Retail settlement notice",
    segmentId: "3",
    segment: "Retail agents",
    imageUrl: "",
    content: "Daily cash settlement closes by 21:00 local time.",
  },
];

const initialSmsSettings: SmsSetting[] = [
  {
    id: "SMS-1",
    displayName: "Primary Transactional",
    gatewayName: "Termii",
    senderId: "SportBet",
    apiKey: "TERM-6a91d2c3fcab",
    username: "ops@sportbet",
    password: "secret-password",
    status: true,
  },
  {
    id: "SMS-2",
    displayName: "Marketing Backup",
    gatewayName: "Africa's Talking",
    senderId: "Promo",
    apiKey: "ATK-9e47ab115002",
    username: "marketing@sportbet",
    password: "marketing-password",
    status: false,
  },
];

const blankMessage: CmsMessage = {
  id: "",
  title: "",
  segmentId: "",
  segment: "",
  imageUrl: "",
  content: "",
};

const blankSms: SmsSetting = {
  id: "",
  displayName: "",
  gatewayName: "",
  senderId: "",
  apiKey: "",
  username: "",
  password: "",
  status: false,
};

function maskSecret(value: string) {
  if (!value || value.length < 8) return "********";
  return `${value.slice(0, 4)}********${value.slice(-4)}`;
}

export default function ContentMessagingClient() {
  const [activeTab, setActiveTab] = useState<"messages" | "sms">("messages");
  const [messages, setMessages] = useState<CmsMessage[]>(initialMessages);
  const [messageForm, setMessageForm] = useState<CmsMessage>(blankMessage);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messageError, setMessageError] = useState("");
  const [pendingMessageDelete, setPendingMessageDelete] = useState<CmsMessage | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);

  const [smsSettings, setSmsSettings] = useState<SmsSetting[]>(initialSmsSettings);
  const [smsForm, setSmsForm] = useState<SmsSetting>(blankSms);
  const [editingSmsId, setEditingSmsId] = useState<string | null>(null);
  const [smsError, setSmsError] = useState("");
  const [pendingSmsDelete, setPendingSmsDelete] = useState<SmsSetting | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function openAddMessage() {
    setEditingMessageId(null);
    setMessageForm(blankMessage);
    setMessageError("");
  }

  function openEditMessage(message: CmsMessage) {
    setEditingMessageId(message.id);
    setMessageForm(message);
    setMessageError("");
  }

  function updateMessage(key: keyof CmsMessage, value: string) {
    if (key === "segmentId") {
      const segment = segments.find((item) => item.id === value);
      setMessageForm((current) => ({ ...current, segmentId: value, segment: segment?.name ?? "" }));
      return;
    }
    setMessageForm((current) => ({ ...current, [key]: value }));
  }

  function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessageError("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateMessage("imageUrl", String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  function saveMessage() {
    if (!messageForm.title || !messageForm.segmentId || !messageForm.imageUrl || !messageForm.content) {
      setMessageError("All fields are required");
      return;
    }

    if (editingMessageId) {
      setMessages((current) =>
        current.map((message) => (message.id === editingMessageId ? { ...messageForm, id: editingMessageId } : message)),
      );
    } else {
      setMessages((current) => [...current, { ...messageForm, id: `MSG-${1000 + current.length + 1}` }]);
    }

    setMessageError("");
    setEditingMessageId(null);
    setMessageForm(blankMessage);
  }

  function deleteMessage() {
    if (!pendingMessageDelete) return;
    setMessages((current) => current.filter((message) => message.id !== pendingMessageDelete.id));
    setPendingMessageDelete(null);
  }

  function openAddSms() {
    setEditingSmsId(null);
    setSmsForm(blankSms);
    setSmsError("");
  }

  function openEditSms(setting: SmsSetting) {
    setEditingSmsId(setting.id);
    setSmsForm(setting);
    setSmsError("");
    setShowApiKey(false);
    setShowPassword(false);
  }

  function updateSms(key: keyof SmsSetting, value: string | boolean) {
    setSmsForm((current) => ({ ...current, [key]: value }));
  }

  function saveSms() {
    if (!smsForm.displayName || !smsForm.gatewayName || !smsForm.senderId || !smsForm.username || !smsForm.apiKey || !smsForm.password) {
      setSmsError("All fields are required");
      return;
    }

    if (editingSmsId) {
      setSmsSettings((current) =>
        current.map((setting) => (setting.id === editingSmsId ? { ...smsForm, id: editingSmsId } : setting)),
      );
    } else {
      setSmsSettings((current) => [...current, { ...smsForm, id: `SMS-${current.length + 1}` }]);
    }

    setSmsError("");
    setEditingSmsId(null);
    setSmsForm(blankSms);
  }

  function deleteSms() {
    if (!pendingSmsDelete) return;
    setSmsSettings((current) => current.filter((setting) => setting.id !== pendingSmsDelete.id));
    setPendingSmsDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          {[
            ["messages", "Messages"],
            ["sms", "SMS Settings"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setActiveTab(value as "messages" | "sms")}
              className={`border-b-2 px-4 py-3 text-sm font-medium ${
                activeTab === value
                  ? "border-brand-500 text-brand-600 dark:text-brand-300"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "messages" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button type="button" onClick={openAddMessage} className="inline-flex items-center gap-2 rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600">
              <Plus size={16} />
              Add New Message
            </button>
          </div>
          <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Messages</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    {["Title", "Segment", "Image", "Content", "Action"].map((head) => (
                      <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                  {messages.map((message) => (
                    <tr key={message.id}>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{message.title}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{message.segment || "-"}</td>
                      <td className="px-4 py-3">
                        {message.imageUrl ? <img src={message.imageUrl} alt="" className="h-14 w-28 rounded object-cover" /> : <span className="text-gray-500">-</span>}
                      </td>
                      <td className="max-w-sm px-4 py-3 text-gray-700 dark:text-gray-300">{message.content}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <IconButton label="Edit message" onClick={() => openEditMessage(message)}><Edit2 size={16} /></IconButton>
                          <IconButton label="Delete message" tone="danger" onClick={() => setPendingMessageDelete(message)}><Trash2 size={16} /></IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!messages.length ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No messages have been created</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <MessageForm
            form={messageForm}
            editing={Boolean(editingMessageId)}
            error={messageError}
            imageRef={imageRef}
            onChange={updateMessage}
            onImageChange={onImageChange}
            onSave={saveMessage}
            onCancel={() => {
              setEditingMessageId(null);
              setMessageForm(blankMessage);
              setMessageError("");
            }}
          />

          {pendingMessageDelete ? (
            <ConfirmDelete
              text={`You will not be able to recover ${pendingMessageDelete.title}.`}
              confirmLabel="Yes, delete message"
              cancelLabel="No, keep message"
              onCancel={() => setPendingMessageDelete(null)}
              onConfirm={deleteMessage}
            />
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button type="button" onClick={openAddSms} className="inline-flex items-center gap-2 rounded-md bg-success-500 px-4 py-2 text-sm font-medium text-white hover:bg-success-600">
              <Plus size={16} />
              Add SMS Settings
            </button>
          </div>
          <SmsSettingsTable settings={smsSettings} onEdit={openEditSms} onDelete={setPendingSmsDelete} />
          <SmsForm
            form={smsForm}
            editing={Boolean(editingSmsId)}
            error={smsError}
            showApiKey={showApiKey}
            showPassword={showPassword}
            onChange={updateSms}
            onToggleApiKey={() => setShowApiKey((value) => !value)}
            onTogglePassword={() => setShowPassword((value) => !value)}
            onSave={saveSms}
            onCancel={() => {
              setEditingSmsId(null);
              setSmsForm(blankSms);
              setSmsError("");
            }}
          />
          {pendingSmsDelete ? (
            <ConfirmDelete
              text={`You will not be able to recover ${pendingSmsDelete.displayName}.`}
              confirmLabel="Yes, delete setting"
              cancelLabel="No, keep setting"
              onCancel={() => setPendingSmsDelete(null)}
              onConfirm={deleteSms}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function MessageForm({
  form,
  editing,
  error,
  imageRef,
  onChange,
  onImageChange,
  onSave,
  onCancel,
}: {
  form: CmsMessage;
  editing: boolean;
  error: string;
  imageRef: RefObject<HTMLInputElement | null>;
  onChange: (key: keyof CmsMessage, value: string) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{editing ? "Edit Message" : "Add New Message"}</h2>
      </div>
      <form className="space-y-5 p-5">
        <TextField label="Title" value={form.title} onChange={(value) => onChange("title", value)} />
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Segment
          <select value={form.segmentId} onChange={(event) => onChange("segmentId", event.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
            <option value="">Select a segment</option>
            {segments.map((segment) => <option key={segment.id} value={segment.id}>{segment.name}</option>)}
          </select>
        </label>
        <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
          {form.imageUrl ? <img src={form.imageUrl} alt="Message image preview" className="h-28 w-full rounded-md object-cover" /> : <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-gray-300 text-sm text-gray-500 dark:border-gray-700">No image</div>}
          <div className="flex flex-col justify-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Image</label>
            <input ref={imageRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
            <button type="button" onClick={() => imageRef.current?.click()} className="w-fit rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Choose File</button>
          </div>
        </div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content
          <textarea value={form.content} onChange={(event) => onChange("content", event.target.value)} rows={4} className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        </label>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Cancel</button>
          <button type="button" onClick={onSave} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">{editing ? "Update Message" : "Save Message"}</button>
        </div>
      </form>
    </section>
  );
}

function SmsSettingsTable({ settings, onEdit, onDelete }: { settings: SmsSetting[]; onEdit: (setting: SmsSetting) => void; onDelete: (setting: SmsSetting) => void }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">SMS Settings</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>{["Display Name", "Gateway", "Sender ID", "API Key", "Username", "Password", "Status", "Action"].map((head) => <th key={head} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">{head}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {settings.map((setting) => (
              <tr key={setting.id}>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{setting.displayName}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{setting.gatewayName}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{setting.senderId}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{maskSecret(setting.apiKey)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{setting.username}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">********</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${setting.status ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"}`}>{setting.status ? "Enabled" : "Disabled"}</span></td>
                <td className="px-4 py-3"><div className="flex gap-2"><IconButton label="Edit SMS setting" onClick={() => onEdit(setting)}><Edit2 size={16} /></IconButton><IconButton label="Delete SMS setting" tone="danger" onClick={() => onDelete(setting)}><Trash2 size={16} /></IconButton></div></td>
              </tr>
            ))}
            {!settings.length ? <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">No SMS settings have been configured</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SmsForm({
  form,
  editing,
  error,
  showApiKey,
  showPassword,
  onChange,
  onToggleApiKey,
  onTogglePassword,
  onSave,
  onCancel,
}: {
  form: SmsSetting;
  editing: boolean;
  error: string;
  showApiKey: boolean;
  showPassword: boolean;
  onChange: (key: keyof SmsSetting, value: string | boolean) => void;
  onToggleApiKey: () => void;
  onTogglePassword: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{editing ? "Edit SMS Settings" : "Add SMS Settings"}</h2>
      </div>
      <form className="space-y-5 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Display Name" value={form.displayName} onChange={(value) => onChange("displayName", value)} />
          <TextField label="Gateway Name" value={form.gatewayName} onChange={(value) => onChange("gatewayName", value)} />
          <TextField label="Sender ID" value={form.senderId} onChange={(value) => onChange("senderId", value)} />
          <TextField label="Username" value={form.username} onChange={(value) => onChange("username", value)} />
          <SecretField label="API Key" value={form.apiKey} visible={showApiKey} onToggle={onToggleApiKey} onChange={(value) => onChange("apiKey", value)} />
          <SecretField label="Password" value={form.password} visible={showPassword} onToggle={onTogglePassword} onChange={(value) => onChange("password", value)} />
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <input type="checkbox" checked={form.status} onChange={(event) => onChange("status", event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-500" />
          Enable this SMS Gateway
        </label>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Cancel</button>
          <button type="button" onClick={onSave} className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">{editing ? "Update SMS Settings" : "Save SMS Settings"}</button>
        </div>
      </form>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} <span className="text-red-500">*</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
    </label>
  );
}

function SecretField({ label, value, visible, onToggle, onChange }: { label: string; value: string; visible: boolean; onToggle: () => void; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} <span className="text-red-500">*</span>
      <span className="mt-2 flex h-10 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-900">
        <input value={value} type={visible ? "text" : "password"} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm dark:text-white" />
        <button type="button" onClick={onToggle} className="inline-flex w-10 items-center justify-center text-gray-500">
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  );
}

function IconButton({ label, tone = "default", onClick, children }: { label: string; tone?: "default" | "danger"; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${
        tone === "danger"
          ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10"
          : "border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-500/30 dark:text-brand-300 dark:hover:bg-brand-500/10"
      }`}
    >
      {children}
    </button>
  );
}

function ConfirmDelete({ text, confirmLabel, cancelLabel, onConfirm, onCancel }: { text: string; confirmLabel: string; cancelLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">Are you sure?</h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-200">{text}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 dark:border-red-500/30 dark:text-red-200">{cancelLabel}</button>
          <button type="button" onClick={onConfirm} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
