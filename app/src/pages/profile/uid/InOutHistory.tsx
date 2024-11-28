import { getInoutHistory } from "../../../apis/inout";
import { Inout } from "../../../types/inout";
import { auth } from "../../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/joy";
import { List } from "@mui/joy";
import { ListItem, Typography } from "@mui/joy";
import { Box } from "@mui/joy";

interface InOutHistoryProps {
  uid: string;
}

const InOutHistory = ({ uid }: InOutHistoryProps) => {
  const [user] = useIdToken(auth);
  const { data, isLoading } = useQuery<Inout[]>({
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

  return (
    <Box>
      <Typography level="title-lg">入退室履歴</Typography>
      <List>
        {data?.map((inout, index) => {
          const opacity = Math.max(0.1, 1 - index * 0.15);
          return (
            <ListItem key={inout.created_at}>
              <Typography sx={{ opacity }}>
                {new Date(inout.created_at).toLocaleString()}:
                {inout.is_in ? "入室" : "退室"}
              </Typography>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default InOutHistory;
