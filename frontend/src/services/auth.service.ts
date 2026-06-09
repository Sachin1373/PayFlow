import api from "@/lib/axios";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  mobile_no: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (
  data: RegisterPayload
) => {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};

export const loginUser = async (
  data: LoginPayload
) => {
  const response = await api.post(
    "/auth/login",
    data
  );

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};