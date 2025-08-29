import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'Toptancı' | 'Alıcı'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'Toptancı' | 'Alıcı'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'Toptancı' | 'Alıcı'
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          stock: number
          image_url: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          stock: number
          image_url: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          stock?: number
          image_url?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          product_id: string
          buyer_id: string
          seller_id: string
          quantity: number
          status: 'Beklemede' | 'Hazırlanıyor' | 'Teslim Edildi'
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          buyer_id: string
          seller_id: string
          quantity: number
          status?: 'Beklemede' | 'Hazırlanıyor' | 'Teslim Edildi'
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          buyer_id?: string
          seller_id?: string
          quantity?: number
          status?: 'Beklemede' | 'Hazırlanıyor' | 'Teslim Edildi'
          created_at?: string
        }
      }
    }
  }
}