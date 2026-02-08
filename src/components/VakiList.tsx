import React, { useState, useEffect } from 'react';
import { getDb } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import type { VakiItem } from '../types';

interface Props {
    vakiId: string;
    firebaseConfig?: any;
}

export const VakiList: React.FC<Props> = ({ vakiId, firebaseConfig }) => {
    const [items, setItems] = useState<VakiItem[]>([]);
    const [newItem, setNewItem] = useState('');
    const [nickname, setNickname] = useState<string | null>(null);
    const [isCopying, setIsCopying] = useState(false);

    // Inicializamos la base de datos con la config que venga (Runtime o Build-time)
    const db = getDb(firebaseConfig);

    useEffect(() => {
        // Nickname logic
        const savedNickname = localStorage.getItem('vaki_nickname');
        if (!savedNickname) {
            const name = prompt('¿Cuál es tu nickname?') || `Usuario_${Math.floor(Math.random() * 1000)}`;
            localStorage.setItem('vaki_nickname', name);
            setNickname(name);
        } else {
            setNickname(savedNickname);
        }

        // Firestore Real-time listener
        const itemsRef = collection(db, 'vakis', vakiId, 'items');
        // Simplificamos la query para evitar problemas de índices o campos faltantes
        // Ordenamos en el cliente. Usamos allow read: if true en las reglas para que no falle.
        const q = query(itemsRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as VakiItem[];

            // Ordenamiento Cliente (descendente por fecha de creación)
            fetchedItems.sort((a, b) => {
                const dateA = a.createdAt ? (a.createdAt as any).seconds : 0;
                const dateB = b.createdAt ? (b.createdAt as any).seconds : 0;
                return dateB - dateA;
            });

            console.log("Vaki Debug - Fetched items:", fetchedItems);
            setItems(fetchedItems);
        }, (error) => {
            console.error("Vaki Error - Snapshot listener failed:", error);
        });

        return () => unsubscribe();
    }, [vakiId]);

    const addItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const valueToSave = newItem.trim();
        if (!valueToSave || !nickname) return;

        try {
            // Limpiamos el input inmediatamente para una sensación más fluida
            setNewItem('');

            const itemsRef = collection(db, 'vakis', vakiId, 'items');
            const now = new Date();
            // Usamos 23h 55m para evitar problemas de sincronización de reloj con las reglas de Firebase
            const expiresAt = new Date(now.getTime() + (23 * 60 + 55) * 60 * 1000);

            await addDoc(itemsRef, {
                name: valueToSave,
                addedBy: nickname,
                bought: false,
                createdAt: serverTimestamp(),
                expiresAt: expiresAt
            });
        } catch (error) {
            console.error("Error adding document: ", error);
            // Si falla, devolvemos el texto para que el usuario no tenga que reescribirlo
            setNewItem(valueToSave);
        }
    };

    const toggleBought = async (item: VakiItem) => {
        if (!nickname) return;
        const itemRef = doc(db, 'vakis', vakiId, 'items', item.id);
        await updateDoc(itemRef, {
            bought: !item.bought,
            boughtBy: !item.bought ? nickname : null
        });
    };

    const deleteItem = async (e: React.MouseEvent, itemId: string) => {
        e.stopPropagation();
        if (!confirm('¿Seguro que quieres borrar este producto?')) return;
        const itemRef = doc(db, 'vakis', vakiId, 'items', itemId);
        await deleteDoc(itemRef);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
    };

    const now = new Date();
    const activeItems = items.filter(item => {
        if (!item.expiresAt) return true; // Legacy items without expiresAt
        const expiryDate = (item.expiresAt as any).toDate ? (item.expiresAt as any).toDate() : new Date(item.expiresAt as any);
        return expiryDate > now;
    });

    const pendingItems = activeItems.filter(i => !i.bought);
    const boughtItems = activeItems.filter(i => i.bought);

    return (
        <>
            {/* Header Section */}
            <header className="flex items-center justify-between py-8">
                <div className="flex items-center gap-2">
                    <div className="size-6 text-slate-900 dark:text-white">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => window.location.href = '/'}>Vaki</h1>
                </div>
                <button
                    onClick={copyLink}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-lg">{isCopying ? 'check' : 'link'}</span>
                    <span>{isCopying ? '¡Copiado!' : 'Compartir'}</span>
                </button>
            </header>

            {/* Input Section */}
            <div className="mb-10">
                <form onSubmit={addItem} className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 text-base py-3 px-4 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
                        placeholder="Ej. Carbón, Bebidas..."
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="bg-emerald-accent hover:bg-emerald-600 text-white size-12 flex items-center justify-center rounded-lg transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined font-bold">add</span>
                    </button>
                </form>
            </div>

            {/* Pending Items Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pendientes</h3>
                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                        {pendingItems.length}
                    </span>
                </div>
                <div className="space-y-3">
                    {pendingItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => toggleBought(item)}
                            className="item-card-hover flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-xl shadow-sm transition-all group cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        readOnly
                                        checked={false}
                                        className="checkbox-custom appearance-none size-6 rounded border-2 border-slate-200 dark:border-slate-600 checked:bg-emerald-accent checked:border-emerald-accent focus:ring-0 transition-all cursor-pointer"
                                        type="checkbox"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[15px] font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">Agregado por {item.addedBy}</p>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => deleteItem(e, item.id)}
                                    className="text-slate-300 hover:text-red-400 p-1"
                                >
                                    <span className="material-symbols-outlined text-xl">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    {pendingItems.length === 0 && (
                        <div className="text-center py-4">
                            <p className="text-slate-400 text-sm italic italic_test">No hay productos pendientes</p>
                            {(items.length - activeItems.length) > 0 && (
                                <p className="text-slate-400/60 text-xs mt-2">
                                    ({items.length - activeItems.length} items ocultos por antigüedad &gt; 24h)
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Completed Items Section */}
            {boughtItems.length > 0 && (
                <section className="opacity-50">
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completados</h3>
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">
                            {boughtItems.length}
                        </span>
                    </div>
                    <div className="space-y-3">
                        {boughtItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleBought(item)}
                                className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 p-4 rounded-xl cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            readOnly
                                            checked={true}
                                            className="checkbox-custom appearance-none size-6 rounded border-2 border-emerald-accent bg-emerald-accent focus:ring-0 transition-all"
                                            type="checkbox"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 line-through">{item.name}</p>
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Agregado por {item.addedBy} • Marcado por {item.boughtBy}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => deleteItem(e, item.id)}
                                        className="text-slate-300 hover:text-red-400 p-1 mr-1"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                    <span className="material-symbols-outlined text-emerald-accent/60">check_circle</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer Info */}
            <footer className="mt-20 pb-10 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-600 font-medium tracking-wide">
                    Lista compartida como <span className="text-primary font-bold">{nickname}</span> • Sincronizado en tiempo real
                </p>
            </footer>
        </>
    );
};
