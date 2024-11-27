import { Badge, Box, Divider, IconButton, Typography } from "@mui/joy";
import CheckAuth from "./CheckAuth";
import OfflineList from "../components/OfflineList/OfflineList";
import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../apis/user";
import { User } from "../types/user";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../libs/firebase";
import { useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";

const Index = () => {
  const [user] = useIdToken(auth);
  const { data: me, isLoading: isMeLoading } = useQuery<User>({
    queryKey: ["user"],
    queryFn: () => GetUser(user?.uid || ""),
    enabled: !!user?.uid,
  });
  const navigate = useNavigate();

  return (
    <CheckAuth>
      <Box gap={2} display="flex" flexDirection="column" alignItems="center">
        <Box
          mt={2}
          width={"95%"}
          border={"lightgray solid 1px"}
          display={"flex"}
          flexDirection={"row"}
          alignItems={"center"}
          borderRadius={"12px"}
          p={1}
        >
          <Box mr={2} ml={1}>
            <Typography level={"title-lg"}>AIGRID</Typography>
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
        <OfflineList />
        <Box
          component="img"
          src="/catg.gif"
          alt="Cat GIF"
          sx={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </Box>
    </CheckAuth>
  );
};

export default Index;
