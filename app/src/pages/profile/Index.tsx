import { Avatar, Card, CircularProgress, Divider } from "@mui/joy";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../libs/firebase";
import TopBar from "../../components/TopBar";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user] = useIdToken(auth);
  const { data: me, isLoading } = useQuery<User>({
    queryKey: ["user"],
    queryFn: () => GetUser(user?.uid || ""),
    enabled: !!user?.uid,
  });

  const [username, setUsername] = useState("");
  const [greeting, ] = useState("");
  const [avatarImageUrl, setAvatarImageUrl] = useState("");
  const [suicaId, setSuicaId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
        avatar_image_url: avatarImageUrl,
        suica_id: suicaId,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user?.uid) return;

    setIsUploading(true);
    const file = e.target.files[0];
    const storageRef = ref(storage, `thumbnails/${user.uid}.png`);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log(downloadURL);
      setAvatarImageUrl(downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("画像のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (me) {
      setUsername(me.username || "");
      setAvatarImageUrl(me.avatar_image_url || "");
      setSuicaId(me.suica_id || "");
    }
  }, [me]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <CheckAuth>
      <Box sx={{mx: "auto", gap: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
        <TopBar/>
        <Box width={"90%"}>
          <Divider/>
        </Box>
      </Box>
        
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
        <FormControl>
          <FormLabel>挨拶</FormLabel>
          <Input
            value={greeting}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名を入力"
          />
        </FormControl>
        <FormControl>
          <FormLabel>アバター画像</FormLabel>
          <Box display="flex" alignItems="center" gap={2}>
            {isUploading ? (
              <CircularProgress size="sm" />
            ) : (
              <Avatar src={avatarImageUrl} />
            )}
            <Button component="label" variant="outlined" disabled={isUploading}>
              変更
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </Button>
          </Box>
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
