import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProfile, registerProfile } from "../../services/profile.service";
import { Eye, EyeOff } from "lucide-react";

const ApiConfiguration: React.FC = () => {
  const [appId, setAppId] = useState("");
  const [secret, setSecret] = useState("");
  const [webhook, setWebhook] = useState("");
  const [loading, setLoading] = useState(false);

  const [env, setEnv] = useState<"sandbox" | "production">("sandbox");
  const [showSecrets, setShowSecrets] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        setAppId(res?.cashfree_app_id || "");
        setSecret(res?.cashfree_secret_key || "");
        setWebhook(res?.webhook_secret || "");
        setEnv(res?.env || "sandbox");
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await registerProfile({
        payload: {
          cashfree_app_id: appId,
          cashfree_secret_key: secret,
          webhook_secret: webhook,
          env,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">API Configuration</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Cashfree credentials for processing payments.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
          <button
            onClick={() => setEnv("sandbox")}
            className={`px-3 py-1 text-xs rounded-md transition ${
              env === "sandbox"
                ? "bg-warning shadow text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Sandbox
          </button>

          <button
            onClick={() => setEnv("production")}
            className={`px-3 py-1 text-xs rounded-md transition ${
              env === "production"
                ? "bg-success shadow text-foreground"
                : "text-muted-foreground"
            }`}
          >
            Production
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Cashfree App ID</label>
          <Input
            className="flex h-9 w-full"
            placeholder="Enter Key..."
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Cashfree Secret Key</label>

          <div className="relative">
            <Input
              className="flex h-9 w-full"
              placeholder="Enter Key..."
              type={showSecrets ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowSecrets((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Webhook Secret</label>

          <div className="relative">
            <Input
              className="flex h-9 w-full"
              placeholder="Enter Key..."
              type={showSecrets ? "text" : "password"}
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowSecrets((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save API Config"}
      </Button>
    </section>
  );
};

export default ApiConfiguration;
