import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getProfile, updateProfile } from "../../services/profile.service";

type NotificationsState = {
  payment_received: boolean;
  payment_failed: boolean;
  invoice_overdue: boolean;
};

const Notifications: React.FC = () => {
  const [notif, setNotif] = useState<NotificationsState>({
    payment_received: true,
    payment_failed: false,
    invoice_overdue: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        setNotif({
          payment_received: Boolean(res?.notifications?.payment_received),
          payment_failed: Boolean(res?.notifications?.payment_failed),
          invoice_overdue: Boolean(res?.notifications?.invoice_overdue),
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const toggle = (key: keyof NotificationsState) => {
    setNotif((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProfile({
        section: "notifications",
        payload: notif,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-card border border-border rounded-lg p-6 space-y-6">

      <div>
        <h2 className="font-semibold">Notifications</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Control when we should email you.
        </p>
      </div>

      <div className="space-y-4">

        <div className="flex items-center justify-between">
          <span className="text-sm">Email me when payment is received</span>

          <button
            onClick={() => toggle("payment_received")}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              notif.payment_received ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
                notif.payment_received ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Email me when payment fails</span>

          <button
            onClick={() => toggle("payment_failed")}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              notif.payment_failed ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
                notif.payment_failed ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">Email me when invoice is overdue</span>

          <button
            onClick={() => toggle("invoice_overdue")}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
              notif.invoice_overdue ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
                notif.invoice_overdue ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </section>
  );
};

export default Notifications;