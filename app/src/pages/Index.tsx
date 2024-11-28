import { Box, Divider } from "@mui/joy";
import CheckAuth from "./CheckAuth";
import OfflineList from "../components/OfflineList/OfflineList";
import { Link } from "react-router-dom";
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
        <Link to="https://github.com/juggler-boryo/aigrid">
          みんなでaigridを作ろう
        </Link>
      </Box>
    </CheckAuth>
  );
};

export default Index;
