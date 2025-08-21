import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Function ---
const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

// --- KOMPONEN UI ---

const ResponseDisplay = ({ data }) => (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 border-b border-gray-600 pb-2">Respons dari Server</h2>
        <pre className="text-sm bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto whitespace-pre-wrap break-all">
            <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
    </div>
);

const UserList = ({ users }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-2xl font-semibold">Daftar Pengguna</h2>
        </div>
        <div className="mt-4 max-h-[500px] overflow-y-auto bg-gray-50 p-4 rounded-lg">
            {users.length > 0 ? (
                users.map(user => (
                    <div key={user.id} className="p-3 border-b border-gray-200">
                        <p className="font-bold">@{user.username}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">Tidak ada pengguna yang cocok atau belum ada data.</p>
            )}
        </div>
    </div>
);

const UserForm = ({ title, fields, buttonText, buttonClass, onSubmit, initialData = {} }) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [JSON.stringify(initialData)]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        if (!Object.keys(initialData).length) {
            e.target.reset();
            setFormData({});
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{title}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map(field => (
                    <input
                        key={field.name}
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        className={`w-full p-3 border rounded-lg focus:ring-2 ${field.focusRingClass}`}
                        onChange={handleChange}
                        required={field.required}
                        value={formData[field.name] || ''}
                    />
                ))}
                <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg transition duration-300 ${buttonClass}`}>
                    {buttonText}
                </button>
            </form>
        </div>
    );
};

// --- KOMPONEN FITUR ---

const QueryForm = ({ onQuery }) => {
    const [params, setParams] = useState({ search: '', sortBy: 'id', sortOrder: 'asc' });

    const handleChange = (e) => {
        setParams({ ...params, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onQuery(params);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Filter & Urutkan Pengguna</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="search"
                    placeholder="Cari berdasarkan nama/username/email"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    onChange={handleChange}
                />
                <div className="grid grid-cols-2 gap-4">
                    <select name="sortBy" onChange={handleChange} className="w-full p-3 border rounded-lg">
                        <option value="id">Urutkan berdasarkan ID</option>
                        <option value="fullname">Nama Lengkap</option>
                        <option value="username">Username</option>
                    </select>
                    <select name="sortOrder" onChange={handleChange} className="w-full p-3 border rounded-lg">
                        <option value="asc">Menaik (ASC)</option>
                        <option value="desc">Menurun (DESC)</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition duration-300">
                    Terapkan
                </button>
            </form>
        </div>
    );
};

const UpdateUserSection = ({ onUpdate, token }) => {
    const [userToUpdate, setUserToUpdate] = useState(null);
    const [usernameToFind, setUsernameToFind] = useState('');
    const [error, setError] = useState('');
    const API_BASE_URL = 'http://localhost:3000';

    const handleFindUser = async (e) => {
        e.preventDefault();
        setError('');
        if (!usernameToFind) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/${usernameToFind}`);
            const data = await res.json();
            if (res.ok) {
                setUserToUpdate(data);
            } else {
                setUserToUpdate(null);
                setError(data.message || 'Pengguna tidak ditemukan.');
            }
        } catch (err) {
            setError('Gagal terhubung ke server.');
        }
    };
    
    const handleCancel = () => {
        setUserToUpdate(null);
        setUsernameToFind('');
        setError('');
    }

    if (userToUpdate) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <UserForm
                    title={`Perbarui Data: ${userToUpdate.username}`}
                    fields={[
                        { name: 'fullname', type: 'text', placeholder: 'Nama Lengkap Baru', focusRingClass: 'focus:ring-indigo-500' },
                        { name: 'username', type: 'text', placeholder: 'Username Baru', focusRingClass: 'focus:ring-indigo-500' },
                        { name: 'email', type: 'email', placeholder: 'Email Baru', focusRingClass: 'focus:ring-indigo-500' },
                    ]}
                    buttonText="Simpan Perubahan"
                    buttonClass="bg-indigo-600 hover:bg-indigo-700"
                    initialData={{ fullname: userToUpdate.fullname, username: userToUpdate.username, email: userToUpdate.email }}
                    onSubmit={(data) => {
                        onUpdate(userToUpdate.id, data, token);
                        handleCancel();
                    }}
                />
                <button onClick={handleCancel} className="w-full mt-2 bg-gray-500 text-white font-bold py-2 rounded-lg hover:bg-gray-600">Batal</button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Perbarui Pengguna</h2>
            <form onSubmit={handleFindUser} className="space-y-4">
                <p className="text-sm text-gray-600">Cari pengguna berdasarkan username.</p>
                <input
                    type="text"
                    placeholder="Ketik username untuk dicari"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => setUsernameToFind(e.target.value)}
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
                    Cari Pengguna
                </button>
            </form>
        </div>
    );
};

const DeleteUserSection = ({ onDelete, token }) => {
    const [userToDelete, setUserToDelete] = useState(null);
    const [usernameToFind, setUsernameToFind] = useState('');
    const [error, setError] = useState('');
    const API_BASE_URL = 'http://localhost:3000';

    const handleFindUser = async (e) => {
        e.preventDefault();
        setError('');
        if (!usernameToFind) return;
        try {
            const res = await fetch(`${API_BASE_URL}/users/${usernameToFind}`);
            const data = await res.json();
            if (res.ok) {
                setUserToDelete(data);
            } else {
                setUserToDelete(null);
                setError(data.message || 'Pengguna tidak ditemukan.');
            }
        } catch (err) {
            setError('Gagal terhubung ke server.');
        }
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDelete(userToDelete.username, token);
            setUserToDelete(null);
            setUsernameToFind('');
        }
    };
    
    const handleCancel = () => {
        setUserToDelete(null);
        setUsernameToFind('');
        setError('');
    }

    if (userToDelete) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Hapus Pengguna</h2>
                <p className="text-sm text-gray-600 mb-4">Anda yakin ingin menghapus pengguna ini?</p>
                <div className="bg-red-50 p-4 rounded-lg space-y-1 text-gray-800">
                    <p><strong>ID:</strong> {userToDelete.id}</p>
                    <p><strong>Nama:</strong> {userToDelete.fullname}</p>
                    <p><strong>Username:</strong> {userToDelete.username}</p>
                </div>
                <div className="flex gap-4 mt-4">
                    <button onClick={handleCancel} className="w-full bg-gray-500 text-white font-bold py-2 rounded-lg hover:bg-gray-600">Batal</button>
                    <button onClick={handleConfirmDelete} className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700">Ya, Hapus</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Hapus Pengguna</h2>
            <form onSubmit={handleFindUser} className="space-y-4">
                <p className="text-sm text-gray-600">Cari pengguna berdasarkan username untuk dihapus.</p>
                <input
                    type="text"
                    placeholder="Ketik username untuk dicari"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                    onChange={(e) => setUsernameToFind(e.target.value)}
                    required
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700">
                    Cari Pengguna
                </button>
            </form>
        </div>
    );
};

const LoginPage = ({ onLoginSuccess, setResponse }) => {
    const [error, setError] = useState('');
    const API_BASE_URL = 'http://localhost:3000';

    const handleLogin = async (formData) => {
        setError('');
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            setResponse(data);
            if (res.ok) {
                onLoginSuccess(data.token);
            } else {
                setError(data.message || 'Login gagal.');
            }
        } catch (err) {
            setError('Gagal terhubung ke server.');
            setResponse({ message: 'Error koneksi', error: err.message });
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <UserForm
                title="Login"
                fields={[
                    { name: 'username', type: 'text', placeholder: 'username', focusRingClass: 'focus:ring-green-500', required: true },
                    { name: 'password', type: 'password', placeholder: 'Password', focusRingClass: 'focus:ring-green-500', required: true },
                ]}
                buttonText="Login"
                buttonClass="bg-green-600 hover:bg-green-700"
                onSubmit={handleLogin}
            />
            {error && <p className="text-center text-red-500 mt-4">{error}</p>}
        </div>
    );
};

const UserProfileCard = ({ user, onLogout }) => (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <img 
            className="h-24 w-24 rounded-full mx-auto ring-4 ring-indigo-300" 
            src={`https://placehold.co/100x100/E2E8F0/4A5568?text=${user.username.charAt(0).toUpperCase()}`} 
            alt="Foto Profil" 
        />
        <h2 className="text-2xl font-bold text-gray-900 mt-4">Selamat Datang!</h2>
        <p className="text-lg text-gray-600">@{user.username}</p>
        <button 
            onClick={onLogout} 
            className="w-full mt-4 bg-red-500 text-white font-bold py-2 rounded-lg hover:bg-red-600 transition"
        >
            Logout
        </button>
    </div>
);

// --- KOMPONEN UTAMA ---

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [response, setResponse] = useState({ pesan: "Hasil dari permintaan API akan ditampilkan di sini." });
    const [queryParams, setQueryParams] = useState({});
    const API_BASE_URL = 'http://localhost:3000';

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            setLoggedInUser(parseJwt(storedToken));
        }
    }, []);

    const fetchAllUsers = useCallback(async () => {
        const params = new URLSearchParams(queryParams).toString();
        try {
            const res = await fetch(`${API_BASE_URL}/users?${params}`);
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                setUsers([]);
                setResponse(data);
            }
        } catch (error) {
            setResponse({ message: 'Error koneksi', error: error.message });
        }
    }, [queryParams]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleApiCall = async (endpoint, method, body = null, authToken = null) => {
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            const options = { method, headers };
            if (body) options.body = JSON.stringify(body);
            
            const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const data = await res.json();
            setResponse(data);
            if (res.ok) {
                fetchAllUsers();
            }
        } catch (error) {
            setResponse({ message: 'Error koneksi', error: error.message });
        }
    };

    const handleLoginSuccess = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setLoggedInUser(parseJwt(newToken));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setLoggedInUser(null);
    };

    const handleRegister = (data) => handleApiCall('/register', 'POST', data);
    const handleUpdate = (id, data, authToken) => handleApiCall(`/users/${id}`, 'PUT', data, authToken);
    const handleDelete = (username, authToken) => handleApiCall(`/users/${username}`, 'DELETE', null, authToken);
    const handleQuery = (params) => setQueryParams(params);

    return (
        <div className="bg-gray-100 text-gray-800 min-h-screen font-sans">
            <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-gray-900">Dashboard Uji Coba API (React)</h1>
                    <p className="text-lg text-gray-600 mt-2">Antarmuka untuk berinteraksi dengan backend Express.js Anda.</p>
                </header>
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- KOLOM KIRI --- */}
                    <div className="lg:col-span-1 space-y-8">
                        {loggedInUser ? (
                            <UserProfileCard user={loggedInUser} onLogout={handleLogout} />
                        ) : (
                            <LoginPage onLoginSuccess={handleLoginSuccess} setResponse={setResponse} />
                        )}
                        <UserForm
                            title="Registrasi Pengguna"
                            fields={[
                                { name: 'fullname', type: 'text', placeholder: 'Nama Lengkap', focusRingClass: 'focus:ring-blue-500', required: true },
                                { name: 'username', type: 'text', placeholder: 'Username', focusRingClass: 'focus:ring-blue-500', required: true },
                                { name: 'email', type: 'email', placeholder: 'Email', focusRingClass: 'focus:ring-blue-500', required: true },
                                { name: 'password', type: 'password', placeholder: 'Password', focusRingClass: 'focus:ring-blue-500', required: true },
                            ]}
                            buttonText="Daftar"
                            buttonClass="bg-blue-600 hover:bg-blue-700"
                            onSubmit={handleRegister}
                        />
                    </div>
                    {/* --- KOLOM TENGAH --- */}
                    <div className="lg:col-span-1 space-y-8">
                        <ResponseDisplay data={response} />
                        <QueryForm onQuery={handleQuery} />
                        <UserList users={users} onRefresh={fetchAllUsers} />
                    </div>
                    {/* --- KOLOM KANAN --- */}
                    <div className="lg:col-span-1 space-y-8">
                        <UpdateUserSection onUpdate={handleUpdate} token={token} />
                        <DeleteUserSection onDelete={handleDelete} token={token} />
                    </div>
                </main>
            </div>
        </div>
    );
}
