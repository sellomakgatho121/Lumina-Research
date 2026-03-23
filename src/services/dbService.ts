import { SavedSearch } from "../types";

const getStorageKey = (userId: string) => `lumina_searches_${userId}`;

export const syncSearchesToFirestore = async (userId: string, searches: SavedSearch[]) => {
    // Left empty to maintain signature compatibility
};

export const saveSearchToDb = async (userId: string, search: SavedSearch) => {
    try {
        const key = getStorageKey(userId);
        const existingRaw = localStorage.getItem(key);
        const existing: SavedSearch[] = existingRaw ? JSON.parse(existingRaw) : [];
        
        // Remove if exists, then prepend
        const filtered = existing.filter(s => s.id !== search.id);
        const updated = [search, ...filtered];
        
        localStorage.setItem(key, JSON.stringify(updated.slice(0, 50))); // Keep last 50
    } catch (error) {
        console.error("Error saving search to local storage:", error);
    }
}

export const loadSearchesFromDb = async (userId: string): Promise<SavedSearch[]> => {
    try {
        const key = getStorageKey(userId);
        const existingRaw = localStorage.getItem(key);
        if (existingRaw) {
            return JSON.parse(existingRaw) as SavedSearch[];
        }
        return [];
    } catch (error) {
        console.error("Error loading searches from local storage:", error);
        return [];
    }
}

export const deleteSearchFromDb = async (userId: string, searchId: string) => {
    try {
        const key = getStorageKey(userId);
        const existingRaw = localStorage.getItem(key);
        if (existingRaw) {
            const existing: SavedSearch[] = JSON.parse(existingRaw);
            const filtered = existing.filter(s => s.id !== searchId);
            localStorage.setItem(key, JSON.stringify(filtered));
        }
    } catch (error) {
        console.error("Error deleting search from local storage:", error);
    }
}
