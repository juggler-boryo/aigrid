import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Divider,
  Button,
  Chip,
} from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { listTamaki } from "../../apis/tamaki";
import { TamakiEvent } from "../../types/tamaki";
import UserProfile from "../UserProfile";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../libs/firebase";
import { IoMdAdd, IoMdCheckmark } from "react-icons/io";
import { Min2Str } from "../../libs/min2str";
import { useNavigate } from "react-router-dom";

export const Kind2title = (kind: number) => {
  if (kind === 1) return "風呂";
  return "invalid kind";
};

const Tamaki = () => {
  const navigate = useNavigate();
  const [user] = useIdToken(auth);
  const { data: tamakiList = [], isLoading } = useQuery<TamakiEvent[]>({
    queryKey: ["tamaki"],
    queryFn: async () => {
      const accessToken = await user?.getIdToken();
      if (!accessToken) return [];
      return await listTamaki(accessToken);
    },
    enabled: !!user,
  });

  return (
    <Card sx={{ width: "85%" }}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box gap={1} display="flex" flexDirection="column">
          {(tamakiList || []).map((tamaki) => (
            <Box key={tamaki.id} position="relative">
              {(tamaki.participants_uids?.includes(user?.uid || "") ||
                tamaki.organizer_uid === user?.uid) && (
                <Chip
                  size="sm"
                  variant="outlined"
                  color="success"
                  startDecorator={<IoMdCheckmark />}
                  sx={{
                    position: "absolute",
                    top: -4,
                    left: -4,
                    zIndex: 10,
                  }}
                />
              )}
              <Card
                key={tamaki.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "var(--joy-palette-neutral-100, #F0F4F8)",
                    transition: "all 0.2s ease-in-out",
                  },
                  position: "relative",
                }}
                onClick={() => {
                  navigate(`/tamaki/${tamaki.id}`);
                }}
              >
                <Box
                  display="flex"
                  gap={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" gap={2} alignItems="center">
                    <UserProfile
                      uid={tamaki.organizer_uid}
                      isOnlyAvatar
                      disableClick
                    />

                    <Divider orientation="vertical" />
                    <Box display="flex" gap={1} alignItems="center">
                      <Typography level="title-md">
                        {tamaki.kind === 0
                          ? tamaki.title
                          : Kind2title(tamaki.kind)}
                      </Typography>
                      <Typography level="title-sm">
                        {tamaki.participants_uids &&
                          `(${tamaki.participants_uids.length + 1})`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography level="body-sm" textColor="neutral.500">
                    {Min2Str(
                      (new Date().getTime() -
                        new Date(tamaki.created_at).getTime()) /
                        1000 /
                        60
                    )}
                  </Typography>
                </Box>
              </Card>
            </Box>
          ))}
          <Box display="flex" justifyContent="center" width="100%">
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => navigate("/tamaki/new")}
              startDecorator={<IoMdAdd />}
            >
              魂環
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default Tamaki;
