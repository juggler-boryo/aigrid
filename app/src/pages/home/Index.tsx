import TopBar from "../../components/TopBar"
import { Box, Button, Divider } from "@mui/joy";
import CoolMo from "../../components/CoolMo";
import CheckAuth from "../CheckAuth";
import { useIdToken } from "react-firebase-hooks/auth";
import { auth } from "../../libs/firebase";
import { CheckToyuHealth, TriggerToyu } from "../../apis/home";
import { useEffect, useState } from "react";

const Home = () => {
    const [user] = useIdToken(auth)
    const [isToyuHealth, setIsToyuHealth] = useState(false)

    const handleCheckHealthToyu = async () => {
        if (!user) return;
        const accessToken = await user.getIdToken();
        const status = await CheckToyuHealth(accessToken);
        if (status === 200) {
            setIsToyuHealth(true);
        } else {
            setIsToyuHealth(false);
        }
    }

    const handleTriggerToyu = async () => {
        if (!user) return;
        const accessToken = await user.getIdToken();
        const status = await TriggerToyu(accessToken);
        if (!status) {
            alert("灯油ストーブを起動できませんでした");
        }
    }

    useEffect(() => {
        handleCheckHealthToyu();
    }, [user]);

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
                            loading={!isToyuHealth}
                            onClick={handleTriggerToyu}
                            disabled={!isToyuHealth}
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

