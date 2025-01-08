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
      crm_tools: {
        Row: {
          id: string
          name: string
          logo: string | null
          price: number
          rating: number
          review_count: number
          features: string[]
          summary: string | null
          sentiment: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo?: string | null
          price: number
          rating: number
          review_count: number
          features: string[]
          summary?: string | null
          sentiment?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo?: string | null
          price?: number
          rating?: number
          review_count?: number
          features?: string[]
          summary?: string | null
          sentiment?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}