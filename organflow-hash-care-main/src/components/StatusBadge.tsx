import { CheckCircle, Clock, Truck, FileQuestion, AlertCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Status = "available" | "in-transit" | "transplanted" | "requested" | "pending" | "accepted" | "rejected";

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const configs = {
    available: {
      icon: CheckCircle,
      label: "Available",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    "in-transit": {
      icon: Truck,
      label: "In Transit",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    transplanted: {
      icon: Clock,
      label: "Transplanted",
      className: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    },
    requested: {
      icon: FileQuestion,
      label: "Requested",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    pending: {
      icon: AlertCircle,
      label: "Pending",
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    },
    accepted: {
      icon: CheckCircle,
      label: "Accepted",
      className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    },
    rejected: {
      icon: X,
      label: "Rejected",
      className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-1 px-3 py-1`}>
      <Icon className="w-3 h-3" />
      <span className="font-medium">{config.label}</span>
    </Badge>
  );
};

export default StatusBadge;
