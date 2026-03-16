"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Plus, MessageSquare, Upload } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { DataTable } from "@/components/tables/DataTable";
import { Modal, ModalHeader, ModalBody } from "@/components/ui/modal/Modal";
import { toast } from "sonner";
import Badge from "@/components/ui/badge/Badge";
import { withAuth } from "@/utils/withAuth";

import { columns, createActionColumn, MessageRow } from "./columns";
import { cmsApi } from "@/lib/api/modules/cms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

function MessagingPage() {
  const [activeTab, setActiveTab] = useState("messages");
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<MessageRow | null>(null);

  // SMS Settings State
  const [smsSettings, setSmsSettings] = useState({
    provider: "",
    apiKey: "",
    senderId: "",
    status: "active"
  });

  const [formValues, setFormValues] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch Data
  React.useEffect(() => {
    if (activeTab === "messages") {
      loadMessages();
    } else {
      loadSmsSettings();
    }
  }, [activeTab]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.fetchMessages();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSmsSettings = async () => {
    try {
      setIsLoading(true);
      const data = await cmsApi.fetchSmsSettings();
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setSmsSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
       // Silently fail if settings haven't been created yet
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingMessage(null);
    setFormValues({ title: "", content: "", image: "" });
    setImagePreview("");
    setIsModalOpen(true);
  };

  const handleEdit = useCallback((message: MessageRow) => {
    setEditingMessage(message);
    setFormValues({
      title: message.title,
      content: message.content,
      image: message.image || "",
    });
    setImagePreview(message.image || "");
    setIsModalOpen(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormValues((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await cmsApi.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalValues = {
      ...formValues,
      image: imagePreview || formValues.image,
    };

    try {
      setIsLoading(true);
      if (editingMessage) {
        await cmsApi.updateMessage({ ...finalValues, id: editingMessage.id });
        toast.success("Updated successfully");
      } else {
        await cmsApi.saveMessage(finalValues);
        toast.success("Created successfully");
      }
      setIsModalOpen(false);
      loadMessages();
    } catch (error) {
      toast.error(editingMessage ? "Failed to update" : "Failed to create");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmsSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await cmsApi.saveSmsSettings(smsSettings);
      toast.success("SMS Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save SMS settings");
    } finally {
      setIsLoading(false);
    }
  };

  const columnsWithActions = useMemo(
    () => [...columns, createActionColumn({ onEdit: handleEdit, onDelete: handleDelete })],
    [handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Messaging & Communications" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-md">
          <TabsTrigger value="messages" className="flex-1 px-6 py-2.5 rounded-lg">
            <MessageSquare className="w-4 h-4 mr-2" /> Messages
          </TabsTrigger>
          <TabsTrigger value="sms-settings" className="flex-1 px-6 py-2.5 rounded-lg">
            <Settings className="w-4 h-4 mr-2" /> SMS Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-end">
            <Button
              onClick={openCreateModal}
              startIcon={<Plus className="h-4 w-4" />}
              className="w-fit bg-brand-500 hover:bg-brand-600 text-white"
            >
              Add New Message
            </Button>
          </div>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between bg-brand-500 p-5 text-white">
              <div className="flex items-center gap-2 font-semibold">
                <MessageSquare className="h-5 w-5" />
                Messages
              </div>
              <Badge variant="solid" color="neutral" className="bg-white/20 text-white border-none">
                {messages.length} Total
              </Badge>
            </div>
            <div className="p-4">
              <DataTable columns={columnsWithActions} data={messages} loading={isLoading} />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="sms-settings" className="animate-in fade-in slide-in-from-bottom-2">
           <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden max-w-2xl mx-auto">
             <div className="flex items-center gap-2 bg-brand-500 p-4 text-white font-semibold">
               <Settings className="w-5 h-5" /> Configure SMS Provider
             </div>
             <form onSubmit={handleSmsSettingsSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">SMS Provider</label>
                  <select 
                    className={inputClassName}
                    value={smsSettings.provider}
                    onChange={(e) => setSmsSettings({...smsSettings, provider: e.target.value})}
                    required
                  >
                    <option value="">Select Provider</option>
                    <option value="twilio">Twilio</option>
                    <option value="infobip">Infobip</option>
                    <option value="termii">Termii</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">API Key / Auth Token</label>
                  <input 
                    type="password"
                    className={inputClassName}
                    placeholder="Enter API Key"
                    value={smsSettings.apiKey}
                    onChange={(e) => setSmsSettings({...smsSettings, apiKey: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Sender ID / From Number</label>
                  <input 
                    type="text"
                    className={inputClassName}
                    placeholder="Ex: SBE_ADMIN"
                    value={smsSettings.senderId}
                    onChange={(e) => setSmsSettings({...smsSettings, senderId: e.target.value})}
                    required
                  />
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
             </form>
           </section>
        </TabsContent>
      </Tabs>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader>{editingMessage ? "Edit Message" : "Add New Message"}</ModalHeader>
        <ModalBody className="py-6">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Title
              </label>
              <input
                type="text"
                className={inputClassName}
                value={formValues.title}
                onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                placeholder="Enter message title"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Select Image
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <Upload className="h-4 w-4" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <span className="text-xs text-gray-400">
                    {fileInputRef.current?.files?.[0]?.name || "No file chosen"}
                  </span>
                </div>
                {imagePreview && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setFormValues((prev) => ({ ...prev, image: "" }));
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-1 right-1 bg-white/80 dark:bg-black/50 p-0.5 rounded-full hover:bg-white dark:hover:bg-black"
                    >
                      <Plus className="h-3 w-3 rotate-45" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Content
              </label>
              <textarea
                rows={5}
                className={inputClassName}
                value={formValues.content}
                onChange={(e) => setFormValues({ ...formValues, content: e.target.value })}
                placeholder="Enter message content..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-100 border-none text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </Button>
               <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Message"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
}

export default withAuth(MessagingPage);
