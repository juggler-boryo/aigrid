import { Box, Button } from "@mui/joy";
import { auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "../../libs/firebase";

interface Props {
  offlineList: Array<string>;
}

const database = getDatabase(app);

const InOutNotify = ({ offlineList }: Props) => {
  const [user] = useIdToken(auth);
  const isMein = offlineList.includes(user?.uid || "114514");

  const handleEnter = async () => {
    if (!user?.uid) return;
    const newList = [...offlineList, user.uid];
    try {
      await set(ref(database, "offlineList"), JSON.stringify(newList));
    } catch (error) {
      console.error("Error entering:", error);
    }
  };

  const handleExit = async () => {
    if (!user?.uid) return;
    const newList = offlineList.filter((uid) => uid !== user.uid);
    try {
      await set(ref(database, "offlineList"), JSON.stringify(newList));
    } catch (error) {
      console.error("Error exiting:", error);
    }
  };

  return (
    <Box mt={2} gap={4} display={"flex"} sx={{ justifyContent: "center" }}>
      <Button
        color="primary"
        disabled={isMein}
        onClick={handleEnter}
        size="lg"
        sx={{ fontSize: "2rem" }}
      >
        入室
      </Button>
      <Button
        color="danger"
        disabled={!isMein}
        onClick={handleExit}
        size="lg"
        sx={{ fontSize: "2rem" }}
      >
        退出
      </Button>
    </Box>
  );
};

export default InOutNotify;
