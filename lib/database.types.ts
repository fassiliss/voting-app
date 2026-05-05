export type Database = {
    public: {
        Tables: {
            candidates: {
                Row: {
                    id: number;
                    name: string;
                    position: string;
                };
                Insert: {
                    id?: number;
                    name: string;
                    position?: string;
                };
                Update: {
                    name?: string;
                    position?: string;
                };
                Relationships: [];
            };
            voters: {
                Row: {
                    id: number;
                    voter_name: string;
                    voter_email: string;
                    device_fingerprint: string | null;
                    has_voted: boolean;
                    voted_at: string | null;
                };
                Insert: {
                    id?: number;
                    voter_name: string;
                    voter_email: string;
                    device_fingerprint?: string | null;
                    has_voted?: boolean;
                    voted_at?: string | null;
                };
                Update: {
                    voter_name?: string;
                    voter_email?: string;
                    device_fingerprint?: string | null;
                    has_voted?: boolean;
                    voted_at?: string | null;
                };
                Relationships: [];
            };
            votes: {
                Row: {
                    id: number;
                    voter_id: number;
                    candidate_id: number;
                    rank: number;
                };
                Insert: {
                    id?: number;
                    voter_id: number;
                    candidate_id: number;
                    rank: number;
                };
                Update: {
                    voter_id?: number;
                    candidate_id?: number;
                    rank?: number;
                };
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
};
