import { ToyuEndpoint } from "./endpoint";

export const getToyu = async () => {
  try {
    const response = await fetch(`${ToyuEndpoint}`)
    return response.json()
  } catch (error) {
    console.error(error)
    return null
  }
}