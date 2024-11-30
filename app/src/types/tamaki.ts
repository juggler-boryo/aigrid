export interface TamakiEvent {
  id: string;
  kind: number;
  organizer_uid: string;
  participants_uids: string[];
  created_at: string;
  memo?: string; // 1: tip-02
  is_in?: boolean; // 0: tip-02
}
