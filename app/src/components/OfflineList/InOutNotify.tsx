import { Box, Button, IconButton } from "@mui/joy";
import { IoStatsChart } from "react-icons/io5";
import { auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "../../libs/firebase";
import { postInout } from "../../apis/inout";
import { useNavigate } from "react-router-dom";

interface Props {
  offlineList: Array<string>;
  control_uid: string;
  isNoAnal?: boolean; // no analysis
}

const database = getDatabase(app);

const InOutNotify = ({ offlineList, control_uid, isNoAnal }: Props) => {
  const [user] = useIdToken(auth);
  const isMein = offlineList.includes(user?.uid || "114514");
  const navigate = useNavigate();

  const handleEnter = async () => {
    if (!user?.uid) return;
    if (!window.confirm("入室しますか？")) return;

    try {
      await set(ref(database, `inoutList/${control_uid}`), true);
      const accessToken = await user.getIdToken();
      await postInout(control_uid, true, accessToken);
    } catch (error) {
      console.error("Error entering:", error);
    }
  };

  const handleExit = async () => {
    if (!user?.uid) return;
    if (!window.confirm("退出しますか？")) return;

    try {
      await set(ref(database, `inoutList/${control_uid}`), false);
      const accessToken = await user.getIdToken();
      await postInout(control_uid, false, accessToken);
    } catch (error) {
      console.error("Error exiting:", error);
    }
  };

  return (
    <Box gap={2} display={"flex"} sx={{ justifyContent: "space-between" }}>
      {!isNoAnal && (
        <IconButton
          color="primary"
          size="md"
          variant="soft"
          onClick={() => {
            navigate("/inout/anal");
          }}
        >
          <IoStatsChart />
        </IconButton>
      )}
      {isNoAnal && <Box width={40} />}

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
