import api from "@/lib/axios";

export const getProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

export const updateProfile = async ({ section, payload }: { section: string; payload: any }) => {
  // For now backend expects same endpoint; section passed in body so backend can route
  const res = await api.post(`/profile`, { section, ...payload });
  return res.data;
};

export default { getProfile, updateProfile };
