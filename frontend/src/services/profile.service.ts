import api from "@/lib/axios";

export const getBusinessProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

export const registerProfile = async ({ payload }: { payload: any }) => {
  const res = await api.post(`/profile/register`, { ...payload });
  return res.data;
};

export default { getBusinessProfile, registerProfile };
