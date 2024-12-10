import { Box, Button, IconButton } from "@mui/joy";
import { IoStatsChart } from "react-icons/io5";
import { auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { postInout } from "../../apis/inout";
import { useNavigate } from "react-router-dom";
import useSound from "use-sound";
import { useState } from "react";

interface Props {
  offlineList: Array<string>;
  control_uid: string;
  isNoAnal?: boolean;
}

const InOutNotify = ({ offlineList, control_uid, isNoAnal }: Props) => {
  const [user] = useIdToken(auth);
  const isIn = offlineList.includes(control_uid);
  const navigate = useNavigate();
  const [inSound] = useSound("/in.mp3");
  const [outSound] = useSound("/bb.mp3");
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = async () => {
    if (!user?.uid) return;
    inSound();
    setIsEntering(true);

    try {
      const accessToken = await user.getIdToken();
      await postInout(control_uid, true, accessToken);
    } catch (error) {
      console.error("Error entering:", error);
    } finally {
      setIsEntering(false);
    }
  };

  const handleExit = async () => {
    if (!user?.uid) return;
    outSound();
    setIsExiting(true);

    try {
      const accessToken = await user.getIdToken();
      await postInout(control_uid, false, accessToken);
    } catch (error) {
      console.error("Error exiting:", error);
    } finally {
      setIsExiting(false);
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
          disabled={isIn || isEntering}
          onClick={handleEnter}
          size="md"
          loading={isEntering}
        >
          ただいま
        </Button>
        <Button
          color="danger"
          disabled={!isIn || isExiting}
          onClick={handleExit}
          size="md"
          loading={isExiting}
        >
          撤退
        </Button>
      </Box>
    </Box>
  );
};

export default InOutNotify;
