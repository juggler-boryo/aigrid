import { Badge, Divider } from "@mui/joy";
import { Box, IconButton, Typography } from "@mui/joy";
import { FaRegUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../libs/firebase";
import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../apis/user";
import { User } from "../types/user";
import { LuLayoutDashboard } from "react-icons/lu";

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
      border={"lightgray solid 1px"}
      display={"flex"}
      flexDirection={"row"}
      alignItems={"center"}
      borderRadius={"16px"}
      p={1}
    >
      <Box
        mr={1}
        onClick={() => navigate("/")}
        sx={{
          cursor: "pointer",
          "&:hover": {
            bgcolor: "neutral.softBg",
          },
          borderRadius: "6px",
          px: 1,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Typography level={"body-lg"}>aigrid</Typography>
        </Box>
      </Box>
      <Divider orientation="vertical" />
      <Box display="flex" alignItems="center" gap={1}>
        <Box ml={2}>
          <IconButton
            variant="outlined"
            color="neutral"
            size="sm"
            sx={{
              borderRadius: "12px",
            }}
            onClick={() => {
              navigate("/whiteboard");
            }}
          >
            <LuLayoutDashboard size={16} />
          </IconButton>
        </Box>
        <Badge
          badgeContent={isMeLoading ? 0 : me ? 0 : "!"}
          color={isMeLoading ? "neutral" : "danger"}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{}}
        >
          <Box>
            <IconButton
              variant="outlined"
              color={isMeLoading ? "neutral" : me ? "neutral" : "danger"}
              size="sm"
              sx={{
                borderRadius: "12px",
              }}
              onClick={() => {
                navigate("/profile");
              }}
            >
              <FaRegUser />
            </IconButton>
          </Box>
        </Badge>
      </Box>
    </Box>
  );
};

export default TopBar;
