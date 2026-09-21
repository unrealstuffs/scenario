import { app } from "./firebase";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
} from "firebase/firestore";

// initializeFirestore вместо getFirestore — позволяет задать настройки кэша.
// persistentLocalCache включает оффлайн-персистентность через IndexedDB.
// persistentMultipleTabManager позволяет работать в нескольких вкладках одновременно.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const scenariosCol = collection(db, "scenarios");
