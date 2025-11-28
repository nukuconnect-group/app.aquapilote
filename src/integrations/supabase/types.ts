export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          module: string
          severity: string
          timestamp: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          module: string
          severity: string
          timestamp?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          module?: string
          severity?: string
          timestamp?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
      ai_analyses: {
        Row: {
          alerte: boolean
          ammonium: number
          conseil: string
          created_at: string
          id: string
          nitrite: number
          oxygene_dissous: number
          ph: number
          temperature: number
          unit_id: string | null
          user_id: string
        }
        Insert: {
          alerte: boolean
          ammonium: number
          conseil: string
          created_at?: string
          id?: string
          nitrite: number
          oxygene_dissous: number
          ph: number
          temperature: number
          unit_id?: string | null
          user_id: string
        }
        Update: {
          alerte?: boolean
          ammonium?: number
          conseil?: string
          created_at?: string
          id?: string
          nitrite?: number
          oxygene_dissous?: number
          ph?: number
          temperature?: number
          unit_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alert_history: {
        Row: {
          alert_type: string
          created_at: string
          email_error: string | null
          email_sent: boolean
          id: string
          message: string
          stock_details: Json | null
          stock_id: string | null
          user_id: string
        }
        Insert: {
          alert_type?: string
          created_at?: string
          email_error?: string | null
          email_sent?: boolean
          id?: string
          message: string
          stock_details?: Json | null
          stock_id?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          email_error?: string | null
          email_sent?: boolean
          id?: string
          message?: string
          stock_details?: Json | null
          stock_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_history_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "feed_stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_infrastructures: {
        Row: {
          created_at: string | null
          current_quantity: number | null
          cycle_id: string
          id: string
          infrastructure_name: string
          infrastructure_type: string
          livestock_batch_id: string | null
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_quantity?: number | null
          cycle_id: string
          id?: string
          infrastructure_name: string
          infrastructure_type: string
          livestock_batch_id?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_quantity?: number | null
          cycle_id?: string
          id?: string
          infrastructure_name?: string
          infrastructure_type?: string
          livestock_batch_id?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_cycle"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_livestock_batch"
            columns: ["livestock_batch_id"]
            isOneToOne: false
            referencedRelation: "livestock_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_stocks: {
        Row: {
          cost: number | null
          created_at: string | null
          custom_name: string | null
          expiration_date: string | null
          fat_content: number | null
          feed_type: string
          id: string
          min_threshold: number | null
          notes: string | null
          protein_content: number | null
          quantity: number
          supplier: string | null
          unit: string
          unit_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          custom_name?: string | null
          expiration_date?: string | null
          fat_content?: number | null
          feed_type: string
          id?: string
          min_threshold?: number | null
          notes?: string | null
          protein_content?: number | null
          quantity?: number
          supplier?: string | null
          unit?: string
          unit_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          custom_name?: string | null
          expiration_date?: string | null
          fat_content?: number | null
          feed_type?: string
          id?: string
          min_threshold?: number | null
          notes?: string | null
          protein_content?: number | null
          quantity?: number
          supplier?: string | null
          unit?: string
          unit_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feeding_plans: {
        Row: {
          created_at: string | null
          cycle_id: string | null
          days: string[]
          feed_type: string
          id: string
          infrastructure_id: string | null
          is_active: boolean
          notes: string | null
          quantity: number
          time: string
          unit: string
          unit_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          cycle_id?: string | null
          days?: string[]
          feed_type: string
          id?: string
          infrastructure_id?: string | null
          is_active?: boolean
          notes?: string | null
          quantity: number
          time: string
          unit?: string
          unit_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          cycle_id?: string | null
          days?: string[]
          feed_type?: string
          id?: string
          infrastructure_id?: string | null
          is_active?: boolean
          notes?: string | null
          quantity?: number
          time?: string
          unit?: string
          unit_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_plans_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_plans_infrastructure_id_fkey"
            columns: ["infrastructure_id"]
            isOneToOne: false
            referencedRelation: "cycle_infrastructures"
            referencedColumns: ["id"]
          },
        ]
      }
      feeding_records: {
        Row: {
          behavior: string | null
          created_at: string | null
          cycle_id: string | null
          date: string
          fcr: number | null
          feed_type: string | null
          id: string
          infrastructure_id: string | null
          notes: string | null
          quantity: number
          temperature: number | null
          time: string | null
          unit_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          behavior?: string | null
          created_at?: string | null
          cycle_id?: string | null
          date: string
          fcr?: number | null
          feed_type?: string | null
          id?: string
          infrastructure_id?: string | null
          notes?: string | null
          quantity: number
          temperature?: number | null
          time?: string | null
          unit_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          behavior?: string | null
          created_at?: string | null
          cycle_id?: string | null
          date?: string
          fcr?: number | null
          feed_type?: string | null
          id?: string
          infrastructure_id?: string | null
          notes?: string | null
          quantity?: number
          temperature?: number | null
          time?: string | null
          unit_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feeding_records_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feeding_records_infrastructure_id_fkey"
            columns: ["infrastructure_id"]
            isOneToOne: false
            referencedRelation: "cycle_infrastructures"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          average_weight: number | null
          basin_id: string | null
          created_at: string | null
          cycle_id: string | null
          date: string
          density: number | null
          feeding: number | null
          id: string
          mortality: number | null
          notes: string | null
          oxygen: number | null
          ph: number | null
          sample_count: number | null
          temperature: number | null
          unit_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_weight?: number | null
          basin_id?: string | null
          created_at?: string | null
          cycle_id?: string | null
          date: string
          density?: number | null
          feeding?: number | null
          id?: string
          mortality?: number | null
          notes?: string | null
          oxygen?: number | null
          ph?: number | null
          sample_count?: number | null
          temperature?: number | null
          unit_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_weight?: number | null
          basin_id?: string | null
          created_at?: string | null
          cycle_id?: string | null
          date?: string
          density?: number | null
          feeding?: number | null
          id?: string
          mortality?: number | null
          notes?: string | null
          oxygen?: number | null
          ph?: number | null
          sample_count?: number | null
          temperature?: number | null
          unit_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "production_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock_batches: {
        Row: {
          acquisition_date: string | null
          average_weight: number | null
          created_at: string | null
          current_age: number | null
          expected_harvest_date: string | null
          expected_survival_rate: number | null
          feeding_plan: string | null
          id: string
          last_health_check: string | null
          notes: string | null
          quantity: number
          source: string | null
          species: string
          status: string
          total_weight: number | null
          type: string | null
          unit_id: string
          unit_name: string
          updated_at: string | null
          user_id: string
          variety: string | null
        }
        Insert: {
          acquisition_date?: string | null
          average_weight?: number | null
          created_at?: string | null
          current_age?: number | null
          expected_harvest_date?: string | null
          expected_survival_rate?: number | null
          feeding_plan?: string | null
          id?: string
          last_health_check?: string | null
          notes?: string | null
          quantity?: number
          source?: string | null
          species: string
          status?: string
          total_weight?: number | null
          type?: string | null
          unit_id: string
          unit_name: string
          updated_at?: string | null
          user_id: string
          variety?: string | null
        }
        Update: {
          acquisition_date?: string | null
          average_weight?: number | null
          created_at?: string | null
          current_age?: number | null
          expected_harvest_date?: string | null
          expected_survival_rate?: number | null
          feeding_plan?: string | null
          id?: string
          last_health_check?: string | null
          notes?: string | null
          quantity?: number
          source?: string | null
          species?: string
          status?: string
          total_weight?: number | null
          type?: string | null
          unit_id?: string
          unit_name?: string
          updated_at?: string | null
          user_id?: string
          variety?: string | null
        }
        Relationships: []
      }
      production_cycles: {
        Row: {
          created_at: string | null
          current_quantity: number
          duration_months: number | null
          end_date: string | null
          fingerlings_count: number | null
          id: string
          initial_quantity: number | null
          name: string
          notes: string | null
          species: string | null
          start_date: string
          status: string
          stocking_date: string | null
          target_quantity: number
          unit_id: string
          unit_name: string
          unit_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_quantity?: number
          duration_months?: number | null
          end_date?: string | null
          fingerlings_count?: number | null
          id?: string
          initial_quantity?: number | null
          name: string
          notes?: string | null
          species?: string | null
          start_date: string
          status?: string
          stocking_date?: string | null
          target_quantity: number
          unit_id: string
          unit_name: string
          unit_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_quantity?: number
          duration_months?: number | null
          end_date?: string | null
          fingerlings_count?: number | null
          id?: string
          initial_quantity?: number | null
          name?: string
          notes?: string | null
          species?: string | null
          start_date?: string
          status?: string
          stocking_date?: string | null
          target_quantity?: number
          unit_id?: string
          unit_name?: string
          unit_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_files: {
        Row: {
          compressed_size: number | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          metadata: Json | null
          module: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          compressed_size?: number | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          metadata?: Json | null
          module: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          compressed_size?: number | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          metadata?: Json | null
          module?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
