
import { useQuery } from "@tanstack/react-query";
import { fetchAuthSession } from "aws-amplify/auth";

import { userAxios } from "../packages/axioxinstance";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

const fetchUser = async (): Promise<User> => {
  const session = await fetchAuthSession();

  const accessToken = session.tokens?.accessToken?.toString();

  if (!accessToken) {
    throw new Error("Access token unavailable.");
  }

  const response = await userAxios.get("/api/get-profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.user;
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User>({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    user,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export default useUser;
