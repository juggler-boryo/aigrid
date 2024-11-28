import {
  Typography,
  CircularProgress,
  Badge,
  Chip,
  Box,
  Avatar,
} from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../apis/user";
import { User } from "../types/user";
import { getInMinutes } from "../apis/inout";
import { auth } from "../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [user] = useIdToken(auth);
  const { data: userData, isLoading: isUserDataLoading } = useQuery<User>({
    queryKey: ["user", uid],
    queryFn: () => GetUser(uid),
    enabled: !!uid,
  });

  const { data: inMinutes, isLoading: inMinutesLoading } = useQuery<number>({
    queryKey: ["inMinutes", uid],
    queryFn: async () => {
      const accessToken = await user?.getIdToken();
      if (!accessToken) return 0;
      return await getInMinutes(uid, accessToken);
    },
    enabled: !!uid,
  });

  if (isUserDataLoading || inMinutesLoading) {
    return <CircularProgress size="sm" />;
  }

  return (
    <Box mr={2}>
      <Badge badgeContent={min2Str(inMinutes || 0)} variant="outlined" showZero>
        <Chip
          variant="outlined"
          onClick={() => {
            navigate(`/profile/${uid}`);
          }}
          size="lg"
          sx={{ cursor: "pointer" }}
          startDecorator={
            <Avatar size="sm" src={userData?.avatar_image_url ?? ""} />
          }
        >
          <Typography level="title-md">
            {userData?.username || "anonymous"}
          </Typography>
        </Chip>
      </Badge>
    </Box>
  );
};

export default UserProfile;
