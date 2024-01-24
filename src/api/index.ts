import { apiRouter } from "./fatch";

export const getProfile = async (
    success?: (result: any) => void,
    fail?: (error: any) => void,
    done?: () => void
  ) => {
    apiRouter("profile", "get", null, {
      background: false,
      success,
      fail,
      done,
    });
  };
  
  export const getProfileByBackground = (
    success: (result: any) => void,
    fail: (error: any) => void,
    done?: () => void
  ) => {
    apiRouter("profile", "get", null, { background: true, success, fail, done });
  };
  