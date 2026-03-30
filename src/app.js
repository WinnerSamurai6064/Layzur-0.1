import { api } from './api.js';

// State Management
let currentUser = localStorage.getItem('layzur_user') || null;
let currentToken = localStorage.getItem('layzur_token') || null;
let currentView = currentToken ? 'home' : 'welcome';
let authMode = 'login'; // 'login' or 'signup'
let posts = [];

// DOM Elements
const root = document.getElementById('root');

// Icons (SVG Strings)
const icons = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    explore: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
    profile: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    image: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
    heart: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
};

// Router
function navigate(view, params = {}) {
    currentView = view;
    render();
    window.scrollTo(0, 0);
}

// Views
function WelcomeView() {
    return `
        <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-[url('https://picsum.photos/seed/dark/1920/1080?blur=10')] bg-cover bg-center">
            <div class="glass-card thick-glass p-12 max-w-lg w-full text-center animate-fade-in">
                <h1 class="text-6xl font-black mb-4 tracking-tighter">LAYZUR</h1>
                <p class="text-2xl font-light mb-8 text-white/80">See what's happening right now. Join the conversation on Layzur.</p>
                
                <div class="space-y-4">
                    <input type="text" id="username-input" placeholder="Username" 
                        class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-orange-500 transition-colors text-lg">
                    <input type="password" id="password-input" placeholder="Password" 
                        class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-orange-500 transition-colors text-lg">
                    
                    <button id="auth-btn" class="btn-primary w-full text-xl py-4">
                        ${authMode === 'login' ? 'Log In' : 'Sign Up'}
                    </button>
                    
                    <p class="text-sm text-white/60">
                        ${authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                        <button id="toggle-auth" class="text-orange-500 font-bold hover:underline">
                            ${authMode === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
                
                <p class="mt-6 text-sm text-white/40">By joining, you agree to our Terms of Service.</p>
            </div>
        </div>
    `;
}

function MainLayout(content) {
    return `
        <div class="flex min-h-screen max-w-7xl mx-auto">
            <!-- Sidebar Navigation -->
            <nav class="w-20 md:w-64 fixed h-screen border-r border-white/5 p-4 flex flex-col justify-between">
                <div class="space-y-2">
                    <div class="p-4 mb-4">
                        <h2 class="text-2xl font-black orange-glow">L</h2>
                    </div>
                    <div class="nav-item ${currentView === 'home' ? 'active' : ''}" onclick="window.app.navigate('home')">
                        ${icons.home} <span class="hidden md:inline font-semibold">Home</span>
                    </div>
                    <div class="nav-item ${currentView === 'explore' ? 'active' : ''}" onclick="window.app.navigate('explore')">
                        ${icons.explore} <span class="hidden md:inline font-semibold">Explore</span>
                    </div>
                    <div class="nav-item ${currentView === 'search' ? 'active' : ''}" onclick="window.app.navigate('search')">
                        ${icons.search} <span class="hidden md:inline font-semibold">Search</span>
                    </div>
                    <div class="nav-item ${currentView === 'profile' ? 'active' : ''}" onclick="window.app.navigate('profile', {username: '${currentUser}'})">
                        ${icons.profile} <span class="hidden md:inline font-semibold">Profile</span>
                    </div>
                </div>
                
                <div class="p-4">
                    <div class="flex items-center gap-3 glass-card p-3 cursor-pointer hover:bg-white/5 transition-colors" onclick="window.app.navigate('profile', {username: '${currentUser}'})">
                        <div class="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center font-bold">
                            ${currentUser ? currentUser[0].toUpperCase() : '?'}
                        </div>
                        <div class="hidden md:block overflow-hidden">
                            <p class="font-bold truncate">${currentUser}</p>
                            <p class="text-xs text-white/40">@${currentUser}</p>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Content Area -->
            <main class="flex-1 ml-20 md:ml-64 border-r border-white/5 min-h-screen">
                ${content}
            </main>

            <!-- Right Sidebar (Trends/Suggestions) -->
            <aside class="hidden lg:block w-80 p-6 space-y-6">
                <div class="glass-card p-6">
                    <h3 class="text-xl font-bold mb-4">What's happening</h3>
                    <div class="space-y-4">
                        <div class="cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                            <p class="text-xs text-white/40">Trending in Tech</p>
                            <p class="font-bold">#LayzurGlass</p>
                            <p class="text-xs text-white/40">12.4K posts</p>
                        </div>
                        <div class="cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                            <p class="text-xs text-white/40">Entertainment</p>
                            <p class="font-bold">#LiquidDesign</p>
                            <p class="text-xs text-white/40">8.1K posts</p>
                        </div>
                    </div>
                </div>
                
                <div class="glass-card p-6">
                    <h3 class="text-xl font-bold mb-4">Who to follow</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-blue-500"></div>
                                <div>
                                    <p class="text-sm font-bold">Layzur Official <span class="verified-badge">${icons.check}</span></p>
                                    <p class="text-xs text-white/40">@layzur</p>
                                </div>
                            </div>
                            <button class="text-xs font-bold bg-white text-black px-3 py-1 rounded-full">Follow</button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    `;
}

function HomeView() {
    return `
        <div class="sticky top-0 glass-card thick-glass z-10 p-4 border-t-0 border-x-0 rounded-none">
            <h2 class="text-xl font-bold">Home</h2>
        </div>
        
        <!-- Post Creator -->
        <div class="p-4 border-b border-white/5">
            <div class="flex gap-4">
                <div class="w-12 h-12 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center font-bold text-xl">
                    ${currentUser[0].toUpperCase()}
                </div>
                <div class="flex-1">
                    <textarea id="post-text" class="post-input" placeholder="What's happening?" rows="3" maxlength="170"></textarea>
                    <div id="image-preview" class="mt-2 hidden">
                        <img src="" class="rounded-2xl max-h-64 object-cover w-full border border-white/10">
                    </div>
                    <div class="flex items-center justify-between mt-4">
                        <div class="flex gap-2">
                            <label class="cursor-pointer p-2 hover:bg-orange-500/10 rounded-full transition-colors text-orange-500">
                                ${icons.image}
                                <input type="file" id="image-upload" class="hidden" accept="image/*">
                            </label>
                        </div>
                        <div class="flex items-center gap-4">
                            <span id="char-count" class="text-sm text-white/40">0 / 170</span>
                            <button id="submit-post" class="btn-primary px-6 py-2">Post</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Feed -->
        <div id="posts-feed" class="divide-y divide-white/5">
            <div class="p-12 text-center text-white/40">Loading posts...</div>
        </div>
    `;
}

function ProfileView(username) {
    return `
        <div class="sticky top-0 glass-card thick-glass z-10 p-4 border-t-0 border-x-0 rounded-none flex items-center gap-6">
            <button onclick="window.app.navigate('home')" class="p-2 hover:bg-white/5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
            <div>
                <h2 class="text-xl font-bold">${username} <span class="verified-badge">${icons.check}</span></h2>
                <p class="text-xs text-white/40" id="profile-post-count">0 posts</p>
            </div>
        </div>

        <div class="relative">
            <div class="h-48 bg-gradient-to-r from-orange-600 to-orange-900"></div>
            <div class="px-4 -mt-16 flex justify-between items-end">
                <div class="w-32 h-32 rounded-full border-4 border-black bg-orange-500 flex items-center justify-center text-4xl font-black shadow-2xl">
                    ${username[0].toUpperCase()}
                </div>
                ${username === currentUser ? 
                    `<button class="glass-card px-6 py-2 font-bold mb-2 hover:bg-white/5 transition-colors" onclick="window.app.navigate('settings')">Edit Profile</button>` :
                    `<button id="follow-btn" class="btn-primary px-8 py-2 mb-2">Follow</button>`
                }
            </div>
        </div>

        <div class="p-4 space-y-4">
            <div>
                <h3 class="text-2xl font-black">${username} <span class="verified-badge">${icons.check}</span></h3>
                <p class="text-white/40">@${username}</p>
            </div>
            
            <p class="text-lg">Living life in the liquid glass lane. #Layzur</p>
            
            <div class="flex gap-6 text-sm">
                <p><span class="font-bold" id="follower-count">0</span> <span class="text-white/40">Followers</span></p>
                <p><span class="font-bold">128</span> <span class="text-white/40">Following</span></p>
            </div>
        </div>

        <div class="border-b border-white/5 flex">
            <div class="flex-1 text-center p-4 border-b-2 border-orange-500 font-bold">Posts</div>
            <div class="flex-1 text-center p-4 text-white/40 hover:bg-white/5 cursor-pointer">Media</div>
            <div class="flex-1 text-center p-4 text-white/40 hover:bg-white/5 cursor-pointer">Likes</div>
        </div>

        <div id="profile-feed" class="divide-y divide-white/5">
            <div class="p-12 text-center text-white/40">Loading user posts...</div>
        </div>
    `;
}

function SettingsView() {
    return `
        <div class="sticky top-0 glass-card thick-glass z-10 p-4 border-t-0 border-x-0 rounded-none flex items-center gap-6">
            <button onclick="window.app.navigate('profile', {username: '${currentUser}'})" class="p-2 hover:bg-white/5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
            <h2 class="text-xl font-bold">Settings</h2>
        </div>
        
        <div class="p-6 space-y-8">
            <div class="glass-card p-6 space-y-4">
                <h3 class="text-lg font-bold text-orange-500">Account</h3>
                <div class="flex justify-between items-center">
                    <span>Username</span>
                    <span class="text-white/40">@${currentUser}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span>Verification Status</span>
                    <span class="text-green-500 flex items-center gap-1">Active <span class="verified-badge">${icons.check}</span></span>
                </div>
            </div>

            <div class="glass-card p-6 space-y-4">
                <h3 class="text-lg font-bold text-orange-500">Appearance</h3>
                <div class="flex justify-between items-center">
                    <span>Glass Intensity</span>
                    <input type="range" class="accent-orange-500">
                </div>
            </div>

            <button id="logout-btn" class="w-full p-4 glass-card text-red-500 font-bold hover:bg-red-500/10 transition-colors">Log Out</button>
        </div>
    `;
}

// Components
function PostCard(post) {
    return `
        <div class="p-4 hover:bg-white/[0.02] transition-colors animate-fade-in">
            <div class="flex gap-4">
                <div class="w-12 h-12 rounded-full bg-orange-500 flex-shrink-0 flex items-center justify-center font-bold cursor-pointer" 
                    onclick="window.app.navigate('profile', {username: '${post.username}'})">
                    ${post.username[0].toUpperCase()}
                </div>
                <div class="flex-1 space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="font-bold hover:underline cursor-pointer" onclick="window.app.navigate('profile', {username: '${post.username}'})">
                            ${post.username} ${post.verified ? `<span class="verified-badge">${icons.check}</span>` : ''}
                        </span>
                        <span class="text-white/40 text-sm">@${post.username} · ${new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-lg leading-relaxed">${post.content}</p>
                    ${post.media ? `<img src="${post.media}" class="rounded-2xl max-h-96 w-full object-cover border border-white/10 mt-2">` : ''}
                    
                    <div class="flex items-center gap-8 pt-2 text-white/40">
                        <button class="flex items-center gap-2 hover:text-orange-500 transition-colors group" onclick="window.app.likePost('${post.id}')">
                            <span class="p-2 group-hover:bg-orange-500/10 rounded-full">${icons.heart}</span>
                            <span class="text-sm">Like</span>
                        </button>
                        <button class="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                            <span class="p-2 group-hover:bg-blue-500/10 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            </span>
                            <span class="text-sm">Reply</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Core Logic
async function render() {
    if (!currentToken && currentView !== 'welcome') {
        currentView = 'welcome';
    }

    if (currentView === 'welcome') {
        root.innerHTML = WelcomeView();
        attachWelcomeListeners();
    } else {
        let content = '';
        if (currentView === 'home') content = HomeView();
        else if (currentView === 'profile') content = ProfileView(window.app.params.username || currentUser);
        else if (currentView === 'settings') content = SettingsView();
        else content = `<div class="p-12 text-center text-white/40">View coming soon...</div>`;

        root.innerHTML = MainLayout(content);
        attachMainListeners();
        
        if (currentView === 'home') loadFeed();
        if (currentView === 'profile') loadProfile(window.app.params.username || currentUser);
    }
}

function attachWelcomeListeners() {
    const authBtn = document.getElementById('auth-btn');
    const toggleBtn = document.getElementById('toggle-auth');
    const userInp = document.getElementById('username-input');
    const passInp = document.getElementById('password-input');
    
    toggleBtn?.addEventListener('click', () => {
        authMode = authMode === 'login' ? 'signup' : 'login';
        render();
    });

    authBtn?.addEventListener('click', async () => {
        const username = userInp.value.trim();
        const password = passInp.value.trim();
        if (username && password) {
            try {
                let res;
                if (authMode === 'login') {
                    res = await api.login(username, password);
                } else {
                    res = await api.register(username, password);
                }
                
                currentUser = res.username;
                currentToken = res.token;
                localStorage.setItem('layzur_user', res.username);
                localStorage.setItem('layzur_token', res.token);
                
                navigate('home');
            } catch (e) {
                alert(e.message || 'Authentication failed');
            }
        } else {
            alert('Please enter both username and password');
        }
    });
}

function attachMainListeners() {
    const postText = document.getElementById('post-text');
    const charCount = document.getElementById('char-count');
    const submitBtn = document.getElementById('submit-post');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const logoutBtn = document.getElementById('logout-btn');
    const followBtn = document.getElementById('follow-btn');

    let uploadedImageUrl = null;

    postText?.addEventListener('input', (e) => {
        const len = e.target.value.length;
        charCount.innerText = `${len} / 170`;
        charCount.style.color = len > 150 ? '#FF6B00' : 'rgba(255,255,255,0.4)';
    });

    imageUpload?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await api.uploadImage(formData);
                uploadedImageUrl = res.url;
                imagePreview.querySelector('img').src = res.url;
                imagePreview.classList.remove('hidden');
            } catch (err) {
                alert('Image upload failed.');
            }
        }
    });

    submitBtn?.addEventListener('click', async () => {
        const content = postText.value.trim();
        if (content) {
            try {
                await api.createPost(currentUser, content, uploadedImageUrl);
                postText.value = '';
                imagePreview.classList.add('hidden');
                uploadedImageUrl = null;
                loadFeed();
            } catch (err) {
                alert('Failed to post.');
            }
        }
    });

    followBtn?.addEventListener('click', async () => {
        const target = window.app.params.username;
        if (target && target !== currentUser) {
            try {
                await api.followUser(currentUser, target);
                alert(`Followed @${target}`);
                loadProfile(target);
            } catch (e) {
                alert('Follow failed');
            }
        }
    });

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('layzur_user');
        localStorage.removeItem('layzur_token');
        currentUser = null;
        currentToken = null;
        navigate('welcome');
    });
}

async function loadFeed() {
    const feed = document.getElementById('posts-feed');
    try {
        const data = await api.getPosts();
        posts = data;
        if (posts.length === 0) {
            feed.innerHTML = `<div class="p-12 text-center text-white/40">No posts yet. Be the first!</div>`;
        } else {
            feed.innerHTML = posts.map(post => PostCard(post)).join('');
        }
    } catch (err) {
        feed.innerHTML = `<div class="p-12 text-center text-red-500">Failed to load feed.</div>`;
    }
}

async function loadProfile(username) {
    const feed = document.getElementById('profile-feed');
    const followerEl = document.getElementById('follower-count');
    const postCountEl = document.getElementById('profile-post-count');

    try {
        const [postsData, followersData] = await Promise.all([
            api.getPosts(),
            api.getFollowerCount(username)
        ]);

        const userPosts = postsData.filter(p => p.username === username);
        followerEl.innerText = followersData.count || 0;
        postCountEl.innerText = `${userPosts.length} posts`;

        if (userPosts.length === 0) {
            feed.innerHTML = `<div class="p-12 text-center text-white/40">No posts from this user yet.</div>`;
        } else {
            feed.innerHTML = userPosts.map(post => PostCard(post)).join('');
        }
    } catch (err) {
        feed.innerHTML = `<div class="p-12 text-center text-red-500">Failed to load profile.</div>`;
    }
}

// Global App Object for inline handlers
window.app = {
    navigate: (view, params = {}) => {
        window.app.params = params;
        navigate(view);
    },
    likePost: async (id) => {
        try {
            await api.likePost(currentUser, id);
            // alert('Post liked!');
        } catch (e) {
            alert('Like failed');
        }
    },
    params: {}
};

// Initial Render
render();
