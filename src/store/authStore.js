import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('fetchProfile error:', error)
        set({ profile: null })
        return null
      }

      set({ profile: data })
      return data
    } catch (err) {
      console.error('fetchProfile catch:', err)
      set({ profile: null })
      return null
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  }
}))