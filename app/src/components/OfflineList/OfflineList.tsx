import { Box, Typography, CircularProgress, Divider } from "@mui/joy";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app, auth } from "../../libs/firebase";
import InOutNotify from "./InOutNotify";
import UserProfile from "../UserProfile";
import { useIdToken } from "react-firebase-hooks/auth";
import MyCard from "../MyCard";

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
    <MyCard>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box gap={1} display={"flex"} flexWrap={"wrap"}>
          {offlineList.map((uid) => (
            <Box key={uid} mt={0.5}>
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
    </MyCard>
  );
};

export default OfflineList;
