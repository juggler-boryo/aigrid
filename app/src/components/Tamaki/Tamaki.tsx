import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Divider,
  Button,
} from "@mui/joy";
import { useQuery } from "@tanstack/react-query";
import { listTamaki, TamakiEvent } from "../../apis/tamaki";
import UserProfile from "../UserProfile";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../libs/firebase";
import { IoMdAdd } from "react-icons/io";
import { Min2Str } from "../../libs/min2str";
import { useNavigate } from "react-router-dom";

export const Kind2title = (kind: number) => {
  if (kind === 1) return "風呂";
  return "その他";
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
              }}
              onClick={() => navigate(`/tamaki/${tamaki.id}`)}
            >
              <Box
                display="flex"
                gap={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Box display="flex" gap={2} alignItems="center">
                  <Typography level="title-md">
                    {Kind2title(tamaki.kind)}
                  </Typography>
                  <Divider orientation="vertical" />
                  <UserProfile
                    uid={tamaki.organizer_uid}
                    isOnlyAvatar
                    disableClick
                  />
                  {(tamaki.participants_uids || []).map((uid) => (
                    <UserProfile
                      key={uid}
                      uid={uid}
                      isOnlyAvatar
                      disableClick
                    />
                  ))}
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
          ))}
          <Box display="flex" justifyContent="center" width="100%">
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => navigate("/tamaki/new")}
            >
              <IoMdAdd />
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default Tamaki;
