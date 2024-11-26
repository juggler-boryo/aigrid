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
        <ul>
          {offlineList.map((item, index) => (
            <li key={index}>
              <UserProfile uid={item} />
            </li>
          ))}
          {offlineList.length === 0 && (
            <Box>誰もいません...(jumango外出中⭐️)</Box>
          )}
        </ul>
      )}
      {!loading && <InOutNotify offlineList={offlineList} />}
    </Box>
  );
};

export default OfflineList;
