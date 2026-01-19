export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          user_id: string
          source_city: string
          source_company: string | null
          destination_city: string
          destination_company: string | null
          cargo_type: string
          cargo_weight: number | null
          income: number
          distance: number
          started_at: string
          completed_at: string | null
          deadline: string | null
          delivered_late: boolean
          fuel_consumed: number | null
          damage_taken: number | null
          avg_speed: number | null
          avg_rpm: number | null
          fuel_cost: number | null
          damage_cost: number | null
          profit: number | null
          profit_per_mile: number | null
          fuel_economy: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_city: string
          source_company?: string | null
          destination_city: string
          destination_company?: string | null
          cargo_type: string
          cargo_weight?: number | null
          income: number
          distance: number
          started_at: string
          completed_at?: string | null
          deadline?: string | null
          delivered_late?: boolean
          fuel_consumed?: number | null
          damage_taken?: number | null
          avg_speed?: number | null
          avg_rpm?: number | null
          fuel_cost?: number | null
          damage_cost?: number | null
          profit?: number | null
          profit_per_mile?: number | null
          fuel_economy?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_city?: string
          source_company?: string | null
          destination_city?: string
          destination_company?: string | null
          cargo_type?: string
          cargo_weight?: number | null
          income?: number
          distance?: number
          started_at?: string
          completed_at?: string | null
          deadline?: string | null
          delivered_late?: boolean
          fuel_consumed?: number | null
          damage_taken?: number | null
          avg_speed?: number | null
          avg_rpm?: number | null
          fuel_cost?: number | null
          damage_cost?: number | null
          profit?: number | null
          profit_per_mile?: number | null
          fuel_economy?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      telemetry: {
        Row: {
          id: string
          user_id: string
          job_id: string | null
          speed: number | null
          rpm: number | null
          gear: number | null
          fuel_current: number | null
          fuel_capacity: number | null
          engine_damage: number | null
          transmission_damage: number | null
          chassis_damage: number | null
          wheels_damage: number | null
          cabin_damage: number | null
          cargo_damage: number | null
          position_x: number | null
          position_y: number | null
          position_z: number | null
          game_time: string | null
          cruise_control_speed: number | null
          cruise_control_enabled: boolean | null
          parking_brake: boolean | null
          motor_brake: boolean | null
          retarder_level: number | null
          air_pressure: number | null
          brake_temperature: number | null
          navigation_distance: number | null
          navigation_time: number | null
          speed_limit: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id?: string | null
          speed?: number | null
          rpm?: number | null
          gear?: number | null
          fuel_current?: number | null
          fuel_capacity?: number | null
          engine_damage?: number | null
          transmission_damage?: number | null
          chassis_damage?: number | null
          wheels_damage?: number | null
          cabin_damage?: number | null
          cargo_damage?: number | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          game_time?: string | null
          cruise_control_speed?: number | null
          cruise_control_enabled?: boolean | null
          parking_brake?: boolean | null
          motor_brake?: boolean | null
          retarder_level?: number | null
          air_pressure?: number | null
          brake_temperature?: number | null
          navigation_distance?: number | null
          navigation_time?: number | null
          speed_limit?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string | null
          speed?: number | null
          rpm?: number | null
          gear?: number | null
          fuel_current?: number | null
          fuel_capacity?: number | null
          engine_damage?: number | null
          transmission_damage?: number | null
          chassis_damage?: number | null
          wheels_damage?: number | null
          cabin_damage?: number | null
          cargo_damage?: number | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          cruise_control_speed?: number | null
          cruise_control_enabled?: boolean | null
          parking_brake?: boolean | null
          motor_brake?: boolean | null
          retarder_level?: number | null
          air_pressure?: number | null
          brake_temperature?: number | null
          navigation_distance?: number | null
          navigation_time?: number | null
          speed_limit?: number | null
          game_time?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          category: string | null
          icon_url: string | null
          requirement_value: number | null
          requirement_type: string | null
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          category?: string | null
          icon_url?: string | null
          requirement_value?: number | null
          requirement_type?: string | null
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          category?: string | null
          icon_url?: string | null
          requirement_value?: number | null
          requirement_type?: string | null
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
          progress: number
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
          progress?: number
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
          progress?: number
        }
      }
      company_stats: {
        Row: {
          id: string
          user_id: string
          company_name: string
          jobs_completed: number
          jobs_on_time: number
          total_damage: number
          avg_damage: number
          rating: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          jobs_completed?: number
          jobs_on_time?: number
          total_damage?: number
          avg_damage?: number
          rating?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          jobs_completed?: number
          jobs_on_time?: number
          total_damage?: number
          avg_damage?: number
          rating?: number
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          fuel_alert_threshold: number
          rest_alert_minutes: number
          maintenance_alert_threshold: number
          units: string
          currency: string
          timezone: string
          api_key: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          fuel_alert_threshold?: number
          rest_alert_minutes?: number
          maintenance_alert_threshold?: number
          units?: string
          currency?: string
          timezone?: string
          api_key?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          fuel_alert_threshold?: number
          rest_alert_minutes?: number
          maintenance_alert_threshold?: number
          units?: string
          currency?: string
          timezone?: string
          api_key?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
