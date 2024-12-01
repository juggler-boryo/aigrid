import { Box, Card, Divider, Typography } from "@mui/joy";
import TopBar from "../../../components/TopBar";
import UserProfile from "../../../components/UserProfile";
import { useParams } from "react-router-dom";
import InOutHistory from "./InOutHistory";
import InOutNotify from "../../../components/OfflineList/InOutNotify";
import { useState, useEffect } from "react";
import { ref, onValue, getDatabase } from "firebase/database";
import { app } from "../../../libs/firebase";

const database = getDatabase(app);

const Profile = () => {
  const { uid } = useParams();
  const [offlineList, setOfflineList] = useState<Array<string>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const offlineListRef = ref(database, "inoutList");
    onValue(offlineListRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const uids = Object.entries(data)
          .filter(([, isIn]) => isIn)
          .map(([uid]) => uid);
        setOfflineList(uids);
      }
      setLoading(false);
    });
  }, []);

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
              <InOutNotify isNoAnal={true} control_uid={uid || "114514"} />
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
