import { accountStorage, type PlayerProfile } from "./accountStorage";
import { cloudSave } from "./cloudSave";

export interface AuthSessionState {
  userId: string;
  email: string;
  provider: "google" | "guest";
  profile: PlayerProfile;
}

function getSupabaseClient(): any | null {
  const anyWindow = window as Window & { supabase?: { createClient?: () => any }; __supabaseClient?: any };
  if (anyWindow.__supabaseClient) return anyWindow.__supabaseClient;
  const client = anyWindow.supabase?.createClient?.();
  if (client) anyWindow.__supabaseClient = client;
  return client ?? null;
}

export const supabaseAuth = {
  getClient() {
    return getSupabaseClient();
  },

  async init(): Promise<AuthSessionState | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = await client.auth.getUser();
    const user = data?.user;
    if (!user) return null;
    const email = user.email ?? "";
    const baseProfile: PlayerProfile = {
      email,
      displayName: email.split("@")[0] || "Player",
      provider: "google",
      completedLevels: {},
      selectedLevel: 0,
      updatedAt: Date.now(),
    };
    const restored = await cloudSave.load(user.id, baseProfile);
    await cloudSave.ensure(user.id, restored);
    accountStorage.setActiveProfileEmail(email);
    accountStorage.saveProfile(restored);
    return { userId: user.id, email, provider: "google", profile: restored };
  },

  async signInWithGoogle() {
    await cloudSave.signInWithGoogle();
  },
};
