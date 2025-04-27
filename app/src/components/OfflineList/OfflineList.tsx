import { Box, Typography, CircularProgress, Divider } from "@mui/joy";
import { useEffect, useState, useMemo } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app, auth } from "../../libs/firebase";
import InOutNotify from "./InOutNotify";
import UserProfile from "../UserProfile";
import { useIdToken } from "react-firebase-hooks/auth";
import MyCard from "../MyCard";
import { getInMinutes } from "../../apis/inout";
import { useQueries, UseQueryResult } from "@tanstack/react-query";

const database = getDatabase(app);

const OfflineList = () => {
  const [offlineList, setOfflineList] = useState<Array<string>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user] = useIdToken(auth);

  const inMinutesResults = useQueries({
    queries: offlineList.map((uid) => ({
      queryKey: ["inMinutes", uid],
      queryFn: async () => {
        const accessToken = await user?.getIdToken();
        if (!accessToken) return 0;
        return await getInMinutes(uid, accessToken);
      },
      enabled: !!user && !!uid,
      staleTime: 1 * 60 * 1000,
    })),
  }) as UseQueryResult<number, unknown>[];

  const isMinutesLoading = inMinutesResults.some(
    (result: UseQueryResult<number, unknown>) => result.isLoading
  );

  const sortedList = useMemo(() => {
    const dataWithMinutes = inMinutesResults.map(
      (result: UseQueryResult<number, unknown>, index: number) => ({
        uid: offlineList[index],
        inMinutes: result.data ?? 0,
      })
    );
    return dataWithMinutes.sort((a, b) => b.inMinutes - a.inMinutes);
  }, [inMinutesResults, offlineList]);

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
      {loading || isMinutesLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box gap={1} display={"flex"} flexWrap={"wrap"}>
          {sortedList.map(({ uid }) => (
            <Box key={uid} mt={0.5}>
              <UserProfile uid={uid} />
            </Box>
          ))}
          {sortedList.length === 0 && (
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
