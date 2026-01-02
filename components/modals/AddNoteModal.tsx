"use client";

import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

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

  const handleSave = () => {
    if (!note.trim()) return;
    onSave(note);
    setNote("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader>Add Note for {playerName}</ModalHeader>

      <ModalBody>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type your note here..."
          className="w-full h-32 resize-none rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-brand-500 text-white hover:bg-brand-600">
          Save Note
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddNoteModal;
