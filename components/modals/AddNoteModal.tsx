"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import  Button  from "@/components/ui/button/Button";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  playerName: string;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  playerName,
}) => {
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!note.trim()) return;
    onSave(note);
    setNote("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Add Note for {playerName}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type your note here..."
          className="w-full h-32 resize-none rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-5">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-brand-500 text-white hover:bg-brand-600">
            Save Note
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddNoteModal;
