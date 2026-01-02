"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import { withAuth } from "@/utils/withAuth";

const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-brand-500";

const faqItems = [
  {
    question: "How do I reset my password?",
    answer:
      "You can reset your password by going to Account Settings > Security > Change Password, or by clicking the 'Forgot Password' link on the login page.",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "Navigate to your Profile page from the user dropdown menu in the header. You can update your name, email, phone, and other personal information there.",
  },
  {
    question: "How do I enable two-factor authentication?",
    answer:
      "Go to Account Settings > Security section and toggle on Two-Factor Authentication. You'll be guided through the setup process.",
  },
  {
    question: "What should I do if I notice suspicious activity?",
    answer:
      "Immediately change your password and enable two-factor authentication. Contact support if you need further assistance securing your account.",
  },
  {
    question: "How can I change my notification preferences?",
    answer:
      "Visit Account Settings > Notifications to customize which notifications you receive via email, push, or SMS.",
  },
];

function SupportPage() {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage("Support ticket submitted successfully! We'll get back to you within 24 hours.");
      setFormData({
        subject: "",
        category: "",
        message: "",
        priority: "medium",
      });
    }, 600);
  };

  return (
    <div className="space-y-6 p-4">
      <PageBreadcrumb pageTitle="Support" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-gray-100">
              Get in Touch
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Email Support
                  </p>
                  <a
                    href="mailto:support@example.com"
                    className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                  >
                    support@example.com
                  </a>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Response within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Phone Support
                  </p>
                  <a
                    href="tel:+2348012345678"
                    className="text-sm text-brand-600 hover:underline dark:text-brand-400"
                  >
                    +234 801 234 5678
                  </a>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Mon-Fri, 9AM-6PM WAT
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Live Chat
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Available 24/7
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Click the chat icon in the bottom right
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Response Times
                </h3>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/40">
                <span className="text-gray-700 dark:text-gray-300">High Priority</span>
                <Badge variant="light" color="error" size="sm">
                  &lt; 2 hours
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/40">
                <span className="text-gray-700 dark:text-gray-300">Medium Priority</span>
                <Badge variant="light" color="warning" size="sm">
                  &lt; 24 hours
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-gray-900/40">
                <span className="text-gray-700 dark:text-gray-300">Low Priority</span>
                <Badge variant="light" color="info" size="sm">
                  &lt; 48 hours
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Support Form and FAQ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Support Ticket Form */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Submit a Support Ticket
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Describe your issue and we'll get back to you as soon as possible.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Category
                  </label>
                  <select
                    className={inputClassName}
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Priority
                  </label>
                  <select
                    className={inputClassName}
                    value={formData.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Subject
                </label>
                <input
                  type="text"
                  className={inputClassName}
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Message
                </label>
                <textarea
                  rows={6}
                  className={inputClassName}
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Please provide as much detail as possible..."
                  required
                />
              </div>

              {successMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  {successMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                startIcon={<Send className="h-4 w-4" />}
              >
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Find answers to common questions.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 dark:border-gray-800"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedFaq(expandedFaq === index ? null : index)
                    }
                    className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {faq.question}
                    </span>
                    <span
                      className={`transition-transform ${
                        expandedFaq === index ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>
                  {expandedFaq === index && (
                    <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(SupportPage);

