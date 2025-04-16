import { Box, Chip, Divider, Typography } from "@mui/joy";
import CheckAuth from "./CheckAuth";
import OfflineList from "../components/OfflineList/OfflineList";
import TopBar from "../components/TopBar";

const banners = [
  "https://sub-straightline.ssl-lolipop.jp/banner/3507.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/3414.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/3295.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/3236.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/2857.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/2792.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/2680.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/2066.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/1991.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/1537.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/455.gif",
  "https://sub-straightline.ssl-lolipop.jp/banner/380.gif",
];

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
        <Box
          display="flex"
          flexDirection="row"
          flexWrap="wrap"
          gap={1}
          justifyContent="center"
          alignItems="center"
          width="100%"
          px={2}
        >
          {banners.map((banner) => (
            <Box
              key={banner}
              component="img"
              src={banner}
              alt="Banner"
              sx={{
                width: "80px",
                height: "auto",
                objectFit: "contain",
              }}
            />
          ))}
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
