import { Box, Button, Input, Switch, Typography } from "@mui/joy";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../libs/firebase";

const Index = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      alert("メールアドレスとパスワードを入力してください");
      return;
    }
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        navigate("/");
      } else {
        await createUserWithEmailAndPassword(auth, form.email, form.password);
        navigate("/profile");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "auth/invalid-credential"
      ) {
        alert("メールアドレスまたはパスワードが間違っています");
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("不明なエラーが発生しました");
      }
    }
  };
  return (
    <Box gap={2} display="flex" flexDirection="column">
      <Typography level="h1" sx={{ textAlign: "center" }}>
        aigrid 認証
      </Typography>
      <Input
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="メールアドレス"
      />
      <Input
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="パスワード"
        type="password"
      />

      <Button onClick={handleSubmit}>
        {isLoginMode ? "ログイン" : "新規登録"}
      </Button>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
        <Switch
          checked={!isLoginMode}
          onChange={(e) => setIsLoginMode(!e.target.checked)}
          startDecorator={"ログイン"}
          endDecorator={"新規登録"}
        />
      </Box>
    </Box>
  );
};

export default Index;
