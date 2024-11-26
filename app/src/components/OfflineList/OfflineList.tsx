import { Box, Typography, CircularProgress } from "@mui/joy";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../libs/firebase"; // firebase.tsからインポート
import InOutNotify from "./InOutNotify";
import UserProfile from "../UserProfile";

const database = getDatabase(app);

const OfflineList = () => {
  const [offlineList, setOfflineList] = useState<Array<string>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const offlineListRef = ref(database, "offlineList");
    onValue(offlineListRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOfflineList(JSON.parse(data));
      }
      setLoading(false);
    });
  }, []);

  return (
    <Box
      style={{
        width: "100%",
        maxWidth: "600px",
      }}
    >
      <Typography level="h3">- 現地リスト</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box>
          {offlineList.map((item, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <UserProfile uid={item} />
            </Box>
          ))}
          {offlineList.length === 0 && (
            <Typography level="body-lg">
              誰もいません...(jumango外出中⭐️)
            </Typography>
          )}
        </Box>
      )}
      {!loading && <InOutNotify offlineList={offlineList} />}
    </Box>
  );
};

export default OfflineList;
