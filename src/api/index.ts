import { apiRouter } from "./request";

const BASE_URL = "https://my-json-server.typicode.com/ospoon/mock";

export const getProfile = () => {
  return apiRouter("get", `${BASE_URL}/profile`, {
    background: false,
    params: {
      age: 30,
      name: "小鑫同学",
    },
  });
};

export const getProfileByBackground = () => {
  return apiRouter("get", `${BASE_URL}/profile`, {
    background: true,
    params: {
      age: 30,
    },
  });
};
