import { Box, Button, IconButton } from "@mui/joy";
import { IoStatsChart } from "react-icons/io5";
import { auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "../../libs/firebase";
import { postInout } from "../../apis/inout";
import { useNavigate } from "react-router-dom";
import useSound from "use-sound";

interface Props {
  offlineList: Array<string>;
  control_uid: string;
  isNoAnal?: boolean; // no analysis
}

const database = getDatabase(app);

const InOutNotify = ({ offlineList, control_uid, isNoAnal }: Props) => {
  const [user] = useIdToken(auth);
  const isMein = offlineList.includes(control_uid);
  const navigate = useNavigate();
  const [inSound] = useSound("/in.mp3");
  const [outSound] = useSound("/bb.mp3");
  const handleEnter = async () => {
    if (!user?.uid) return;
    inSound();

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
    outSound();

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
          disabled
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
          ただいま
        </Button>
        <Button
          color="danger"
          disabled={!isMein}
          onClick={handleExit}
          size="md"
        >
          撤退
        </Button>
      </Box>
    </Box>
  );
};

export default InOutNotify;
