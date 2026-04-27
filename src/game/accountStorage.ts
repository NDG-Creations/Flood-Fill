export interface PlayerProfile {
  email: string;
  displayName: string;
  provider: "google" | "facebook" | "instagram" | "guest";
  completedLevels: Record<number, number>;
  selectedLevel: number;
  updatedAt: number;
}

const PROFILE_PREFIX = "flood-fill-profile:";
const ACTIVE_PROFILE_KEY = "flood-fill-active-profile";

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const accountStorage = {
  saveProfile(profile: PlayerProfile) {
    localStorage.setItem(`${PROFILE_PREFIX}${profile.email}`, JSON.stringify(profile));
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.email);
  },

  loadProfile(email: string): PlayerProfile | null {
    return safeParse<PlayerProfile>(localStorage.getItem(`${PROFILE_PREFIX}${email}`));
  },

  loadActiveProfileEmail(): string | null {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  },

  setActiveProfileEmail(email: string) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, email);
  },

  clearActiveProfileEmail() {
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  },

  buildGuestProfile(): PlayerProfile {
    return {
      email: "guest@local",
      displayName: "Guest",
      provider: "guest",
      completedLevels: {},
      selectedLevel: 0,
      updatedAt: Date.now(),
    };
  },

  mergeProfiles(localProfile: PlayerProfile, remoteProfile: PlayerProfile): PlayerProfile {
    const mergedCompleted = { ...localProfile.completedLevels };
    for (const [k, v] of Object.entries(remoteProfile.completedLevels)) {
      const key = Number(k);
      const localValue = mergedCompleted[key];
      if (localValue == null || v > localValue) mergedCompleted[key] = v;
    }
    return {
      ...localProfile,
      ...remoteProfile,
      completedLevels: mergedCompleted,
      selectedLevel: Math.max(localProfile.selectedLevel, remoteProfile.selectedLevel),
      updatedAt: Math.max(localProfile.updatedAt, remoteProfile.updatedAt),
    };
  },
};
