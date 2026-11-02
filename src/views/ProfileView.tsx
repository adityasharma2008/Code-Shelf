import React, { useState, useEffect } from 'react';
import { User, Snippet } from '../types';
import { authService } from '../services/authService';
import { snippetStorage } from '../services/snippetStorage';
import { gamificationService } from '../services/gamificationService';
import { LANGUAGES } from '../data/languages';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  User as UserIcon, Mail, Shield, Calendar, Edit3, Check, 
  Flame, Trophy, Award, Code2, Eye, Heart, ExternalLink, 
  Github, Globe, MapPin, Sparkles, LogIn, ArrowLeft, Image as ImageIcon,
  Plus, Lock, Unlock, FileCode, Trash2, BookOpen, Send
} from 'lucide-react';
import { CodeEditor } from '../components/CodeEditor';
import { CATEGORIES, DIFFICULTY_LEVELS } from '../data/languages';
import { Language, Difficulty, CategoryTag } from '../types';

interface ProfileViewProps {
  onToast: (msg: string) => void;
  onRequestAuth?: (reason: string) => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=PixelDev',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CodeHero',
  'https://api.dicebear.com/7.x/bottts/svg?seed=DevPro',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ByteCoder',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Matrix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Techie'
];

export const ProfileView: React.FC<ProfileViewProps> = ({ onToast, onRequestAuth }) => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId?: string }>();
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  
  const isOwnProfile = !userId || (currentUser && (
    currentUser.id === userId || 
    currentUser.uid === userId || 
    currentUser.email.split('@')[0] === userId
  ));

  const [mySnippets, setMySnippets] = useState<Snippet[]>(() => {
    const user = authService.getCurrentUser();
    if (!user) return [];
    return snippetStorage.getAllSnippets().filter(s => 
      s.userId === user.id || 
      (s.authorEmail && s.authorEmail.toLowerCase() === user.email.toLowerCase())
    );
  });

  const [stats, setStats] = useState(() => gamificationService.getStats());
  const [levelInfo, setLevelInfo] = useState(() => gamificationService.getLevelInfo());

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [roleTitle, setRoleTitle] = useState(currentUser?.roleTitle || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [githubUrl, setGithubUrl] = useState(currentUser?.githubUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(currentUser?.websiteUrl || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Write Code (Notebook) in Profile state
  const [isWritingCode, setIsWritingCode] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState<Language>('python');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('Beginner');
  const [newCategory, setNewCategory] = useState<CategoryTag>('Basics');
  const [newDescription, setNewDescription] = useState('');
  const [newCodeBody, setNewCodeBody] = useState(LANGUAGES.python.sampleBoilerplate);
  const [newIsPrivate, setNewIsPrivate] = useState<boolean>(true); // default private draft in profile
  const [snippetFilterTab, setSnippetFilterTab] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    const handleAuth = () => {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setName(user.name);
        setRoleTitle(user.roleTitle || '');
        setBio(user.bio || '');
        setLocation(user.location || '');
        setGithubUrl(user.githubUrl || '');
        setWebsiteUrl(user.websiteUrl || '');
        setSelectedAvatar(user.avatar);
        setMySnippets(
          snippetStorage.getAllSnippets().filter(s => 
            s.userId === user.id || 
            (s.authorEmail && s.authorEmail.toLowerCase() === user.email.toLowerCase())
          )
        );
      }
      setStats(gamificationService.getStats());
      setLevelInfo(gamificationService.getLevelInfo());
    };

    window.addEventListener('codeshelf_auth_changed', handleAuth);
    window.addEventListener('codeshelf_snippets_updated', handleAuth);
    window.addEventListener('codeself_gamification_updated', handleAuth);

    return () => {
      window.removeEventListener('codeshelf_auth_changed', handleAuth);
      window.removeEventListener('codeshelf_snippets_updated', handleAuth);
      window.removeEventListener('codeself_gamification_updated', handleAuth);
    };
  }, []);

  if (!currentUser) {
    return (
      <div className="py-16 text-center max-w-md mx-auto px-4">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-2xs">
          <UserIcon className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Developer Profile</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with your Google account or credentials to view your profile, track your coding stats, and manage your contributions.
        </p>
        <button
          type="button"
          onClick={() => {
            if (onRequestAuth) {
              onRequestAuth('Please sign in to view and customize your developer profile.');
            } else {
              window.dispatchEvent(
                new CustomEvent('codeshelf_require_auth', {
                  detail: { message: 'Please sign in to view and customize your profile.' }
                })
              );
            }
          }}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Continue</span>
        </button>
      </div>
    );
  }

  const isAdmin = currentUser.email?.toLowerCase() === 'shakti14112008@gmail.com';
  const totalViews = mySnippets.reduce((sum, s) => sum + (s.views || 0), 0);
  const totalLikes = mySnippets.reduce((sum, s) => sum + (s.likes || 0), 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onToast('Please enter your name.');
      return;
    }

    setIsSaving(true);
    try {
      authService.updateUserProfile({
        name: name.trim(),
        roleTitle: roleTitle.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        avatar: selectedAvatar || currentUser.avatar
      });

      setIsEditing(false);
      onToast('Profile updated successfully!');
    } catch (err: any) {
      onToast(err?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyCustomAvatar = () => {
    if (customAvatarInput.trim()) {
      setSelectedAvatar(customAvatarInput.trim());
      setCustomAvatarInput('');
      setShowAvatarPicker(false);
      onToast('Custom avatar URL applied.');
    }
  };

  const handleSaveNewCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      onToast('Please enter a title for your code.');
      return;
    }
    if (!newCodeBody.trim()) {
      onToast('Please write some code before saving.');
      return;
    }

    const res = snippetStorage.saveSnippet({
      title: newTitle.trim(),
      description: newDescription.trim() || 'Authored code in developer notebook.',
      language: newLanguage,
      difficulty: newDifficulty,
      category: newCategory,
      tags: [newLanguage, newCategory.toLowerCase()],
      code: newCodeBody,
      isPrivate: newIsPrivate
    });

    if (res.success && res.snippet) {
      if (newIsPrivate) {
        onToast('Code saved as Private Draft in your profile!');
      } else {
        onToast('Code published live to Community Library & Home Page! +50 XP');
      }
      setIsWritingCode(false);
      setNewTitle('');
      setNewDescription('');
      setNewCodeBody(LANGUAGES[newLanguage].sampleBoilerplate);
      setMySnippets(
        snippetStorage.getAllSnippets().filter(s =>
          s.userId === currentUser.id ||
          (s.authorEmail && s.authorEmail.toLowerCase() === currentUser.email.toLowerCase())
        )
      );
    } else {
      onToast(res.error || 'Failed to save code.');
    }
  };

  const handleToggleVisibility = (snippetId: string) => {
    const res = snippetStorage.toggleSnippetVisibility(snippetId);
    if (res.success) {
      if (res.isPrivate) {
        onToast('Snippet moved to Private Draft (hidden from Public Library).');
      } else {
        onToast('Snippet is now Public! It appears live on the Home Page and Library.');
      }
      setMySnippets(
        snippetStorage.getAllSnippets().filter(s =>
          s.userId === currentUser.id ||
          (s.authorEmail && s.authorEmail.toLowerCase() === currentUser.email.toLowerCase())
        )
      );
    }
  };

  const handleLaunchQuiz = (lang: Language) => {
    window.dispatchEvent(
      new CustomEvent('codeself_open_quiz', { detail: { language: lang } })
    );
  };

  const languagePoints = gamificationService.getLanguagePoints();
  const visibleSnippets = mySnippets.filter(s => {
    if (snippetFilterTab === 'public') return !s.isPrivate && s.visibility !== 'private';
    if (snippetFilterTab === 'private') return s.isPrivate || s.visibility === 'private';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer shadow-2xs bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Main Profile Card Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with status border */}
          <div className="relative group shrink-0">
            <img
              src={selectedAvatar || currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-xs bg-slate-50"
              referrerPolicy="no-referrer"
            />
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white text-[11px] font-medium opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <ImageIcon className="w-5 h-5 mb-1" />
                <span>Change</span>
              </button>
            )}
          </div>

          {/* User Info Overview */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {currentUser.name}
              </h1>

              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <Shield className="w-3 h-3 text-rose-600" />
                  Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  {currentUser.role || 'Contributor'}
                </span>
              )}

              {currentUser.provider === 'google' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Google Account
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-slate-600">
              {currentUser.roleTitle || 'Full-Stack Developer & CodeSelf Contributor'}
            </p>

            {currentUser.bio && (
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                {currentUser.bio}
              </p>
            )}

            {/* Meta Row: Email, Location, Joined */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.email}</span>
              </div>

              {currentUser.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.location}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  Joined {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {currentUser.githubUrl && (
                <a
                  href={currentUser.githubUrl.startsWith('http') ? currentUser.githubUrl : `https://${currentUser.githubUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}

              {currentUser.websiteUrl && (
                <a
                  href={currentUser.websiteUrl.startsWith('http') ? currentUser.websiteUrl : `https://${currentUser.websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Avatar Picker Modal Dropdown (if editing) */}
        {isEditing && showAvatarPicker && (
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Select Developer Avatar:</h4>
            <div className="flex flex-wrap items-center gap-3">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(av);
                    setShowAvatarPicker(false);
                  }}
                  className={`w-12 h-12 rounded-xl border-2 p-0.5 transition-all cursor-pointer ${
                    selectedAvatar === av ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={av} alt="Avatar option" className="w-full h-full rounded-lg object-cover" />
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2 max-w-md">
              <input
                type="url"
                placeholder="Or paste image URL (e.g. https://...)"
                value={customAvatarInput}
                onChange={(e) => setCustomAvatarInput(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleApplyCustomAvatar}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span>Edit Profile Information</span>
            </h3>
            <span className="text-xs text-slate-400">All fields update your public profile instantly</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headline / Role
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Full-Stack Engineer, Student, Python Enthusiast"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                About / Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell other developers about what you build, languages you love, or what you are currently learning..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Delhi, India or Remote"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Username or Profile URL
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="e.g. github.com/yourhandle"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portfolio or Personal Website
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="e.g. https://yourportfolio.dev"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Developer Real Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Streak */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs text-center">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
            <Flame className="w-4 h-4 fill-orange-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats?.currentStreak ?? 0} <span className="text-xs font-sans text-slate-400">days</span>
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">Coding Streak 🔥</p>
        </div>

        {/* Level & XP */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs text-center">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            Lv. {levelInfo.level}
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{stats?.xp ?? 0} Total XP</p>
        </div>

        {/* Snippets Uploaded */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs text-center">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
            <Code2 className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {mySnippets.length}
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">Published Snippets</p>
        </div>

        {/* Community Likes & Views */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs text-center">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {totalLikes}
          </p>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{totalViews} Total Views</p>
        </div>
      </div>

      {/* Language Mastery & Skill Points Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Language Mastery & Skill Points</h3>
              <p className="text-xs text-slate-500">
                Points are earned specifically in each language by taking 10-question quizzes and completing learning track modules.
              </p>
            </div>
          </div>

          <Link
            to="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Go to Learning Hub</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(LANGUAGES) as Language[]).map((langKey) => {
            const meta = LANGUAGES[langKey];
            const pts = languagePoints[langKey] || 0;

            let rank = 'Novice';
            let rankColor = 'text-slate-600 bg-slate-100';
            if (pts >= 600) {
              rank = 'Master';
              rankColor = 'text-purple-700 bg-purple-50 border border-purple-200';
            } else if (pts >= 300) {
              rank = 'Specialist';
              rankColor = 'text-blue-700 bg-blue-50 border border-blue-200';
            } else if (pts >= 100) {
              rank = 'Practitioner';
              rankColor = 'text-emerald-700 bg-emerald-50 border border-emerald-200';
            }

            const targetPoints = pts < 100 ? 100 : pts < 300 ? 300 : pts < 600 ? 600 : 1000;
            const progressPct = Math.min(100, Math.round((pts / targetPoints) * 100));

            return (
              <div
                key={langKey}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-xs font-bold ${meta.color}`}>{meta.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rankColor}`}>
                      {rank}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold font-mono text-slate-900">{pts}</span>
                    <span className="text-[11px] text-slate-400 font-mono">/ {targetPoints} pts</span>
                  </div>

                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">10-Q Certification</span>
                  <button
                    type="button"
                    onClick={() => handleLaunchQuiz(langKey)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Take Quiz →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* In-Profile "Write Code" Section */}
      {isWritingCode && (
        <form
          onSubmit={handleSaveNewCode}
          className="bg-white border-2 border-blue-600/30 rounded-2xl p-6 shadow-md space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Developer Code Studio</h3>
                <p className="text-xs text-slate-500">
                  Write and save code directly to your profile. Keep it private as a draft or make it public to show on the Home Page!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsWritingCode(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Snippet Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Optimized Two-Pointer Algorithm or DB Transaction Manager"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Language <span className="text-rose-500">*</span>
              </label>
              <select
                value={newLanguage}
                onChange={(e) => {
                  const lang = e.target.value as Language;
                  setNewLanguage(lang);
                  setNewCodeBody(LANGUAGES[lang]?.sampleBoilerplate || '');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                {Object.values(LANGUAGES).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CategoryTag)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Difficulty
              </label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
              >
                {DIFFICULTY_LEVELS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Notes
              </label>
              <textarea
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Explain what this code does, algorithm complexity, or usage instructions..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 resize-none"
              />
            </div>
          </div>

          {/* Code Editor */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Source Code ({LANGUAGES[newLanguage]?.name})
            </label>
            <CodeEditor
              code={newCodeBody}
              onChange={setNewCodeBody}
              language={newLanguage}
              minHeight="280px"
              maxHeight="420px"
            />
          </div>

          {/* Visibility Choice */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="block text-xs font-bold text-slate-800">
              Publishing & Visibility Settings:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  newIsPrivate
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="visibilityOption"
                  checked={newIsPrivate}
                  onChange={() => setNewIsPrivate(true)}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Save as Private (Draft in Profile)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Saved safely in your personal profile. You can test, refine, or make it public anytime later!
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  !newIsPrivate
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="visibilityOption"
                  checked={!newIsPrivate}
                  onChange={() => setNewIsPrivate(false)}
                  className="mt-0.5 text-blue-600"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Publish Live to Public Library</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Visible immediately to all developers on the Home Page & Library. Earn +50 XP!
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsWritingCode(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{newIsPrivate ? 'Save to My Profile' : 'Publish Live to Library'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Submissions Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                My Code Repository ({mySnippets.length})
              </h3>
              <p className="text-xs text-slate-500">
                Manage your authored codes, toggle public/private status, or write new code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isWritingCode && (
              <button
                type="button"
                onClick={() => setIsWritingCode(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write Code</span>
              </button>
            )}

            <Link
              to="/my-snippets"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
            >
              Manage All
            </Link>
          </div>
        </div>

        {/* Filter Tabs: All, Public, Private */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
          <button
            type="button"
            onClick={() => setSnippetFilterTab('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              snippetFilterTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({mySnippets.length})
          </button>

          <button
            type="button"
            onClick={() => setSnippetFilterTab('public')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              snippetFilterTab === 'public'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Public ({mySnippets.filter(s => !s.isPrivate && s.visibility !== 'private').length})
          </button>

          <button
            type="button"
            onClick={() => setSnippetFilterTab('private')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
              snippetFilterTab === 'private'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Private Drafts ({mySnippets.filter(s => s.isPrivate || s.visibility === 'private').length})
          </button>
        </div>

        {visibleSnippets.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              This developer hasn't published any snippets yet.
            </p>
            {isOwnProfile && (
              <>
                <p className="text-xs text-slate-500 mt-1">
                  Publish an algorithm or create a private draft directly in your developer studio.
                </p>
                <button
                  type="button"
                  onClick={() => setIsWritingCode(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write your first code now</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {visibleSnippets.slice(0, 10).map((s) => {
              const lang = LANGUAGES[s.language] || LANGUAGES.python;
              const isPriv = s.isPrivate || s.visibility === 'private';

              return (
                <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/snippet/${s.id}`}
                        className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                      >
                        {s.title}
                      </Link>

                      {isPriv ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>Private Draft</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          <Globe className="w-3 h-3 text-emerald-600" />
                          <span>Public on Library</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className={`font-medium ${lang.color}`}>{lang.name}</span>
                      <span>·</span>
                      <span>{s.category}</span>
                      <span>·</span>
                      <span>{s.views || 0} views</span>
                      <span>·</span>
                      <span>{s.likes || 0} likes</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle Public / Private Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(s.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        isPriv
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                      title={isPriv ? 'Publish this code to public library' : 'Make this code private'}
                    >
                      {isPriv ? (
                        <>
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Make Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Make Private</span>
                        </>
                      )}
                    </button>

                    <Link
                      to={`/snippet/${s.id}`}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors"
                    >
                      View & Run
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
