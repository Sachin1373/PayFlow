import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Pencil, Building2 } from "lucide-react";
import { getBusinessProfile, registerProfile } from "../../services/profile.service";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Profile = {
  business_name: string;
  business_email: string;
  business_phone: string;
  gst_number: string;
  logo_url: string;
};

const EMPTY: Profile = {
  business_name: "",
  business_email: "",
  business_phone: "",
  gst_number: "",
  logo_url: "",
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
    <p className="text-sm text-foreground">{value || <span className="text-muted-foreground italic">—</span>}</p>
  </div>
);

const BusinessProfile: React.FC = () => {
  const [saved, setSaved] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getBusinessProfile();
        if (res) {
          setSaved(res);
          setForm(res);
        }
      } catch {
        // no profile yet — stay in create mode
      } finally {
        setFetching(false);
      }
    })();
  }, []);

  const handleChange = (k: keyof Profile, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setLoading(true);
    try {
      let logoUrl = saved?.logo_url ?? "";

      if (logoFile) {
        const fileName = `${Date.now()}-${logoFile.name}`;
        const { error } = await supabase.storage.from("PayFlow").upload(fileName, logoFile);
        if (error) throw error;
        const { data } = supabase.storage.from("PayFlow").getPublicUrl(fileName);
        logoUrl = data.publicUrl;
      }

      await registerProfile({
        payload: {
          bussiness_name: form.business_name,
          bussiness_email: form.business_email,
          bussiness_phone: form.business_phone,
          gst_number: form.gst_number,
          logo: logoUrl,
        },
      });

      const updated = { ...form, logo_url: logoUrl };
      setSaved(updated);
      setForm(updated);
      setLogoFile(null);
      setEditing(false);
      toast.success("Business profile saved");
    } catch {
      toast.error("Failed to save business profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(saved ?? EMPTY);
    setLogoFile(null);
    setEditing(false);
  };

  if (fetching) {
    return (
      <section className="bg-card rounded-lg p-6">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </section>
    );
  }

  console.log("lgog :", saved.logo_url)

  return (
    <section className="bg-card rounded-lg p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold">Business Profile</h2>
          <p className="text-xs text-muted-foreground mt-1">Information shown on invoices.</p>
        </div>
        {saved && !editing && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditing(true)}>
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        )}
      </div>

      {saved && !editing ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            {saved.logo_url ? (
              <img
                src={saved.logo_url}
                alt="Business logo"
                className="w-14 h-14 rounded-lg object-contain border border-border bg-muted/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">{saved.business_name}</p>
              <p className="text-sm text-muted-foreground">{saved.business_email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-1">
            <Field label="Business Phone" value={saved.business_phone} />
            <Field label="GST Number" value={saved.gst_number} />
          </div>
        </div>
      ) : (
        /* ── Edit / Create mode ── */
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Business Name</label>
              <Input
                className="h-9"
                placeholder="Acme Pvt. Ltd."
                value={form.business_name}
                onChange={(e) => handleChange("business_name", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Business Email</label>
              <Input
                className="h-9"
                type="email"
                placeholder="hello@acme.com"
                value={form.business_email}
                onChange={(e) => handleChange("business_email", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Business Phone</label>
              <Input
                className="h-9"
                placeholder="+91 98765 43210"
                value={form.business_phone}
                onChange={(e) => handleChange("business_phone", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">GST Number</label>
              <Input
                className="h-9"
                placeholder="22AAAAA0000A1Z5"
                value={form.gst_number}
                onChange={(e) => handleChange("gst_number", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Logo</label>
            <label className="mt-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-md p-6 cursor-pointer hover:bg-accent/30 transition">
              <Upload className="w-4 h-4 text-muted-foreground" />
              {logoFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium">{logoFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(logoFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {saved?.logo_url ? "Click to replace logo" : "Drag & drop or click to upload"}
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setLogoFile(file);
                }}
              />
            </label>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : saved ? "Save Changes" : "Save Profile"}
            </Button>
            {saved && (
              <Button variant="ghost" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default BusinessProfile;
