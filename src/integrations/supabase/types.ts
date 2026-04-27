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
      boutique_members: {
        Row: {
          boutique_id: string
          created_at: string
          id: string
          invited_email: string
          role: Database["public"]["Enums"]["team_role"]
          status: Database["public"]["Enums"]["member_status"]
          user_id: string | null
        }
        Insert: {
          boutique_id: string
          created_at?: string
          id?: string
          invited_email: string
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id?: string | null
        }
        Update: {
          boutique_id?: string
          created_at?: string
          id?: string
          invited_email?: string
          role?: Database["public"]["Enums"]["team_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boutique_members_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      boutiques: {
        Row: {
          category: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          has_protection: boolean
          id: string
          logo_url: string | null
          name: string
          slug: string
          status: Database["public"]["Enums"]["boutique_status"]
          tagline: string | null
          theme_settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          has_protection?: boolean
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          status?: Database["public"]["Enums"]["boutique_status"]
          tagline?: string | null
          theme_settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          has_protection?: boolean
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          status?: Database["public"]["Enums"]["boutique_status"]
          tagline?: string | null
          theme_settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          marketing_opt_in: boolean
          total_recycling_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          marketing_opt_in?: boolean
          total_recycling_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          marketing_opt_in?: boolean
          total_recycling_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          boutique_id: string
          created_at: string
          id: string
          is_active: boolean
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          body_html?: string
          boutique_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject?: string
          type: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          boutique_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          balance_cents: number
          boutique_id: string
          created_at: string
          customer_profile_id: string
          id: string
          updated_at: string
        }
        Insert: {
          balance_cents?: number
          boutique_id: string
          created_at?: string
          customer_profile_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          balance_cents?: number
          boutique_id?: string
          created_at?: string
          customer_profile_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_cards_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_responses: {
        Row: {
          action: Database["public"]["Enums"]["issue_action"]
          created_at: string
          id: string
          issue_id: string
          message: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["issue_action"]
          created_at?: string
          id?: string
          issue_id: string
          message?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["issue_action"]
          created_at?: string
          id?: string
          issue_id?: string
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_responses_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "order_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      moq_reservations: {
        Row: {
          expires_at: string
          id: string
          quantity: number
          reserved_at: string
          status: Database["public"]["Enums"]["moq_status"]
          supplier_product_id: string
          user_id: string
        }
        Insert: {
          expires_at?: string
          id?: string
          quantity: number
          reserved_at?: string
          status?: Database["public"]["Enums"]["moq_status"]
          supplier_product_id: string
          user_id: string
        }
        Update: {
          expires_at?: string
          id?: string
          quantity?: number
          reserved_at?: string
          status?: Database["public"]["Enums"]["moq_status"]
          supplier_product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moq_reservations_supplier_product_id_fkey"
            columns: ["supplier_product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_issues: {
        Row: {
          created_at: string
          customer_email: string
          deadline_at: string
          id: string
          image_url: string | null
          message: string | null
          order_id: string
          status: Database["public"]["Enums"]["issue_status"]
          type: Database["public"]["Enums"]["issue_type"]
        }
        Insert: {
          created_at?: string
          customer_email: string
          deadline_at?: string
          id?: string
          image_url?: string | null
          message?: string | null
          order_id: string
          status?: Database["public"]["Enums"]["issue_status"]
          type: Database["public"]["Enums"]["issue_type"]
        }
        Update: {
          created_at?: string
          customer_email?: string
          deadline_at?: string
          id?: string
          image_url?: string | null
          message?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["issue_status"]
          type?: Database["public"]["Enums"]["issue_type"]
        }
        Relationships: [
          {
            foreignKeyName: "order_issues_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          boutique_id: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_profile_id: string | null
          customer_validated: boolean
          id: string
          logistics_status: Database["public"]["Enums"]["logistics_status"]
          market: string
          order_number: string
          product_id: string
        }
        Insert: {
          amount: number
          boutique_id: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_profile_id?: string | null
          customer_validated?: boolean
          id?: string
          logistics_status?: Database["public"]["Enums"]["logistics_status"]
          market?: string
          order_number: string
          product_id: string
        }
        Update: {
          amount?: number
          boutique_id?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_profile_id?: string | null
          customer_validated?: boolean
          id?: string
          logistics_status?: Database["public"]["Enums"]["logistics_status"]
          market?: string
          order_number?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          boutique_id: string | null
          created_at: string
          id: string
          payout_date: string | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount: number
          boutique_id?: string | null
          created_at?: string
          id?: string
          payout_date?: string | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount?: number
          boutique_id?: string | null
          created_at?: string
          id?: string
          payout_date?: string | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          applied_margin: number
          boutique_id: string
          created_at: string
          cumulative_sales: number
          id: string
          public_price: number
          status: Database["public"]["Enums"]["product_status"]
          supplier_product_id: string
          updated_at: string
        }
        Insert: {
          applied_margin: number
          boutique_id: string
          created_at?: string
          cumulative_sales?: number
          id?: string
          public_price: number
          status?: Database["public"]["Enums"]["product_status"]
          supplier_product_id: string
          updated_at?: string
        }
        Update: {
          applied_margin?: number
          boutique_id?: string
          created_at?: string
          cumulative_sales?: number
          id?: string
          public_price?: number
          status?: Database["public"]["Enums"]["product_status"]
          supplier_product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_product_id_fkey"
            columns: ["supplier_product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          market: string | null
          recycling_points: number | null
          trust_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          market?: string | null
          recycling_points?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          market?: string | null
          recycling_points?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recycling_scans: {
        Row: {
          boutique_id: string
          created_at: string
          customer_profile_id: string
          id: string
          order_id: string | null
          points: number
          source: Database["public"]["Enums"]["recycling_source"]
        }
        Insert: {
          boutique_id: string
          created_at?: string
          customer_profile_id: string
          id?: string
          order_id?: string | null
          points: number
          source?: Database["public"]["Enums"]["recycling_source"]
        }
        Update: {
          boutique_id?: string
          created_at?: string
          customer_profile_id?: string
          id?: string
          order_id?: string | null
          points?: number
          source?: Database["public"]["Enums"]["recycling_source"]
        }
        Relationships: [
          {
            foreignKeyName: "recycling_scans_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recycling_scans_customer_profile_id_fkey"
            columns: ["customer_profile_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recycling_scans_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          base_price: number
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          market: string
          max_margin_percent: number
          moq: number
          name: string
          performance_history: Json | null
          rotation_indicator: Database["public"]["Enums"]["rotation_indicator"]
        }
        Insert: {
          base_price: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          market?: string
          max_margin_percent?: number
          moq?: number
          name: string
          performance_history?: Json | null
          rotation_indicator?: Database["public"]["Enums"]["rotation_indicator"]
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          market?: string
          max_margin_percent?: number
          moq?: number
          name?: string
          performance_history?: Json | null
          rotation_indicator?: Database["public"]["Enums"]["rotation_indicator"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_guest_orders: {
        Args: { _customer_profile_id: string; _email: string }
        Returns: number
      }
      owns_boutique: {
        Args: { _boutique_id: string; _user_id: string }
        Returns: boolean
      }
      track_order: {
        Args: { _customer_email: string; _order_number: string }
        Returns: {
          amount: number
          created_at: string
          customer_name: string
          logistics_status: string
          order_number: string
          product_name: string
        }[]
      }
    }
    Enums: {
      boutique_status: "draft" | "published"
      issue_action: "accept" | "refuse" | "partial_refund" | "resend" | "other"
      issue_status:
        | "pending"
        | "accepted"
        | "refused"
        | "resolved"
        | "escalated"
      issue_type: "not_received" | "return_request" | "defective"
      logistics_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "returned"
      member_status: "pending" | "active" | "removed"
      moq_status: "reserved" | "confirmed" | "expired" | "cancelled"
      payment_status: "pending" | "completed" | "failed"
      product_status: "active" | "paused"
      recycling_source: "qr_scan" | "manual" | "pickup"
      rotation_indicator: "green" | "yellow" | "orange" | "red"
      team_role: "owner" | "manager" | "marketing" | "support"
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
      boutique_status: ["draft", "published"],
      issue_action: ["accept", "refuse", "partial_refund", "resend", "other"],
      issue_status: ["pending", "accepted", "refused", "resolved", "escalated"],
      issue_type: ["not_received", "return_request", "defective"],
      logistics_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "returned",
      ],
      member_status: ["pending", "active", "removed"],
      moq_status: ["reserved", "confirmed", "expired", "cancelled"],
      payment_status: ["pending", "completed", "failed"],
      product_status: ["active", "paused"],
      recycling_source: ["qr_scan", "manual", "pickup"],
      rotation_indicator: ["green", "yellow", "orange", "red"],
      team_role: ["owner", "manager", "marketing", "support"],
    },
  },
} as const
