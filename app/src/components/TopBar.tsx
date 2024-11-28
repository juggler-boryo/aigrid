import { Badge, Divider } from "@mui/joy";
import { Box, IconButton, Typography } from "@mui/joy";
import { FaRegUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../libs/firebase";
import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../apis/user";
import { User } from "../types/user";

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
      borderRadius={"12px"}
      p={1}
    >
      <Box mr={2} ml={1}>
        <Typography level={"title-lg"}>aigrid</Typography>
      </Box>
      <Divider orientation="vertical" />
      <Badge
        badgeContent={me ? 0 : "!"}
        color="danger"
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box ml={2}>
          <IconButton
            variant="outlined"
            color={me ? "neutral" : "danger"}
            size="sm"
            onClick={() => {
              navigate("/profile");
            }}
            loading={isMeLoading}
          >
            <FaRegUser />
          </IconButton>
        </Box>
      </Badge>
    </Box>
  );
};

export default TopBar;
