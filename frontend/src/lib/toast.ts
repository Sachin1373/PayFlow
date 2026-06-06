import { toast } from "sonner";

export const showSuccess = (msg: string) => {
  toast.success(msg, {
    style: {
      background: "#0B1F45",
      border: "1px solid rgba(34,197,94,0.3)",
      color: "#fff",
    },
  });
};

export const showError = (msg: string) => {
  toast.error(msg, {
    style: {
      background: "#0B1F45",
      border: "1px solid rgba(239,68,68,0.4)",
      color: "#fff",
    },
  });
};