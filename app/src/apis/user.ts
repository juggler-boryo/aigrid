import { User } from "../types/user";
import { Endpoint } from "./endpoint";

export const GetUser = async (uid: string): Promise<User> => {
  try {
    const response = await fetch(`${Endpoint}users/${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      return {} as User;
    }
    const data = await response.json();
    if (!data) {
      return {} as User;
    }
    return data;
  } catch (error) {
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
  } catch (error) {
    return false;
  }
};
