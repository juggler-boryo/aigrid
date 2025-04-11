import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../../libs/firebase";
import { useQuery } from "@tanstack/react-query";
import { getInoutAnalytics } from "../../../apis/inout";
import {
  Box,
  CircularProgress,
  Card,
  Divider,
  Table,
  Select,
  Option,
  Typography,
} from "@mui/joy";
import { Inout } from "../../../types/inout";
import { Min2StrDetailed } from "../../../libs/min2str";
import { GetUser } from "../../../apis/user";
import TopBar from "../../../components/TopBar";
import { useMemo, useState } from "react";
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
  const [fromYear, setFromYear] = useState(new Date().getFullYear());
  const [fromMonth, setFromMonth] = useState(new Date().getMonth());
  const [toYear, setToYear] = useState(new Date().getFullYear());
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);

  const { data: inoutData, isLoading } = useQuery({
    queryKey: ["inoutAnalytics", fromYear, fromMonth, toYear, toMonth],
    queryFn: async () => {
      const accessToken = await user?.getIdToken();
      const inoutList = await getInoutAnalytics(
        accessToken || "",
        fromYear,
        fromMonth,
        toYear,
        toMonth
      );
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

  const monthlyStayTime = useMemo(() => {
    if (!inoutData) return {};
    return InOutList2EachPersonMinutes(inoutData.inoutList);
  }, [inoutData]);

  const tableData = useMemo(() => {
    if (!inoutData) return [];

    const totalMinutes = Object.values(monthlyStayTime).reduce(
      (sum, minutes) => sum + minutes,
      0
    );

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
        }}
      >
        <CoolMo>
          <Box display="flex" gap={2} mb={2} flexDirection="column">
            <Box
              display="flex"
              gap={2}
              alignItems="center"
              sx={{
                p: 2,
                borderRadius: "md",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography level="title-sm" sx={{ minWidth: 80 }}>
                期間
              </Typography>
              <Box display="flex" gap={1} alignItems="center">
                <Select
                  value={fromYear}
                  onChange={(_, value) => setFromYear(value as number)}
                  size="sm"
                  sx={{ minWidth: 100 }}
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <Option key={year} value={year}>
                      {year}年
                    </Option>
                  ))}
                </Select>
                <Select
                  value={fromMonth}
                  onChange={(_, value) => setFromMonth(value as number)}
                  size="sm"
                  sx={{ minWidth: 100 }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <Option key={month} value={month}>
                      {month}月
                    </Option>
                  ))}
                </Select>
              </Box>
              <Typography level="body-sm">〜</Typography>
              <Box display="flex" gap={1} alignItems="center">
                <Select
                  value={toYear}
                  onChange={(_, value) => setToYear(value as number)}
                  size="sm"
                  sx={{ minWidth: 100 }}
                >
                  {Array.from(
                    { length: 5 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <Option key={year} value={year}>
                      {year}年
                    </Option>
                  ))}
                </Select>
                <Select
                  value={toMonth}
                  onChange={(_, value) => setToMonth(value as number)}
                  size="sm"
                  sx={{ minWidth: 100 }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <Option key={month} value={month}>
                      {month}月
                    </Option>
                  ))}
                </Select>
              </Box>
            </Box>
          </Box>
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
                    <th style={{ width: "15%" }}>滞在時間(分)</th>
                    <th style={{ width: "15%" }}>割合</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(({ uid, formattedMinutes, percentage }) => (
                    <tr key={uid}>
                      <td>
                        <UserProfile uid={uid} disablebadge={true} />
                      </td>
                      <td>{formattedMinutes}</td>
                      <td>{percentage} %</td>
                    </tr>
                  ))}
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
