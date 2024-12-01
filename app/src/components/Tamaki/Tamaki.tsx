import {
  Box,
  Typography,
  CircularProgress,
  Card,
  Divider,
  Button,
  Chip,
} from "@mui/joy";
import { useInfiniteQuery } from "@tanstack/react-query";
import { listTamaki } from "../../apis/tamaki";
import UserProfile from "../UserProfile";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../libs/firebase";
import { IoMdAdd, IoMdCheckmark } from "react-icons/io";
import { Min2Str } from "../../libs/min2str";
import { useNavigate } from "react-router-dom";
import { BsThreeDots } from "react-icons/bs";
import { useState, useMemo } from "react";

export const Kind2title = (kind: number) => {
  if (kind === 1) return "風呂";
  return "invalid kind";
};

const Tamaki = () => {
  const navigate = useNavigate();
  const [user] = useIdToken(auth);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["tamaki"],
    queryFn: async ({ pageParam }) => {
      const accessToken = await user?.getIdToken();
      if (!accessToken) return { events: [], has_more: false };
      return await listTamaki(accessToken, !pageParam, pageParam);
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    enabled: !!user,
  });

  const tamakiList = useMemo(() => {
    return data?.pages.flatMap((page) => page.events) ?? [];
  }, [data]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await fetchNextPage();
    setIsLoadingMore(false);
  };

  return (
    <Card sx={{ width: "85%" }}>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box gap={1} display="flex" flexDirection="column">
          {tamakiList.map((tamaki) => (
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
          <Box display="flex" width="100%" justifyContent="flex-end" gap={1}>
            {hasNextPage && (
              <Button
                variant="outlined"
                color="neutral"
                fullWidth
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <CircularProgress size="sm" />
                ) : (
                  <BsThreeDots />
                )}
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/tamaki/new")}
              startDecorator={<IoMdAdd />}
              sx={{
                minWidth: "100px",
              }}
            >
              たまき
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default Tamaki;
