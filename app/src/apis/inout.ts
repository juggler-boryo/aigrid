import { Inout } from "../types/inout";
import { Endpoint } from "./endpoint";

export const postInout = async (
  uid: string,
  isIn: boolean,
  accessToken: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${Endpoint}inout/${uid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ isIn }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error in postInout:", error);
    return false;
  }
};

export const postExitAll = async (uid: string, accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(`${Endpoint}inout/${uid}/exit_all`, { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Error in postExitAll:", error);
    return false;
  }
};

export const getInMinutes = async (
  uid: string,
  accessToken: string
): Promise<number> => {
  const response = await fetch(`${Endpoint}inout/${uid}/minutes`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data.minutes;
};

export const getInoutHistory = async (
  uid: string,
  accessToken: string
): Promise<Inout[]> => {
  const response = await fetch(`${Endpoint}inout/${uid}/history`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data.history;
};

export const getInoutList = async (
  uid: string,
  accessToken: string
): Promise<boolean> => {
  const response = await fetch(`${Endpoint}inout/${uid}/is_in`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  return data.isIn;
};

export const getInoutAnalytics = async (
  accessToken: string
): Promise<Inout[]> => {
  const response = await fetch(`${Endpoint}inout/anal`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  return data.history;
};
