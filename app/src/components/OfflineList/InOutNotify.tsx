import { Box, Button, IconButton } from "@mui/joy";
import { IoStatsChart } from "react-icons/io5";
import { auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "../../libs/firebase";
import { postInout } from "../../apis/inout";

interface Props {
  offlineList: Array<string>;
}

const database = getDatabase(app);

const InOutNotify = ({ offlineList }: Props) => {
  const [user] = useIdToken(auth);
  const isMein = offlineList.includes(user?.uid || "114514");

  const handleEnter = async () => {
    if (!user?.uid) return;
    if (!window.confirm("入室しますか？")) return;

    try {
      await set(ref(database, `inoutList/${user.uid}`), true);
      const accessToken = await user.getIdToken();
      await postInout(user.uid, true, accessToken);
    } catch (error) {
      console.error("Error entering:", error);
    }
  };

  const handleExit = async () => {
    if (!user?.uid) return;
    if (!window.confirm("退出しますか？")) return;

    try {
      await set(ref(database, `inoutList/${user.uid}`), false);
      const accessToken = await user.getIdToken();
      await postInout(user.uid, false, accessToken);
    } catch (error) {
      console.error("Error exiting:", error);
    }
  };

  return (
    <Box gap={2} display={"flex"} sx={{ justifyContent: "space-between" }}>
      <IconButton color="neutral" disabled={true} size="md" variant="solid">
        <IoStatsChart />
      </IconButton>

      <Box gap={2} display={"flex"}>
        <Button
          color="primary"
          disabled={isMein}
          onClick={handleEnter}
          size="md"
        >
          入室
        </Button>
        <Button
          color="danger"
          disabled={!isMein}
          onClick={handleExit}
          size="md"
        >
          退出
        </Button>
      </Box>
    </Box>
  );
};

export default InOutNotify;
