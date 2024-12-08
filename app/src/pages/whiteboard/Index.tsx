import { Box, Card, Divider, Typography, Button } from "@mui/joy";
import TopBar from "../../components/TopBar";
import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { app, auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";

const database = getDatabase(app);

const Whiteboard = () => {
  const [content, setContent] = useState<string>("");
  const [draftContent, setDraftContent] = useState<string>("");
  const [user] = useIdToken(auth);

  const updateContent = (newContent: string) => {
    if (user) {
      const whiteboardRef = ref(database, "whiteboard/content");
      set(whiteboardRef, newContent);
    }
  };

  useEffect(() => {
    const whiteboardRef = ref(database, "whiteboard/content");
    const unsubscribe = onValue(whiteboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setContent(data);
        setDraftContent(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(e.target.value);
  };

  const handleUpdate = () => {
    setContent(draftContent);
    updateContent(draftContent);
  };
  return (
    <Box gap={2} display="flex" flexDirection="column" alignItems="center">
      <TopBar />
      <Box width={"90%"}>
        <Divider />
      </Box>
      <Box width={"85%"} sx={{ maxWidth: "100%" }}>
        <Card>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography level="title-lg">Whiteboard</Typography>
            <Box>
              <textarea
                value={draftContent}
                onChange={handleChange}
                placeholder="( ◠‿◠ )"
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              />
              <Typography level="body-sm" color="warning">
                ※
                みんなで同時編集すると大変なことになっちゃうから、一人ずつ編集してね
              </Typography>

              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  onClick={handleUpdate}
                  disabled={!user || content === draftContent}
                >
                  更新
                </Button>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default Whiteboard;
