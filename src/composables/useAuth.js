import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (!error && data) profile.value = data
  }

  // ─── Init once ────────────────────────────────────────────
  supabase.auth.getSession().then(({ data }) => {
    user.value = data.session?.user ?? null
    if (user.value) fetchProfile(user.value.id)
    loading.value = false
  })

  // ─── Listen for changes ───────────────────────────────────
  supabase.auth.onAuthStateChange((_event, session) => {
    const newUser = session?.user ?? null

    // Only update if user actually changed to prevent infinite loop
    if (newUser?.id !== user.value?.id) {
      user.value = newUser
      if (newUser) fetchProfile(newUser.id)
      else profile.value = null
    }
  })

  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password })
    return error
  }

  async function verifyOtp(email, token) {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
    return error
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return error
  }

  async function updateUsername(username) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.value.id)
      .maybeSingle()

    let error
    if (existing) {
      const { error: e } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', user.value.id)
      error = e
    } else {
      const { error: e } = await supabase
        .from('profiles')
        .insert({ id: user.value.id, username, email: user.value.email })
      error = e
    }

    if (!error) profile.value = { ...profile.value, username }
    return error
  }

  async function deleteAccount() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const text = await response.text()
      console.error('Delete account error:', text)
      return
    }

    await supabase.auth.signOut()
  }

  return {
    user, profile, loading,
    signUp, verifyOtp, signIn, signOut,
    updatePassword, updateUsername, deleteAccount
  }
}