import { User } from "../types/user";
import { Endpoint } from "./endpoint";

export const GetAllUsers = async (accessToken: string): Promise<string[]> => {
  try {
    const response = await fetch(`${Endpoint}users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data;
  } catch {
    return [];
  }
};

export const GetUser = async (
  uid: string,
  accessToken?: string
): Promise<User> => {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const response = await fetch(`${Endpoint}users/${uid}`, {
      method: "GET",
      headers,
    });
    if (!response.ok) {
      return {} as User;
    }
    const data = await response.json();
    if (!data) {
      return {} as User;
    }
    return data;
  } catch {
    return {} as User;
  }
};

export const UpdateUser = async (
  uid: string,
  user: User,
  accessToken: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${Endpoint}users/${uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(user),
    });
    return response.ok;
  } catch {
    return false;
  }
};
