import { Box, Button, IconButton } from "@mui/joy";
import { IoStatsChart } from "react-icons/io5";
import { auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "../../libs/firebase";
import { getInoutList, postInout } from "../../apis/inout";
import { useNavigate } from "react-router-dom";
import useSound from "use-sound";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
interface Props {
  control_uid: string;
  isNoAnal?: boolean; // no analysis
}

const database = getDatabase(app);

const InOutNotify = ({ control_uid, isNoAnal }: Props) => {
  const [user] = useIdToken(auth);
  const queryClient = useQueryClient();
  const { data: isIn, isFetching } = useQuery({
    queryKey: ["inout", control_uid],
    queryFn: async () => {
      if (!user) return false;
      const accessToken = await user.getIdToken();
      return await getInoutList(control_uid, accessToken);
    },
  });
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
      await set(ref(database, `inoutList/${control_uid}`), true);
      const accessToken = await user.getIdToken();
      await postInout(control_uid, true, accessToken);
      queryClient.invalidateQueries({ queryKey: ["inout", control_uid] });
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
      await set(ref(database, `inoutList/${control_uid}`), false);
      const accessToken = await user.getIdToken();
      await postInout(control_uid, false, accessToken);
      queryClient.invalidateQueries({ queryKey: ["inout", control_uid] });
    } catch (error) {
      console.error("Error exiting:", error);
    } finally {
      setIsExiting(false);
    }
  };

  if (isFetching) return null;

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
          disabled={isIn || isFetching || isEntering}
          onClick={handleEnter}
          size="md"
          loading={isEntering}
        >
          ただいま
        </Button>
        <Button
          color="danger"
          disabled={!isIn || isFetching || isExiting}
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
