import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Modal,
  ModalDialog,
} from "@mui/joy";
import { IoStatsChart } from "react-icons/io5";
import { auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "../../libs/firebase";
import { postInout } from "../../apis/inout";
import { useState } from "react";

interface Props {
  offlineList: Array<string>;
}

const database = getDatabase(app);

const InOutNotify = ({ offlineList }: Props) => {
  const [user] = useIdToken(auth);
  const isMein = offlineList.includes(user?.uid || "114514");
  const [openEnterModal, setOpenEnterModal] = useState(false);
  const [openExitModal, setOpenExitModal] = useState(false);

  const handleEnter = async () => {
    if (!user?.uid) return;
    const newList = [...offlineList, user.uid];
    try {
      await set(ref(database, "offlineList"), JSON.stringify(newList));
      const accessToken = await user.getIdToken();
      await postInout(user.uid, true, accessToken);
    } catch (error) {
      console.error("Error entering:", error);
    }
    setOpenEnterModal(false);
  };

  const handleExit = async () => {
    if (!user?.uid) return;
    const newList = offlineList.filter((uid) => uid !== user.uid);
    try {
      await set(ref(database, "offlineList"), JSON.stringify(newList));
      const accessToken = await user.getIdToken();
      await postInout(user.uid, false, accessToken);
    } catch (error) {
      console.error("Error exiting:", error);
    }
    setOpenExitModal(false);
  };

  return (
    <Box gap={2} display={"flex"} sx={{ justifyContent: "space-between" }}>
      <IconButton color="neutral" disabled={true} size="md" variant="solid">
        <IoStatsChart />
      </IconButton>

      <Box gap={2} display={"flex"}>
        <Modal open={openEnterModal} onClose={() => setOpenEnterModal(false)}>
          <ModalDialog>
            <DialogTitle>確認</DialogTitle>
            <DialogContent>入室しますか？</DialogContent>
            <DialogActions>
              <Button variant="plain" onClick={() => setOpenEnterModal(false)}>
                キャンセル
              </Button>
              <Button onClick={handleEnter}>入室</Button>
            </DialogActions>
          </ModalDialog>
        </Modal>

        <Modal open={openExitModal} onClose={() => setOpenExitModal(false)}>
          <ModalDialog>
            <DialogTitle>確認</DialogTitle>
            <DialogContent>退出しますか？</DialogContent>
            <DialogActions>
              <Button variant="plain" onClick={() => setOpenExitModal(false)}>
                キャンセル
              </Button>
              <Button color="danger" onClick={handleExit}>
                退出
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>

        <Button
          color="primary"
          disabled={isMein}
          onClick={() => setOpenEnterModal(true)}
          size="md"
        >
          入室
        </Button>
        <Button
          color="danger"
          disabled={!isMein}
          onClick={() => setOpenExitModal(true)}
          size="md"
        >
          退出
        </Button>
      </Box>
    </Box>
  );
};

export default InOutNotify;
