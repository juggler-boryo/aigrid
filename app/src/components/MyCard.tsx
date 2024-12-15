import { Box } from "@mui/joy";

const MyCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        width: "87vw",
        borderRadius: "var(--joy-radius-lg)",
        backgroundColor: "var(--joy-palette-neutral-50)",
        border: "1px solid var(--joy-palette-neutral-300)",
      }}
      p={0.8}
    >
      <Box m={1} gap={"16px"} display={"flex"} flexDirection={"column"}>
        {children}
      </Box>
    </Box>
  );
};

export default MyCard;
