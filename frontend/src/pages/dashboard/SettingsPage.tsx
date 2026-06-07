import BusinessProfile from "@/components/profile/BusinessProfile";
import ApiConfiguration from "@/components/profile/ApiConfiguration";
import Notifications from "@/components/profile/Notifications";

const SettingsPage = () => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div><h1 className="text-2xl font-semibold tracking-tight">Settings</h1><p className="text-sm text-muted-foreground mt-1">Manage your business profile, API keys, and notification preferences.</p></div>
      <BusinessProfile />
      <ApiConfiguration />
      <Notifications />
    </div>
  );
};

export default SettingsPage;