import { collection, doc, setDoc, deleteDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SavedSearch } from "../types";

export const syncSearchesToFirestore = async (userId: string, searches: SavedSearch[]) => {
    try {
        // Sync the latest searches batch (limit what to write to save quota if needed, 
        // but for simplicity we write the ones being saved)
        // Since useResearch handles the state Array, we can provide a method to save individual searches.
        // It's better to provide a saveSearchToDb instead of bulk sync every time.
    } catch (e) {
        console.error("Firestore Bulk Sync Error:", e);
    }
};

export const saveSearchToDb = async (userId: string, search: SavedSearch) => {
    try {
        const searchRef = doc(db, "users", userId, "searches", search.id);
        await setDoc(searchRef, search);
    } catch (error) {
        console.error("Error saving search to Firestore:", error);
    }
}

export const loadSearchesFromDb = async (userId: string): Promise<SavedSearch[]> => {
    try {
        const searchesRef = collection(db, "users", userId, "searches");
        // Get the latest 50 searches
        const q = query(searchesRef, orderBy("timestamp", "desc"), limit(50));
        const snapshot = await getDocs(q);
        
        const searches: SavedSearch[] = [];
        snapshot.forEach((doc) => {
            searches.push(doc.data() as SavedSearch);
        });
        
        return searches;
    } catch (error) {
        console.error("Error fetching searches from Firestore:", error);
        return [];
    }
}

export const deleteSearchFromDb = async (userId: string, searchId: string) => {
    try {
        const searchRef = doc(db, "users", userId, "searches", searchId);
        await deleteDoc(searchRef);
    } catch (error) {
        console.error("Error deleting search from Firestore:", error);
    }
}
