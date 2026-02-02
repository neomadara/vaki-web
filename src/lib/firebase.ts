import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const getDb = (config?: any) => {
    // Si ya hay una app inicializada, la usamos
    const app = getApps().length > 0
        ? getApp()
        : initializeApp(config || {
            apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
            authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
        });

    return getFirestore(app);
};

// Exportamos una instancia por defecto (para desarrollo local)
export const db = getDb();
