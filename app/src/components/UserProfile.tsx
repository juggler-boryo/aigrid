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
import { Min2Str } from "../libs/min2str";

interface UserProfileProps {
  uid: string;
  isOnlyAvatar?: boolean;
  disableClick?: boolean;
  selected?: boolean;
  disablebadge?: boolean;
}

const UserProfile = ({
  uid,
  isOnlyAvatar = false,
  disableClick = false,
  selected = false,
  disablebadge = false,
}: UserProfileProps) => {
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
    enabled: !!uid && !disablebadge,
  });

  if (isUserDataLoading) {
    return <CircularProgress size="sm" />;
  }

  if (isOnlyAvatar) {
    return (
      <Box>
        <Avatar
          size="sm"
          src={userData?.avatar_image_url ?? ""}
          onClick={() => navigate(`/profile/${uid}`)}
          sx={{ cursor: "pointer" }}
        />
      </Box>
    );
  }

  return (
    <Box mr={2}>
      <Badge
        badgeContent={Min2Str(inMinutes || 0)}
        variant="outlined"
      >
        <Chip
          variant="outlined"
          onClick={() => {
            if (!disableClick) {
              navigate(`/profile/${uid}`);
            }
          }}
          size="lg"
          sx={{
            cursor: disableClick ? "default" : "pointer",
            border: selected
              ? "3px solid var(--joy-palette-primary-400)"
              : undefined,
          }}
          startDecorator={
            userData?.permission_str !== "GUEST" && (
              <Avatar size="sm" src={userData?.avatar_image_url ?? ""} />
            )
          }
        >
          <Typography mr={1} level="title-md">
            {userData?.username || "anonymous"}
          </Typography>
        </Chip>
      </Badge>
    </Box>
  );
};

export default UserProfile;
