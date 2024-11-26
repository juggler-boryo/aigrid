import { Typography, CircularProgress } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../apis/user";
import { User } from "../types/user";

interface UserProfileProps {
  uid: string;
}

const UserProfile = ({ uid }: UserProfileProps) => {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["user", uid],
    queryFn: () => GetUser(uid),
    enabled: !!uid,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  return <Typography>{user?.username || "anonymous"}</Typography>;
};

export default UserProfile;
