"use client";

import React, { useState } from "react";
import { Trash2, Edit2, PenSquare } from "lucide-react";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Form from "@/components/form/Form";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/modal";
import { withAuth } from "@/utils/withAuth";

import { MessageTemplate } from "./types";
import { messageTemplatesData } from "./data";

function PlayerMessagesPage() {
  const [savedTemplates, setSavedTemplates] = useState<MessageTemplate[]>(messageTemplatesData);
  
  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !body.trim()) {
      alert("Please fill in both title and body fields");
      return;
    }

    if (editingId) {
      // Update existing template
      setSavedTemplates((prev) =>
        prev.map((template) =>
          template.id === editingId
            ? { ...template, title, body }
            : template
        )
      );
      setEditingId(null);
    } else {
      // Create new template
      const newTemplate: MessageTemplate = {
        id: (savedTemplates.length + 1).toString(),
        title,
        body,
        createdAt: new Date().toISOString().split("T")[0],
        createdBy: "Admin User",
      };
      setSavedTemplates((prev) => [...prev, newTemplate]);
    }

    handleClear();
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setTitle("");
    setBody("");
    setEditingId(null);
  };

  const handleEdit = (template: MessageTemplate) => {
    setTitle(template.title);
    setBody(template.body);
    setEditingId(template.id);
    setIsModalOpen(true);
  };

  const handleDelete = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setSavedTemplates((prev) => prev.filter((t) => t.id !== templateId));
      if (editingId === templateId) {
        handleClear();
      }
    }
  };

  const openCreateModal = () => {
    handleClear();
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Breadcrumb */}
      <PageBreadcrumb pageTitle="Player Messages" />

      {/* Templates Section */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-t-lg bg-gray-100 px-4 py-3 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
          <span className="text-lg font-semibold">Saved Templates</span>
          <Button
            onClick={openCreateModal}
            startIcon={<PenSquare size={16} />}
            className="bg-emerald-500 text-white hover:bg-emerald-600"
          >
            Create
          </Button>
        </div>

        <div className="p-4">
          {savedTemplates.length === 0 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-300">
              No templates saved yet.
            </p>
          ) : (
            <div className="custom-scrollbar max-h-[600px] space-y-4 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/60"
                >
                  <div className="col-span-2">
                    <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      {template.title}
                    </h3>
                    <p className="mb-3 flex-grow text-sm text-gray-600 line-clamp-3 dark:text-gray-300">
                      {template.body}
                    </p>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4 ">
                      <span>Created: {template.createdAt}</span>
                      <span>By: {template.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(template)}
                        className="transition-colors text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit template"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="transition-colors text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        <ModalHeader>
          {editingId ? "Edit Message Template" : "Create Message Template"}
        </ModalHeader>
        <ModalBody>
          <Form id="template-form" onSubmit={handleSaveTemplate} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter message title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="body">Body</Label>
              <textarea
                id="body"
                placeholder="Type your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-hidden focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              />
            </div>
          </Form>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full items-center justify-end gap-3">
            <Button variant="outline" onClick={() => { handleClear(); setIsModalOpen(false); }}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="template-form"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default withAuth(PlayerMessagesPage);

