export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cake_categories: {
        Row: {
          cake_id: string
          category_id: string
        }
        Insert: {
          cake_id: string
          category_id: string
        }
        Update: {
          cake_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cake_categories_cake_id_fkey"
            columns: ["cake_id"]
            isOneToOne: false
            referencedRelation: "cakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cake_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cake_images: {
        Row: {
          cake_id: string | null
          id: string
          position: number
          url: string
        }
        Insert: {
          cake_id?: string | null
          id?: string
          position?: number
          url: string
        }
        Update: {
          cake_id?: string | null
          id?: string
          position?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "cake_images_cake_id_fkey"
            columns: ["cake_id"]
            isOneToOne: false
            referencedRelation: "cakes"
            referencedColumns: ["id"]
          },
        ]
      }
      cake_ingredients: {
        Row: {
          cake_id: string | null
          id: string
          name: string
        }
        Insert: {
          cake_id?: string | null
          id?: string
          name: string
        }
        Update: {
          cake_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cake_ingredients_cake_id_fkey"
            columns: ["cake_id"]
            isOneToOne: false
            referencedRelation: "cakes"
            referencedColumns: ["id"]
          },
        ]
      }
      cakes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          price: number
          servings: number | null
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          price: number
          servings?: number | null
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          price?: number
          servings?: number | null
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cake_id: string
          created_at: string
          id: string
          quantity: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cake_id: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cake_id?: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cake_id_fkey"
            columns: ["cake_id"]
            isOneToOne: false
            referencedRelation: "cakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          cake_id: string
          created_at: string
          id: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          cake_id: string
          created_at?: string
          id?: string
          order_id: string
          price: number
          quantity: number
        }
        Update: {
          cake_id?: string
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_cake_id_fkey"
            columns: ["cake_id"]
            isOneToOne: false
            referencedRelation: "cakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          phone_number: string
          shipping_address: string
          status: string
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone_number: string
          shipping_address: string
          status?: string
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phone_number?: string
          shipping_address?: string
          status?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_profile: {
        Row: {
          about_us: string | null
          address: string | null
          created_at: string | null
          email: string | null
          facebook_url: string | null
          github_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          phone: string | null
          shop_name: string
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          about_us?: string | null
          address?: string | null
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          phone?: string | null
          shop_name: string
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          about_us?: string | null
          address?: string | null
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          phone?: string | null
          shop_name?: string
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string
          created_at: string
          full_name: string
          gender: string
          id: string
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string
          full_name: string
          gender: string
          id: string
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          full_name?: string
          gender?: string
          id?: string
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
