import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import api from "../api/axios";

function Profile() {
    const { user, updateUser } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [edited, setEdited] = useState({
        name:   user?.name   || '',
        email:  user?.email  || '',
        avatar: user?.avatar || null,
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // user.id is the MongoDB _id exposed by the backend
            const { data: updated } = await api.patch(`/users/${user.id}`, {
                name:   edited.name,
                email:  edited.email,
                avatar: edited.avatar,
            });

            const { password: _pw, ...safeUser } = updated;
            updateUser(safeUser);
            setIsEditing(false);
            toast.success("Profile updated");
        } catch (err) {
            toast.error(err.message || "Could not save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setEdited((prev) => ({ ...prev, avatar: reader.result }));
        reader.readAsDataURL(file);
    };

    if (!user) return null;

    const displayAvatar = isEditing ? edited.avatar : user.avatar;

    return (
        <div className="w-full min-h-full p-6 sm:p-10">
            <Toaster />
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold text-white mb-10">Profile</h2>

                <div className="bg-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            {displayAvatar ? (
                                <img
                                    src={displayAvatar}
                                    alt="Avatar"
                                    className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-teal-500 shadow-xl"
                                />
                            ) : (
                                <FaUserCircle className="w-32 h-32 sm:w-48 sm:h-48 text-gray-400" />
                            )}

                            {isEditing && (
                                <label className="absolute bottom-2 right-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl cursor-pointer font-medium transition text-sm">
                                    Change
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 w-full text-center md:text-left">
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={edited.name}
                                        onChange={(e) => setEdited((prev) => ({ ...prev, name: e.target.value }))}
                                        className="text-2xl sm:text-3xl font-bold bg-slate-700 text-white px-5 py-3 rounded-xl mb-4 w-full"
                                        placeholder="Full name"
                                    />
                                    <input
                                        type="email"
                                        value={edited.email}
                                        onChange={(e) => setEdited((prev) => ({ ...prev, email: e.target.value }))}
                                        className="text-lg sm:text-xl text-gray-300 bg-slate-700 px-5 py-3 rounded-xl w-full"
                                        placeholder="Email"
                                    />
                                </>
                            ) : (
                                <>
                                    <h3 className="text-3xl sm:text-4xl font-bold text-white mb-3 break-words">
                                        {user.name}
                                    </h3>
                                    <p className="text-xl sm:text-2xl text-gray-400 break-words">{user.email}</p>
                                    <div className="mt-3">
                                        <span className="badge badge-outline badge-accent text-xs py-2 px-3">
                                            ID: {user.id}
                                        </span>
                                    </div>
                                </>
                            )}

                            <div className="mt-8 sm:mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="bg-teal-600 hover:bg-teal-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition flex items-center gap-2"
                                        >
                                            {saving && <span className="loading loading-spinner loading-sm" />}
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEdited({ name: user.name, email: user.email, avatar: user.avatar });
                                                setIsEditing(false);
                                            }}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEdited({ name: user.name, email: user.email, avatar: user.avatar });
                                            setIsEditing(true);
                                        }}
                                        className="bg-teal-600 hover:bg-teal-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;