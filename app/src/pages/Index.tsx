import { Box, Chip, Divider, Typography } from "@mui/joy";
import CheckAuth from "./CheckAuth";
import OfflineList from "../components/OfflineList/OfflineList";
import TopBar from "../components/TopBar";

const Index = () => {
  return (
    <CheckAuth>
      <Box gap={2} display="flex" flexDirection="column" alignItems="center">
        <TopBar />
        <Box width={"90%"}>
          <Divider />
        </Box>
        <OfflineList />
        {/* <Tamaki /> */}
        <Box display="flex" flexDirection="row" gap={2} justifyContent="center">
          <Box
            component="img"
            src="/catg.gif"
            alt="Cat GIF"
            sx={{
              maxWidth: "50%",
              height: "auto",
            }}
          />
          <Box
            component="img"
            src="/catg2.gif"
            alt="Cat GIF 2"
            sx={{
              maxWidth: "50%",
              height: "auto",
            }}
          />
        </Box>
        <Chip
          variant="outlined"
          onClick={() => {
            window.open("https://github.com/juggler-boryo/aigrid", "_blank");
          }}
        >
          <Typography level="title-sm">みんなでaigridを作ろう</Typography>
        </Chip>
        {/* 
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <IconButton
            variant="outlined"
            onClick={() => {
              navigate("/home");
            }}
            sx={{
              backgroundColor: "white",
              borderRadius: "100%",
              width: 64,
              height: 64,
              cursor: "pointer",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            <RiHomeWifiLine size={32} />
          </IconButton>
        </Box>
        */}
      </Box>
    </CheckAuth>
  );
};

export default Index;
