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

  const { data: inMinutes } = useQuery<number>({
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
        color="primary"
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
          {userData?.uid == "d3vzW4JXK4TuDHs1QBM5ce3uh5y2" ? (
            <Typography mr={1} level="title-md" sx={sakoStyle}>
              {userData?.username || "anonymous"}
            </Typography>
          ) : userData?.uid == "ZewnOPpCyZgorBom7SbLcopxJxx2" ? (
            <Box display="flex" alignItems="center" sx={jumangoStyle}>
              <img
                src="/jl.png"
                alt="jl"
                style={{ height: "24px", zIndex: -100 }}
              />
            </Box>
          ) : (
            <Typography mr={1} level="title-md">
              {userData?.username || "anonymous"}
            </Typography>
          )}
        </Chip>
      </Badge>
    </Box>
  );
};

const sakoStyle = {
  background:
    "linear-gradient(45deg, red, orange, yellow, green, cyan, blue, indigo, violet, purple, pink, red)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundSize: "400% 400%",
  animation: "gradientShift 5s infinite linear",
  "@keyframes gradientShift": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
};

const jumangoStyle = {
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundSize: "400% 400%",
  animation: "shake 2s 1s infinite",
  "@keyframes shake": {
    "0%, 100%": { transform: "translate(0, 0) scaleY(1)" },
    "10%": {
      transform: "translate(-100px, 0) scaleX(5.55) scaleY(200.55)",
    },
    "20%": {
      transform: "translate(8px, 0) scaleY(0.7)",
      filter: "blur(0px)",
    },
    "30%": {
      transform: "translate(-7px, 0) scaleY(1.2)",
    },
    "40%": {
      transform: "translate(6px, 0) scaleY(0.8)",
    },
    "50%": {
      transform: "translate(-5px, 0) scaleY(1.15)",
    },
    "60%": {
      transform: "translate(4px, 0) scaleY(0.85)",
    },
    "70%": {
      transform: "translate(-3px, 0) scaleY(1.08)",
    },
    "80%": {
      transform: "translate(2px, 0) scaleY(0.92)",
    },
    "90%": {
      transform: "translate(-1px, 0) scaleY(1.03)",
    },
    "100%": {
      transform: "translate(0, 0) scaleY(1)",
    },
  },
};

export default UserProfile;
