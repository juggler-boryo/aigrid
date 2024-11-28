import { Box, Divider, Typography } from "@mui/joy";
import TopBar from "../../../components/TopBar";
import UserProfile from "../../../components/UserProfile";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { uid } = useParams();
  return (
    <Box gap={2} display="flex" flexDirection="column" alignItems="center">
      <TopBar />
      <Box width={"90%"}>
        <Divider />
      </Box>
      <Box width={"90%"} mt={2}>
        <UserProfile uid={uid || ""} />
        <Box mt={1}>
          <Typography level="title-md">UID: {uid}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
