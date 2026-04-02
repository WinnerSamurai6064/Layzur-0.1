import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, 
  Search, 
  PlusSquare, 
  User as UserIcon, 
  Heart, 
  MessageCircle, 
  Share2, 
  CheckCircle2, 
  Image as ImageIcon, 
  LogOut,
  ArrowLeft,
  Loader2,
  Camera,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, Post, View } from './types';
import { ImageCropper } from './components/ImageCropper';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE_URL = 'https://api.layzur.qzz.io';

export default function App() {
  const [view, setView] = useState<View>('auth');
  const [token, setToken] = useState<string | null>(localStorage.getItem('layzur_token'));
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('layzur_username'));
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      setView('home');
      fetchPosts();
    } else {
      setView('auth');
    }
  }, [token]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/posts`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPosts(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('layzur_token');
    localStorage.removeItem('layzur_username');
    setToken(null);
    setCurrentUser(null);
    setView('auth');
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      <main className="pb-24 max-w-2xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {view === 'auth' && (
            <AuthView 
              onSuccess={(t, u) => {
                setToken(t);
                setCurrentUser(u);
              }} 
            />
          )}
          {view === 'home' && <HomeView posts={posts} onRefresh={fetchPosts} loading={loading} />}
          {view === 'search' && <SearchView />}
          {view === 'post' && <CreatePostView onCreated={() => { setView('home'); fetchPosts(); }} onCancel={() => setView('home')} />}
          {view === 'profile' && <ProfileView username={currentUser!} onLogout={handleLogout} isOwnProfile={true} />}
        </AnimatePresence>
      </main>

      {view !== 'auth' && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2">
          <div className="max-w-md mx-auto glass-thick rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-orange-500/10">
            <NavButton active={view === 'home'} onClick={() => setView('home')} icon={<Home size={24} />} />
            <NavButton active={view === 'search'} onClick={() => setView('search')} icon={<Search size={24} />} />
            <button 
              onClick={() => setView('post')}
              className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center -mt-10 shadow-lg shadow-orange-500/40 active:scale-95 transition-transform"
            >
              <PlusSquare size={28} className="text-white" />
            </button>
            <NavButton active={view === 'profile'} onClick={() => setView('profile')} icon={<UserIcon size={24} />} />
            <NavButton active={false} onClick={handleLogout} icon={<LogOut size={24} />} />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-full transition-all duration-300",
        active ? "text-orange-500 scale-110" : "text-white/60 hover:text-white"
      )}
    >
      {icon}
    </button>
  );
}

function AuthView({ onSuccess }: { onSuccess: (token: string, username: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('layzur_token', data.token);
        localStorage.setItem('layzur_username', username);
        onSuccess(data.token, username);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen px-6"
    >
      <div className="w-full max-w-sm glass p-8 rounded-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter neon-orange italic">LAYZUR</h1>
          <p className="text-white/60 text-sm font-medium">
            See what's happening right now. Join the conversation on Layzur.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-colors"
            required
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50 transition-colors"
            required
          />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button 
            disabled={loading}
            className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/40 text-sm hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function HomeView({ posts, onRefresh, loading }: { posts: Post[], onRefresh: () => void, loading: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-6 px-4 space-y-6"
    >
      <header className="flex items-center justify-between sticky top-0 z-40 bg-black/50 backdrop-blur-md py-2 -mx-4 px-4">
        <h2 className="text-2xl font-black tracking-tight neon-text">Feed</h2>
        <button onClick={onRefresh} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Loader2 className={cn("text-orange-500", loading && "animate-spin")} size={20} />
        </button>
      </header>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && !loading && (
          <div className="text-center py-20 text-white/40 italic">
            No posts yet. Be the first to share something.
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PostCard({ post }: { post: Post, key?: any }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);

  const handleLike = async () => {
    const token = localStorage.getItem('layzur_token');
    if (!token) return;
    
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);

    try {
      await fetch(`${API_BASE_URL}/api/like`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId: post.id })
      });
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-4 rounded-3xl space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-lg overflow-hidden">
            {post.profilePicture ? (
              <img 
                src={post.profilePicture} 
                alt={post.username || 'User'} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-800 flex items-center justify-center">
                {(post.username?.[0] || '?').toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm">@{post.username || 'unknown'}</span>
              {post.verified === 1 && <CheckCircle2 size={14} className="text-orange-500 fill-orange-500/20" />}
            </div>
            <span className="text-[10px] text-white/40">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'recently'}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-white/90">
        {post.content}
      </p>

      {post.media && (
        <div className="rounded-2xl overflow-hidden border border-white/5">
          <img 
            src={post.media} 
            alt="Post media" 
            className="w-full h-auto object-cover max-h-96"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      <div className="flex items-center gap-6 pt-2">
        <button 
          onClick={handleLike}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-colors",
            liked ? "text-orange-500" : "text-white/40 hover:text-white"
          )}
        >
          <Heart size={18} className={cn(liked && "fill-orange-500")} />
          <span>{likesCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
          <MessageCircle size={18} />
          <span>0</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors ml-auto">
          <Share2 size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function CreatePostView({ onCreated, onCancel }: { onCreated: () => void, onCancel: () => void }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !media) return;
    setLoading(true);
    const token = localStorage.getItem('layzur_token');
    const username = localStorage.getItem('layzur_username');

    try {
      let mediaUrl = '';
      if (media) {
        const formData = new FormData();
        formData.append('file', media);
        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        mediaUrl = uploadData.url;
      }

      const res = await fetch(`${API_BASE_URL}/api/post`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, content, media: mediaUrl })
      });

      if (res.ok) {
        onCreated();
      }
    } catch (err) {
      console.error('Post creation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <button onClick={onCancel} className="p-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={handleSubmit}
          disabled={loading || (!content.trim() && !media)}
          className="bg-orange-500 text-white px-6 py-1.5 rounded-full font-bold active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : 'Post'}
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <textarea 
          placeholder="What's happening?"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 170))}
          className="w-full h-40 bg-transparent text-xl resize-none focus:outline-none placeholder:text-white/20"
          autoFocus
        />
        
        <div className="flex justify-end text-xs text-white/40">
          {content.length}/170
        </div>

        {preview && (
          <div className="relative rounded-2xl overflow-hidden border border-white/10">
            <img src={preview} alt="Preview" className="w-full h-auto" />
            <button 
              onClick={() => { setMedia(null); setPreview(null); }}
              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full backdrop-blur-md"
            >
              <LogOut size={16} className="rotate-180" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-orange-500 font-medium"
          >
            <ImageIcon size={24} />
            <span>Add Media</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleMediaChange} 
            className="hidden" 
            accept="image/*"
          />
        </div>
      </div>
    </motion.div>
  );
}

function ProfileView({ username, onLogout, isOwnProfile }: { username: string, onLogout?: () => void, isOwnProfile?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [followers, setFollowers] = useState(0);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState<'profile' | 'cover' | null>(null);
  
  // Cropping states
  const [cropImage, setCropImage] = useState<{ url: string, type: 'profile' | 'cover' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);

      // In a real app, we'd fetch the user profile from /api/user/:username
      const userRes = await fetch(`${API_BASE_URL}/api/user/${username}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      } else {
        // Fallback for demo purposes if user endpoint doesn't exist
        setUser(prev => prev || {
          username,
          bio: username === 'Layzur' ? "The official handle of Layzur." : "Social media enthusiast.",
          verified: username === 'Layzur' ? 1 : 0,
          profilePicture: '',
          coverPhoto: ''
        });
      }

      const followerRes = await fetch(`${API_BASE_URL}/api/followers/${username}`);
      if (followerRes.ok) {
        const fData = await followerRes.json();
        if (fData && typeof fData.count === 'number') {
          setFollowers(fData.count);
        }
      }

      const postsRes = await fetch(`${API_BASE_URL}/api/posts`);
      if (postsRes.ok) {
        const pData = await postsRes.json();
        if (Array.isArray(pData)) {
          setUserPosts(pData.filter((p: Post) => p.username === username));
        }
      }
    } catch (err) {
      console.error('Profile fetch failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [username]);

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage({ url: reader.result as string, type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!cropImage) return;
    
    const type = cropImage.type;
    setCropImage(null);
    setUploading(type);

    const token = localStorage.getItem('layzur_token');
    const formData = new FormData();
    formData.append('file', croppedBlob, `${type}_${username}.jpg`);

    try {
      const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        const imageUrl = uploadData.url;

        // Update user profile with new image
        const updateRes = await fetch(`${API_BASE_URL}/api/user/update`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            [type === 'profile' ? 'profilePicture' : 'coverPhoto']: imageUrl 
          })
        });

        if (updateRes.ok) {
          // Refresh user data
          fetchData();
        }
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 relative"
    >
      <AnimatePresence>
        {cropImage && (
          <ImageCropper
            image={cropImage.url}
            aspect={cropImage.type === 'profile' ? 1 : 16 / 9}
            circularCrop={cropImage.type === 'profile'}
            onCropComplete={handleCropComplete}
            onCancel={() => setCropImage(null)}
          />
        )}
      </AnimatePresence>

      {/* Cover Photo */}
      <div className="relative h-40 bg-neutral-900 overflow-hidden group">
        {refreshing && (
          <div className="absolute top-4 right-4 z-10">
            <Loader2 className="animate-spin text-orange-500" size={20} />
          </div>
        )}
        {user?.coverPhoto ? (
          <img 
            src={user.coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-500/20 to-orange-800/20" />
        )}
        
        {isOwnProfile && (
          <button 
            onClick={() => coverInputRef.current?.click()}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 font-bold text-sm"
          >
            {uploading === 'cover' ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
            <span>Change Cover</span>
          </button>
        )}
        <input 
          type="file" 
          ref={coverInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => handleFileSelect(e, 'cover')} 
        />
      </div>

      {/* Profile Info */}
      <div className="px-6 relative">
        <div className="absolute -top-16 left-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl glass-thick flex items-center justify-center text-4xl font-bold border-4 border-black overflow-hidden bg-neutral-800">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={username} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                username[0].toUpperCase()
              )}
            </div>
            
            {isOwnProfile && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploading === 'profile' ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => handleFileSelect(e, 'profile')} 
            />
          </div>
        </div>

        <div className="pt-16 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h2 className="text-2xl font-black tracking-tight">{username}</h2>
                {user?.verified === 1 && <CheckCircle2 size={20} className="text-orange-500 fill-orange-500/20" />}
              </div>
              <p className="text-white/40 text-sm">@{username}</p>
            </div>
            <div className="flex gap-2">
              {isOwnProfile && (
                <button className="glass p-2.5 rounded-xl text-white/60 hover:text-white transition-colors">
                  <Edit3 size={18} />
                </button>
              )}
              {isOwnProfile && (
                <button 
                  onClick={onLogout}
                  className="glass px-4 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-white/80 leading-relaxed">
            {user?.bio}
          </p>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-bold">{followers}</span>
              <span className="text-white/40">Followers</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">128</span>
              <span className="text-white/40">Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="flex">
          <button className="flex-1 py-4 text-sm font-bold border-b-2 border-orange-500">Posts</button>
          <button className="flex-1 py-4 text-sm font-bold text-white/40">Media</button>
          <button className="flex-1 py-4 text-sm font-bold text-white/40">Likes</button>
        </div>
        <div className="p-4 space-y-4">
          {userPosts.map((post: any) => <PostCard key={post.id} post={post} />)}
          {userPosts.length === 0 && (
            <div className="text-center py-10 text-white/20 italic">No posts yet.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function SearchView() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-6 px-4 space-y-6"
    >
      <div className="glass flex items-center gap-3 px-4 py-3 rounded-2xl">
        <Search size={20} className="text-white/40" />
        <input 
          type="text" 
          placeholder="Search Layzur" 
          className="bg-transparent flex-1 focus:outline-none placeholder:text-white/20"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black tracking-tight neon-text">Trending</h3>
        {[1, 2, 3].map(i => (
          <div key={i} className="glass p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">Trending in Tech</p>
              <p className="font-bold">#LayzurLaunch</p>
              <p className="text-xs text-white/40">12.4K Posts</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <PlusSquare size={20} className="text-white/20" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
