import { newApiClient, unwrapData } from "../client";

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
    return unwrapData(newApiClient.get("/user/account/details"));
  },
};

