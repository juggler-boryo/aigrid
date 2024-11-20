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
    // validation
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
      }
    } catch (error) {
      // Firebase errors have a specific 'code' property
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "auth/invalid-credential"
      ) {
        alert("メールアドレスまたはパスワードが間違っています");
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };
  return (
    <Box gap={2} display="flex" flexDirection="column">
      <Typography level="h1" sx={{ textAlign: "center" }}>
        aigrid auth
      </Typography>
      <Input
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        placeholder="email"
      />
      <Input
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="password"
        type="password"
      />

      <Button onClick={handleSubmit}>{isLoginMode ? "Login" : "Signup"}</Button>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
        <Switch
          checked={!isLoginMode}
          onChange={(e) => setIsLoginMode(!e.target.checked)}
          startDecorator={"Login"}
          endDecorator={"Signup"}
        />
      </Box>
    </Box>
  );
};

export default Index;
