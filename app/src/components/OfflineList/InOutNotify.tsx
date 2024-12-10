import { Box, Button, IconButton } from "@mui/joy";
import { IoStatsChart } from "react-icons/io5";
import { auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { postInout, postExitAll } from "../../apis/inout"; // 追加
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
  const [eloSound] = useSound("/elo.mp3");
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isExitingAll, setIsExitingAll] = useState(false); 

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

  const handleExitAll = async () => {
    if (!user?.uid) return;
    if (!window.confirm("本当に全員を爆発させますか？")) return;
    eloSound();
    setIsExitingAll(true);

    try {
      const accessToken = await user.getIdToken();
      await postExitAll(control_uid, accessToken);
    } catch (error) {
      console.error("Error exiting all:", error);
      alert("全員の退室に失敗しました。");
    } finally {
      setIsExitingAll(false);
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
        <Button
          color="warning"
          disabled={isExitingAll}
          onClick={handleExitAll}
          size="md"
          loading={isExitingAll}
        >
          爆発的人生
        </Button>
      </Box>
    </Box>
  );
};

export default InOutNotify;
