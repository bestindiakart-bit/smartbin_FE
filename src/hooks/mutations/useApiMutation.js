import { useMutation } from "@tanstack/react-query";
import { apiMethod } from "../../axios/Global";
import { showToast } from "@/lib/toastSonner.js";

export const useApiMutation = (
  method,
  onSuccessRedirect,
  customSuccessMessage,
) => {
  return useMutation({
    mutationFn: async ({ url, body }) => {
      return await apiMethod(method, url.apiUrl, body);
    },
    onSuccess: (response) => {
      const message =
        customSuccessMessage || response.message || "Action successful!";
      showToast.success(message);

      if (onSuccessRedirect) {
        // navigate(onSuccessRedirect);
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong!";
      showToast.error(errorMessage);
      console.error(`${method.toUpperCase()} error:`, error);
    },
  });
};

export default useApiMutation;