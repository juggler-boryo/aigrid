import {
  Avatar,
  Card,
  CircularProgress,
  Divider,
  Option,
  Select,
} from "@mui/joy";
import {
  Box,
  Button,
  Typography,
  FormControl,
  FormLabel,
  Input,
} from "@mui/joy";
import { ColorPicker, createColor } from "material-ui-color";
import Cookies from "js-cookie";
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
import CoolMo from "../../components/CoolMo";


const ProfileSettings = () => {

  const navigate = useNavigate();
  const [user] = useIdToken(auth);
  const { data: me, isLoading } = useQuery<User>({
    queryKey: ["user"],
    queryFn: () => GetUser(user?.uid || ""),
    enabled: !!user?.uid,
  });

  const [username, setUsername] = useState("");
  const [greet, setGreet] = useState("");
  const [bye, setBye] = useState("");
  const [avatarImageUrl, setAvatarImageUrl] = useState("");
  const [suicaId, setSuicaId] = useState("");
  const [permissionStr, setPermissionStr] = useState("GUEST");
  const [isUploading, setIsUploading] = useState(false);
  const [color, setColor] = useState(Cookies.get("userColor") || "#808080");

  const handleChange = (value: any) => {
    setColor(value);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    const accessToken = await user.getIdToken();
    if (!accessToken) return;

    const colorHex = "#" + color.hex

    Cookies.set("userColor", colorHex, { expires: 7, path: "/" });
    const success = await UpdateUser(
      user.uid,
      {
        uid: user.uid,
        username,
        avatar_image_url: avatarImageUrl,
        suica_id: suicaId,
        greet_text: greet,
        bye_text: bye,
        permission_str: permissionStr,
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
      setGreet(me.greet_text || "");
      setBye(me.bye_text || "");
      setAvatarImageUrl(me.avatar_image_url || "");
      setSuicaId(me.suica_id || "");
      setPermissionStr(me.permission_str || "GUEST");
    }
  }, [me]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <CheckAuth>
      <Box
        sx={{
          mx: "auto",
          gap: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TopBar />
        <Box width={"90%"}>
          <Divider />
        </Box>
      </Box>
      <CoolMo>
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
            <FormLabel>アバター画像</FormLabel>
            <Box display="flex" alignItems="center" gap={2}>
              {isUploading ? (
                <CircularProgress size="sm" />
              ) : (
                <Avatar src={avatarImageUrl} />
              )}
              <Button
                component="label"
                variant="outlined"
                disabled={isUploading}
              >
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

          <FormControl>
            <FormLabel>権限</FormLabel>
            <Select
              value={permissionStr}
              onChange={(_, value) => setPermissionStr(value ?? "GUEST")}
              placeholder="権限を選択"
            >
              <Option value="GUEST">ゲスト</Option>
              <Option value="GENERAL">一般</Option>
              <Option value="ADMIN">住居人</Option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>入室挨拶</FormLabel>
            <Input
              value={greet}
              onChange={(e) => setGreet(e.target.value)}
              placeholder="私が来た"
            />
          </FormControl>
          <FormControl>
            <FormLabel>退室挨拶</FormLabel>
            <Input
              value={bye}
              onChange={(e) => setBye(e.target.value)}
              placeholder="I'll be back."
            />
          </FormControl>

          <FormControl>
            <FormLabel>NFC ID</FormLabel>
            <Input
              value={suicaId}
              onChange={(e) => setSuicaId(e.target.value)}
              placeholder="NFC IDを入力"
            />
          </FormControl>
          <FormControl>
            <FormLabel>color map(heatmap)</FormLabel>
            <div>
              <ColorPicker value={color} onChange={handleChange} />
            </div>
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
      </CoolMo>
    </CheckAuth>
  );
};

export default ProfileSettings