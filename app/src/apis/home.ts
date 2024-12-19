import { Endpoint } from "./endpoint";


export const TriggerToyu = async (accessToken: string): Promise<boolean> => {
    try {
        const response = await fetch(`${Endpoint}home/toyu`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.ok;
    } catch (error) {
        console.error("Error in TriggerToyu:", error);
        return false;
    }
}
