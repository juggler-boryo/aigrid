import React from "react";
import { getInoutHistory } from "../../../apis/inout";
import { useIdToken } from "react-firebase-hooks/auth";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress, Typography, Box } from "@mui/joy";
import Heatmap from "./Heatmap"; // Heatmapコンポーネントをインポート
import { auth } from "../../../libs/firebase";

interface InOutHistoryProps {
  uid: string;
}

const InOutHistory = ({ uid }: InOutHistoryProps) => {
  const [user] = useIdToken(auth);
  const { data, isLoading } = useQuery<{ count: number; date: Date }[]>({
    queryKey: ["inoutHistory", uid],
    queryFn: async () => {
      const accessToken = await user?.getIdToken();
      if (!accessToken) return [];
      const inoutHistory = await getInoutHistory(uid, accessToken);
      return inoutHistory;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  // ヒートマップ用のデータを整形
  const heatmapData = data?.map((entry) => ({
    date: entry.date.toISOString().split("T")[0], // "YYYY-MM-DD" 形式
    count: entry.count,
  }));

  return (
    <Box>
      <Typography level="title-lg" sx={{ marginBottom: 2 }}>
      入退室履歴
      </Typography>
      <Heatmap data={heatmapData || []} />
    </Box>
  );
};

export default InOutHistory;
