import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  Textarea,
  Typography,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/joy";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../../libs/firebase";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTamaki, updateTamaki, deleteTamaki } from "../../../apis/tamaki";
import TopBar from "../../../components/TopBar";
import CheckAuth from "../../CheckAuth";
import { FaEdit } from "react-icons/fa";
import { GetAllUsers } from "../../../apis/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UserProfile from "../../../components/UserProfile";
import { Kind2title } from "../../../components/Tamaki/Tamaki";

const TamakiDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user] = useIdToken(auth);
  const queryClient = useQueryClient();
  const [memo, setMemo] = useState("");
  const [participants_uids, setParticipants_uids] = useState<string[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const { data: tamaki } = useQuery({
    queryKey: ["tamaki", id],
    queryFn: async () => {
      if (!user?.uid || !id) return null;
      const accessToken = await user.getIdToken();
      if (!accessToken) return null;
      const data = await getTamaki(id, accessToken);
      setMemo(data.memo || "");
      setParticipants_uids(data.participants_uids);
      return data;
    },
    enabled: !!user && !!id,
  });

  const { data: allUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!user?.uid) return [];
      const accessToken = await user.getIdToken();
      if (!accessToken) return [];
      const users = await GetAllUsers(accessToken);
      return users.filter((uid) => uid !== user.uid);
    },
    enabled: !!user,
  });

  const handleUpdate = async () => {
    if (!user?.uid || !id || !tamaki) return;

    const accessToken = await user.getIdToken();
    if (!accessToken) return;

    try {
      await updateTamaki(
        id,
        tamaki.kind,
        tamaki.organizer_uid,
        participants_uids,
        memo,
        accessToken
      );
      queryClient.invalidateQueries({ queryKey: ["tamaki"] });
      navigate(`/`);
    } catch (error) {
      console.error("Error updating tamaki:", error);
      alert("たまきの更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!user?.uid || !id) return;

    const accessToken = await user.getIdToken();
    if (!accessToken) return;

    try {
      const success = await deleteTamaki(id, accessToken);
      if (success) {
        navigate("/");
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.error("Error deleting tamaki:", error);
      alert("たまきの削除に失敗しました");
    }
  };

  return (
    <CheckAuth>
      <Box
        sx={{
          mx: "auto",
          gap: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <TopBar />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 400,
            width: "90%",
            p: 2,
          }}
        >
          <Card>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box display="flex" alignItems="center" gap={2}>
                <FaEdit />
                <Typography level="title-lg">
                  {tamaki && Kind2title(tamaki.kind)}
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  color="danger"
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  削除
                </Button>
              </Box>
            </Box>
          </Card>

          <FormControl>
            <FormLabel>メモ</FormLabel>
            <Textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモを入力"
              minRows={3}
            />
          </FormControl>

          <FormControl>
            <FormLabel>参加者</FormLabel>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {(allUsers || []).map((user) => (
                <Box
                  key={user}
                  display="flex"
                  gap={2}
                  alignItems="center"
                  onClick={() => {
                    setParticipants_uids(
                      participants_uids.includes(user)
                        ? participants_uids.filter((uid) => uid !== user)
                        : [...participants_uids, user]
                    );
                  }}
                >
                  <UserProfile
                    uid={user}
                    disableClick
                    selected={participants_uids.includes(user)}
                  />
                </Box>
              ))}
            </Box>
          </FormControl>

          <Button onClick={handleUpdate} variant="solid">
            更新
          </Button>
        </Box>

        <Modal
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
        >
          <ModalDialog>
            <DialogTitle>たまきの削除</DialogTitle>
            <DialogContent>
              このたまきを削除してもよろしいですか？
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => setOpenDeleteDialog(false)}
              >
                キャンセル
              </Button>
              <Button variant="solid" color="danger" onClick={handleDelete}>
                削除
              </Button>
            </DialogActions>
          </ModalDialog>
        </Modal>
      </Box>
    </CheckAuth>
  );
};

export default TamakiDetail;
