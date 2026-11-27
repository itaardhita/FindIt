import { createContext, useContext } from 'react'
import type { Profile } from './supabase'
export type Notif = { id: string; type: 'claim' | 'message' | 'handover'; title: string; body: string; link: string | null; read: boolean; dismissed?: boolean; created_at: string }
export type AppState = {
  uid: string; me: Profile | null; reloadMe: () => void
  blocked: Set<string>; toggleBlock: (id: string) => Promise<void>
  saved: Set<string>; toggleSave: (id: string) => void
notifs: Notif[]
markRead: (ids: string[]) => void
clearNotifications: () => Promise<void>
  dark: boolean; toggleDark: () => void
}
export const Ctx = createContext<AppState>(null as never)
export const useApp = () => useContext(Ctx)
