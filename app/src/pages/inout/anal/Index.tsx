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

  const minutesData = data?.inoutList
    ? InOutList2EachPersonMinutes(data.inoutList)
    : {};
  const chartData = Object.entries(minutesData)
    .filter(([_, minutes]) => minutes > 0)
    .map(([uid, minutes], index) => ({
      id: index,
      value: minutes,
      label: `${data?.userMap[uid]?.username || "Unknown User"} (${Min2Str(
        minutes
      )})`,
    }));

  const userDailyData = data?.inoutList
    ? getDailyMinutesByUser(data.inoutList)
    : {};
  const userSeries = Object.entries(userDailyData)
    .filter(([_, dailyData]) => dailyData.length > 0)
    .map(([uid, dailyData]) => ({
      data: dailyData.map((d) => d.minutes),
      label: data?.userMap[uid]?.username || "Unknown User",
    }));

  const allDates = Object.values(userDailyData)
    .flat()
    .map((d) => d.date)
    .filter((date, index, self) => self.indexOf(date) === index)
    .sort((a, b) => a - b);

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
