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
      accounting_transactions: {
        Row: {
          amount: number
          category: string
          client: string | null
          created_at: string | null
          currency: string | null
          date: string
          description: string | null
          id: string
          payment_method: string | null
          purchase_id: string | null
          reference: string | null
          status: string | null
          supplier: string | null
          type: string
          unit_id: string | null
          unit_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          client?: string | null
          created_at?: string | null
          currency?: string | null
          date: string
          description?: string | null
          id?: string
          payment_method?: string | null
          purchase_id?: string | null
          reference?: string | null
          status?: string | null
          supplier?: string | null
          type: string
          unit_id?: string | null
          unit_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          client?: string | null
          created_at?: string | null
          currency?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          purchase_id?: string | null
          reference?: string | null
          status?: string | null
          supplier?: string | null
          type?: string
          unit_id?: string | null
          unit_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounting_transactions_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
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
      depreciable_assets: {
        Row: {
          accumulated_depreciation: number | null
          category: string
          created_at: string | null
          currency: string | null
          current_value: number | null
          depreciation_method: string | null
          id: string
          name: string
          purchase_date: string
          purchase_price: number
          status: string | null
          unit_id: string | null
          updated_at: string | null
          useful_life: number | null
          user_id: string
        }
        Insert: {
          accumulated_depreciation?: number | null
          category: string
          created_at?: string | null
          currency?: string | null
          current_value?: number | null
          depreciation_method?: string | null
          id?: string
          name: string
          purchase_date: string
          purchase_price?: number
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
          useful_life?: number | null
          user_id: string
        }
        Update: {
          accumulated_depreciation?: number | null
          category?: string
          created_at?: string | null
          currency?: string | null
          current_value?: number | null
          depreciation_method?: string | null
          id?: string
          name?: string
          purchase_date?: string
          purchase_price?: number
          status?: string | null
          unit_id?: string | null
          updated_at?: string | null
          useful_life?: number | null
          user_id?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          contract_type: string
          created_at: string
          email: string | null
          first_name: string
          hire_date: string | null
          id: string
          last_name: string
          phone: string | null
          position: string | null
          salary: number
          status: string
          unit_id: string
          unit_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_type?: string
          created_at?: string
          email?: string | null
          first_name: string
          hire_date?: string | null
          id?: string
          last_name: string
          phone?: string | null
          position?: string | null
          salary?: number
          status?: string
          unit_id: string
          unit_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_type?: string
          created_at?: string
          email?: string | null
          first_name?: string
          hire_date?: string | null
          id?: string
          last_name?: string
          phone?: string | null
          position?: string | null
          salary?: number
          status?: string
          unit_id?: string
          unit_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          actual_quantity: number | null
          behavior: string | null
          created_at: string | null
          cycle_id: string | null
          date: string
          fcr: number | null
          feed_type: string | null
          feeder_name: string | null
          id: string
          infrastructure_id: string | null
          mortality: number | null
          notes: string | null
          prescribed_quantity: number | null
          quantity: number
          remaining_quantity: number | null
          session_type: string | null
          temperature: number | null
          time: string | null
          unit_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_quantity?: number | null
          behavior?: string | null
          created_at?: string | null
          cycle_id?: string | null
          date: string
          fcr?: number | null
          feed_type?: string | null
          feeder_name?: string | null
          id?: string
          infrastructure_id?: string | null
          mortality?: number | null
          notes?: string | null
          prescribed_quantity?: number | null
          quantity: number
          remaining_quantity?: number | null
          session_type?: string | null
          temperature?: number | null
          time?: string | null
          unit_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_quantity?: number | null
          behavior?: string | null
          created_at?: string | null
          cycle_id?: string | null
          date?: string
          fcr?: number | null
          feed_type?: string | null
          feeder_name?: string | null
          id?: string
          infrastructure_id?: string | null
          mortality?: number | null
          notes?: string | null
          prescribed_quantity?: number | null
          quantity?: number
          remaining_quantity?: number | null
          session_type?: string | null
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
      mfa_recovery_codes: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          is_used: boolean
          used_at: string | null
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_critical: boolean
          is_read: boolean
          message: string
          metadata: Json | null
          module: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_critical?: boolean
          is_read?: boolean
          message: string
          metadata?: Json | null
          module: string
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_critical?: boolean
          is_read?: boolean
          message?: string
          metadata?: Json | null
          module?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pay_slips: {
        Row: {
          base_salary: number
          bonuses: number
          created_at: string
          deductions: number
          employee_id: string
          employee_name: string
          generated_at: string
          id: string
          net_salary: number
          overtime: number
          period: string
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_salary?: number
          bonuses?: number
          created_at?: string
          deductions?: number
          employee_id: string
          employee_name: string
          generated_at?: string
          id?: string
          net_salary?: number
          overtime?: number
          period: string
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_salary?: number
          bonuses?: number
          created_at?: string
          deductions?: number
          employee_id?: string
          employee_name?: string
          generated_at?: string
          id?: string
          net_salary?: number
          overtime?: number
          period?: string
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pay_slips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alert_thresholds: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          fcr_critical_threshold: number | null
          fcr_enabled: boolean | null
          fcr_warning_threshold: number | null
          id: string
          mortality_daily_critical: number | null
          mortality_daily_warning: number | null
          mortality_enabled: boolean | null
          oxygen_critical: number | null
          oxygen_enabled: boolean | null
          oxygen_warning: number | null
          ph_enabled: boolean | null
          ph_max_critical: number | null
          ph_max_warning: number | null
          ph_min_critical: number | null
          ph_min_warning: number | null
          production_behind_critical: number | null
          production_behind_warning: number | null
          production_enabled: boolean | null
          push_notifications: boolean | null
          stock_days_critical: number | null
          stock_days_warning: number | null
          stock_enabled: boolean | null
          temp_enabled: boolean | null
          temp_max_critical: number | null
          temp_max_warning: number | null
          temp_min_critical: number | null
          temp_min_warning: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          fcr_critical_threshold?: number | null
          fcr_enabled?: boolean | null
          fcr_warning_threshold?: number | null
          id?: string
          mortality_daily_critical?: number | null
          mortality_daily_warning?: number | null
          mortality_enabled?: boolean | null
          oxygen_critical?: number | null
          oxygen_enabled?: boolean | null
          oxygen_warning?: number | null
          ph_enabled?: boolean | null
          ph_max_critical?: number | null
          ph_max_warning?: number | null
          ph_min_critical?: number | null
          ph_min_warning?: number | null
          production_behind_critical?: number | null
          production_behind_warning?: number | null
          production_enabled?: boolean | null
          push_notifications?: boolean | null
          stock_days_critical?: number | null
          stock_days_warning?: number | null
          stock_enabled?: boolean | null
          temp_enabled?: boolean | null
          temp_max_critical?: number | null
          temp_max_warning?: number | null
          temp_min_critical?: number | null
          temp_min_warning?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          fcr_critical_threshold?: number | null
          fcr_enabled?: boolean | null
          fcr_warning_threshold?: number | null
          id?: string
          mortality_daily_critical?: number | null
          mortality_daily_warning?: number | null
          mortality_enabled?: boolean | null
          oxygen_critical?: number | null
          oxygen_enabled?: boolean | null
          oxygen_warning?: number | null
          ph_enabled?: boolean | null
          ph_max_critical?: number | null
          ph_max_warning?: number | null
          ph_min_critical?: number | null
          ph_min_warning?: number | null
          production_behind_critical?: number | null
          production_behind_warning?: number | null
          production_enabled?: boolean | null
          push_notifications?: boolean | null
          stock_days_critical?: number | null
          stock_days_warning?: number | null
          stock_enabled?: boolean | null
          temp_enabled?: boolean | null
          temp_max_critical?: number | null
          temp_max_warning?: number | null
          temp_min_critical?: number | null
          temp_min_warning?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          cycle_id: string | null
          cycle_name: string | null
          id: string
          is_acknowledged: boolean | null
          message: string
          metadata: Json | null
          metric_name: string | null
          metric_value: number | null
          severity: string
          threshold_value: number | null
          title: string
          unit_id: string | null
          unit_name: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          cycle_id?: string | null
          cycle_name?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message: string
          metadata?: Json | null
          metric_name?: string | null
          metric_value?: number | null
          severity?: string
          threshold_value?: number | null
          title: string
          unit_id?: string | null
          unit_name?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          cycle_id?: string | null
          cycle_name?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          metadata?: Json | null
          metric_name?: string | null
          metric_value?: number | null
          severity?: string
          threshold_value?: number | null
          title?: string
          unit_id?: string | null
          unit_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      planned_tasks: {
        Row: {
          alert_sent: boolean | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          due_date: string
          due_time: string
          id: string
          priority: string
          source: string | null
          source_id: string | null
          status: string
          title: string
          type: string
          unit_id: string | null
          unit_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_sent?: boolean | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          due_time: string
          id?: string
          priority?: string
          source?: string | null
          source_id?: string | null
          status?: string
          title: string
          type?: string
          unit_id?: string | null
          unit_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_sent?: boolean | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          due_time?: string
          id?: string
          priority?: string
          source?: string | null
          source_id?: string | null
          status?: string
          title?: string
          type?: string
          unit_id?: string | null
          unit_name?: string | null
          updated_at?: string | null
          user_id?: string
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
      production_units: {
        Row: {
          capacity: number
          created_at: string
          current_stock: number
          description: string | null
          id: string
          is_active: boolean
          manager: string | null
          name: string
          photo_url: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          manager?: string | null
          name: string
          photo_url?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity?: number
          created_at?: string
          current_stock?: number
          description?: string | null
          id?: string
          is_active?: boolean
          manager?: string | null
          name?: string
          photo_url?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_address: string | null
          company_email: string | null
          company_logo_url: string | null
          company_name: string | null
          company_phone: string | null
          company_registration_number: string | null
          company_tax_id: string | null
          country: string | null
          country_code: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_suspended: boolean | null
          suspended_at: string | null
          suspension_reason: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_address?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_registration_number?: string | null
          company_tax_id?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_suspended?: boolean | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_address?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_registration_number?: string | null
          company_tax_id?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          suspended_at?: string | null
          suspension_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          currency: string | null
          date: string
          delivery_date: string | null
          description: string | null
          due_date: string | null
          id: string
          is_credit: boolean | null
          notes: string | null
          paid_amount: number | null
          payment_method: string | null
          payment_terms: string | null
          quantity: number | null
          reference: string | null
          status: string | null
          subcategory: string | null
          supplier: string | null
          unit: string | null
          unit_id: string | null
          unit_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string | null
          currency?: string | null
          date: string
          delivery_date?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_credit?: boolean | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_terms?: string | null
          quantity?: number | null
          reference?: string | null
          status?: string | null
          subcategory?: string | null
          supplier?: string | null
          unit?: string | null
          unit_id?: string | null
          unit_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          currency?: string | null
          date?: string
          delivery_date?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_credit?: boolean | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_terms?: string | null
          quantity?: number | null
          reference?: string | null
          status?: string | null
          subcategory?: string | null
          supplier?: string | null
          unit?: string | null
          unit_id?: string | null
          unit_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reproduction_records: {
        Row: {
          broodstock_batch_id: string | null
          broodstock_female_count: number | null
          broodstock_male_count: number | null
          created_at: string | null
          egg_count: number | null
          fertilization_rate: number | null
          fry_count: number | null
          hatching_date: string | null
          hatching_rate: number | null
          hormone_dose: number | null
          hormone_used: string | null
          id: string
          incubation_start_date: string | null
          incubation_temperature: number | null
          larvae_count: number | null
          larvae_transfer_date: string | null
          notes: string | null
          reproduction_date: string
          reproduction_method: string
          spawning_date: string | null
          spawning_rate: number | null
          species: string
          status: string
          survival_rate: number | null
          unit_id: string
          unit_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          broodstock_batch_id?: string | null
          broodstock_female_count?: number | null
          broodstock_male_count?: number | null
          created_at?: string | null
          egg_count?: number | null
          fertilization_rate?: number | null
          fry_count?: number | null
          hatching_date?: string | null
          hatching_rate?: number | null
          hormone_dose?: number | null
          hormone_used?: string | null
          id?: string
          incubation_start_date?: string | null
          incubation_temperature?: number | null
          larvae_count?: number | null
          larvae_transfer_date?: string | null
          notes?: string | null
          reproduction_date: string
          reproduction_method?: string
          spawning_date?: string | null
          spawning_rate?: number | null
          species: string
          status?: string
          survival_rate?: number | null
          unit_id: string
          unit_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          broodstock_batch_id?: string | null
          broodstock_female_count?: number | null
          broodstock_male_count?: number | null
          created_at?: string | null
          egg_count?: number | null
          fertilization_rate?: number | null
          fry_count?: number | null
          hatching_date?: string | null
          hatching_rate?: number | null
          hormone_dose?: number | null
          hormone_used?: string | null
          id?: string
          incubation_start_date?: string | null
          incubation_temperature?: number | null
          larvae_count?: number | null
          larvae_transfer_date?: string | null
          notes?: string | null
          reproduction_date?: string
          reproduction_method?: string
          spawning_date?: string | null
          spawning_rate?: number | null
          species?: string
          status?: string
          survival_rate?: number | null
          unit_id?: string
          unit_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reproduction_records_broodstock_batch_id_fkey"
            columns: ["broodstock_batch_id"]
            isOneToOne: false
            referencedRelation: "livestock_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          name: string
          quantity: number
          sale_id: string
          total: number
          unit_price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          quantity?: number
          sale_id: string
          total?: number
          unit_price?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          quantity?: number
          sale_id?: string
          total?: number
          unit_price?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          client_contact: string | null
          client_name: string
          created_at: string
          date: string
          due_date: string | null
          id: string
          is_credit: boolean | null
          notes: string | null
          paid_amount: number | null
          payment_method: string | null
          payment_terms: string | null
          status: string
          total_amount: number
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_contact?: string | null
          client_name: string
          created_at?: string
          date?: string
          due_date?: string | null
          id?: string
          is_credit?: boolean | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_terms?: string | null
          status?: string
          total_amount?: number
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_contact?: string | null
          client_name?: string
          created_at?: string
          date?: string
          due_date?: string | null
          id?: string
          is_credit?: boolean | null
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          payment_terms?: string | null
          status?: string
          total_amount?: number
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplier_orders: {
        Row: {
          amount: number
          created_at: string
          date: string
          delivery_date: string | null
          id: string
          products: string
          quantity: number
          status: string
          supplier_id: string
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          date?: string
          delivery_date?: string | null
          id?: string
          products?: string
          quantity?: number
          status?: string
          supplier_id: string
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          delivery_date?: string | null
          id?: string
          products?: string
          quantity?: number
          status?: string
          supplier_id?: string
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string
          contact: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          products: string[]
          rating: number
          status: string
          unit_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          category?: string
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          products?: string[]
          rating?: number
          status?: string
          unit_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          category?: string
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          products?: string[]
          rating?: number
          status?: string
          unit_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          sender_id: string
          sender_name: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          sender_id: string
          sender_name: string
          sender_type?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          sender_id?: string
          sender_name?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          category: string
          created_at: string
          id: string
          message: string
          priority: string | null
          responded_at: string | null
          responded_by: string | null
          status: string
          subject: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          priority?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          admin_response?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          priority?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      team_member_units: {
        Row: {
          created_at: string
          id: string
          permissions: Json
          team_member_id: string
          unit_id: string
          unit_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json
          team_member_id: string
          unit_id: string
          unit_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json
          team_member_id?: string
          unit_id?: string
          unit_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_units_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          custom_role: string | null
          department: string | null
          id: string
          invited_at: string
          member_email: string
          member_name: string
          owner_id: string
          permissions: Json
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          custom_role?: string | null
          department?: string | null
          id?: string
          invited_at?: string
          member_email: string
          member_name: string
          owner_id: string
          permissions?: Json
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          custom_role?: string | null
          department?: string | null
          id?: string
          invited_at?: string
          member_email?: string
          member_name?: string
          owner_id?: string
          permissions?: Json
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      unit_equipment: {
        Row: {
          created_at: string | null
          current_value: number | null
          depreciation_rate: number | null
          id: string
          name: string
          purchase_date: string | null
          purchase_price: number | null
          specifications: Json | null
          status: string | null
          type: string
          unit_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          depreciation_rate?: number | null
          id?: string
          name: string
          purchase_date?: string | null
          purchase_price?: number | null
          specifications?: Json | null
          status?: string | null
          type: string
          unit_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          depreciation_rate?: number | null
          id?: string
          name?: string
          purchase_date?: string | null
          purchase_price?: number | null
          specifications?: Json | null
          status?: string | null
          type?: string
          unit_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      unit_infrastructures: {
        Row: {
          capacity: number | null
          created_at: string | null
          custom_type_name: string | null
          id: string
          last_maintenance_date: string | null
          maintenance_frequency_days: number | null
          maintenance_notes: string | null
          name: string
          next_maintenance_date: string | null
          specifications: Json | null
          status: string | null
          type: string
          unit_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          custom_type_name?: string | null
          id?: string
          last_maintenance_date?: string | null
          maintenance_frequency_days?: number | null
          maintenance_notes?: string | null
          name: string
          next_maintenance_date?: string | null
          specifications?: Json | null
          status?: string | null
          type: string
          unit_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          custom_type_name?: string | null
          id?: string
          last_maintenance_date?: string | null
          maintenance_frequency_days?: number | null
          maintenance_notes?: string | null
          name?: string
          next_maintenance_date?: string | null
          specifications?: Json | null
          status?: string | null
          type?: string
          unit_id?: string
          updated_at?: string | null
          user_id?: string
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
      user_sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_activity_at: string
          login_at: string
          logout_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity_at?: string
          login_at?: string
          logout_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity_at?: string
          login_at?: string
          logout_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_team_member_owner_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_team_member_of: { Args: { owner_user_id: string }; Returns: boolean }
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
