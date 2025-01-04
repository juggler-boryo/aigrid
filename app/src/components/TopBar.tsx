import { Badge } from "@mui/joy";
import { Box } from "@mui/joy";
import { FaRegUser } from "react-icons/fa";
import { LuLayoutDashboard } from "react-icons/lu";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
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
      mt={1}
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
        <img
          src="/logo_pink.png"
          alt="Logo Pink"
          width={70}
        />
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <ActiveIconButton
          to="/inout/anal"
          icon={<TbBrandGoogleAnalytics size={18} />}
        />
        <ActiveIconButton
          to="/whiteboard"
          icon={<LuLayoutDashboard size={18} />}
        />
        <ActiveIconButton
          to="/profile"
          icon={<FaRegUser size={18} />}
          color={isMeLoading ? "neutral" : me ? "neutral" : "danger"}
        />
      </Box>
    </Box >
  );
};

export default TopBar;
