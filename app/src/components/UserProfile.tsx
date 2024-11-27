import { Typography, CircularProgress, Badge, Chip } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../apis/user";
import { User } from "../types/user";
import { getInMinutes } from "../apis/inout";
import { auth } from "../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";

interface UserProfileProps {
  uid: string;
}

const UserProfile = ({ uid }: UserProfileProps) => {
  const [user] = useIdToken(auth);
  const { data: userData, isLoading: isUserDataLoading } = useQuery<User>({
    queryKey: ["user", uid],
    queryFn: () => GetUser(uid),
    enabled: !!uid,
  });

  const { data: inMinutes, isLoading: inMinutesLoading } = useQuery<number>({
    queryKey: ["inMinutes", uid],
    queryFn: async () => {
      if (!user?.uid) return 0;
      const accessToken = await user.getIdToken();
      return await getInMinutes(user.uid, accessToken);
    },
    enabled: !!uid,
  });

  if (isUserDataLoading || inMinutesLoading) {
    return <CircularProgress />;
  }

  return (
    <Badge badgeContent={inMinutes} variant="outlined" showZero>
      <Chip variant="outlined">
        <Typography level="title-md">
          @{userData?.username || "anonymous"}
        </Typography>
      </Chip>
    </Badge>
  );
};

export default UserProfile;
