import { Info } from "lucide-react";
export const Infotext = ({text}: {text: string}) => (
  <span className="hidden md:flex items-center gap-1 mb-2 text-gray-500 dark:text-gray-400">
    <Info className="h-4 w-4 " />
    <p className="text-sm  ">
      {text}
    </p>
  </span>
);