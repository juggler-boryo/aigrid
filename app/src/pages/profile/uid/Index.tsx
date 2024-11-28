import { Box, Card, Divider, Typography } from "@mui/joy";
import TopBar from "../../../components/TopBar";
import UserProfile from "../../../components/UserProfile";
import { useParams } from "react-router-dom";
import InOutHistory from "./InOutHistory";

const Profile = () => {
  const { uid } = useParams();
  return (
    <Box gap={2} display="flex" flexDirection="column" alignItems="center">
      <TopBar />
      <Box width={"90%"}>
        <Divider />
      </Box>
      <Box width={"85%"}>
        <Card>
          <Box display="flex" flexDirection="column" gap={2}>
            <UserProfile uid={uid || ""} />
            <Box>
              <Typography level="title-md">UID: {uid}</Typography>
            </Box>
          </Box>
          <Box m={0.5}>
            <Divider />
          </Box>
          <InOutHistory uid={uid || ""} />
        </Card>
      </Box>
    </Box>
  );
};

export default Profile;
