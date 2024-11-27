import { Typography, CircularProgress, Badge, Chip, Box } from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../apis/user";
import { User } from "../types/user";
import { getInMinutes } from "../apis/inout";
import { auth } from "../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";

interface UserProfileProps {
  uid: string;
}

const min2Str = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

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
    return <CircularProgress size="sm" />;
  }

  return (
    <Box mr={1}>
      <Badge badgeContent={min2Str(inMinutes || 0)} variant="outlined" showZero>
        <Chip variant="outlined">
          <Typography level="title-md">
            @{userData?.username || "anonymous"}
          </Typography>
        </Chip>
      </Badge>
    </Box>
  );
};

export default UserProfile;
