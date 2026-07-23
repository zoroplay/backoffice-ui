"use client";

import { useState } from "react";
import { toast } from "sonner";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import { withAuth } from "@/utils/withAuth";

type MessageTemplate = {
  title: string;
  body: string;
};

function PlayerMessagesPage() {
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [templateList, setTemplateList] = useState<MessageTemplate[]>([]);

  function clearForm() {
    setTemplateTitle("");
    setTemplateContent("");
  }

  function saveTemplate() {
    if (!templateTitle.trim() || !templateContent.trim()) {
      toast.error("Please enter both title and body");
      return;
    }

    setTemplateList((current) => [
      {
        title: templateTitle.trim(),
        body: templateContent.trim(),
      },
      ...current,
    ]);
    clearForm();
    toast.success("Template saved successfully!");
  }

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Player Messages" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(20rem,5fr)]">
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:order-1">
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Saved Templates
            </h2>
          </div>
          <div className="p-5">
            {!templateList.length ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No templates saved yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                {templateList.map((template, index) => (
                  <li key={`${template.title}-${index}`} className="p-4">
                    <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {template.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:order-2">
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Create Message Template
            </h2>
          </div>
          <div className="space-y-4 p-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </span>
              <input
                id="messageTitle"
                value={templateTitle}
                onChange={(event) => setTemplateTitle(event.target.value)}
                placeholder="Enter message title"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Body
              </span>
              <textarea
                id="messageBody"
                value={templateContent}
                onChange={(event) => setTemplateContent(event.target.value)}
                rows={6}
                placeholder="Type your message..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </label>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={clearForm}>
                Clear
              </Button>
              <Button type="button" onClick={saveTemplate}>
                Save
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default withAuth(PlayerMessagesPage);
