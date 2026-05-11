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
      boutique_brand_dna: {
        Row: {
          ambiance: string | null
          boutique_id: string
          created_at: string
          generated_copy: Json
          generated_palette: Json
          generated_typography: Json
          id: string
          keywords: string[]
          seed: string
          studio_answers: Json
          target_audience: string | null
          tone: string | null
          updated_at: string
        }
        Insert: {
          ambiance?: string | null
          boutique_id: string
          created_at?: string
          generated_copy?: Json
          generated_palette?: Json
          generated_typography?: Json
          id?: string
          keywords?: string[]
          seed: string
          studio_answers?: Json
          target_audience?: string | null
          tone?: string | null
          updated_at?: string
        }
        Update: {
          ambiance?: string | null
          boutique_id?: string
          created_at?: string
          generated_copy?: Json
          generated_palette?: Json
          generated_typography?: Json
          id?: string
          keywords?: string[]
          seed?: string
          studio_answers?: Json
          target_audience?: string | null
          tone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      boutique_email_log: {
        Row: {
          boutique_id: string
          error: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          sent_at: string
          status: string
          subject: string | null
          type: string
        }
        Insert: {
          boutique_id: string
          error?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          sent_at?: string
          status?: string
          subject?: string | null
          type: string
        }
        Update: {
          boutique_id?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string
          status?: string
          subject?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "boutique_email_log_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      boutique_email_settings: {
        Row: {
          auto_send_order_confirmation: boolean
          auto_send_promo: boolean
          auto_send_shipping: boolean
          auto_send_welcome: boolean
          boutique_id: string
          created_at: string
          from_name: string | null
          gmail_connected: boolean
          id: string
          updated_at: string
        }
        Insert: {
          auto_send_order_confirmation?: boolean
          auto_send_promo?: boolean
          auto_send_shipping?: boolean
          auto_send_welcome?: boolean
          boutique_id: string
          created_at?: string
          from_name?: string | null
          gmail_connected?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          auto_send_order_confirmation?: boolean
          auto_send_promo?: boolean
          auto_send_shipping?: boolean
          auto_send_welcome?: boolean
          boutique_id?: string
          created_at?: string
          from_name?: string | null
          gmail_connected?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boutique_email_settings_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: true
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
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
      boutique_og_history: {
        Row: {
          boutique_id: string
          byte_size: number | null
          created_at: string
          height: number | null
          id: string
          image_url: string
          source_filename: string | null
          storage_path: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          boutique_id: string
          byte_size?: number | null
          created_at?: string
          height?: number | null
          id?: string
          image_url: string
          source_filename?: string | null
          storage_path?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          boutique_id?: string
          byte_size?: number | null
          created_at?: string
          height?: number | null
          id?: string
          image_url?: string
          source_filename?: string | null
          storage_path?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "boutique_og_history_boutique_id_fkey"
            columns: ["boutique_id"]
            isOneToOne: false
            referencedRelation: "boutiques"
            referencedColumns: ["id"]
          },
        ]
      }
      boutique_pages: {
        Row: {
          boutique_id: string
          content: string | null
          created_at: string
          hero_image_url: string | null
          id: string
          is_visible: boolean
          mode: string
          position: number
          scenes: Json
          seo_description: string | null
          seo_title: string | null
          show_in_nav: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          boutique_id: string
          content?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          is_visible?: boolean
          mode?: string
          position?: number
          scenes?: Json
          seo_description?: string | null
          seo_title?: string | null
          show_in_nav?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          boutique_id?: string
          content?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          is_visible?: boolean
          mode?: string
          position?: number
          scenes?: Json
          seo_description?: string | null
          seo_title?: string | null
          show_in_nav?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      boutique_scenes: {
        Row: {
          boutique_id: string
          content: Json
          created_at: string
          id: string
          is_visible: boolean
          page_id: string | null
          position: number
          role: string
          scene_type: string
          style_overrides: Json | null
          updated_at: string
          variant: string
        }
        Insert: {
          boutique_id: string
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          page_id?: string | null
          position?: number
          role: string
          scene_type: string
          style_overrides?: Json | null
          updated_at?: string
          variant?: string
        }
        Update: {
          boutique_id?: string
          content?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          page_id?: string | null
          position?: number
          role?: string
          scene_type?: string
          style_overrides?: Json | null
          updated_at?: string
          variant?: string
        }
        Relationships: []
      }
      boutiques: {
        Row: {
          category: string
          cover_image_url: string | null
          created_at: string
          default_currency: string
          description: string | null
          has_protection: boolean
          highlight_media: Json
          id: string
          legal_address: string | null
          legal_business_name: string | null
          legal_email: string | null
          legal_phone: string | null
          legal_siret: string | null
          logo_url: string | null
          name: string
          seo_description: string | null
          seo_jsonld: Json | null
          seo_og_image_url: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["boutique_status"]
          studio_completed_at: string | null
          tagline: string | null
          target_markets: string[]
          theme_settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          cover_image_url?: string | null
          created_at?: string
          default_currency?: string
          description?: string | null
          has_protection?: boolean
          highlight_media?: Json
          id?: string
          legal_address?: string | null
          legal_business_name?: string | null
          legal_email?: string | null
          legal_phone?: string | null
          legal_siret?: string | null
          logo_url?: string | null
          name: string
          seo_description?: string | null
          seo_jsonld?: Json | null
          seo_og_image_url?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["boutique_status"]
          studio_completed_at?: string | null
          tagline?: string | null
          target_markets?: string[]
          theme_settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          default_currency?: string
          description?: string | null
          has_protection?: boolean
          highlight_media?: Json
          id?: string
          legal_address?: string | null
          legal_business_name?: string | null
          legal_email?: string | null
          legal_phone?: string | null
          legal_siret?: string | null
          logo_url?: string | null
          name?: string
          seo_description?: string | null
          seo_jsonld?: Json | null
          seo_og_image_url?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["boutique_status"]
          studio_completed_at?: string | null
          tagline?: string | null
          target_markets?: string[]
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
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
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
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
          payment_status: string | null
          product_id: string
          stripe_session_id: string | null
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
          payment_status?: string | null
          product_id: string
          stripe_session_id?: string | null
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
          payment_status?: string | null
          product_id?: string
          stripe_session_id?: string | null
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
      plans: {
        Row: {
          annual_monthly_price_eur: number
          commission_percent: number
          created_at: string
          features: Json
          id: string
          insurance_addon_price_eur: number
          insurance_max_disputes_per_month: number | null
          insurance_per_dispute_cap_eur: number
          max_boutiques: number
          max_products: number | null
          monthly_price_eur: number
          name: string
          sort_order: number
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Insert: {
          annual_monthly_price_eur: number
          commission_percent: number
          created_at?: string
          features?: Json
          id?: string
          insurance_addon_price_eur: number
          insurance_max_disputes_per_month?: number | null
          insurance_per_dispute_cap_eur: number
          max_boutiques: number
          max_products?: number | null
          monthly_price_eur: number
          name: string
          sort_order?: number
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Update: {
          annual_monthly_price_eur?: number
          commission_percent?: number
          created_at?: string
          features?: Json
          id?: string
          insurance_addon_price_eur?: number
          insurance_max_disputes_per_month?: number | null
          insurance_per_dispute_cap_eur?: number
          max_boutiques?: number
          max_products?: number | null
          monthly_price_eur?: number
          name?: string
          sort_order?: number
          tier?: Database["public"]["Enums"]["plan_tier"]
        }
        Relationships: []
      }
      product_media: {
        Row: {
          boutique_id: string
          created_at: string
          id: string
          is_selected: boolean
          position: number
          product_id: string
          prompt: string | null
          url: string
          user_id: string
        }
        Insert: {
          boutique_id: string
          created_at?: string
          id?: string
          is_selected?: boolean
          position?: number
          product_id: string
          prompt?: string | null
          url: string
          user_id: string
        }
        Update: {
          boutique_id?: string
          created_at?: string
          id?: string
          is_selected?: boolean
          position?: number
          product_id?: string
          prompt?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          applied_margin: number
          boutique_id: string
          created_at: string
          cumulative_sales: number
          id: string
          low_stock_threshold: number
          public_price: number
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number
          supplier_product_id: string
          updated_at: string
        }
        Insert: {
          applied_margin: number
          boutique_id: string
          created_at?: string
          cumulative_sales?: number
          id?: string
          low_stock_threshold?: number
          public_price: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          supplier_product_id: string
          updated_at?: string
        }
        Update: {
          applied_margin?: number
          boutique_id?: string
          created_at?: string
          cumulative_sales?: number
          id?: string
          low_stock_threshold?: number
          public_price?: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
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
          green_addon_enabled: boolean
          id: string
          insurance_addon_enabled: boolean
          is_verified: boolean | null
          market: string | null
          plan_billing_cycle: string
          plan_tier: Database["public"]["Enums"]["plan_tier"]
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
          green_addon_enabled?: boolean
          id?: string
          insurance_addon_enabled?: boolean
          is_verified?: boolean | null
          market?: string | null
          plan_billing_cycle?: string
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
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
          green_addon_enabled?: boolean
          id?: string
          insurance_addon_enabled?: boolean
          is_verified?: boolean | null
          market?: string | null
          plan_billing_cycle?: string
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
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
      scene_events: {
        Row: {
          boutique_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["scene_event_type"]
          id: string
          metadata: Json
          scene_id: string
          scene_type: string
          session_id: string | null
          value: number | null
        }
        Insert: {
          boutique_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["scene_event_type"]
          id?: string
          metadata?: Json
          scene_id: string
          scene_type: string
          session_id?: string | null
          value?: number | null
        }
        Update: {
          boutique_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["scene_event_type"]
          id?: string
          metadata?: Json
          scene_id?: string
          scene_type?: string
          session_id?: string | null
          value?: number | null
        }
        Relationships: []
      }
      storefront_events: {
        Row: {
          boutique_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["storefront_event_type"]
          id: string
          metadata: Json
          product_id: string | null
          session_id: string | null
        }
        Insert: {
          boutique_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["storefront_event_type"]
          id?: string
          metadata?: Json
          product_id?: string | null
          session_id?: string | null
        }
        Update: {
          boutique_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["storefront_event_type"]
          id?: string
          metadata?: Json
          product_id?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          kind: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          kind?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          kind?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      support_ticket_attachments: {
        Row: {
          byte_size: number | null
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          storage_path: string
          ticket_id: string
          uploaded_by: string | null
        }
        Insert: {
          byte_size?: number | null
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          storage_path: string
          ticket_id: string
          uploaded_by?: string | null
        }
        Update: {
          byte_size?: number | null
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          storage_path?: string
          ticket_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_responses: {
        Row: {
          author_id: string
          created_at: string
          id: string
          message: string
          ticket_id: string
        }
        Insert: {
          author_id: string
          created_at?: string
          id?: string
          message: string
          ticket_id: string
        }
        Update: {
          author_id?: string
          created_at?: string
          id?: string
          message?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          ai_conversation: Json | null
          ai_summary: string | null
          boutique_id: string | null
          contact_email: string
          contact_name: string | null
          created_at: string
          id: string
          message: string
          source: Database["public"]["Enums"]["support_ticket_source"]
          status: Database["public"]["Enums"]["support_ticket_status"]
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_conversation?: Json | null
          ai_summary?: string | null
          boutique_id?: string | null
          contact_email: string
          contact_name?: string | null
          created_at?: string
          id?: string
          message: string
          source?: Database["public"]["Enums"]["support_ticket_source"]
          status?: Database["public"]["Enums"]["support_ticket_status"]
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_conversation?: Json | null
          ai_summary?: string | null
          boutique_id?: string | null
          contact_email?: string
          contact_name?: string | null
          created_at?: string
          id?: string
          message?: string
          source?: Database["public"]["Enums"]["support_ticket_source"]
          status?: Database["public"]["Enums"]["support_ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      owns_boutique: {
        Args: { _boutique_id: string; _user_id: string }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      scene_analytics_summary: {
        Args: { _boutique_id: string; _since?: string }
        Returns: {
          avg_dwell_ms: number
          avg_scroll_pct: number
          conversion_rate: number
          conversions: number
          cta_clicks: number
          ctr: number
          impressions: number
          scene_id: string
          scene_type: string
        }[]
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
      plan_tier: "starter" | "growth" | "pro"
      product_status: "active" | "paused"
      recycling_source: "qr_scan" | "manual" | "pickup"
      rotation_indicator: "green" | "yellow" | "orange" | "red"
      scene_event_type:
        | "impression"
        | "cta_click"
        | "dwell"
        | "scroll_depth"
        | "conversion"
      storefront_event_type:
        | "boutique_view"
        | "product_view"
        | "add_to_cart"
        | "checkout_start"
      support_ticket_source: "dashboard_ai" | "dashboard_form" | "storefront"
      support_ticket_status: "open" | "in_progress" | "resolved" | "closed"
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
      plan_tier: ["starter", "growth", "pro"],
      product_status: ["active", "paused"],
      recycling_source: ["qr_scan", "manual", "pickup"],
      rotation_indicator: ["green", "yellow", "orange", "red"],
      scene_event_type: [
        "impression",
        "cta_click",
        "dwell",
        "scroll_depth",
        "conversion",
      ],
      storefront_event_type: [
        "boutique_view",
        "product_view",
        "add_to_cart",
        "checkout_start",
      ],
      support_ticket_source: ["dashboard_ai", "dashboard_form", "storefront"],
      support_ticket_status: ["open", "in_progress", "resolved", "closed"],
      team_role: ["owner", "manager", "marketing", "support"],
    },
  },
} as const
