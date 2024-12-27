import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  Select,
  Option,
  Textarea,
  Typography,
  Chip,
  Input,
  CircularProgress,
  Divider,
  Modal,
  ModalDialog,
} from "@mui/joy";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../../libs/firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTamaki } from "../../../apis/tamaki";
import TopBar from "../../../components/TopBar";
import CheckAuth from "../../CheckAuth";
import { FaRegCalendarPlus } from "react-icons/fa";
import { GetAllUsers } from "../../../apis/user";
import { useQuery } from "@tanstack/react-query";
import UserProfile from "../../../components/UserProfile";
import { TamakiEvent, TamakiEventDTO } from "../../../types/tamaki";

const TamakiNew = () => {
  const navigate = useNavigate();
  const [meUser] = useIdToken(auth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [kind, setKind] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [participants_uids, setParticipants_uids] = useState<string[]>([]);
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

  const [openKindModal, setOpenKindModal] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meUser?.uid) return;
    setIsSubmitting(true);

    const accessToken = await meUser.getIdToken();
    if (!accessToken) {
      setIsSubmitting(false);
      return;
    }

    try {
      const baseEvent: Omit<TamakiEvent, "id" | "created_at"> = {
        kind,
        organizer_uid: meUser.uid,
        participants_uids,
      };

      let event: TamakiEventDTO;

      if (kind === 0) {
        // わくわくイベント
        event = {
          ...baseEvent,
          title,
          memo,
          price: price !== undefined ? price : -1,
          is_archived: false,
        };
      } else if (kind === 1) {
        // お風呂券
        event = {
          ...baseEvent,
          memo,
        };
      } else if (kind === 2) {
        // 最強レシピ
        event = {
          ...baseEvent,
          title,
          memo,
        };
      } else if (kind === 3) {
        // ときめきメモリアル
        event = {
          ...baseEvent,
          title,
          memo,
        };
      } else {
        throw new Error("Unsupported event kind");
      }

      await createTamaki(event, accessToken);
      navigate("/");
    } catch (error) {
      console.error("Error creating tamaki:", error);
      alert("たまきの作成に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CheckAuth>
      <Modal open={openKindModal} onClose={() => setOpenKindModal(false)}>
        <ModalDialog>
          <Typography level="title-lg" mb={2}>
            たまきの種類を選択
          </Typography>
          <FormControl>
            <Select
              value={kind}
              onChange={(_, value) => {
                setKind(Number(value));
              }}
            >
              <Option value={0}>わくわくイベント</Option>
              <Option value={3}>ときめきメモリアル</Option>
              <Option value={1}>お風呂券</Option>
              <Option value={2}>最強レシピ</Option>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            onClick={() => setOpenKindModal(false)}
            sx={{ mt: 2 }}
          >
            選択
          </Button>
        </ModalDialog>
      </Modal>
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
        <Box
          component="form"
          onSubmit={handleSubmit}
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
            <Box display="flex" alignItems="center" gap={2}>
              <FaRegCalendarPlus />
              <Typography level="title-lg">新規たまき作成</Typography>
            </Box>
          </Card>

          <FormControl>
            <FormLabel>種類</FormLabel>
            <Select
              value={kind}
              onChange={(_, value) => setKind(Number(value))}
              placeholder="たま���の種類を選択"
            >
              <Option value={0}>わくわくイベント</Option>
              <Option value={3}>ときめきメモリアル</Option>
              <Option value={1}>お風呂券</Option>
              <Option value={2}>最強レシピ</Option>
            </Select>
          </FormControl>

          {(kind === 0 || kind === 2 || kind === 3) && (
            <FormControl required>
              <FormLabel>タイトル</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトルを入力"
                required
              />
            </FormControl>
          )}

          {(kind === 0 || kind === 1 || kind === 2 || kind === 3) && (
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

          {kind === 0 && (
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

          {(kind === 0 || kind === 1) && (
            <FormControl>
              <FormLabel>参加者</FormLabel>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {(allUsers || []).map((uid) => (
                  <Box
                    key={uid}
                    display="flex"
                    gap={2}
                    alignItems="center"
                    onClick={() => {
                      if (!meUser) return;
                      if (uid === meUser.uid) return;
                      setParticipants_uids((prev) =>
                        prev.includes(uid)
                          ? prev.filter((uid) => uid !== uid)
                          : [...prev, uid]
                      );
                    }}
                  >
                    <UserProfile
                      uid={uid}
                      disableClick
                      selected={
                        participants_uids.includes(uid) || uid === meUser?.uid
                      }
                    />
                  </Box>
                ))}
              </Box>
            </FormControl>
          )}

          <Divider />

          <Button
            type="submit"
            variant="solid"
            disabled={isSubmitting}
            startDecorator={
              isSubmitting ? <CircularProgress size="sm" /> : null
            }
          >
            {isSubmitting ? "作成中..." : "作成"}
          </Button>
        </Box>
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

export default TamakiNew;
