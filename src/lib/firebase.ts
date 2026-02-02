import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const getDb = (config?: any) => {
    // Si se proporciona una configuración, intentamos inicializar con ella
    if (config && config.apiKey && config.apiKey !== 'YOUR_API_KEY') {
        const apps = getApps();
        if (apps.length > 0) {
            return getFirestore(apps[0]);
        }
        const app = initializeApp(config);
        return getFirestore(app);
    }

    // Fallback a la configuración de variables de entorno
    if (getApps().length > 0) {
        return getFirestore(getApp());
    }

    const app = initializeApp({
        apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
        authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
    });

    return getFirestore(app);
};
