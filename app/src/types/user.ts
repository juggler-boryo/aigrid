export interface User {
  // required
  uid: string;
  // optionals
  username?: string;
  avatar_image_url?: string;
  greet_text?: string;
  bye_text?: string;
  mac_address?: string;
}
