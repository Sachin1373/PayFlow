import api from "@/lib/axios";

export const getProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

export const registerProfile = async ({ payload }: { payload: any }) => {
  // For now backend expects same endpoint; section passed in body so backend can route
  const res = await api.post(`/profile/register`, { ...payload });
  return res.data;
};

export default { getProfile, registerProfile };
