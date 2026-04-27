import { accountStorage, type PlayerProfile } from "./accountStorage";

export interface CloudSaveSnapshot {
  userId: string;
  email: string;
  playerName: string;
  provider: "google" | "guest";
  completedLevels: Record<number, number>;
  selectedLevel: number;
  lastSeenAt: number;
  updatedAt: number;
  unlockedMaps: string[];
}

const TABLE_NAME = "player_profiles";

function getSupabaseClient(): any | null {
  const anyWindow = window as Window & {
    supabase?: { createClient?: () => any };
    __supabaseClient?: any;
  };
  if (anyWindow.__supabaseClient) return anyWindow.__supabaseClient;
  const client = anyWindow.supabase?.createClient?.();
  if (client) {
    anyWindow.__supabaseClient = client;
    return client;
  }
  return null;
}

function toSnapshot(profile: PlayerProfile, userId: string, email = profile.email): CloudSaveSnapshot {
  return {
    userId,
    email,
    playerName: profile.displayName,
    provider: profile.provider === "guest" ? "guest" : "google",
    completedLevels: profile.completedLevels,
    selectedLevel: profile.selectedLevel,
    lastSeenAt: Date.now(),
    updatedAt: profile.updatedAt,
    unlockedMaps: ["ladder"],
  };
}

function mergeSnapshots(local: CloudSaveSnapshot, remote: CloudSaveSnapshot): CloudSaveSnapshot {
  const mergedCompleted = { ...local.completedLevels };
  for (const [k, v] of Object.entries(remote.completedLevels ?? {})) {
    const key = Number(k);
    const localValue = mergedCompleted[key];
    if (localValue == null || v > localValue) mergedCompleted[key] = v;
  }
  return {
    ...local,
    ...remote,
    completedLevels: mergedCompleted,
    selectedLevel: Math.max(local.selectedLevel, remote.selectedLevel),
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    lastSeenAt: Math.max(local.lastSeenAt, remote.lastSeenAt),
    unlockedMaps: Array.from(new Set([...(local.unlockedMaps ?? []), ...(remote.unlockedMaps ?? [])])),
  };
}

export const cloudSave = {
  async load(userId: string, profile: PlayerProfile): Promise<PlayerProfile> {
    const client = getSupabaseClient();
    if (!client) return profile;
    const { data, error } = await client.from(TABLE_NAME).select("*").eq("user_id", userId).maybeSingle();
    if (error || !data) return profile;
    const cloud: CloudSaveSnapshot = {
      userId: data.user_id,
      email: data.email ?? profile.email,
      playerName: data.player_name ?? profile.displayName,
      provider: data.provider ?? "google",
      completedLevels: data.completed_levels ?? {},
      selectedLevel: data.selected_level ?? 0,
      lastSeenAt: data.last_seen_at ?? Date.now(),
      updatedAt: data.updated_at ?? Date.now(),
      unlockedMaps: data.unlocked_maps ?? ["ladder"],
    };
    const merged = mergeSnapshots(toSnapshot(profile, userId), cloud);
    return {
      ...profile,
      email: merged.email,
      displayName: merged.playerName,
      provider: merged.provider,
      completedLevels: merged.completedLevels,
      selectedLevel: merged.selectedLevel,
      updatedAt: merged.updatedAt,
    };
  },

  async ensure(userId: string, profile: PlayerProfile) {
    const client = getSupabaseClient();
    if (!client) return;
    const snapshot = toSnapshot(profile, userId);
    await client.from(TABLE_NAME).upsert({
      user_id: snapshot.userId,
      email: snapshot.email,
      player_name: snapshot.playerName,
      provider: snapshot.provider,
      completed_levels: snapshot.completedLevels,
      selected_level: snapshot.selectedLevel,
      last_seen_at: snapshot.lastSeenAt,
      updated_at: snapshot.updatedAt,
      unlocked_maps: snapshot.unlockedMaps,
    }, { onConflict: "user_id" });
  },

  async save(userId: string, profile: PlayerProfile) {
    const client = getSupabaseClient();
    if (!client) return;
    const snapshot = toSnapshot(profile, userId);
    await client.from(TABLE_NAME).upsert({
      user_id: snapshot.userId,
      email: snapshot.email,
      player_name: snapshot.playerName,
      provider: snapshot.provider,
      completed_levels: snapshot.completedLevels,
      selected_level: snapshot.selectedLevel,
      last_seen_at: snapshot.lastSeenAt,
      updated_at: snapshot.updatedAt,
      unlocked_maps: snapshot.unlockedMaps,
    }, { onConflict: "user_id" });
  },

  async touch(userId: string, profile: PlayerProfile) {
    const client = getSupabaseClient();
    if (!client) return;
    await this.save(userId, profile);
  },

  async signInWithGoogle() {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase client not available");
    return client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  mergeSnapshots,
};
