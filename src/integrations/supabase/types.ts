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
      accessories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_package: boolean
          name: string
          price: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_package?: boolean
          name: string
          price: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_package?: boolean
          name?: string
          price?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action_type: string
          changes: Json | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          summary: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          changes?: Json | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          summary: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          changes?: Json | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          summary?: string
          user_id?: string | null
        }
        Relationships: []
      }
      agent_applications: {
        Row: {
          address: string
          brand_id: string
          contact_person: string | null
          created_at: string | null
          delivery_vehicles: string[] | null
          has_license: boolean | null
          id: string
          license_explanation: string | null
          license_number: string | null
          license_url: string | null
          notes: string | null
          owner_name: string
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          selected_brand_ids: string[] | null
          shop_name: string
          status: Database["public"]["Enums"]["application_status"] | null
          township: string | null
          vehicle_count: number | null
          vehicle_other: string | null
          weekly_demand_kg: number | null
        }
        Insert: {
          address: string
          brand_id: string
          contact_person?: string | null
          created_at?: string | null
          delivery_vehicles?: string[] | null
          has_license?: boolean | null
          id?: string
          license_explanation?: string | null
          license_number?: string | null
          license_url?: string | null
          notes?: string | null
          owner_name: string
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          selected_brand_ids?: string[] | null
          shop_name: string
          status?: Database["public"]["Enums"]["application_status"] | null
          township?: string | null
          vehicle_count?: number | null
          vehicle_other?: string | null
          weekly_demand_kg?: number | null
        }
        Update: {
          address?: string
          brand_id?: string
          contact_person?: string | null
          created_at?: string | null
          delivery_vehicles?: string[] | null
          has_license?: boolean | null
          id?: string
          license_explanation?: string | null
          license_number?: string | null
          license_url?: string | null
          notes?: string | null
          owner_name?: string
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          selected_brand_ids?: string[] | null
          shop_name?: string
          status?: Database["public"]["Enums"]["application_status"] | null
          township?: string | null
          vehicle_count?: number | null
          vehicle_other?: string | null
          weekly_demand_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_applications_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_inventory: {
        Row: {
          brand_id: string
          current_stock: number | null
          cylinder_type: string
          id: string
          low_stock_threshold: number | null
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          current_stock?: number | null
          cylinder_type: string
          id?: string
          low_stock_threshold?: number | null
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          current_stock?: number | null
          cylinder_type?: string
          id?: string
          low_stock_threshold?: number | null
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_inventory_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_inventory_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_locations: {
        Row: {
          accuracy: number | null
          agent_id: string
          captured_at: string
          created_at: string | null
          heading: number | null
          id: string
          lat: number
          lng: number
          on_shift: boolean
          order_id: string | null
          speed: number | null
        }
        Insert: {
          accuracy?: number | null
          agent_id: string
          captured_at?: string
          created_at?: string | null
          heading?: number | null
          id?: string
          lat: number
          lng: number
          on_shift?: boolean
          order_id?: string | null
          speed?: number | null
        }
        Update: {
          accuracy?: number | null
          agent_id?: string
          captured_at?: string
          created_at?: string | null
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          on_shift?: boolean
          order_id?: string | null
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_locations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_locations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_profiles: {
        Row: {
          app_version: string | null
          created_at: string | null
          device_id: string | null
          fcm_token: string | null
          last_active_at: string | null
          location_enabled: boolean | null
          notification_enabled: boolean | null
          supplier_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string | null
          device_id?: string | null
          fcm_token?: string | null
          last_active_at?: string | null
          location_enabled?: boolean | null
          notification_enabled?: boolean | null
          supplier_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string | null
          device_id?: string | null
          fcm_token?: string | null
          last_active_at?: string | null
          location_enabled?: boolean | null
          notification_enabled?: boolean | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_profiles_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: true
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_products: {
        Row: {
          brand_id: string
          created_at: string
          cylinder_type_id: string | null
          default_low_stock_threshold: number
          display_name: string
          id: string
          is_active: boolean
          is_orderable: boolean
          price: number
          product_kind: string
          sort_order: number
          track_inventory: boolean
          unit: string
          updated_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string
          cylinder_type_id?: string | null
          default_low_stock_threshold?: number
          display_name: string
          id?: string
          is_active?: boolean
          is_orderable?: boolean
          price?: number
          product_kind?: string
          sort_order?: number
          track_inventory?: boolean
          unit?: string
          updated_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string
          cylinder_type_id?: string | null
          default_low_stock_threshold?: number
          display_name?: string
          id?: string
          is_active?: boolean
          is_orderable?: boolean
          price?: number
          product_kind?: string
          sort_order?: number
          track_inventory?: boolean
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_products_cylinder_type_id_fkey"
            columns: ["cylinder_type_id"]
            isOneToOne: false
            referencedRelation: "cylinder_types"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          sort_order: number | null
          type: Database["public"]["Enums"]["brand_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          sort_order?: number | null
          type: Database["public"]["Enums"]["brand_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          sort_order?: number | null
          type?: Database["public"]["Enums"]["brand_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      bundle_accessories: {
        Row: {
          accessory_id: string
          bundle_id: string
          id: string
          quantity: number
        }
        Insert: {
          accessory_id: string
          bundle_id: string
          id?: string
          quantity?: number
        }
        Update: {
          accessory_id?: string
          bundle_id?: string
          id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundle_accessories_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_accessories_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "equipment_bundles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_attempts: {
        Row: {
          attempted_by: string | null
          call_status: string
          called_at: string
          confirmed_address: string | null
          confirmed_contact_name: string | null
          confirmed_phone: string | null
          created_at: string
          id: string
          notes: string | null
          shop_id: string
          trip_day_id: string | null
          visit_window: string | null
        }
        Insert: {
          attempted_by?: string | null
          call_status: string
          called_at?: string
          confirmed_address?: string | null
          confirmed_contact_name?: string | null
          confirmed_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          shop_id: string
          trip_day_id?: string | null
          visit_window?: string | null
        }
        Update: {
          attempted_by?: string | null
          call_status?: string
          called_at?: string
          confirmed_address?: string | null
          confirmed_contact_name?: string | null
          confirmed_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          shop_id?: string
          trip_day_id?: string | null
          visit_window?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_attempts_attempted_by_fkey"
            columns: ["attempted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_attempts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "route_ready_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_attempts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_attempts_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          answered_at: string | null
          answered_by: string | null
          call_id: string | null
          call_status: string | null
          call_type: string
          callee_number: string | null
          caller_number: string | null
          created_at: string | null
          customer_id: string | null
          direction: string | null
          duration_seconds: number | null
          ended_at: string | null
          from_number: string | null
          id: string
          meta: Json | null
          recording_url: string | null
          ring_seconds: number | null
          started_at: string
          status: string | null
          to_number: string | null
        }
        Insert: {
          answered_at?: string | null
          answered_by?: string | null
          call_id?: string | null
          call_status?: string | null
          call_type?: string
          callee_number?: string | null
          caller_number?: string | null
          created_at?: string | null
          customer_id?: string | null
          direction?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          meta?: Json | null
          recording_url?: string | null
          ring_seconds?: number | null
          started_at: string
          status?: string | null
          to_number?: string | null
        }
        Update: {
          answered_at?: string | null
          answered_by?: string | null
          call_id?: string | null
          call_status?: string | null
          call_type?: string
          callee_number?: string | null
          caller_number?: string | null
          created_at?: string | null
          customer_id?: string | null
          direction?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          from_number?: string | null
          id?: string
          meta?: Json | null
          recording_url?: string | null
          ring_seconds?: number | null
          started_at?: string
          status?: string | null
          to_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      change_requests: {
        Row: {
          created_at: string | null
          current_values: Json
          entity_id: string
          entity_type: string
          id: string
          proposed_date: string | null
          proposed_time: string | null
          proposed_values: Json
          reason: string
          request_type: string
          requested_at: string | null
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          current_values: Json
          entity_id: string
          entity_type: string
          id?: string
          proposed_date?: string | null
          proposed_time?: string | null
          proposed_values: Json
          reason: string
          request_type: string
          requested_at?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          current_values?: Json
          entity_id?: string
          entity_type?: string
          id?: string
          proposed_date?: string | null
          proposed_time?: string | null
          proposed_values?: Json
          reason?: string
          request_type?: string
          requested_at?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string | null
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address: string
          auth_user_id: string
          created_at: string
          customer_id: string
          gps_lat: number | null
          gps_lng: number | null
          id: string
          is_default: boolean
          label: string
          landmark: string | null
          township_id: string | null
          updated_at: string
        }
        Insert: {
          address: string
          auth_user_id: string
          created_at?: string
          customer_id: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          is_default?: boolean
          label?: string
          landmark?: string | null
          township_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          auth_user_id?: string
          created_at?: string
          customer_id?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          is_default?: boolean
          label?: string
          landmark?: string | null
          township_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_addresses_township_id_fkey"
            columns: ["township_id"]
            isOneToOne: false
            referencedRelation: "townships"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_phones: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
          is_primary: boolean | null
          label: string | null
          phone: string
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
          is_primary?: boolean | null
          label?: string | null
          phone: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
          is_primary?: boolean | null
          label?: string | null
          phone?: string
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_phones_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_preferences: {
        Row: {
          auth_user_id: string
          created_at: string
          default_customer_id: string | null
          default_cylinder_type_id: string | null
          default_delivery_type: string | null
          default_payment_method: string | null
          id: string
          language: string
          notifications_enabled: boolean
          promo_notifications: boolean
          refill_reminder_days: number | null
          refill_reminder_enabled: boolean
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          default_customer_id?: string | null
          default_cylinder_type_id?: string | null
          default_delivery_type?: string | null
          default_payment_method?: string | null
          id?: string
          language?: string
          notifications_enabled?: boolean
          promo_notifications?: boolean
          refill_reminder_days?: number | null
          refill_reminder_enabled?: boolean
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          default_customer_id?: string | null
          default_cylinder_type_id?: string | null
          default_delivery_type?: string | null
          default_payment_method?: string | null
          id?: string
          language?: string
          notifications_enabled?: boolean
          promo_notifications?: boolean
          refill_reminder_days?: number | null
          refill_reminder_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_preferences_default_customer_id_fkey"
            columns: ["default_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_preferences_default_cylinder_type_id_fkey"
            columns: ["default_cylinder_type_id"]
            isOneToOne: false
            referencedRelation: "cylinder_types"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string
          auth_user_id: string | null
          created_at: string | null
          customer_type: string | null
          full_name: string
          gmaps_query_text: string | null
          gps_accuracy_m: number | null
          gps_captured_at: string | null
          gps_lat: number | null
          gps_lng: number | null
          gps_source: string | null
          id: string
          normalized_address_text: string | null
          notes: string | null
          original_customer_id: string | null
          phone: string
          phone_2: string | null
          status: string | null
          township: string
          updated_at: string | null
        }
        Insert: {
          address: string
          auth_user_id?: string | null
          created_at?: string | null
          customer_type?: string | null
          full_name: string
          gmaps_query_text?: string | null
          gps_accuracy_m?: number | null
          gps_captured_at?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          gps_source?: string | null
          id?: string
          normalized_address_text?: string | null
          notes?: string | null
          original_customer_id?: string | null
          phone: string
          phone_2?: string | null
          status?: string | null
          township: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          auth_user_id?: string | null
          created_at?: string | null
          customer_type?: string | null
          full_name?: string
          gmaps_query_text?: string | null
          gps_accuracy_m?: number | null
          gps_captured_at?: string | null
          gps_lat?: number | null
          gps_lng?: number | null
          gps_source?: string | null
          id?: string
          normalized_address_text?: string | null
          notes?: string | null
          original_customer_id?: string | null
          phone?: string
          phone_2?: string | null
          status?: string | null
          township?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cylinder_types: {
        Row: {
          created_at: string | null
          cylinder_price: number
          display_name: string
          id: string
          image_url: string | null
          is_active: boolean | null
          size_kg: number
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cylinder_price?: number
          display_name: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          size_kg: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cylinder_price?: number
          display_name?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          size_kg?: number
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dealer_order_items: {
        Row: {
          brand_id: string
          brand_name: string
          brand_product_id: string
          created_at: string | null
          cylinder_display_name: string | null
          cylinder_type_id: string | null
          dealer_order_id: string
          id: string
          line_total: number
          quantity: number
          size_kg: number | null
          unit_price: number
        }
        Insert: {
          brand_id: string
          brand_name: string
          brand_product_id: string
          created_at?: string | null
          cylinder_display_name?: string | null
          cylinder_type_id?: string | null
          dealer_order_id: string
          id?: string
          line_total: number
          quantity: number
          size_kg?: number | null
          unit_price: number
        }
        Update: {
          brand_id?: string
          brand_name?: string
          brand_product_id?: string
          created_at?: string | null
          cylinder_display_name?: string | null
          cylinder_type_id?: string | null
          dealer_order_id?: string
          id?: string
          line_total?: number
          quantity?: number
          size_kg?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "dealer_order_items_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_order_items_brand_product_id_fkey"
            columns: ["brand_product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_order_items_cylinder_type_id_fkey"
            columns: ["cylinder_type_id"]
            isOneToOne: false
            referencedRelation: "cylinder_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_order_items_dealer_order_id_fkey"
            columns: ["dealer_order_id"]
            isOneToOne: false
            referencedRelation: "dealer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_orders: {
        Row: {
          cancellation_reason: string | null
          confirmed_by: string | null
          confirmed_date: string | null
          created_at: string | null
          created_by: string | null
          delivered_by: string | null
          delivered_date: string | null
          delivery_fee: number
          delivery_method: string
          discount: number
          id: string
          notes: string | null
          order_number: string
          order_source: string
          order_type: string
          payment_method: string | null
          payment_status: string
          requested_date: string | null
          shop_id: string | null
          status: string
          subtotal: number
          supplier_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          confirmed_by?: string | null
          confirmed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_by?: string | null
          delivered_date?: string | null
          delivery_fee?: number
          delivery_method?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number: string
          order_source?: string
          order_type?: string
          payment_method?: string | null
          payment_status?: string
          requested_date?: string | null
          shop_id?: string | null
          status?: string
          subtotal?: number
          supplier_id: string
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          confirmed_by?: string | null
          confirmed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_by?: string | null
          delivered_date?: string | null
          delivery_fee?: number
          delivery_method?: string
          discount?: number
          id?: string
          notes?: string | null
          order_number?: string
          order_source?: string
          order_type?: string
          payment_method?: string | null
          payment_status?: string
          requested_date?: string | null
          shop_id?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "route_ready_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dealer_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_payments: {
        Row: {
          amount: number
          created_at: string | null
          dealer_order_id: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string
          recorded_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          dealer_order_id: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          recorded_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          dealer_order_id?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          recorded_by?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_payments_dealer_order_id_fkey"
            columns: ["dealer_order_id"]
            isOneToOne: false
            referencedRelation: "dealer_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_pricing: {
        Row: {
          brand_product_id: string
          created_at: string | null
          created_by: string | null
          cylinder_deposit: number | null
          cylinder_ownership: string
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          payment_term: string
          pricing_model: string
          settlement_basis: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          brand_product_id: string
          created_at?: string | null
          created_by?: string | null
          cylinder_deposit?: number | null
          cylinder_ownership?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_term?: string
          pricing_model: string
          settlement_basis?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          brand_product_id?: string
          created_at?: string | null
          created_by?: string | null
          cylinder_deposit?: number | null
          cylinder_ownership?: string
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          payment_term?: string
          pricing_model?: string
          settlement_basis?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_pricing_brand_product_id_fkey"
            columns: ["brand_product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_proofs: {
        Row: {
          customer_confirmed: boolean | null
          delivered_at: string | null
          gps_accuracy: number | null
          gps_lat: number | null
          gps_lng: number | null
          id: string
          notes: string | null
          order_id: string
          photo_path: string | null
          photo_url: string
          supplier_id: string
        }
        Insert: {
          customer_confirmed?: boolean | null
          delivered_at?: string | null
          gps_accuracy?: number | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          notes?: string | null
          order_id: string
          photo_path?: string | null
          photo_url: string
          supplier_id: string
        }
        Update: {
          customer_confirmed?: boolean | null
          delivered_at?: string | null
          gps_accuracy?: number | null
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          notes?: string | null
          order_id?: string
          photo_path?: string | null
          photo_url?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_proofs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_proofs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_bundles: {
        Row: {
          brand_id: string | null
          brand_product_id: string | null
          bundle_price: number | null
          created_at: string
          cylinder_type_id: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          requires_gas: boolean | null
          sort_order: number
          stove_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          brand_product_id?: string | null
          bundle_price?: number | null
          created_at?: string
          cylinder_type_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          requires_gas?: boolean | null
          sort_order?: number
          stove_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          brand_product_id?: string | null
          bundle_price?: number | null
          created_at?: string
          cylinder_type_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          requires_gas?: boolean | null
          sort_order?: number
          stove_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_bundles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_bundles_brand_product_id_fkey"
            columns: ["brand_product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_bundles_cylinder_type_id_fkey"
            columns: ["cylinder_type_id"]
            isOneToOne: false
            referencedRelation: "cylinder_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_bundles_stove_id_fkey"
            columns: ["stove_id"]
            isOneToOne: false
            referencedRelation: "stoves"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_programs: {
        Row: {
          brand_id: string
          created_at: string | null
          created_by: string | null
          cylinder_type_id: string | null
          description: string | null
          end_date: string | null
          exchange_fee: number | null
          id: string
          is_active: boolean | null
          program_name: string
          start_date: string
          updated_at: string | null
          valuation_bad: number | null
          valuation_good: number | null
          valuation_ok: number | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          created_by?: string | null
          cylinder_type_id?: string | null
          description?: string | null
          end_date?: string | null
          exchange_fee?: number | null
          id?: string
          is_active?: boolean | null
          program_name: string
          start_date: string
          updated_at?: string | null
          valuation_bad?: number | null
          valuation_good?: number | null
          valuation_ok?: number | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          created_by?: string | null
          cylinder_type_id?: string | null
          description?: string | null
          end_date?: string | null
          exchange_fee?: number | null
          id?: string
          is_active?: boolean | null
          program_name?: string
          start_date?: string
          updated_at?: string | null
          valuation_bad?: number | null
          valuation_good?: number | null
          valuation_ok?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exchange_programs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exchange_programs_cylinder_type_id_fkey"
            columns: ["cylinder_type_id"]
            isOneToOne: false
            referencedRelation: "cylinder_types"
            referencedColumns: ["id"]
          },
        ]
      }
      gas_prices: {
        Row: {
          brand_id: string
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          price_per_kg: number
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          price_per_kg: number
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          price_per_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "gas_prices_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_positions: {
        Row: {
          brand_product_id: string
          low_stock_threshold: number
          on_hand_units: number
          supplier_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          brand_product_id: string
          low_stock_threshold?: number
          on_hand_units?: number
          supplier_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          brand_product_id?: string
          low_stock_threshold?: number
          on_hand_units?: number
          supplier_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_positions_brand_product_id_fkey"
            columns: ["brand_product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_positions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          brand_product_id: string
          created_at: string
          created_by: string
          delta_units: number
          id: string
          note: string | null
          restock_request_id: string | null
          supplier_id: string
          type: string
        }
        Insert: {
          brand_product_id: string
          created_at?: string
          created_by?: string
          delta_units: number
          id?: string
          note?: string | null
          restock_request_id?: string | null
          supplier_id: string
          type: string
        }
        Update: {
          brand_product_id?: string
          created_at?: string
          created_by?: string
          delta_units?: number
          id?: string
          note?: string | null
          restock_request_id?: string | null
          supplier_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_tx_restock"
            columns: ["restock_request_id"]
            isOneToOne: false
            referencedRelation: "restock_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_brand_product_id_fkey"
            columns: ["brand_product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          id: string
          is_pinned: boolean | null
          note_type: string | null
          order_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          order_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          order_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_assignments: {
        Row: {
          accepted_at: string | null
          assigned_at: string | null
          assigned_by: string | null
          expires_at: string | null
          id: string
          order_id: string
          rejected_at: string | null
          rejection_reason: string | null
          responded_at: string | null
          status: string | null
          supplier_id: string
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          order_id: string
          rejected_at?: string | null
          rejection_reason?: string | null
          responded_at?: string | null
          status?: string | null
          supplier_id: string
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          responded_at?: string | null
          status?: string | null
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_assignments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          item_name: string
          item_type: string
          order_id: string
          quantity: number | null
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_name: string
          item_type: string
          order_id: string
          quantity?: number | null
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          item_name?: string
          item_type?: string
          order_id?: string
          quantity?: number | null
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_ratings: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          order_id: string
          rating: number
          supplier_id: string | null
          tags: string[] | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          order_id: string
          rating: number
          supplier_id?: string | null
          tags?: string[] | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string
          rating?: number
          supplier_id?: string | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_ratings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_ratings_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          accessories_subtotal: number | null
          address: string
          agent_claimed_at: string | null
          agent_id: string | null
          brand_id: string | null
          bundle_id: string | null
          cancellation_notes: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_reason: string | null
          confirmed_at: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string
          cylinder_subtotal: number | null
          cylinder_type: string | null
          delivered_at: string | null
          delivered_by: string | null
          delivered_time: string | null
          delivery_fee: number | null
          delivery_instructions: string | null
          delivery_photo_path: string | null
          delivery_photo_url: string | null
          discount: number | null
          exchange_photo_urls: Json | null
          exchange_program_id: string | null
          gas_price_per_kg: number | null
          gas_subtotal: number | null
          id: string
          in_progress_at: string | null
          notes: string | null
          offered_at: string | null
          old_cylinder_condition: string | null
          order_source: string
          order_type: Database["public"]["Enums"]["order_type"] | null
          preferred_delivery_time: string | null
          quantity: number
          rescheduled_from: string | null
          rescheduled_to: string | null
          scheduled_delivery_date: string | null
          service_call_type: string | null
          service_fee: number | null
          service_scope: string[] | null
          status: Database["public"]["Enums"]["order_status"] | null
          stove_subtotal: number | null
          supplier_id: string | null
          total_amount: number | null
          township: string
          trade_in_credit: number | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          accessories_subtotal?: number | null
          address: string
          agent_claimed_at?: string | null
          agent_id?: string | null
          brand_id?: string | null
          bundle_id?: string | null
          cancellation_notes?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone: string
          cylinder_subtotal?: number | null
          cylinder_type?: string | null
          delivered_at?: string | null
          delivered_by?: string | null
          delivered_time?: string | null
          delivery_fee?: number | null
          delivery_instructions?: string | null
          delivery_photo_path?: string | null
          delivery_photo_url?: string | null
          discount?: number | null
          exchange_photo_urls?: Json | null
          exchange_program_id?: string | null
          gas_price_per_kg?: number | null
          gas_subtotal?: number | null
          id?: string
          in_progress_at?: string | null
          notes?: string | null
          offered_at?: string | null
          old_cylinder_condition?: string | null
          order_source?: string
          order_type?: Database["public"]["Enums"]["order_type"] | null
          preferred_delivery_time?: string | null
          quantity: number
          rescheduled_from?: string | null
          rescheduled_to?: string | null
          scheduled_delivery_date?: string | null
          service_call_type?: string | null
          service_fee?: number | null
          service_scope?: string[] | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stove_subtotal?: number | null
          supplier_id?: string | null
          total_amount?: number | null
          township: string
          trade_in_credit?: number | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          accessories_subtotal?: number | null
          address?: string
          agent_claimed_at?: string | null
          agent_id?: string | null
          brand_id?: string | null
          bundle_id?: string | null
          cancellation_notes?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string
          cylinder_subtotal?: number | null
          cylinder_type?: string | null
          delivered_at?: string | null
          delivered_by?: string | null
          delivered_time?: string | null
          delivery_fee?: number | null
          delivery_instructions?: string | null
          delivery_photo_path?: string | null
          delivery_photo_url?: string | null
          discount?: number | null
          exchange_photo_urls?: Json | null
          exchange_program_id?: string | null
          gas_price_per_kg?: number | null
          gas_subtotal?: number | null
          id?: string
          in_progress_at?: string | null
          notes?: string | null
          offered_at?: string | null
          old_cylinder_condition?: string | null
          order_source?: string
          order_type?: Database["public"]["Enums"]["order_type"] | null
          preferred_delivery_time?: string | null
          quantity?: number
          rescheduled_from?: string | null
          rescheduled_to?: string | null
          scheduled_delivery_date?: string | null
          service_call_type?: string | null
          service_fee?: number | null
          service_scope?: string[] | null
          status?: Database["public"]["Enums"]["order_status"] | null
          stove_subtotal?: number | null
          supplier_id?: string | null
          total_amount?: number | null
          township?: string
          trade_in_credit?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "equipment_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_exchange_program_id_fkey"
            columns: ["exchange_program_id"]
            isOneToOne: false
            referencedRelation: "exchange_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          order_id: string
          recorded_by: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          order_id: string
          recorded_by?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          order_id?: string
          recorded_by?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_update_requests: {
        Row: {
          created_at: string | null
          current_phone: string
          customer_id: string
          id: string
          notes: string | null
          order_id: string | null
          proposed_phone: string
          reason: string | null
          rejection_reason: string | null
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          supplier_id: string | null
          update_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_phone: string
          customer_id: string
          id?: string
          notes?: string | null
          order_id?: string | null
          proposed_phone: string
          reason?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          supplier_id?: string | null
          update_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_phone?: string
          customer_id?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          proposed_phone?: string
          reason?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          supplier_id?: string | null
          update_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_phone_update_requested_by_profiles"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_update_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_update_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_update_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_update_requests: {
        Row: {
          created_at: string | null
          current_avatar_path: string | null
          current_name: string | null
          id: string
          notes: string | null
          proposed_avatar_path: string | null
          proposed_name: string | null
          rejection_reason: string | null
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          supplier_id: string | null
          update_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_avatar_path?: string | null
          current_name?: string | null
          id?: string
          notes?: string | null
          proposed_avatar_path?: string | null
          proposed_name?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          supplier_id?: string | null
          update_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_avatar_path?: string | null
          current_name?: string | null
          id?: string
          notes?: string | null
          proposed_avatar_path?: string | null
          proposed_name?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          supplier_id?: string | null
          update_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profile_update_requested_by_profiles"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_update_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          avatar_path: string | null
          created_at: string | null
          deactivated_at: string | null
          deactivated_by: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          phone: string | null
          supplier_id: string | null
          township_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_path?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_seen_at?: string | null
          phone?: string | null
          supplier_id?: string | null
          township_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_path?: string | null
          created_at?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          phone?: string | null
          supplier_id?: string | null
          township_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_deactivated_by_fkey"
            columns: ["deactivated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_township_id_fkey"
            columns: ["township_id"]
            isOneToOne: false
            referencedRelation: "townships"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_shop_id: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          referred_address: string | null
          referred_phone: string | null
          referred_shop_name: string
          source_shop_id: string | null
          township: string | null
        }
        Insert: {
          converted_shop_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          referred_address?: string | null
          referred_phone?: string | null
          referred_shop_name: string
          source_shop_id?: string | null
          township?: string | null
        }
        Update: {
          converted_shop_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          referred_address?: string | null
          referred_phone?: string | null
          referred_shop_name?: string
          source_shop_id?: string | null
          township?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_converted_shop_id_fkey"
            columns: ["converted_shop_id"]
            isOneToOne: false
            referencedRelation: "route_ready_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_converted_shop_id_fkey"
            columns: ["converted_shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_source_shop_id_fkey"
            columns: ["source_shop_id"]
            isOneToOne: false
            referencedRelation: "route_ready_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_source_shop_id_fkey"
            columns: ["source_shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      refill_reminders: {
        Row: {
          auth_user_id: string
          created_at: string
          customer_id: string
          id: string
          reminder_date: string
          status: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string
          customer_id: string
          id?: string
          reminder_date: string
          status?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          reminder_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "refill_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      reschedule_requests: {
        Row: {
          created_at: string | null
          id: string
          new_order_id: string | null
          notes: string | null
          order_id: string
          proposed_date: string
          proposed_time_slot: string | null
          reason: string
          rejection_reason: string | null
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_order_id?: string | null
          notes?: string | null
          order_id: string
          proposed_date: string
          proposed_time_slot?: string | null
          reason: string
          rejection_reason?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_order_id?: string | null
          notes?: string | null
          order_id?: string
          proposed_date?: string
          proposed_time_slot?: string | null
          reason?: string
          rejection_reason?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reschedule_requested_by_profiles"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reschedule_reviewed_by_profiles"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_requests_new_order_id_fkey"
            columns: ["new_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reschedule_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      restock_requests: {
        Row: {
          brand_product_id: string
          fulfilled_at: string | null
          fulfilled_by: string | null
          id: string
          note: string | null
          requested_at: string
          requested_by: string
          requested_units: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          supplier_id: string
        }
        Insert: {
          brand_product_id: string
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          note?: string | null
          requested_at?: string
          requested_by?: string
          requested_units: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          supplier_id: string
        }
        Update: {
          brand_product_id?: string
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          note?: string | null
          requested_at?: string
          requested_by?: string
          requested_units?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_restock_requested_by_profiles"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_requests_brand_product_id_fkey"
            columns: ["brand_product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restock_requests_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_contacts: {
        Row: {
          contact_name: string | null
          created_at: string
          id: string
          is_primary: boolean
          is_verified: boolean
          notes: string | null
          phone: string | null
          role_label: string | null
          shop_id: string
          updated_at: string
        }
        Insert: {
          contact_name?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          notes?: string | null
          phone?: string | null
          role_label?: string | null
          shop_id: string
          updated_at?: string
        }
        Update: {
          contact_name?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean
          is_verified?: boolean
          notes?: string | null
          phone?: string | null
          role_label?: string | null
          shop_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_contacts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "route_ready_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_contacts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_status_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_initiative_response: string | null
          new_lead_status: string | null
          note: string | null
          old_initiative_response: string | null
          old_lead_status: string | null
          shop_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_initiative_response?: string | null
          new_lead_status?: string | null
          note?: string | null
          old_initiative_response?: string | null
          old_lead_status?: string | null
          shop_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_initiative_response?: string | null
          new_lead_status?: string | null
          note?: string | null
          old_initiative_response?: string | null
          old_lead_status?: string | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_status_history_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "route_ready_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_status_history_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_suppressions: {
        Row: {
          active: boolean
          attempted_by: string | null
          created_at: string
          id: string
          last_attempted_at: string | null
          notes: string | null
          reason: string
          shop_id: string
        }
        Insert: {
          active?: boolean
          attempted_by?: string | null
          created_at?: string
          id?: string
          last_attempted_at?: string | null
          notes?: string | null
          reason: string
          shop_id: string
        }
        Update: {
          active?: boolean
          attempted_by?: string | null
          created_at?: string
          id?: string
          last_attempted_at?: string | null
          notes?: string | null
          reason?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_suppressions_attempted_by_fkey"
            columns: ["attempted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_suppressions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "route_ready_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_suppressions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          brands_observed: string | null
          canonical_name: string
          confidence_score: number | null
          converted_supplier_id: string | null
          created_at: string
          delivery_indicated: string | null
          external_source_id: string | null
          facebook_url: string | null
          first_order_id: string | null
          geolocation_source: string | null
          google_maps_url: string | null
          id: string
          initiative_response: string
          is_route_ready: boolean
          landmark: string | null
          last_called_at: string | null
          last_visited_at: string | null
          lat: number | null
          lead_status: string
          lng: number | null
          location_confidence: string | null
          location_verified_at: string | null
          needs_cleanup: boolean
          notes: string | null
          onboarded_at: string | null
          phone_all: string | null
          primary_phone: string | null
          segment: string
          shop_type: string | null
          source: string | null
          source_type: string | null
          suppression_reason: string | null
          township: string | null
          updated_at: string
          visit_status: string | null
          ward: string | null
        }
        Insert: {
          address?: string | null
          brands_observed?: string | null
          canonical_name: string
          confidence_score?: number | null
          converted_supplier_id?: string | null
          created_at?: string
          delivery_indicated?: string | null
          external_source_id?: string | null
          facebook_url?: string | null
          first_order_id?: string | null
          geolocation_source?: string | null
          google_maps_url?: string | null
          id?: string
          initiative_response?: string
          is_route_ready?: boolean
          landmark?: string | null
          last_called_at?: string | null
          last_visited_at?: string | null
          lat?: number | null
          lead_status?: string
          lng?: number | null
          location_confidence?: string | null
          location_verified_at?: string | null
          needs_cleanup?: boolean
          notes?: string | null
          onboarded_at?: string | null
          phone_all?: string | null
          primary_phone?: string | null
          segment?: string
          shop_type?: string | null
          source?: string | null
          source_type?: string | null
          suppression_reason?: string | null
          township?: string | null
          updated_at?: string
          visit_status?: string | null
          ward?: string | null
        }
        Update: {
          address?: string | null
          brands_observed?: string | null
          canonical_name?: string
          confidence_score?: number | null
          converted_supplier_id?: string | null
          created_at?: string
          delivery_indicated?: string | null
          external_source_id?: string | null
          facebook_url?: string | null
          first_order_id?: string | null
          geolocation_source?: string | null
          google_maps_url?: string | null
          id?: string
          initiative_response?: string
          is_route_ready?: boolean
          landmark?: string | null
          last_called_at?: string | null
          last_visited_at?: string | null
          lat?: number | null
          lead_status?: string
          lng?: number | null
          location_confidence?: string | null
          location_verified_at?: string | null
          needs_cleanup?: boolean
          notes?: string | null
          onboarded_at?: string | null
          phone_all?: string | null
          primary_phone?: string | null
          segment?: string
          shop_type?: string | null
          source?: string | null
          source_type?: string | null
          suppression_reason?: string | null
          township?: string | null
          updated_at?: string
          visit_status?: string | null
          ward?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_converted_supplier_id_fkey"
            columns: ["converted_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_first_order_id_fkey"
            columns: ["first_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          page_access_token: string
          page_id: string
          page_name: string | null
          platform: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          page_access_token: string
          page_id: string
          page_name?: string | null
          platform: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          page_access_token?: string
          page_id?: string
          page_name?: string | null
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_conversations: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          channel: Database["public"]["Enums"]["social_channel"]
          created_at: string
          customer_id: string | null
          customer_unlink_reason: string | null
          customer_unlinked_at: string | null
          customer_unlinked_by: string | null
          external_ticket_id: string | null
          id: string
          last_inbound_at: string | null
          last_message_at: string | null
          last_message_text: string | null
          last_outbound_at: string | null
          page_id: string
          participant_avatar_url: string | null
          participant_id: string
          participant_identifier_key: string | null
          participant_name: string | null
          participant_profile_fetched_at: string | null
          platform: string
          status: Database["public"]["Enums"]["social_conversation_status"]
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          channel: Database["public"]["Enums"]["social_channel"]
          created_at?: string
          customer_id?: string | null
          customer_unlink_reason?: string | null
          customer_unlinked_at?: string | null
          customer_unlinked_by?: string | null
          external_ticket_id?: string | null
          id?: string
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_message_text?: string | null
          last_outbound_at?: string | null
          page_id: string
          participant_avatar_url?: string | null
          participant_id: string
          participant_identifier_key?: string | null
          participant_name?: string | null
          participant_profile_fetched_at?: string | null
          platform?: string
          status?: Database["public"]["Enums"]["social_conversation_status"]
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          channel?: Database["public"]["Enums"]["social_channel"]
          created_at?: string
          customer_id?: string | null
          customer_unlink_reason?: string | null
          customer_unlinked_at?: string | null
          customer_unlinked_by?: string | null
          external_ticket_id?: string | null
          id?: string
          last_inbound_at?: string | null
          last_message_at?: string | null
          last_message_text?: string | null
          last_outbound_at?: string | null
          page_id?: string
          participant_avatar_url?: string | null
          participant_id?: string
          participant_identifier_key?: string | null
          participant_name?: string | null
          participant_profile_fetched_at?: string | null
          platform?: string
          status?: Database["public"]["Enums"]["social_conversation_status"]
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      social_logs: {
        Row: {
          attachments: Json | null
          channel: Database["public"]["Enums"]["social_channel"]
          comment_id: string | null
          conversation_id: string | null
          created_at: string
          customer_id: string | null
          delivery_status: string | null
          direction: string | null
          external_message_id: string | null
          id: string
          linked_at: string | null
          linked_by: string | null
          message_text: string | null
          message_type: string | null
          outbox_id: string | null
          page_id: string
          participant_id: string | null
          permalink_url: string | null
          post_id: string | null
          raw_payload: Json
          sender_id: string
          sender_name: string | null
          source_ts: string | null
        }
        Insert: {
          attachments?: Json | null
          channel: Database["public"]["Enums"]["social_channel"]
          comment_id?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_status?: string | null
          direction?: string | null
          external_message_id?: string | null
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          message_text?: string | null
          message_type?: string | null
          outbox_id?: string | null
          page_id: string
          participant_id?: string | null
          permalink_url?: string | null
          post_id?: string | null
          raw_payload: Json
          sender_id: string
          sender_name?: string | null
          source_ts?: string | null
        }
        Update: {
          attachments?: Json | null
          channel?: Database["public"]["Enums"]["social_channel"]
          comment_id?: string | null
          conversation_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_status?: string | null
          direction?: string | null
          external_message_id?: string | null
          id?: string
          linked_at?: string | null
          linked_by?: string | null
          message_text?: string | null
          message_type?: string | null
          outbox_id?: string | null
          page_id?: string
          participant_id?: string | null
          permalink_url?: string | null
          post_id?: string | null
          raw_payload?: Json
          sender_id?: string
          sender_name?: string | null
          source_ts?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "social_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_logs_outbox_id_fkey"
            columns: ["outbox_id"]
            isOneToOne: false
            referencedRelation: "social_outbox"
            referencedColumns: ["id"]
          },
        ]
      }
      social_outbox: {
        Row: {
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          message_text: string
          meta_message_id: string | null
          page_id: string
          platform: string
          recipient_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          message_text: string
          meta_message_id?: string | null
          page_id: string
          platform: string
          recipient_id: string
          sent_at?: string | null
          status: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          message_text?: string
          meta_message_id?: string | null
          page_id?: string
          platform?: string
          recipient_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: []
      }
      stove_brands: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      stoves: {
        Row: {
          burner_type: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          model: string | null
          name: string
          price: number
          sort_order: number | null
          stove_brand_id: string | null
          updated_at: string | null
        }
        Insert: {
          burner_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          name: string
          price: number
          sort_order?: number | null
          stove_brand_id?: string | null
          updated_at?: string | null
        }
        Update: {
          burner_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          name?: string
          price?: number
          sort_order?: number | null
          stove_brand_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stoves_stove_brand_id_fkey"
            columns: ["stove_brand_id"]
            isOneToOne: false
            referencedRelation: "stove_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_coverage: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          priority: number | null
          supplier_id: string
          township_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          priority?: number | null
          supplier_id: string
          township_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          priority?: number | null
          supplier_id?: string
          township_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_coverage_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_coverage_township_id_fkey"
            columns: ["township_id"]
            isOneToOne: false
            referencedRelation: "townships"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          avatar_url: string | null
          brand_id: string
          brand_inventory: Json | null
          created_at: string | null
          id: string
          inventory_count: number | null
          is_active: boolean | null
          owner_name: string | null
          phone: string
          safety_score: number | null
          selected_brand_ids: string[] | null
          shop_name: string
          township: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          brand_id: string
          brand_inventory?: Json | null
          created_at?: string | null
          id?: string
          inventory_count?: number | null
          is_active?: boolean | null
          owner_name?: string | null
          phone: string
          safety_score?: number | null
          selected_brand_ids?: string[] | null
          shop_name: string
          township?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          brand_id?: string
          brand_inventory?: Json | null
          created_at?: string | null
          id?: string
          inventory_count?: number | null
          is_active?: boolean | null
          owner_name?: string | null
          phone?: string
          safety_score?: number | null
          selected_brand_ids?: string[] | null
          shop_name?: string
          township?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          description: string | null
          due_date: string
          due_time: string | null
          id: string
          order_id: string | null
          priority: string
          status: string
          task_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_date: string
          due_time?: string | null
          id?: string
          order_id?: string | null
          priority?: string
          status?: string
          task_type?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          due_date?: string
          due_time?: string | null
          id?: string
          order_id?: string | null
          priority?: string
          status?: string
          task_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      townships: {
        Row: {
          base_delivery_fee: number | null
          created_at: string | null
          distance_from_center: number | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          updated_at: string | null
          zone: string | null
          zone_priority: number | null
        }
        Insert: {
          base_delivery_fee?: number | null
          created_at?: string | null
          distance_from_center?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          updated_at?: string | null
          zone?: string | null
          zone_priority?: number | null
        }
        Update: {
          base_delivery_fee?: number | null
          created_at?: string | null
          distance_from_center?: number | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          updated_at?: string | null
          zone?: string | null
          zone_priority?: number | null
        }
        Relationships: []
      }
      trip_days: {
        Row: {
          assigned_to: string | null
          cluster_name: string | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          route_day_label: string | null
          status: string
          trip_date: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          cluster_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          route_day_label?: string | null
          status?: string
          trip_date: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          cluster_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          route_day_label?: string | null
          status?: string
          trip_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_days_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_days_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_stops: {
        Row: {
          call_status: string
          completed_at: string | null
          confirmed_address: string | null
          confirmed_contact_name: string | null
          created_at: string
          field_action: string | null
          id: string
          planned_window: string | null
          route_ready: boolean
          shop_id: string
          started_at: string | null
          stop_order: number
          team_notes: string | null
          trip_day_id: string
          updated_at: string
          visit_status_snapshot: string | null
        }
        Insert: {
          call_status?: string
          completed_at?: string | null
          confirmed_address?: string | null
          confirmed_contact_name?: string | null
          created_at?: string
          field_action?: string | null
          id?: string
          planned_window?: string | null
          route_ready?: boolean
          shop_id: string
          started_at?: string | null
          stop_order: number
          team_notes?: string | null
          trip_day_id: string
          updated_at?: string
          visit_status_snapshot?: string | null
        }
        Update: {
          call_status?: string
          completed_at?: string | null
          confirmed_address?: string | null
          confirmed_contact_name?: string | null
          created_at?: string
          field_action?: string | null
          id?: string
          planned_window?: string | null
          route_ready?: boolean
          shop_id?: string
          started_at?: string | null
          stop_order?: number
          team_notes?: string | null
          trip_day_id?: string
          updated_at?: string
          visit_status_snapshot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_stops_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "route_ready_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_stops_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_stops_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          photo_url: string
          visit_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_url: string
          visit_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_url?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_photos_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          accepts_8484_orders: boolean | null
          confirmed_address: string | null
          confirmed_phone: string | null
          created_at: string
          device_recorded_offline: boolean
          gps_accuracy_meters: number | null
          id: string
          interest_level: string
          interested_15kg: boolean | null
          interested_50kg: boolean | null
          interested_5kg: boolean | null
          lat: number | null
          lng: number | null
          next_follow_up_date: string | null
          notes: string | null
          owner_contact_name: string | null
          products_sold: string | null
          shop_id: string
          trip_day_id: string | null
          trip_stop_id: string | null
          visit_result: string
          visited_at: string
          visited_by: string | null
        }
        Insert: {
          accepts_8484_orders?: boolean | null
          confirmed_address?: string | null
          confirmed_phone?: string | null
          created_at?: string
          device_recorded_offline?: boolean
          gps_accuracy_meters?: number | null
          id?: string
          interest_level?: string
          interested_15kg?: boolean | null
          interested_50kg?: boolean | null
          interested_5kg?: boolean | null
          lat?: number | null
          lng?: number | null
          next_follow_up_date?: string | null
          notes?: string | null
          owner_contact_name?: string | null
          products_sold?: string | null
          shop_id: string
          trip_day_id?: string | null
          trip_stop_id?: string | null
          visit_result: string
          visited_at?: string
          visited_by?: string | null
        }
        Update: {
          accepts_8484_orders?: boolean | null
          confirmed_address?: string | null
          confirmed_phone?: string | null
          created_at?: string
          device_recorded_offline?: boolean
          gps_accuracy_meters?: number | null
          id?: string
          interest_level?: string
          interested_15kg?: boolean | null
          interested_50kg?: boolean | null
          interested_5kg?: boolean | null
          lat?: number | null
          lng?: number | null
          next_follow_up_date?: string | null
          notes?: string | null
          owner_contact_name?: string | null
          products_sold?: string | null
          shop_id?: string
          trip_day_id?: string | null
          trip_stop_id?: string | null
          visit_result?: string
          visited_at?: string
          visited_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "route_ready_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_trip_day_id_fkey"
            columns: ["trip_day_id"]
            isOneToOne: false
            referencedRelation: "trip_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_trip_stop_id_fkey"
            columns: ["trip_stop_id"]
            isOneToOne: false
            referencedRelation: "trip_stops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_visited_by_fkey"
            columns: ["visited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zoho_data_quality_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      zoho_ticket_cache: {
        Row: {
          channel_id: string | null
          confidence: string | null
          created_at: string | null
          id: string
          last_verified_at: string | null
          participant_id: string
          session_id: string | null
          source: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          confidence?: string | null
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          participant_id: string
          session_id?: string | null
          source: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          confidence?: string | null
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          participant_id?: string
          session_id?: string | null
          source?: string
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      zoho_ticket_resolution_queue: {
        Row: {
          conversation_id: string
          created_at: string | null
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_retries: number | null
          next_retry_at: string | null
          participant_id: string
          resolved_ticket_id: string | null
          retry_count: number | null
          session_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          participant_id: string
          resolved_ticket_id?: string | null
          retry_count?: number | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          participant_id?: string
          resolved_ticket_id?: string | null
          retry_count?: number | null
          session_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zoho_ticket_resolution_queue_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "social_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      zoho_webhook_events: {
        Row: {
          contact_id: string | null
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          participant_id: string | null
          processed: boolean | null
          processed_at: string | null
          raw_payload: Json
          zoho_event_id: string
          zoho_thread_id: string | null
          zoho_ticket_id: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          participant_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          raw_payload: Json
          zoho_event_id: string
          zoho_thread_id?: string | null
          zoho_ticket_id?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          participant_id?: string | null
          processed?: boolean | null
          processed_at?: string | null
          raw_payload?: Json
          zoho_event_id?: string
          zoho_thread_id?: string | null
          zoho_ticket_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      agent_pending_orders: {
        Row: {
          address: string | null
          assigned_at: string | null
          assignment_id: string | null
          assignment_supplier_id: string | null
          brand_id: string | null
          customer_name: string | null
          customer_phone: string | null
          cylinder_type: string | null
          notes: string | null
          order_created_at: string | null
          order_id: string | null
          order_status: Database["public"]["Enums"]["order_status"] | null
          order_updated_at: string | null
          preferred_delivery_time: string | null
          quantity: number | null
          rejection_reason: string | null
          responded_at: string | null
          total_amount: number | null
          township: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_assignments_supplier_id_fkey"
            columns: ["assignment_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_funnel: {
        Row: {
          pct_of_previous: number | null
          pct_of_total: number | null
          shop_count: number | null
          stage: string | null
          stage_order: number | null
        }
        Relationships: []
      }
      current_gas_prices: {
        Row: {
          brand_id: string | null
          brand_name: string | null
          brand_type: Database["public"]["Enums"]["brand_type"] | null
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string | null
          price_per_kg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gas_prices_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_phones_view: {
        Row: {
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          is_primary: boolean | null
          label: string | null
          phone: string | null
          phone_id: string | null
          township: string | null
          verified: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_phones_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      my_open_tasks: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_township: string | null
          days_overdue: number | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string | null
          is_overdue: boolean | null
          order_customer_name: string | null
          order_id: string | null
          order_status: Database["public"]["Enums"]["order_status"] | null
          order_township: string | null
          priority: string | null
          status: string | null
          task_type: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      overdue_tasks: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_township: string | null
          days_overdue: number | null
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string | null
          order_customer_name: string | null
          order_id: string | null
          order_township: string | null
          priority: string | null
          status: string | null
          task_type: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      route_ready_queue: {
        Row: {
          address: string | null
          canonical_name: string | null
          confidence_score: number | null
          google_maps_url: string | null
          id: string | null
          initiative_response: string | null
          is_route_ready: boolean | null
          lat: number | null
          lead_status: string | null
          lng: number | null
          primary_phone: string | null
          segment: string | null
          township: string | null
        }
        Insert: {
          address?: string | null
          canonical_name?: string | null
          confidence_score?: number | null
          google_maps_url?: string | null
          id?: string | null
          initiative_response?: string | null
          is_route_ready?: boolean | null
          lat?: number | null
          lead_status?: string | null
          lng?: number | null
          primary_phone?: string | null
          segment?: string | null
          township?: string | null
        }
        Update: {
          address?: string | null
          canonical_name?: string | null
          confidence_score?: number | null
          google_maps_url?: string | null
          id?: string | null
          initiative_response?: string | null
          is_route_ready?: boolean | null
          lat?: number | null
          lead_status?: string | null
          lng?: number | null
          primary_phone?: string | null
          segment?: string | null
          township?: string | null
        }
        Relationships: []
      }
      township_coverage: {
        Row: {
          onboarded_pct: number | null
          onboarded_shops: number | null
          total_shops: number | null
          township: string | null
          visited_pct: number | null
          visited_shops: number | null
        }
        Relationships: []
      }
      v_agent_latest_locations: {
        Row: {
          accuracy: number | null
          agent_id: string | null
          agent_name: string | null
          agent_phone: string | null
          captured_at: string | null
          heading: number | null
          id: string | null
          lat: number | null
          lng: number | null
          on_shift: boolean | null
          order_id: string | null
          shop_name: string | null
          speed: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_locations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_locations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      v_low_stock: {
        Row: {
          brand_id: string | null
          brand_name: string | null
          brand_product_id: string | null
          low_stock_threshold: number | null
          on_hand_units: number | null
          product_name: string | null
          shop_name: string | null
          supplier_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_positions_brand_product_id_fkey"
            columns: ["brand_product_id"]
            isOneToOne: false
            referencedRelation: "brand_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_positions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      v_staff_performance_daily: {
        Row: {
          actor_profile_id: string | null
          customers_created: number | null
          customers_updated: number | null
          day: string | null
          orders_assigned: number | null
          orders_cancelled: number | null
          orders_created: number | null
          orders_reassigned: number | null
          payments_recorded: number | null
          total_actions: number | null
        }
        Relationships: []
      }
      v_staff_performance_monthly: {
        Row: {
          actor_profile_id: string | null
          customers_created: number | null
          customers_updated: number | null
          month_start: string | null
          orders_assigned: number | null
          orders_cancelled: number | null
          orders_created: number | null
          orders_reassigned: number | null
          payments_recorded: number | null
          total_actions: number | null
        }
        Relationships: []
      }
      v_staff_performance_weekly: {
        Row: {
          actor_profile_id: string | null
          customers_created: number | null
          customers_updated: number | null
          orders_assigned: number | null
          orders_cancelled: number | null
          orders_created: number | null
          orders_reassigned: number | null
          payments_recorded: number | null
          total_actions: number | null
          week_start: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_assignment: { Args: { p_order_id: string }; Returns: Json }
      agent_set_inventory: {
        Args: { p_brand_product_id: string; p_on_hand_units: number }
        Returns: undefined
      }
      agent_submit_restock_request: {
        Args: {
          p_brand_product_id: string
          p_note?: string
          p_requested_units: number
        }
        Returns: string
      }
      assign_supplier_to_order: {
        Args: {
          p_assigned_by: string
          p_order_id: string
          p_supplier_id: string
        }
        Returns: Json
      }
      calculate_next_retry: {
        Args: { base_delay_minutes?: number; retry_count: number }
        Returns: string
      }
      can_view_onboarding_trip: {
        Args: { _trip_day_id: string }
        Returns: boolean
      }
      can_write_onboarding_shop: {
        Args: { _shop_id: string }
        Returns: boolean
      }
      create_dealer_order: {
        Args: {
          p_delivery_fee?: number
          p_delivery_method?: string
          p_discount?: number
          p_items?: Json
          p_notes?: string
          p_order_source?: string
          p_payment_method?: string
          p_payment_term?: string
          p_requested_date?: string
          p_supplier_id: string
        }
        Returns: string
      }
      create_refill_order: {
        Args: {
          p_address?: string
          p_customer_id?: string
          p_customer_name?: string
          p_customer_phone?: string
          p_delivery_fee?: number
          p_delivery_time?: string
          p_discount?: number
          p_lines?: Json
          p_notes?: string
          p_override_duplicate?: boolean
          p_payment_method?: string
          p_scheduled_delivery_date?: string
          p_supplier_id?: string
          p_township?: string
        }
        Returns: Json
      }
      crm_fulfill_restock_request: {
        Args: { p_fulfilled_units: number; p_request_id: string }
        Returns: undefined
      }
      crm_reject_restock_request: {
        Args: { p_reason?: string; p_request_id: string }
        Returns: undefined
      }
      extract_storage_bucket_path: {
        Args: { p_url: string }
        Returns: {
          bucket: string
          path: string
        }[]
      }
      get_agent_customer_ids: { Args: never; Returns: string[] }
      get_my_customer_ids: { Args: never; Returns: string[] }
      get_my_order_ids: { Args: never; Returns: string[] }
      get_my_supplier_ids_as_customer: { Args: never; Returns: string[] }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      is_crm_user: { Args: { _user_id: string }; Returns: boolean }
      is_internal_staff: { Args: { _user_id: string }; Returns: boolean }
      is_my_order: { Args: { order_customer_id: string }; Returns: boolean }
      manage_customer_phone: {
        Args: {
          p_action: string
          p_customer_id: string
          p_label?: string
          p_phone?: string
          p_phone_id?: string
        }
        Returns: Json
      }
      my_supplier_id: { Args: never; Returns: string }
      normalize_myanmar_address: {
        Args: { raw_address: string }
        Returns: {
          gmaps_query: string
          normalized: string
        }[]
      }
      queue_ticket_resolution: {
        Args: {
          p_conversation_id: string
          p_participant_id: string
          p_session_id?: string
        }
        Returns: Json
      }
      reassign_task: {
        Args: { p_new_assignee: string; p_task_id: string }
        Returns: Json
      }
      record_payment: {
        Args: {
          p_method: Database["public"]["Enums"]["payment_method"]
          p_order_id: string
          p_transaction_id?: string
        }
        Returns: Json
      }
      review_profile_update_request: {
        Args: {
          p_approve: boolean
          p_rejection_reason?: string
          p_request_id: string
        }
        Returns: undefined
      }
      update_agent_inventory: {
        Args: { p_brand_id: string; p_new_stock: number; p_supplier_id: string }
        Returns: number
      }
      update_safety_score: {
        Args: { p_change: number; p_reason: string; p_supplier_id: string }
        Returns: number
      }
      update_task_status: {
        Args: {
          p_cancellation_reason?: string
          p_status: string
          p_task_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "staff"
        | "salesperson"
        | "viewer"
        | "supplier"
        | "customer"
        | "call_agent"
      application_status: "pending" | "approved" | "rejected"
      brand_type: "anchor" | "partner"
      order_status:
        | "new"
        | "offered"
        | "confirmed"
        | "in_progress"
        | "dispatched"
        | "delivered"
        | "cancelled"
        | "failed"
      order_type: "refill" | "new_setup" | "exchange" | "service_call"
      payment_method: "kbz_pay" | "wave" | "cb_pay" | "cash"
      social_channel: "facebook_dm" | "facebook_comment" | "zoho_messenger"
      social_conversation_status: "new" | "in_progress" | "closed"
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
      app_role: [
        "admin",
        "manager",
        "staff",
        "salesperson",
        "viewer",
        "supplier",
        "customer",
        "call_agent",
      ],
      application_status: ["pending", "approved", "rejected"],
      brand_type: ["anchor", "partner"],
      order_status: [
        "new",
        "offered",
        "confirmed",
        "in_progress",
        "dispatched",
        "delivered",
        "cancelled",
        "failed",
      ],
      order_type: ["refill", "new_setup", "exchange", "service_call"],
      payment_method: ["kbz_pay", "wave", "cb_pay", "cash"],
      social_channel: ["facebook_dm", "facebook_comment", "zoho_messenger"],
      social_conversation_status: ["new", "in_progress", "closed"],
    },
  },
} as const
