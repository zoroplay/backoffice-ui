import { newApiClient, unwrapData } from "../client";
import { apiEnv } from "../env";

const clientId = apiEnv.clientId;

export type LoginPayload = {
  username: string;
  password: string;
};

export const authApi = {
  login(payload: LoginPayload) {
    return unwrapData(
      newApiClient.post("/auth/login?source=admin", payload)
    );
  },
  me() {
    return unwrapData(newApiClient.get(`/auth/details/${clientId}`));
  },
};

