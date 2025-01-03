export interface User {
  // required
  uid: string;
  // optionals
  username?: string;
  avatar_image_url?: string;
  suica_id?: string;
  greet_text?: string;
  bye_text?: string;
  permission_str?: string;
}
