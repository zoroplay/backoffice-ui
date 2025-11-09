"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";

import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { WeeklyJackpot } from "./columns";

interface JackpotFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jackpot: Omit<WeeklyJackpot, "id" | "noOfTickets" | "ggr">) => void;
  editData?: WeeklyJackpot | null;
}

const JackpotFormModal: React.FC<JackpotFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editData,
}) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [stake, setStake] = useState("");
  const [agentCommission, setAgentCommission] = useState("");
  const [terms, setTerms] = useState("");
  const [fixtureId, setFixtureId] = useState("");
  const [fixtures, setFixtures] = useState<string[]>([]);
  const [bonuses, setBonuses] = useState<{ noOfLostGames: number; amount: number }[]>([
    { noOfLostGames: 1, amount: 0 },
  ]);

  useEffect(() => {
    if (editData) {
      setTitle(editData.title);
      setAmount(editData.amount.toString());
      setStake(editData.minStake.toString());
      setAgentCommission(editData.agentCommission.toString());
      setTerms(editData.terms);
      setFixtures(editData.fixtures);
      setBonuses(editData.bonuses);
    } else {
      resetForm();
    }
  }, [editData, isOpen]);

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setStake("");
    setAgentCommission("");
    setTerms("");
    setFixtureId("");
    setFixtures([]);
    setBonuses([{ noOfLostGames: 1, amount: 0 }]);
  };

  const handleAddFixture = () => {
    if (fixtureId.trim()) {
      setFixtures([...fixtures, fixtureId.trim()]);
      setFixtureId("");
    }
  };

  const handleRemoveFixture = (index: number) => {
    setFixtures(fixtures.filter((_, i) => i !== index));
  };

  const handleAddBonus = () => {
    const lastBonus = bonuses[bonuses.length - 1];
    setBonuses([
      ...bonuses,
      { noOfLostGames: lastBonus.noOfLostGames + 1, amount: 0 },
    ]);
  };

  const handleRemoveBonus = (index: number) => {
    if (bonuses.length > 1) {
      setBonuses(bonuses.filter((_, i) => i !== index));
    }
  };

  const handleBonusChange = (index: number, field: "noOfLostGames" | "amount", value: string) => {
    const updated = [...bonuses];
    updated[index][field] = parseFloat(value) || 0;
    setBonuses(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !amount || !stake) {
      alert("Please fill in required fields: Title, Amount, and Stake");
      return;
    }

    const newJackpot: Omit<WeeklyJackpot, "id" | "noOfTickets" | "ggr"> = {
      title,
      amount: parseFloat(amount),
      minStake: parseFloat(stake),
      noOfGames: fixtures.length,
      agentCommission: parseFloat(agentCommission) || 0,
      terms,
      fixtures,
      bonuses,
    };

    onSave(newJackpot);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="4xl">
      <ModalHeader>{editData ? "Edit Jackpot" : "Add New Jackpot"}</ModalHeader>

      <ModalBody>
        <Form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter jackpot title"
                    defaultValue={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter jackpot amount"
                    defaultValue={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min={0}
                  />
                </div>

                <div>
                  <Label htmlFor="stake">Stake *</Label>
                  <Input
                    id="stake"
                    type="number"
                    placeholder="Enter minimum stake"
                    defaultValue={stake}
                    onChange={(e) => setStake(e.target.value)}
                    min={0}
                  />
                </div>

                <div>
                  <Label htmlFor="agentCommission">Agent Commission on Stake (%)</Label>
                  <Input
                    id="agentCommission"
                    type="number"
                    placeholder="Enter commission percentage"
                    defaultValue={agentCommission}
                    onChange={(e) => setAgentCommission(e.target.value)}
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>
              </div>

              {/* Terms */}
              <div>
                <Label htmlFor="terms">Terms</Label>
                <textarea
                  id="terms"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Enter terms and conditions"
                  className="w-full h-24 resize-none rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Fixtures */}
              <div>
                <Label>Fixtures</Label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter fixture ID"
                      defaultValue={fixtureId}
                      onChange={(e) => setFixtureId(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={handleAddFixture}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Add
                    </Button>
                  </div>

                  {fixtures.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Added Fixtures ({fixtures.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {fixtures.map((fixture, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {fixture}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFixture(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bonuses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Bonuses</Label>
                  <Button
                    type="button"
                    onClick={handleAddBonus}
                    startIcon={<Plus size={16} />}
                    className="bg-green-500 hover:bg-green-600 text-white"
                    size="sm"
                  >
                    Add Bonus
                  </Button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  {bonuses.map((bonus, index) => (
                    <div key={index} className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`lostGames-${index}`}>No. of Lost Games</Label>
                        <Input
                          id={`lostGames-${index}`}
                          type="number"
                          defaultValue={bonus.noOfLostGames.toString()}
                          onChange={(e) =>
                            handleBonusChange(index, "noOfLostGames", e.target.value)
                          }
                          min={0}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`bonusAmount-${index}`}>Amount</Label>
                          <Input
                            id={`bonusAmount-${index}`}
                            type="number"
                            defaultValue={bonus.amount.toString()}
                            onChange={(e) => handleBonusChange(index, "amount", e.target.value)}
                            min={0}
                          />
                        </div>
                        {bonuses.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => handleRemoveBonus(index)}
                            variant="outline"
                            size="sm"
                            className="mt-6"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <ModalFooter className="mt-6">
              <Button variant="outline" onClick={handleCancel} type="button">
                Cancel
              </Button>
              <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
                {editData ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </Form>
      </ModalBody>
    </Modal>
  );
};

export default JackpotFormModal;

