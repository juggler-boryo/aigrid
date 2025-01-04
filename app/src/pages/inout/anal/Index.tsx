import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../../libs/firebase";
import { useQuery } from "@tanstack/react-query";
import { getInoutAnalytics } from "../../../apis/inout";
import { Box, CircularProgress, Card, Divider, Table } from "@mui/joy";
import { Inout } from "../../../types/inout";
import { Min2StrDetailed } from "../../../libs/min2str";
import { GetUser } from "../../../apis/user";
import TopBar from "../../../components/TopBar";
import { useMemo } from "react";
import CheckAuth from "../../CheckAuth";
import CoolMo from "../../../components/CoolMo";
import UserProfile from "../../../components/UserProfile";

const InOutList2EachPersonMinutes = (
  inoutList: Inout[]
): { [key: string]: number } => {
  const result: { [key: string]: number } = {};

  // Get unique UIDs
  const uids = [...new Set(inoutList.map((record) => record.uid))];

  for (const uid of uids) {
    const userRecords = inoutList
      .filter((record) => record.uid === uid)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    let totalMinutes = 0;
    let lastInTime: Date | null = null;

    for (const record of userRecords) {
      if (record.is_in) {
        lastInTime = new Date(record.created_at);
      } else if (lastInTime) {
        const outTime = new Date(record.created_at);
        const diffMinutes =
          (outTime.getTime() - lastInTime.getTime()) / (1000 * 60);
        totalMinutes += diffMinutes;
        lastInTime = null;
      }
    }

    result[uid] = Math.round(totalMinutes);
  }

  return result;
};

const StayTimeTable = () => {
  const [user] = useIdToken(auth);
  const { data: inoutData, isLoading } = useQuery({
    queryKey: ['inoutAnalytics'],
    queryFn: async () => {
      const accessToken = await user?.getIdToken();
      const inoutList = await getInoutAnalytics(accessToken || "");
      const uids = [...new Set(inoutList.map((record) => record.uid))];
      const userPromises = uids.map((uid) => GetUser(uid));
      const users = await Promise.all(userPromises);
      const userMap = Object.fromEntries(users.map((user) => [user.uid, user]));
      return {
        inoutList,
        userMap,
      }
    },
    enabled: !!user
  });

  const monthlyStayTime = useMemo(() => {
    if (!inoutData) return {};
    return InOutList2EachPersonMinutes(inoutData.inoutList);
  }, [inoutData]);

  const tableData = useMemo(() => {
    if (!inoutData) return [];

    const totalMinutes = Object.values(monthlyStayTime).reduce((sum, minutes) => sum + minutes, 0);

    return Object.entries(monthlyStayTime)
      .map(([uid, minutes]) => {
        const formattedMinutes = Min2StrDetailed(minutes);
        const percentage = ((minutes / totalMinutes) * 100).toFixed(2);
        return { uid, minutes, formattedMinutes, percentage };
      })
      .sort((a, b) => b.minutes - a.minutes);
  }, [inoutData, monthlyStayTime]);

  return (
    <CheckAuth>
      <Box
        sx={{
          mx: "auto",
          gap: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TopBar />
        <Box width={"90%"}>
          <Divider />
        </Box>
      </Box>
      <Box
        sx={{
          width: "80%",
          p: 2,
          mx: "auto",
          gap: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <CoolMo>
          {isLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              p={2}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Card>
              <Table
                aria-label="stay time table"
                sx={{ fontFamily: "Iosevka Aile Iaso, Transparent" }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "20%" }}>ユーザー名</th>
                    <th style={{ width: "15%" }}>先月の滞在時間(分)</th>
                    <th style={{ width: "15%" }}>割合</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(({ uid, formattedMinutes, percentage }) => (
                    <tr key={uid}>
                      <td><UserProfile uid={uid} disablebadge={true} /></td>
                      <td>{formattedMinutes}</td>
                      <td>{percentage} %</td>
                    </tr>
                  )
                  )}
                </tbody>
              </Table>
            </Card>
          )}
        </CoolMo>
      </Box>
    </CheckAuth>
  );
};

export default StayTimeTable;
