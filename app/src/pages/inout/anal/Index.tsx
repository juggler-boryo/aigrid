import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../../libs/firebase";
import { useQuery } from "@tanstack/react-query";
import { getInoutAnalytics } from "../../../apis/inout";
import { Box, CircularProgress, Card, Typography, Divider } from "@mui/joy";
import { Inout } from "../../../types/inout";
import { PieChart, LineChart } from "@mui/x-charts";
import { Min2Str } from "../../../libs/min2str";
import { GetUser } from "../../../apis/user";
import TopBar from "../../../components/TopBar";
import { useMemo } from "react";

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

const getDailyMinutesByUser = (inoutList: Inout[]) => {
  const userDailyMinutes: {
    [key: string]: { date: number; minutes: number }[];
  } = {};

  // Get unique UIDs
  const uids = [...new Set(inoutList.map((record) => record.uid))];

  for (const uid of uids) {
    const userRecords = inoutList
      .filter((record) => record.uid === uid)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    const dailyMinutes: { date: number; minutes: number }[] = [];
    let lastInTime: Date | null = null;
    let currentDate = "";
    let currentDayMinutes = 0;

    for (const record of userRecords) {
      const recordDate = new Date(record.created_at)
        .toISOString()
        .split("T")[0];

      if (currentDate && recordDate !== currentDate && currentDayMinutes > 0) {
        dailyMinutes.push({
          date: new Date(currentDate).getTime(),
          minutes: Math.round(currentDayMinutes),
        });
        currentDayMinutes = 0;
      }

      currentDate = recordDate;

      if (record.is_in) {
        lastInTime = new Date(record.created_at);
      } else if (lastInTime) {
        const outTime = new Date(record.created_at);
        const diffMinutes =
          (outTime.getTime() - lastInTime.getTime()) / (1000 * 60);
        currentDayMinutes += diffMinutes;
        lastInTime = null;
      }
    }

    if (currentDayMinutes > 0) {
      dailyMinutes.push({
        date: new Date(currentDate).getTime(),
        minutes: Math.round(currentDayMinutes),
      });
    }

    userDailyMinutes[uid] = dailyMinutes;
  }

  return userDailyMinutes;
};

const Index = () => {
  const [user] = useIdToken(auth);
  const { data, isFetching } = useQuery({
    queryKey: ["inoutList", user?.uid],
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
      };
    },
    enabled: !!user,
  });

  const { chartData } = useMemo(() => {
    if (!data?.inoutList) return { chartData: [] };

    const minutes = InOutList2EachPersonMinutes(data.inoutList);
    const chart = Object.entries(minutes)
      .filter(([, mins]) => mins > 0)
      .map(([uid, mins], index) => ({
        id: index,
        value: mins,
        label: `${data?.userMap[uid]?.username || "Unknown User"} (${Min2Str(
          mins
        )})`,
      }));

    return { chartData: chart };
  }, [data?.inoutList, data?.userMap]);

  const { userSeries, allDates } = useMemo(() => {
    if (!data?.inoutList) return { userSeries: [], allDates: [] };

    const dailyData = getDailyMinutesByUser(data.inoutList);
    const series = Object.entries(dailyData)
      .filter(([, userData]) => userData.length > 0)
      .map(([uid]) => ({
        data: dailyData[uid].map((d) => d.minutes),
        label: data?.userMap[uid]?.username || "Unknown User",
      }));

    const dates = Object.values(dailyData)
      .flat()
      .map((d) => d.date)
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => a - b);

    return { userSeries: series, allDates: dates };
  }, [data?.inoutList, data?.userMap]);

  return (
    <Box
      sx={{
        mx: "auto",
        gap: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <TopBar />
      <Card sx={{ width: "85%" }}>
        {isFetching ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        ) : chartData.length > 0 &&
          userSeries.length > 0 &&
          allDates.length > 0 ? (
          <Box gap={1} display="flex" flexDirection="column">
            <Box>
              <PieChart
                series={[
                  {
                    data: chartData,
                    highlightScope: { faded: "global", highlighted: "item" },
                    faded: { innerRadius: 30, additionalRadius: 30 },
                  },
                ]}
                width={999}
                height={400}
                slotProps={{
                  legend: {
                    itemGap: 10,
                  },
                }}
              />
            </Box>
            <Box m={0.5}>
              <Divider />
            </Box>
            <Box>
              {userSeries.length > 0 && allDates.length > 0 && (
                <LineChart
                  series={userSeries}
                  width={999}
                  height={400}
                  xAxis={[
                    {
                      data: allDates,
                      scaleType: "time",
                    },
                  ]}
                  slotProps={{
                    legend: {
                      itemGap: 10,
                    },
                  }}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Typography level="title-md">No data available</Typography>
        )}
      </Card>
    </Box>
  );
};

export default Index;
