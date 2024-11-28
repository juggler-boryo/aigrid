import { Card, CircularProgress, Divider } from "@mui/joy";
import {
  Box,
  Button,
  Typography,
  FormControl,
  FormLabel,
  Input,
} from "@mui/joy";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../libs/firebase";
import { useQuery } from "@tanstack/react-query";
import { GetUser, UpdateUser } from "../../apis/user";
import { User } from "../../types/user";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import CheckAuth from "../CheckAuth";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user] = useIdToken(auth);
  const { data: me, isLoading } = useQuery<User>({
    queryKey: ["user"],
    queryFn: () => GetUser(user?.uid || ""),
    enabled: !!user?.uid,
  });

  const [username, setUsername] = useState("");
  const [avatarImageUrl, setAvatarImageUrl] = useState("");
  const [suicaId, setSuicaId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const accessToken = await user.getIdToken();
    if (!accessToken) return;

    const success = await UpdateUser(
      user.uid,
      {
        uid: user.uid,
        username,
        avatarImageUrl,
        suicaId,
      },
      accessToken
    );

    if (success) {
      navigate("/");
    }
  };

  const onLogout = () => {
    if (window.confirm("ログアウトしますか？")) {
      auth.signOut();
      navigate("/login");
    }
  };

  useEffect(() => {
    if (me) {
      setUsername(me.username || "");
      setAvatarImageUrl(me.avatarImageUrl || "");
      setSuicaId(me.suicaId || "");
    }
  }, [me]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <CheckAuth>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 400,
          mx: "auto",
          p: 2,
        }}
      >
        <Card>
          <Box display="flex" alignItems="center" gap={2}>
            <FaRegUser />
            <Typography level="title-lg">プロフィール設定</Typography>
          </Box>
        </Card>
        <FormControl>
          <FormLabel>ユーザー名</FormLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名を入力"
          />
        </FormControl>

        <FormControl disabled>
          <FormLabel>アバター画像URL</FormLabel>
          <Input
            value={avatarImageUrl}
            onChange={(e) => setAvatarImageUrl(e.target.value)}
            placeholder="アバター画像URLを入力"
          />
        </FormControl>

        <FormControl disabled>
          <FormLabel>Suica ID</FormLabel>
          <Input
            value={suicaId}
            onChange={(e) => setSuicaId(e.target.value)}
            placeholder="Suica IDを入力"
          />
        </FormControl>

        <Box m={0.5}>
          <Divider />
        </Box>

        <Button type="submit" variant="solid">
          更新
        </Button>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button color="danger" onClick={onLogout} variant="outlined">
            ログアウト
          </Button>
        </Box>
      </Box>
    </CheckAuth>
  );
};

export default ProfileSettings;
