import { IconButton } from "@mui/joy";
import { useLocation, useNavigate } from "react-router-dom";

type ActiveIconButtonProps = {
  to: string;
  icon: React.ReactNode;
  color?: "neutral" | "danger" | "primary";
};

const ActiveIconButton = ({
  to,
  icon,
  color = "neutral",
}: ActiveIconButtonProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = location.pathname === to;

  return (
    <IconButton
      variant={isActive ? "solid" : "outlined"}
      color={isActive ? "primary" : color}
      size="lg"
      sx={{
        borderRadius: "18px",
      }}
      onClick={() => navigate(to)}
    >
      {icon}
    </IconButton>
  );
};

export default ActiveIconButton;
