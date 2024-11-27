import { Box, Button, Typography } from "@mui/joy";
import CheckAuth from "./CheckAuth";
import OfflineList from "../components/OfflineList/OfflineList";
import { useQuery } from "@tanstack/react-query";
import { GetUser } from "../apis/user";
import { User } from "../types/user";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../libs/firebase";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [user] = useIdToken(auth);
  const { data: me, isLoading: isMeLoading } = useQuery<User>({
    queryKey: ["user"],
    queryFn: () => GetUser(user?.uid || ""), // Get user data using Firebase auth uid
    enabled: !!user?.uid, // Only fetch when uid is available
  });
  const navigate = useNavigate();

  return (
    <CheckAuth>
      <Box gap={2} display="flex" flexDirection="column" alignItems="center">
        <Box mt={2}>
          <Button
            variant="outlined"
            onClick={() => {
              navigate("/profile");
            }}
            loading={isMeLoading}
          >
            <Typography>⚙️ {me?.username || "(名前決めろ)"}</Typography>
          </Button>
        </Box>
        <OfflineList />
      </Box>
    </CheckAuth>
  );
};

export default Index;
