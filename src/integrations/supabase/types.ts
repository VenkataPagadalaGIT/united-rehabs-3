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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      data_sources: {
        Row: {
          agency: string
          created_at: string
          data_types: string[] | null
          description: string | null
          id: string
          last_updated_year: number | null
          source_abbreviation: string
          source_name: string
          source_url: string
        }
        Insert: {
          agency: string
          created_at?: string
          data_types?: string[] | null
          description?: string | null
          id?: string
          last_updated_year?: number | null
          source_abbreviation: string
          source_name: string
          source_url: string
        }
        Update: {
          agency?: string
          created_at?: string
          data_types?: string[] | null
          description?: string | null
          id?: string
          last_updated_year?: number | null
          source_abbreviation?: string
          source_name?: string
          source_url?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          state_id: string | null
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          state_id?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          state_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      free_resources: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          is_free: boolean | null
          is_nationwide: boolean | null
          phone: string | null
          resource_type: string
          sort_order: number | null
          state_id: string | null
          title: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          is_free?: boolean | null
          is_nationwide?: boolean | null
          phone?: string | null
          resource_type: string
          sort_order?: number | null
          state_id?: string | null
          title: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          is_free?: boolean | null
          is_nationwide?: boolean | null
          phone?: string | null
          resource_type?: string
          sort_order?: number | null
          state_id?: string | null
          title?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      page_content: {
        Row: {
          body: string | null
          content_type: string
          created_at: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          page_key: string
          section_key: string
          sort_order: number | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          content_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          page_key: string
          section_key: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          content_type?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          page_key?: string
          section_key?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_seo: {
        Row: {
          canonical_url: string | null
          created_at: string
          h1_title: string | null
          id: string
          intro_text: string | null
          is_active: boolean | null
          meta_description: string | null
          meta_keywords: string[] | null
          meta_title: string
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          page_slug: string
          page_type: string
          robots: string | null
          state_id: string | null
          structured_data: Json | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          h1_title?: string | null
          id?: string
          intro_text?: string | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title: string
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_slug: string
          page_type?: string
          robots?: string | null
          state_id?: string | null
          structured_data?: Json | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          h1_title?: string | null
          id?: string
          intro_text?: string | null
          is_active?: boolean | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          meta_title?: string
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_slug?: string
          page_type?: string
          robots?: string | null
          state_id?: string | null
          structured_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      rehab_guides: {
        Row: {
          category: string
          content: string | null
          created_at: string
          description: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          read_time: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          description: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          read_time?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          description?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          read_time?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      state_addiction_statistics: {
        Row: {
          affected_age_12_17: number | null
          affected_age_18_25: number | null
          affected_age_26_34: number | null
          affected_age_35_plus: number | null
          alcohol_abuse_rate: number | null
          created_at: string
          data_source: string | null
          drug_abuse_rate: number | null
          economic_cost_billions: number | null
          id: string
          inpatient_facilities: number | null
          opioid_deaths: number | null
          outpatient_facilities: number | null
          overdose_deaths: number | null
          recovery_rate: number | null
          relapse_rate: number | null
          source_url: string | null
          state_id: string
          state_name: string
          total_affected: number | null
          total_treatment_centers: number | null
          treatment_admissions: number | null
          updated_at: string
          year: number
        }
        Insert: {
          affected_age_12_17?: number | null
          affected_age_18_25?: number | null
          affected_age_26_34?: number | null
          affected_age_35_plus?: number | null
          alcohol_abuse_rate?: number | null
          created_at?: string
          data_source?: string | null
          drug_abuse_rate?: number | null
          economic_cost_billions?: number | null
          id?: string
          inpatient_facilities?: number | null
          opioid_deaths?: number | null
          outpatient_facilities?: number | null
          overdose_deaths?: number | null
          recovery_rate?: number | null
          relapse_rate?: number | null
          source_url?: string | null
          state_id: string
          state_name: string
          total_affected?: number | null
          total_treatment_centers?: number | null
          treatment_admissions?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          affected_age_12_17?: number | null
          affected_age_18_25?: number | null
          affected_age_26_34?: number | null
          affected_age_35_plus?: number | null
          alcohol_abuse_rate?: number | null
          created_at?: string
          data_source?: string | null
          drug_abuse_rate?: number | null
          economic_cost_billions?: number | null
          id?: string
          inpatient_facilities?: number | null
          opioid_deaths?: number | null
          outpatient_facilities?: number | null
          overdose_deaths?: number | null
          recovery_rate?: number | null
          relapse_rate?: number | null
          source_url?: string | null
          state_id?: string
          state_name?: string
          total_affected?: number | null
          total_treatment_centers?: number | null
          treatment_admissions?: number | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      substance_statistics: {
        Row: {
          alcohol_binge_drinking_percent: number | null
          alcohol_heavy_use_percent: number | null
          alcohol_related_deaths: number | null
          alcohol_use_disorder: number | null
          alcohol_use_past_month_percent: number | null
          cocaine_related_deaths: number | null
          cocaine_use_disorder: number | null
          cocaine_use_past_year: number | null
          created_at: string
          fentanyl_deaths: number | null
          fentanyl_involved_overdoses: number | null
          heroin_use: number | null
          id: string
          marijuana_use_disorder: number | null
          marijuana_use_past_month: number | null
          marijuana_use_past_year: number | null
          mat_recipients: number | null
          mental_illness_with_sud: number | null
          meth_related_deaths: number | null
          meth_use_disorder: number | null
          meth_use_past_year: number | null
          opioid_misuse_past_year: number | null
          opioid_use_disorder: number | null
          prescription_opioid_misuse: number | null
          prescription_sedative_misuse: number | null
          prescription_stimulant_misuse: number | null
          prescription_tranquilizer_misuse: number | null
          serious_mental_illness_with_sud: number | null
          state_id: string
          state_name: string
          treatment_needed_not_received: number | null
          treatment_received: number | null
          updated_at: string
          year: number
        }
        Insert: {
          alcohol_binge_drinking_percent?: number | null
          alcohol_heavy_use_percent?: number | null
          alcohol_related_deaths?: number | null
          alcohol_use_disorder?: number | null
          alcohol_use_past_month_percent?: number | null
          cocaine_related_deaths?: number | null
          cocaine_use_disorder?: number | null
          cocaine_use_past_year?: number | null
          created_at?: string
          fentanyl_deaths?: number | null
          fentanyl_involved_overdoses?: number | null
          heroin_use?: number | null
          id?: string
          marijuana_use_disorder?: number | null
          marijuana_use_past_month?: number | null
          marijuana_use_past_year?: number | null
          mat_recipients?: number | null
          mental_illness_with_sud?: number | null
          meth_related_deaths?: number | null
          meth_use_disorder?: number | null
          meth_use_past_year?: number | null
          opioid_misuse_past_year?: number | null
          opioid_use_disorder?: number | null
          prescription_opioid_misuse?: number | null
          prescription_sedative_misuse?: number | null
          prescription_stimulant_misuse?: number | null
          prescription_tranquilizer_misuse?: number | null
          serious_mental_illness_with_sud?: number | null
          state_id: string
          state_name: string
          treatment_needed_not_received?: number | null
          treatment_received?: number | null
          updated_at?: string
          year: number
        }
        Update: {
          alcohol_binge_drinking_percent?: number | null
          alcohol_heavy_use_percent?: number | null
          alcohol_related_deaths?: number | null
          alcohol_use_disorder?: number | null
          alcohol_use_past_month_percent?: number | null
          cocaine_related_deaths?: number | null
          cocaine_use_disorder?: number | null
          cocaine_use_past_year?: number | null
          created_at?: string
          fentanyl_deaths?: number | null
          fentanyl_involved_overdoses?: number | null
          heroin_use?: number | null
          id?: string
          marijuana_use_disorder?: number | null
          marijuana_use_past_month?: number | null
          marijuana_use_past_year?: number | null
          mat_recipients?: number | null
          mental_illness_with_sud?: number | null
          meth_related_deaths?: number | null
          meth_use_disorder?: number | null
          meth_use_past_year?: number | null
          opioid_misuse_past_year?: number | null
          opioid_use_disorder?: number | null
          prescription_opioid_misuse?: number | null
          prescription_sedative_misuse?: number | null
          prescription_stimulant_misuse?: number | null
          prescription_tranquilizer_misuse?: number | null
          serious_mental_illness_with_sud?: number | null
          state_id?: string
          state_name?: string
          treatment_needed_not_received?: number | null
          treatment_received?: number | null
          updated_at?: string
          year?: number
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
          role?: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "editor" | "viewer"
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
      app_role: ["admin", "editor", "viewer"],
    },
  },
} as const
