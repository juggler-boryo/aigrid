import { TamakiEvent, TamakiEventDTO } from "../types/tamaki";
import { Endpoint } from "./endpoint";

export const getTamaki = async (
  id: string,
  accessToken: string
): Promise<TamakiEvent> => {
  const response = await fetch(`${Endpoint}tamaki/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
};

export const createTamaki = async (
  event: TamakiEventDTO,
  accessToken: string
): Promise<TamakiEvent> => {
  const response = await fetch(`${Endpoint}tamaki`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(event),
  });
  return response.json();
};

export const updateTamaki = async (
  id: string,
  event: TamakiEventDTO,
  accessToken: string
): Promise<TamakiEvent> => {
  const response = await fetch(`${Endpoint}tamaki/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(event),
  });
  return response.json();
};

export const listTamaki = async (
  accessToken: string
): Promise<TamakiEvent[]> => {
  const response = await fetch(`${Endpoint}tamaki`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
};

export const deleteTamaki = async (
  id: string,
  accessToken: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${Endpoint}tamaki/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.ok;
  } catch (error) {
    console.error("Error in deleteTamaki:", error);
    return false;
  }
};
