import TopBar from "../../components/TopBar"
import { Box, Button, Divider } from "@mui/joy";
import CoolMo from "../../components/CoolMo";
import CheckAuth from "../CheckAuth";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../libs/firebase";
import { TriggerToyu } from "../../apis/home";
import { useMutation } from "@tanstack/react-query";

const Home = () => {
    const [user] = useIdToken(auth);

    const toyuMutation = useMutation({
        mutationFn: async () => {
            if (!user) return;
            const accessToken = await user.getIdToken();
            return TriggerToyu(accessToken);
        },
        onError: () => {
            alert("灯油ストーブを起動できませんでした");
        }
    });

    const handleTriggerToyu = () => {
        toyuMutation.mutate();
    };

    return (
        <CheckAuth>
            <Box gap={2} display="flex" flexDirection="column" alignItems="center">
                <TopBar />
                <Box width={"90%"}>
                    <Divider />
                </Box>
                <Box width={"90%"} sx={{ maxWidth: "100%" }}>
                    <CoolMo>
                        <Button
                            variant="outlined"
                            onClick={handleTriggerToyu}
                            disabled={toyuMutation.isLoading}
                        >
                            🔥 灯油ストーブ
                        </Button>
                    </CoolMo>
                </Box>
            </Box>
        </CheckAuth>
    );
};

export default Home;

