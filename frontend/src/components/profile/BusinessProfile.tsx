import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { getProfile, registerProfile } from "../../services/profile.service";
import { supabase } from "@/lib/supabase";

type Data = {
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  gst_number?: string;
};

const BusinessProfile: React.FC = () => {
  const [data, setData] = useState<Data>({});
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const res = await getProfile();
  //       setData(res || {});
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   })();
  // }, []);

  const handleChange = (k: keyof Data, v: string) => {
    setData((s) => ({ ...s, [k]: v }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let logoUrl = "";

      if (logoFile) {
        const fileName = `${Date.now()}-${logoFile.name}`;
        console.log("fileName :", fileName);
        const { error } = await supabase.storage
          .from("PayFlow")
          .upload(fileName, logoFile);

        if (error) {
          throw error;
        }

        const { data } = supabase.storage
          .from("PayFlow")
          .getPublicUrl(fileName);

        logoUrl = data.publicUrl;
      }
      console.log("logoUrl :", logoUrl);
      await registerProfile({
        payload: {
          bussiness_name: data.business_name,
          bussiness_email: data.business_email,
          bussiness_phone: data.business_phone,
          gst_number: data.gst_number,
          logo: logoUrl,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-card rounded-lg p-6 space-y-6">
      <div>
        <h2 className="font-semibold">Business Profile</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Information shown on invoices.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Business Name</label>
          <Input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={data.business_name || ""}
            onChange={(e) => handleChange("business_name", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Business Email</label>
          <Input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            type="email"
            value={data.business_email || ""}
            onChange={(e) => handleChange("business_email", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Business Phone</label>
          <Input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={data.business_phone || ""}
            onChange={(e) => handleChange("business_phone", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">GST Number</label>
          <Input
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={data.gst_number || ""}
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
              <p className="text-xs text-muted-foreground">
                {(logoFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Drag & drop or click to upload
            </span>
          )}

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLogoFile(file);
              }
            }}
          />
        </label>
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </section>
  );
};

export default BusinessProfile;
