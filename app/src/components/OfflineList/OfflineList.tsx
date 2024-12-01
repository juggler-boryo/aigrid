import { Box, Typography, CircularProgress, Card, Divider } from "@mui/joy";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app, auth } from "../../libs/firebase";
import InOutNotify from "./InOutNotify";
import UserProfile from "../UserProfile";
import { useIdToken } from "react-firebase-hooks/auth";

const database = getDatabase(app);

const OfflineList = () => {
  const [offlineList, setOfflineList] = useState<Array<string>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user] = useIdToken(auth);

  useEffect(() => {
    const offlineListRef = ref(database, "inoutList");
    const unsubscribe = onValue(offlineListRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const uids = Object.entries(data)
          .filter(([, isIn]) => isIn)
          .map(([uid]) => uid);
        setOfflineList(uids);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card
      sx={{
        width: "85%",
      }}
    >
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box gap={1} display={"flex"} flexWrap={"wrap"}>
          {offlineList.map((uid) => (
            <Box key={uid}>
              <UserProfile uid={uid} />
            </Box>
          ))}
          {offlineList.length === 0 && (
            <Typography level="title-md">誰もいません</Typography>
          )}
        </Box>
      )}
      <Box m={0.5}>
        <Divider />
      </Box>
      {user && !loading && (
        <InOutNotify
          offlineList={offlineList}
          control_uid={user.uid || "114514"}
        />
      )}
    </Card>
  );
};

export default OfflineList;
