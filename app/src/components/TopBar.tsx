import { Badge } from "@mui/joy";
import { Box, Typography } from "@mui/joy";
import { FaRegUser } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../libs/firebase";
import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../apis/user";
import { User } from "../types/user";
import ActiveIconButton from "./ActiveIconButton";

const TopBar = () => {
  const navigate = useNavigate();
  const [user] = useIdToken(auth);
  const { data: me, isLoading: isMeLoading } = useQuery<User>({
    queryKey: ["user"],
    queryFn: () => GetUser(user?.uid || ""),
    enabled: !!user?.uid,
  });

  return (
    <Box
      mt={2}
      width={"90%"}
      display={"flex"}
      flexDirection={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
      p={0.5}
    >
      <Box
        mr={1}
        onClick={() => navigate("/")}
        sx={{
          cursor: "pointer",
          borderRadius: "6px",
          px: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography level={"body-lg"}>aigrid</Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <ActiveIconButton to="/whiteboard" icon={<LuLayoutDashboard size={16} />} />
        <Badge
          badgeContent={isMeLoading ? 0 : me ? 0 : "!"}
          color={isMeLoading ? "neutral" : "danger"}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <ActiveIconButton
            to="/profile"
            icon={<FaRegUser />}
            color={isMeLoading ? "neutral" : me ? "neutral" : "danger"}
          />
        </Badge>
      </Box>
    </Box>
  );
};

export default TopBar;
