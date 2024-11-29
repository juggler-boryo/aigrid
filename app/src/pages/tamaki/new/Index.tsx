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

const TamakiNew = () => {
  const navigate = useNavigate();
  const [user] = useIdToken(auth);

  const [kind, setKind] = useState(1);
  const [memo, setMemo] = useState("");
  const [participants_uids, setParticipants_uids] = useState<string[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const accessToken = await user.getIdToken();
    if (!accessToken) return;

    try {
      await createTamaki(kind, user.uid, participants_uids, memo, accessToken);
      navigate("/");
    } catch (error) {
      console.error("Error creating tamaki:", error);
      alert("たまきの作成に失敗しました");
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
              onChange={(e, value) => setKind(Number(value))}
              placeholder="たまきの種類を選択"
            >
              <Option value={1}>風呂</Option>
            </Select>
          </FormControl>

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

          <Button type="submit" variant="solid">
            作成
          </Button>
        </Box>
      </Box>
    </CheckAuth>
  );
};

export default TamakiNew;
