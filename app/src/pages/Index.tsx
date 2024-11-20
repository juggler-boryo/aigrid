import { Box, Button, Typography } from "@mui/joy";
import CheckAuth from "./CheckAuth";

const Index = () => {
  return (
    <CheckAuth>
      <Box gap={2} display="flex" flexDirection="column" alignItems="center">
        <Typography level="h1">aigrid</Typography>
        <Button>Test</Button>
      </Box>
    </CheckAuth>
  );
};

export default Index;
