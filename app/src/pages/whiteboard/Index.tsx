import { Box, Card, Divider, Typography, Button, Textarea } from "@mui/joy";
import TopBar from "../../components/TopBar";
import { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  onValue,
  set,
  serverTimestamp,
} from "firebase/database";
import { app, auth } from "../../libs/firebase";
import { useIdToken } from "react-firebase-hooks/auth";
import UserProfile from "../../components/UserProfile";

const database = getDatabase(app);
const ACTIVE_THRESHOLD = 3 * 60 * 1000; // 3 minutes in milliseconds

const Whiteboard = () => {
  const [content, setContent] = useState<string>("");
  const [draftContent, setDraftContent] = useState<string>("");
  const [user] = useIdToken(auth);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  const updateContent = (newContent: string) => {
    if (user) {
      const whiteboardRef = ref(database, "whiteboard/content");
      set(whiteboardRef, newContent);
    }
  };

  const updateUserActivity = () => {
    if (user) {
      const userActivityRef = ref(
        database,
        `whiteboard/activeUsers/${user.uid}`
      );
      set(userActivityRef, serverTimestamp());
    }
  };

  useEffect(() => {
    // Content subscription
    const whiteboardRef = ref(database, "whiteboard/content");
    const contentUnsubscribe = onValue(whiteboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data !== null) {
        setContent(data);
        setDraftContent(data);
      }
    });

    // Active users subscription
    const activeUsersRef = ref(database, "whiteboard/activeUsers");
    const activeUsersUnsubscribe = onValue(activeUsersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const now = Date.now();
        const activeUids = Object.entries(data)
          .filter(([, timestamp]) => {
            const lastActive = timestamp as number;
            return now - lastActive <= ACTIVE_THRESHOLD;
          })
          .map(([uid]) => uid);
        setActiveUsers(activeUids);
      }
    });

    // Update user activity periodically
    const activityInterval = setInterval(updateUserActivity, 60000); // every minute
    updateUserActivity(); // Initial update

    return () => {
      contentUnsubscribe();
      activeUsersUnsubscribe();
      clearInterval(activityInterval);
    };
  }, [user]);

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
            <Box display="flex" gap={1} flexWrap="wrap">
              {activeUsers.map((uid) => (
                <Box key={uid}>
                  <UserProfile uid={uid} />
                </Box>
              ))}
              {activeUsers.length === 0 && (
                <Typography level="body-sm">
                  編集している人はいません
                </Typography>
              )}
            </Box>
            <Box>
              <Textarea
                value={draftContent}
                onChange={handleChange}
                placeholder="( ◠‿◠ )"
                minRows={5}
                sx={{
                  fontFamily: "monospace",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  width: "100%",
                  resize: "both",
                  minHeight: "100px",
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
