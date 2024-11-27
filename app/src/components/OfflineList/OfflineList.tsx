import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Divider,
  Chip,
} from "@mui/joy";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../libs/firebase"; // firebase.tsからインポート
import InOutNotify from "./InOutNotify";
import UserProfile from "../UserProfile";
import { Home } from "@mui/icons-material";

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
    <Card
      sx={{
        width: "90%",
      }}
    >
      <Typography level={"title-lg"}>in ジャグラ墓料</Typography>
      <Box m={0.5}>
        <Divider />
      </Box>
      {loading ? (
        <CircularProgress />
      ) : (
        <Box gap={1} display={"flex"}>
          {offlineList.map((item, index) => (
            <Chip variant="soft" key={index}>
              <UserProfile uid={item} />
            </Chip>
          ))}
          {offlineList.length === 0 && (
            <Typography level="title-md">誰もいません</Typography>
          )}
        </Box>
      )}
      <Box m={0.5}>
        <Divider />
      </Box>
      {!loading && <InOutNotify offlineList={offlineList} />}
    </Card>
  );
};

export default OfflineList;
