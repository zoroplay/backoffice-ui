export type PlayerActionTarget = {
  id: number;
  username: string;
  status: number;
  verified: number;
};

export type ActionModalBaseProps = {
  isOpen: boolean;
  user: PlayerActionTarget | null;
  isSubmitting?: boolean;
  onClose: () => void;
};
