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
  accessToken: string,
  isFirst: boolean,
  cursor: string | undefined,
  kind: number | undefined,
  isUnArchivedOnly: boolean
): Promise<{
  events: TamakiEvent[];
  next_cursor?: string;
  has_more: boolean;
}> => {
  const params = new URLSearchParams();
  params.append("size", isFirst ? "3" : "10");
  if (cursor) params.append("cursor", cursor);
  if (kind !== undefined) params.append("kind", kind.toString());
  if (isUnArchivedOnly) params.append("is_un_archived_only", "true");
  const response = await fetch(`${Endpoint}tamaki?${params.toString()}`, {
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
