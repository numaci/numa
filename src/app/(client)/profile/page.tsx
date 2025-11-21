"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FaUser, FaEnvelope, FaCalendar, FaSignOutAlt, FaEdit, FaCog } from "react-icons/fa";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Cast user to include custom fields
  const user = session && session.user ? session.user as typeof session.user & {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  } : undefined;

  // Ajout pour gestion fournisseur
  const [supplier, setSupplier] = useState<any>(null);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierError, setSupplierError] = useState<string>("");

  // Ajout pour gestion utilisateur custom
  const [customUser, setCustomUser] = useState<any>(null);
  const [customUserLoading, setCustomUserLoading] = useState(false);
  const [customUserError, setCustomUserError] = useState<string>("");

  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    newPassword: "",
    currentPassword: ""
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Historique des commandes
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      // Si pas de session NextAuth, vérifier si supplierId ou userId existe
      const supplierId = typeof window !== "undefined" ? localStorage.getItem("supplierId") : null;
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      if (supplierId) {
        setSupplierLoading(true);
        fetch(`/api/admin/suppliers/${supplierId}`)
          .then(async (res) => {
            if (!res.ok) throw new Error("Fournisseur introuvable");
            return res.json();
          })
          .then((data) => {
            setSupplier(data);
            setSupplierLoading(false);
          })
          .catch((err) => {
            setSupplierError(err.message || "Erreur fournisseur");
            setSupplierLoading(false);
          });
      } else if (userId) {
        setCustomUserLoading(true);
        fetch(`/api/admin/users/${userId}`)
          .then(async (res) => {
            if (!res.ok) throw new Error("Utilisateur introuvable");
            return res.json();
          })
          .then((data) => {
            setCustomUser(data);
            setCustomUserLoading(false);
          })
          .catch((err) => {
            setCustomUserError(err.message || "Erreur utilisateur");
            setCustomUserLoading(false);
          });
      } else {
        router.push("/login");
      }
    }
  }, [status, router]);

  // Charger l'historique des commandes quand l'utilisateur est connecté
  useEffect(() => {
    if (session?.user?.id) {
      setOrdersLoading(true);
      fetch('/api/user/orders')
        .then(async (res) => {
          if (!res.ok) throw new Error('Impossible de charger les commandes');
          return res.json();
        })
        .then((data) => {
          setOrders(Array.isArray(data) ? data : []);
          setOrdersLoading(false);
        })
        .catch((err) => {
          setOrdersError(err.message || 'Erreur lors du chargement des commandes');
          setOrdersLoading(false);
        });
    }
  }, [session?.user?.id]);

  if (status === "loading" || supplierLoading || customUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Affichage profil fournisseur si pas de session NextAuth mais supplierId présent
  if (!session?.user && supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="bg-white/90 rounded-2xl shadow-2xl overflow-hidden">
            {/* En-tête du profil fournisseur */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center shadow-lg">
                  <FaUser className="text-5xl text-amber-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{supplier.name}</h1>
                  <p className="text-amber-100 text-lg">{supplier.phone ? supplier.phone : supplier.email}</p>
                  <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm mt-2 shadow">Fournisseur</span>
                </div>
              </div>
            </div>
            {/* Contenu principal */}
            <div className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Informations personnelles fournisseur */}
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold mb-6">Informations fournisseur</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl shadow">
                      <FaUser className="text-amber-500 text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Nom</p>
                        <p className="font-semibold">{supplier.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl shadow">
                      <FaEnvelope className="text-amber-500 text-xl" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold">{supplier.email}</p>
                      </div>
                    </div>
                    {supplier.phone && (
                      <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl shadow">
                        <FaCalendar className="text-amber-500 text-xl" />
                        <div>
                          <p className="text-sm text-gray-500">Téléphone</p>
                          <p className="font-semibold">{supplier.phone}</p>
                        </div>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl shadow">
                        <FaCog className="text-amber-500 text-xl" />
                        <div>
                          <p className="text-sm text-gray-500">Adresse</p>
                          <p className="font-semibold">{supplier.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button onClick={() => {
                      localStorage.removeItem("supplierId");
                      router.push("/login");
                    }} className="flex items-center gap-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-base shadow-md transition-all duration-200">
                      <FaSignOutAlt />
                      Se déconnecter
                    </Button>
                  </div>
                </div>
                {/* Menu latéral fournisseur */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Actions rapides</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full flex items-center justify-start gap-3 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 rounded-full font-semibold text-base transition-all duration-200" onClick={() => router.push(`/admin/suppliers/${supplier.id}`)}>
                      <FaCog />
                      Espace fournisseur
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Affichage profil utilisateur custom si pas de session NextAuth mais userId présent
  if (!session?.user && customUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50 py-8">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="bg-white/90 rounded-2xl shadow-2xl overflow-hidden">
            {/* En-tête du profil utilisateur */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center shadow-lg">
                  <FaUser className="text-5xl text-amber-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{customUser.firstName} {customUser.lastName}</h1>
                  <p className="text-amber-100 text-lg">{customUser.phone ? customUser.phone : customUser.email}</p>
                  <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm mt-2 shadow">Client</span>
                </div>
              </div>
            </div>
            {/* ... (le reste du code d'origine continue ici) ... */}
          </div>
        </div>
      </div>
    );
  }

  // Affichage profil utilisateur connecté (session NextAuth)
  if (session?.user) {
    // On caste user pour supporter les propriétés personnalisées si elles existent
    const fullName = user?.firstName || user?.lastName
      ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
      : user?.name || '';
    return (
      <div className="min-h-screen bg-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            {/* En-tête du profil utilisateur (noir/blanc) */}
            <div className="bg-white text-black p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300 mx-auto sm:mx-0">
                  <FaUser className="text-3xl text-gray-700" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-black">{fullName}</h1>
                  <p className="text-gray-600 text-sm sm:text-base">{user?.phone ?? user?.email}</p>
                  <span className="admin-status-badge bg-black text-white mt-2">Client connecté</span>
                </div>
              </div>
            </div>
            {/* Contenu principal */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="admin-card p-4 flex items-center gap-3 border border-gray-200">
                  <FaUser className="text-gray-700 text-xl" />
                  <div className="">
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-semibold text-black">{fullName}</p>
                  </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3 border border-gray-200">
                  <FaEnvelope className="text-gray-700 text-xl" />
                  <div className="">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-black">{user?.email}</p>
                  </div>
                </div>
                {user?.phone && (
                  <div className="admin-card p-4 flex items-center gap-3 border border-gray-200">
                    <FaCalendar className="text-gray-700 text-xl" />
                    <div className="">
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-semibold text-black">{user?.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton Modifier et Formulaire d'édition */}
              {!editMode && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-start">
                  <button
                    onClick={() => {
                      setEditForm({
                        firstName: user?.firstName || "",
                        lastName: user?.lastName || "",
                        email: user?.email || "",
                        phone: user?.phone || "",
                        password: "",
                        newPassword: "",
                        currentPassword: ""
                      });
                      setEditMode(true);
                    }}
                    className="admin-button admin-button-primary w-full sm:w-auto flex items-center gap-2"
                  >
                    <FaEdit />
                    Modifier mes informations
                  </button>
                </div>
              )}
              {editMode && (
                <form
                  className="mt-6 space-y-4 bg-white p-4 sm:p-6 rounded-xl border border-gray-200"

                  onSubmit={async (e) => {
                    e.preventDefault();
                    setEditLoading(true);
                    setEditError("");
                    setEditSuccess("");
                    try {
                      const res = await fetch("/api/profile/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          firstName: editForm.firstName,
                          lastName: editForm.lastName,
                          email: editForm.email,
                          phone: editForm.phone,
                          newPassword: editForm.newPassword,
                          currentPassword: editForm.currentPassword
                        })
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setEditError(data.error || "Erreur lors de la mise à jour.");
                      } else {
                        setEditSuccess("Informations mises à jour !");
                        setEditMode(false);
                        router.refresh?.();
                      }
                    } catch (err: any) {
                      setEditError("Erreur technique : " + (err?.message || String(err)));
                    } finally {
                      setEditLoading(false);
                    }
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Prénom</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                        className="admin-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Nom</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                        className="admin-input"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                        className="admin-input"
                        required
                      />

                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Téléphone</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                        className="admin-input"
                      />

                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-gray-700">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={editForm.newPassword}
                        onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                        className="admin-input"
                        placeholder="Laisser vide pour ne pas changer"
                      />

                    </div>
                    {(editForm.email !== user?.email || editForm.newPassword) && (
                      <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Mot de passe actuel <span className="text-red-500">*</span></label>
                        <input
                          type="password"
                          value={editForm.currentPassword}
                          onChange={e => setEditForm(f => ({ ...f, currentPassword: e.target.value }))}
                          className="admin-input"
                          required
                        />

                      </div>
                    )}
                  </div>
                  {editError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mt-4">{editError}</div>}
                  {editSuccess && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mt-4">{editSuccess}</div>}
                  <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-center sm:justify-start">
                    <button type="submit" disabled={editLoading} className="admin-button admin-button-primary w-full sm:w-auto">
                      {editLoading ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button type="button" onClick={() => setEditMode(false)} className="admin-button admin-button-secondary w-full sm:w-auto">
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-4 flex-wrap items-center justify-center sm:justify-start">
                <button onClick={() => signOut({ callbackUrl: "/login" })} className="admin-button admin-button-danger w-full sm:w-auto flex items-center gap-2">
                  <FaSignOutAlt />
                  Se déconnecter
                </button>
                {/* Bouton admin ou fournisseur selon le rôle */}
                {user?.role === "admin" && (
                  <Link href="/admin/dashboard">
                    <button className="admin-button admin-button-primary w-full sm:w-auto flex items-center gap-2">
                      <FaCog />
                      Accéder à l'admin
                    </button>
                  </Link>
                )}
                {user?.role === "supplier" && (
                  <Link href="/supplier/dashboard">
                    <button className="admin-button admin-button-secondary w-full sm:w-auto flex items-center gap-2">
                      <FaCog />
                      Espace fournisseur
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Historique des commandes */}
        <div className="max-w-4xl mx-auto px-4 mt-8 mb-24">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-white text-black p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Historique des commandes</h2>
              <p className="text-gray-600 text-sm">Vos dernières commandes passées sur le site.</p>
            </div>
            <div className="p-6">
              {ordersLoading && (
                <div className="text-gray-600">Chargement...</div>
              )}
              {ordersError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{ordersError}</div>
              )}
              {!ordersLoading && !ordersError && orders.length === 0 && (
                <div className="text-gray-600">Aucune commande pour le moment.</div>
              )}
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const itemsCount = order?.orderItems?.reduce?.((acc: number, it: any) => acc + Number(it.quantity || 0), 0) ?? 0;
                  return (
                    <div key={order.id} className="admin-card p-4 border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="text-sm text-gray-500">Commande</div>
                          <div className="font-semibold text-black">{order.orderNumber}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Date</div>
                          <div className="font-semibold text-black">{new Date(order.createdAt).toLocaleString('fr-FR')}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total</div>
                          <div className="font-semibold text-black">{Number(order.total || 0).toLocaleString('fr-FR')} FCFA</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Articles</div>
                          <div className="font-semibold text-black">{itemsCount}</div>
                        </div>
                      </div>
                      {order?.orderItems?.length ? (
                        <div className="mt-4 border-t border-gray-200 pt-3 text-sm text-gray-700 space-y-1">
                          {order.orderItems.map((it: any) => (
                            <div key={it.id} className="flex justify-between">
                              <span className="truncate pr-2">{it.name} {it.sku ? `(SKU: ${it.sku})` : ''}</span>
                              <span className="whitespace-nowrap">{it.quantity} × {Number(it.price || 0).toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky bottom mobile bar removed as requested */}
        {/* Bouton sticky bas pour accéder à l'admin si admin (mobile) */}
        {user?.role === "admin" && (
          <div className="fixed bottom-16 left-0 right-0 z-50 bg-white border-t border-gray-200 flex sm:hidden justify-center py-2 shadow-lg">
            <Link href="/admin/dashboard">
              <button className="admin-button admin-button-primary flex-1 mx-4">
                Accéder à l'administration
              </button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Si aucun cas ne correspond, on affiche rien ou un fallback
  return null;
}