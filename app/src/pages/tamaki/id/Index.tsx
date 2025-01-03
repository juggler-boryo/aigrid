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
  Chip,
  Input,
  IconButton,
  Divider,
  Switch,
} from "@mui/joy";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../../libs/firebase";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTamaki, updateTamaki, deleteTamaki } from "../../../apis/tamaki";
import TopBar from "../../../components/TopBar";
import CheckAuth from "../../CheckAuth";
import { FaEdit, FaShare, FaTrash } from "react-icons/fa";
import { GetAllUsers } from "../../../apis/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UserProfile from "../../../components/UserProfile";
import { Kind2title } from "../../../components/Tamaki/Tamaki";
import { TamakiEventDTO } from "../../../types/tamaki";
import CoolMo from "../../../components/CoolMo";

const TamakiDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meUser] = useIdToken(auth);
  const queryClient = useQueryClient();
  const [memo, setMemo] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [isArchived, setIsArchived] = useState(false);
  const [participants_uids, setParticipants_uids] = useState<string[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [payDict, setPayDict] = useState<Record<string, boolean>>({});

  const { data: tamaki } = useQuery({
    queryKey: ["tamaki", id],
    queryFn: async () => {
      if (!meUser?.uid || !id) return null;
      const accessToken = await meUser.getIdToken();
      if (!accessToken) return null;
      const data = await getTamaki(id, accessToken);
      setMemo(data.memo || "");
      setTitle(data.title || "");
      setPrice(data.price);
      setParticipants_uids(data.participants_uids || []);
      setIsArchived(data.is_archived || false);
      setPayDict(JSON.parse(data.pay_dict || "{}"));
      return data;
    },
    enabled: !!meUser && !!id,
  });

  const { data: allUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!meUser?.uid) return [];
      const accessToken = await meUser.getIdToken();
      if (!accessToken) return [];
      const users = await GetAllUsers(accessToken);
      return users;
    },
    enabled: !!meUser,
  });

  const handleUpdate = async () => {
    if (!meUser?.uid || !id || !tamaki) return;

    const accessToken = await meUser.getIdToken();
    if (!accessToken) return;

    try {
      const baseEvent = {
        kind: tamaki.kind,
        organizer_uid: tamaki.organizer_uid,
        participants_uids,
      };

      let event: TamakiEventDTO;

      if (tamaki.kind === 0) {
        event = {
          ...baseEvent,
          title,
          memo,
          price: price !== undefined ? price : -1,
          is_archived: isArchived,
          pay_dict: JSON.stringify(payDict),
        };
      } else if (tamaki.kind === 2) {
        event = {
          ...baseEvent,
          title,
          memo,
        };
      } else if (tamaki.kind === 3) {
        event = {
          ...baseEvent,
          title,
          memo,
        };
      } else {
        event = {
          ...baseEvent,
          memo,
        };
      }

      await updateTamaki(id, event, accessToken);
      queryClient.invalidateQueries({ queryKey: ["tamaki"] });
      navigate(`/`);
    } catch (error) {
      console.error("Error updating tamaki:", error);
      alert("たまきの更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!meUser?.uid || !id) return;

    const accessToken = await meUser.getIdToken();
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
        <Box width={"90%"}>
          <Divider />
        </Box>
        <CoolMo>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 500,
              width: "90%",
              minWidth: { xs: "300px", sm: "400px" },
              p: 2,
            }}
          >
            <Card>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width={"100%"}
              >
                <Box width={"100%"} display="flex" alignItems="center" gap={2}>
                  <FaEdit />
                  <Typography level="title-lg">
                    {tamaki &&
                      (tamaki.kind === 0 || tamaki.kind === 2 || tamaki.kind === 3
                        ? tamaki.title
                        : Kind2title(tamaki.kind))}
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <IconButton
                    variant="outlined"
                    color="neutral"
                    onClick={() => {
                      const url = `https://aigrid.vercel.app/tamaki/${id}`;
                      navigator.clipboard.writeText(url).then(() => {
                        alert("URLをコピーしました");
                      });
                    }}
                  >
                    <FaShare />
                  </IconButton>
                  <IconButton
                    variant="outlined"
                    color="danger"
                    onClick={() => setOpenDeleteDialog(true)}
                  >
                    <FaTrash />
                  </IconButton>
                </Box>
              </Box>
            </Card>
            {(tamaki?.kind === 0 || tamaki?.kind === 2 || tamaki?.kind === 3) && (
              <FormControl>
                <FormLabel>タイトル</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="イベントのタイトルを入力"
                  required
                />
              </FormControl>
            )}

            {(tamaki?.kind === 0 ||
              tamaki?.kind === 1 ||
              tamaki?.kind === 2 ||
              tamaki?.kind === 3) && (
                <FormControl>
                  <FormLabel>メモ</FormLabel>
                  <Textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="メモを入力"
                    minRows={3}
                  />
                </FormControl>
              )}

            {tamaki?.kind === 0 && (
              <FormControl>
                <FormLabel>価格</FormLabel>
                <Input
                  type="number"
                  value={price !== undefined ? price : ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="価格を入力"
                />
              </FormControl>
            )}

            {(tamaki?.kind === 0 || tamaki?.kind === 1) && (
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
                        if (user === tamaki?.organizer_uid) return;
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
                        selected={
                          participants_uids.includes(user) ||
                          user === tamaki?.organizer_uid // 主催者は参加者として扱う
                        }
                      />
                    </Box>
                  ))}
                </Box>
              </FormControl>
            )}

            {tamaki?.kind === 0 && (
              <FormControl>
                <FormLabel>支払い状況</FormLabel>
                <Box display="flex" flexDirection="column" gap={1} borderRadius="md">
                  {(allUsers || [])
                    .filter(
                      (uid) =>
                        participants_uids.includes(uid) ||
                        uid === tamaki?.organizer_uid
                    )
                    .map((uid) => (
                      <Box
                        key={uid}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={2}
                        sx={{
                          p: 1.5,
                          borderRadius: 'sm',
                          '&:hover': {
                            backgroundColor: 'background.level2'
                          }
                        }}
                        onClick={() => {
                          setPayDict({
                            ...payDict,
                            [uid]: !payDict[uid],
                          });
                        }}
                      >
                        <UserProfile uid={uid} disableClick />
                        <Switch
                          checked={payDict[uid] || false}
                          onChange={(e) => {
                            setPayDict({
                              ...payDict,
                              [uid]: e.target.checked,
                            });
                          }}
                          color={payDict[uid] ? "success" : "neutral"}
                        />
                      </Box>
                    ))}
                </Box>
              </FormControl>
            )}
            {tamaki?.kind === 0 && (
              <Card variant="outlined">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                >
                  <Typography level="body-sm">進行中</Typography>
                  <Switch
                    checked={isArchived}
                    onChange={(e) => setIsArchived(e.target.checked)}
                  />
                  <Typography level="body-sm">終了</Typography>
                </Box>
              </Card>
            )}


            <Divider />

            <Button onClick={handleUpdate} variant="solid">
              更新
            </Button>
          </Box>
        </CoolMo>

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
        <Chip
          variant="outlined"
          onClick={() => {
            window.open(
              "https://github.com/juggler-boryo/tamaki-protocol/tree/main",
              "_blank"
            );
          }}
        >
          <Typography level="title-sm">
            Tamaki Protocol Specification
          </Typography>
        </Chip>
      </Box>
    </CheckAuth>
  );
};

export default TamakiDetail;
