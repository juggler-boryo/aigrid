import { Endpoint } from "./endpoint";
import axios from "axios";

export const CheckToyuHealth = async (accessToken: string) => {
    const response = await axios.get(`${Endpoint}/home/toyu`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.status;
}

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
