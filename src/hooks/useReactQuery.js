import { useQuery } from "@tanstack/react-query";
import { getApiMethod, getPublicApiMethod } from "../axios/Global";
import { API_ENDPOINTS } from "../axios/Config";

export const useReactQuery = (
  key,
  query_string = "",
  enabled = true,
  isPublic = false,
) => {
  return useQuery({
    queryKey: [key, API_ENDPOINTS[key], query_string],
    queryFn: isPublic ? getPublicApiMethod : getApiMethod,
    enabled,
    retry: 0,
    refetchOnMount: true,
  });
};

export default useReactQuery;