import { apiRouter } from "./request";

export const getProfile = () => {
  return apiRouter("get", "profile", {
    background: false,
    params: {
      age: 30,
      name: "小鑫同学",
    },
  });
};

export const getProfileByBackground = () => {
  return apiRouter("get", "profiles", {
    background: true,
    params: {
      age: 30,
    },
  });
};
