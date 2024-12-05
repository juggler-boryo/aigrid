export interface TamakiEvent {
  id: string;
  kind: number;
  organizer_uid: string;
  created_at: string;
  title?: string; // 0, 2: tip-02
  memo?: string; // 0,1, 2: tip-02
  participants_uids?: string[]; // 0,1: tip-02
  price?: number; // 0: tip-02
}

export interface TamakiEventDTO {
  kind: number;
  title?: string;
  memo?: string;
  participants_uids?: string[];
  price?: number;
}
