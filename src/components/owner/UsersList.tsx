import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useApp } from '../../context/AppContext';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: string;
}

export const UsersList: React.FC = () => {
  const { showToast } = useApp();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        setUsers(
          snapshot.docs.map((d) => ({
            uid: d.id,
            ...(d.data() as Omit<UserProfile, 'uid'>),
          }))
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
        showToast('No se pudo cargar la lista de usuarios.');
      }
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePromote = (user: UserProfile) => {
    if (!db) return;
    const name = user.displayName || user.email || user.uid;
    void updateDoc(doc(db, 'users', user.uid), { role: 'owner' })
      .then(() => showToast(`${name} ahora es Dueño`))
      .catch(() => showToast('Error al actualizar el rol. Intentá de nuevo.'));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
        <span className="w-8 h-8 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin inline-block" />
        <p className="text-xs text-gray-500 font-medium mt-3">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-base font-bold text-[#111c2d]">
            Equipo del Complejo
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Promové cuentas para que administren los complejos de Canchazo.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-bold">
          {users.length} usuarios
        </span>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          Todavía no hay usuarios registrados.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {users.map((user) => {
            const isOwner = user.role === 'owner';
            const name = user.displayName || 'Usuario';
            return (
              <li key={user.uid} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center justify-center font-headline font-bold text-sm shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#111c2d] truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                      isOwner
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isOwner ? 'Dueño' : 'Jugador'}
                  </span>
                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() => handlePromote(user)}
                      className="px-3 py-1.5 rounded-full bg-[#10b981] hover:bg-[#0e9f6f] text-white text-xs font-bold transition-all active:scale-95"
                    >
                      Promover a Dueño
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
