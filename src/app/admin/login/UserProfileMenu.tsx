import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";

interface UserProfileMenuProps {
  open: boolean;
  onClose: () => void;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ open, onClose }) => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!open) return null;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/admin/login");
  };

  return (
    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fade-in transition-all">
      {/* Profil */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow">
          {session?.user?.image ? (
            <Image src={session.user.image} alt="avatar" fill className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500">
              {session?.user?.firstName?.[0] || "A"}
            </div>
          )}
        </div>
        <div>
          <div className="font-bold text-lg text-gray-900 leading-tight">
            {session?.user?.firstName} {session?.user?.lastName}
          </div>
          <div className="text-gray-500 text-sm mt-1">{session?.user?.email}</div>
        </div>
      </div>
      {/* Options */}
      <div className="divide-y divide-gray-100">
        <button
          className="w-full text-left px-6 py-4 hover:bg-gray-50 text-gray-900 font-medium text-base transition"
          onClick={() => {
            onClose();
            setTimeout(() => router.push("/admin/users/profile/edit"), 100);
          }}
        >
          Modifier le profil
        </button>
        <button
          className="w-full text-left px-6 py-4 hover:bg-gray-50 text-gray-900 font-medium text-base transition"
          onClick={() => {
            onClose();
            router.push("/admin/users/profile/change-avatar");
          }}
        >
          Changer la photo de profil
        </button>
      </div>
      <button
        className="w-full text-left px-6 py-4 hover:bg-red-50 text-red-600 font-semibold border-t border-gray-100 transition"
        onClick={handleSignOut}
      >
        Déconnexion
      </button>
    </div>
  );
};

export default UserProfileMenu; 