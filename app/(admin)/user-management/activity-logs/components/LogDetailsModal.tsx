"use client";

import React from "react";
import { Code, Globe, ServerCrash } from "lucide-react";

import Button from "@/components/ui/button/Button";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/modal/Modal";

import type { ActivityLog } from "../types";

type LogDetailsModalProps = {
  isOpen: boolean;
  log: ActivityLog | null;
  onClose: () => void;
};

const stringify = (value: Record<string, unknown>) =>
  JSON.stringify(value, null, 2);

export function LogDetailsModal({ isOpen, log, onClose }: LogDetailsModalProps) {
  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalHeader>
        Activity Details · {new Date(log.timestamp).toLocaleString()}
      </ModalHeader>
      <ModalBody className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            <Code className="h-4 w-4 text-brand-500" />
            Payload Data
          </h3>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-4 text-xs text-gray-700 shadow-sm dark:bg-gray-950 dark:text-gray-200">
{stringify(log.payload)}
          </pre>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            <ServerCrash className="h-4 w-4 text-brand-500" />
            Response Data
          </h3>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-4 text-xs text-gray-700 shadow-sm dark:bg-gray-950 dark:text-gray-200">
{stringify(log.response)}
          </pre>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-950">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            <Globe className="h-4 w-4 text-brand-500" />
            Environment
          </h3>
          <dl className="mt-3 grid gap-2 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Username
              </dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">
                {log.username}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                IP Address
              </dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">
                {log.ipAddress}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Browser & Device
              </dt>
              <dd className="font-medium text-gray-800 dark:text-gray-100">
                {log.userAgent}
              </dd>
            </div>
          </dl>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default LogDetailsModal;

