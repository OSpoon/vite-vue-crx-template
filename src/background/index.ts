import { immediateRoute } from "@/api/request";
import { inject } from "@/message";

inject(
  {
    userData: () => {
      return {
        name: "张三",
        age: 18,
      };
    },
    apiRequest: async (data: any) => {
      const { method, path, options } = data;
      try {
        const data: any = await immediateRoute(method, path, options);
        return {
          _code: "success",
          data,
        };
      } catch (error) {
        if (typeof error === "string") {
          return {
            _code: "fail",
            error: {
              message: error,
            },
          };
        } else if (error instanceof Error) {
          return {
            _code: "fail",
            error: {
              message: error.message,
            },
          };
        }
      }
    },
  },
  "sw"
);

console.log("service worker started !!!");
