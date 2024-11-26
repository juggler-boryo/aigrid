import { CircularProgress } from "@mui/joy";
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

const Profile = () => {
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
      <Typography level="h4">プロフィール設定</Typography>

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

      <Button type="submit" variant="solid">
        プロフィールを更新
      </Button>
    </Box>
  );
};

export default Profile;
