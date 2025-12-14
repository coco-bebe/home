import React, { createContext, useContext, useState, useEffect } from 'react';
import { CLASSES as MOCK_CLASSES } from './mockData';

// API base URL
const API_BASE = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';

// Class Interface
export interface ClassData {
  id: string;
  name: string;
  age: string;
  teacher: string;
  color: string;
  description: string;
  schedule: Array<{ time: string; activity: string }>;
  icon?: any; // React component type for icon
}

// Teacher Interface
export interface Teacher {
  id: string;
  name: string;
  username: string;
  password: string;
  phone?: string;
  classId: string;
  approved: boolean;
  photoUrl?: string;
}

// Types
export interface SiteSettings {
  address: string;
  phone: string;
  email: string;
  mapLink: string;
  aboutDescription: string;
  history: { year: string; title: string; desc?: string }[];
  greetingTitle: string;
  greetingMessage: string;
  greetingImageUrl: string;
  greetingSignature: string;
  philosophy: { title: string; desc: string }[];
  facilityImages: { title: string; url: string; desc?: string }[];
}

export interface ChildInfo {
  name: string;
  age: number;
  classId: string;
  birthDate?: string;
}

export interface RegisteredChild {
  id: string;
  name: string;
  birthDate: string;
  classId: string;
  parentId?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'parent' | 'teacher' | 'nutritionist';
  child?: ChildInfo; 
  phone?: string;
  classId?: string; // 선생님의 담당 반 ID
  approved: boolean; 
}

export interface AlbumPhoto {
  id: number;
  url: string;
  title: string;
  date: string;
  classId?: string; 
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  type: 'notice' | 'event' | 'album' | 'board' | 'menu';
  classId?: string; 
  parentId?: string; // 알림장의 경우 특정 학부모에게만 보이도록
  images?: string[];
}

interface AppContextType {
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: SiteSettings) => void | Promise<void>;
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUserProfile: (user: Partial<User>) => void | Promise<void>;
  registerUser: (user: Omit<User, 'id' | 'approved'>) => Promise<User>;
  users: User[];
  updateUserPassword: (userId: string, password: string) => void;
  updateUserStatus: (userId: string, approved: boolean) => void;
  deleteUser: (userId: string) => void;
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'date'>) => Promise<Post>;
  updatePost: (id: number, post: Partial<Post>) => Promise<Post>;
  deletePost: (postId: number) => Promise<void>;
  albumPhotos: AlbumPhoto[];
  addAlbumPhoto: (photo: Omit<AlbumPhoto, 'id' | 'date'>) => Promise<AlbumPhoto>;
  deleteAlbumPhoto: (photoId: number) => Promise<void>;
  registeredChildren: RegisteredChild[];
  addRegisteredChild: (child: Omit<RegisteredChild, 'id'>) => void;
  updateRegisteredChild: (id: string, child: Partial<RegisteredChild>) => void;
  deleteRegisteredChild: (id: string) => void;
  matchChildWithParent: (childName: string, birthDate: string) => RegisteredChild | null;
  classes: ClassData[];
  addClass: (cls: Omit<ClassData, 'id'>) => void;
  updateClass: (id: string, cls: Partial<ClassData>) => void;
  deleteClass: (id: string) => Promise<void>;
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => Promise<void>;
}

const INITIAL_SETTINGS: SiteSettings = {
  address: "서울 강서구 양천로75길 57 현대1차아파트 104동 102호", 
  phone: "02-2659-7977",
  email: "yhee@naver.com",
  mapLink: "https://map.naver.com/p/search/서울 강서구 양천로75길 57",
  aboutDescription: "아이들의 꿈이 자라는 따뜻한 둥지, 코코베베어린이집입니다. 안전한 환경과 아이 중심의 교육으로 하루하루 성장의 기쁨을 나눕니다.",
  history: [
    { year: "2018", title: "코코베베어린이집 개원" },
    { year: "2020", title: "실내 놀이실 리모델링" },
    { year: "2022", title: "야외 텃밭 & 자연체험 프로그램 도입" },
    { year: "2024", title: "급식실·안전 시스템 전면 업그레이드" },
  ],
  greetingTitle: "아이들의 꿈이 자라는 따뜻한 둥지, 코코베베에 오신 것을 환영합니다.",
  greetingMessage: "안녕하세요, 코코베베어린이집입니다. 안전한 환경, 균형 잡힌 식단, 아이 중심 교육으로 매일 성장의 기쁨을 나눕니다.",
  greetingImageUrl: "",
  greetingSignature: "코코베베어린이집 박윤희 원장",
  philosophy: [
    { title: "안전", desc: "몸과 마음이 안전한 환경에서 생활합니다." },
    { title: "배려", desc: "서로를 존중하고 사랑하는 마음을 배웁니다." },
    { title: "성장", desc: "스스로 할 수 있는 힘과 자신감을 키웁니다." },
    { title: "창의", desc: "자유로운 상상으로 세상을 탐색합니다." },
  ],
  facilityImages: [],
};

const MOCK_USERS: User[] = [
  { id: '1', username: 'admin', password: '123', name: '관리자', role: 'admin', approved: true },
  { 
    id: '2', username: 'parent1', password: '123', name: '김철수', role: 'parent', approved: true, phone: '010-1111-2222',
    child: { name: '김민준', age: 2, classId: 'faith1', birthDate: '2022-03-15' }
  },
  { 
    id: '3', username: 'parent2', password: '123', name: '이영희', role: 'parent', approved: true, phone: '010-3333-4444',
    child: { name: '이서연', age: 4, classId: 'love', birthDate: '2020-07-22' }
  },
  { 
    id: '4', username: 'newparent', password: '123', name: '박신입', role: 'parent', approved: false, phone: '010-5555-6666',
    child: { name: '박하늘', age: 3, classId: 'faith2', birthDate: '2021-11-08' }
  },
  { id: '5', username: 'nutritionist', password: '123', name: '영양사', role: 'nutritionist', approved: true, phone: '010-7777-8888' },
];

const MOCK_POSTS: Post[] = [
  { id: 1, title: "[공지] 12월 겨울방학 안내", content: "겨울방학 기간은 12월 25일부터 1월 5일까지입니다. 가정통신문을 참고해주세요.", author: "원장님", date: "2024-12-01", type: "notice" },
  { id: 2, title: "[행사] 크리스마스 산타 잔치", content: "아이들이 기다리던 산타 잔치가 열립니다! 빨간 옷을 입혀 보내주세요.", author: "관리자", date: "2024-11-28", type: "event" },
  { id: 3, title: "12월 식단표", content: "균형 잡힌 영양 식단표입니다. 알레르기가 있는 어린이는 미리 말씀해주세요.", author: "영양사", date: "2024-12-01", type: "menu", images: ["https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80"] },
  { id: 4, title: "우리 아이들 소풍 사진", content: "가을 소풍을 다녀왔습니다. 해맑은 아이들의 모습을 감상해보세요.", author: "김미소 선생님", date: "2024-11-20", type: "board", classId: "faith1", images: ["https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80"] },
  { id: 5, title: "믿음1반 알림장", content: "오늘 민준이가 밥을 두 그릇이나 먹었어요. 낮잠도 푹 잤답니다.", author: "김미소 선생님", date: "2024-12-04", type: "board", classId: "faith1" },
];

const MOCK_ALBUM_PHOTOS: AlbumPhoto[] = [
  { id: 1, url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80", title: "가을 소풍", date: "2024-10-15" },
  { id: 2, url: "https://images.unsplash.com/photo-1587654780291-39c940483719?auto=format&fit=crop&q=80", title: "요리 실습", date: "2024-11-02" },
  { id: 3, url: "https://images.unsplash.com/photo-1566004100631-35d015d23a38?auto=format&fit=crop&q=80", title: "체육 대회", date: "2024-09-20" },
  { id: 4, url: "https://images.unsplash.com/photo-1596968132113-a6a22bf42ea6?auto=format&fit=crop&q=80", title: "미술 시간", date: "2024-11-10" },
];

const MOCK_REGISTERED_CHILDREN: RegisteredChild[] = [
  { id: '1', name: '김민준', birthDate: '2022-03-15', classId: 'faith1' },
  { id: '2', name: '이서연', birthDate: '2020-07-22', classId: 'love' },
  { id: '3', name: '박하늘', birthDate: '2021-11-08', classId: 'faith2' },
];

const MOCK_TEACHERS: Teacher[] = [
  { id: '1', name: '김미소', username: 'teacher1', password: '123', phone: '010-1111-1111', classId: 'faith1', approved: true },
  { id: '2', name: '이사랑', username: 'teacher2', password: '123', phone: '010-2222-2222', classId: 'faith2', approved: true },
  { id: '3', name: '박다정', username: 'teacher3', password: '123', phone: '010-3333-3333', classId: 'love', approved: true },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([]);
  const [registeredChildren, setRegisteredChildren] = useState<RegisteredChild[]>([]);
  const [classes, setClasses] = useState<ClassData[]>(MOCK_CLASSES);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from server on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsRes, photosRes, usersRes, teachersRes, classesRes, childrenRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/posts`).catch(() => null),
          fetch(`${API_BASE}/album-photos`).catch(() => null),
          fetch(`${API_BASE}/users`).catch(() => null),
          fetch(`${API_BASE}/teachers`).catch(() => null),
          fetch(`${API_BASE}/classes`).catch(() => null),
          fetch(`${API_BASE}/registered-children`).catch(() => null),
          fetch(`${API_BASE}/site-settings`).catch(() => null),
        ]);

        if (postsRes?.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData);
        } else if (postsRes === null) {
          // 서버가 실행되지 않은 경우에만 MOCK 데이터 사용
          console.warn('서버에 연결할 수 없습니다. MOCK 데이터를 사용합니다.');
          setPosts(MOCK_POSTS);
        }
        // 서버 응답이 실패한 경우 기존 상태 유지 (빈 배열)

        if (photosRes?.ok) {
          const photosData = await photosRes.json();
          setAlbumPhotos(photosData);
        } else if (photosRes === null) {
          console.warn('서버에 연결할 수 없습니다. MOCK 데이터를 사용합니다.');
          setAlbumPhotos(MOCK_ALBUM_PHOTOS);
        }

        if (usersRes?.ok) {
          const usersData = await usersRes.json();
          const hasAdmin = usersData.some((u: User) => u.role === 'admin');
          setUsers(hasAdmin ? usersData : [MOCK_USERS[0], ...usersData]);
        } else if (usersRes === null) {
          console.warn('서버에 연결할 수 없습니다. MOCK 데이터를 사용합니다.');
          setUsers(MOCK_USERS);
        }

        if (teachersRes?.ok) {
          const teachersData = await teachersRes.json();
          setTeachers(teachersData);
        } else if (teachersRes === null) {
          console.warn('서버에 연결할 수 없습니다. MOCK 데이터를 사용합니다.');
          setTeachers(MOCK_TEACHERS);
        }

        if (classesRes?.ok) {
          const classesData = await classesRes.json();
          // 서버에서 빈 배열이 와도 그대로 사용 (MOCK으로 대체하지 않음)
          setClasses(classesData);
        } else if (classesRes === null) {
          // 서버가 실행되지 않은 경우에만 MOCK 데이터 사용
          console.warn('서버에 연결할 수 없습니다. MOCK 데이터를 사용합니다.');
          setClasses(MOCK_CLASSES);
        }
        // 서버 응답이 실패한 경우 기존 상태 유지 (MOCK_CLASSES)

        if (childrenRes?.ok) {
          const childrenData = await childrenRes.json();
          setRegisteredChildren(childrenData);
        } else if (childrenRes === null) {
          console.warn('서버에 연결할 수 없습니다. MOCK 데이터를 사용합니다.');
          setRegisteredChildren(MOCK_REGISTERED_CHILDREN);
        }

        if (settingsRes?.ok) {
          const settingsData = await settingsRes.json();
          setSiteSettings({ ...INITIAL_SETTINGS, ...settingsData });
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to mock data
        setPosts(MOCK_POSTS);
        setAlbumPhotos(MOCK_ALBUM_PHOTOS);
        setUsers(MOCK_USERS);
        setTeachers(MOCK_TEACHERS);
        setRegisteredChildren(MOCK_REGISTERED_CHILDREN);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-link parent-child on mount and when data changes
  useEffect(() => {
    if (users.length > 0 && registeredChildren.length > 0) {
      // Link children with existing parents based on child info matching
      const updatedChildren = registeredChildren.map(child => {
        if (child.parentId) return child; // Already linked
        const parentUser = users.find(u => 
          u.role === 'parent' && 
          u.child && 
          u.child.name.trim() === child.name.trim() && 
          u.child.birthDate === child.birthDate
        );
        return parentUser ? { ...child, parentId: parentUser.id } : child;
      });
      
      // Only update if something changed
      if (JSON.stringify(updatedChildren) !== JSON.stringify(registeredChildren)) {
        setRegisteredChildren(updatedChildren);
      }
    }
  }, [users, registeredChildren]);

  // Persist currentUser to localStorage (for login state)
  useEffect(() => { 
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
  }, [currentUser]);

  const updateSiteSettings = async (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    try {
      await fetch(`${API_BASE}/site-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (error) {
      console.error('Failed to update site settings:', error);
    }
  };

  const login = (username: string, password: string) => {
    // 관리자 계정 직접 체크 (항상 로그인 가능하도록)
    if (username === 'admin' && password === '123') {
      const adminUser: User = {
        id: '1',
        username: 'admin',
        password: '123',
        name: '관리자',
        role: 'admin',
        approved: true
      };
      setCurrentUser(adminUser);
      return true;
    }

    // 일반 사용자(학부모, 관리자, 영양사) 로그인
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      if (!user.approved && user.role !== 'admin') {
        alert("관리자 승인 대기 중인 계정입니다.");
        return false;
      }
      setCurrentUser(user);
      return true;
    }

    // 선생님 로그인
    const teacher = teachers.find(t => t.username === username && t.password === password);
    if (teacher) {
      if (!teacher.approved) {
        alert("관리자 승인 대기 중인 계정입니다.");
        return false;
      }
      // 선생님 정보를 User 객체로 변환하여 로그인
      const teacherUser: User = {
        id: teacher.id,
        username: teacher.username,
        password: teacher.password,
        name: teacher.name,
        role: 'teacher',
        phone: teacher.phone,
        classId: teacher.classId,
        approved: teacher.approved
      };
      setCurrentUser(teacherUser);
      return true;
    }

    return false;
  };

  const logout = () => setCurrentUser(null);

  const updateUserPassword = async (userId: string, password: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, password } : u);
    setUsers(updatedUsers);
    if (currentUser?.id === userId) {
      const updatedUser = { ...currentUser, password };
      setCurrentUser(updatedUser);
    }
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        await fetch(`${API_BASE}/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...user, password }),
        });
      }
    } catch (error) {
      console.error('Failed to update user password:', error);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    let updatedUser: User = { ...currentUser, ...updates };

    // If parent updated child info, attempt automatic linking
    if (updatedUser.role === 'parent' && updatedUser.child && updatedUser.child.name && updatedUser.child.birthDate) {
      const matched = registeredChildren.find(
        c => c.name.trim() === updatedUser.child!.name.trim() && c.birthDate === updatedUser.child!.birthDate && !c.parentId
      );
      if (matched) {
        // set parentId on the registered child
        setRegisteredChildren(prev => prev.map(c => c.id === matched.id ? { ...c, parentId: updatedUser.id } : c));

        // ensure parent's child.classId matches the registered child's class
        if (!updatedUser.child.classId || updatedUser.child.classId !== matched.classId) {
          updatedUser = { ...updatedUser, child: { ...updatedUser.child, classId: matched.classId } };
        }
      }
    }

    setCurrentUser(updatedUser);
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsers(updatedUsers);
    
    try {
      await fetch(`${API_BASE}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });
    } catch (error) {
      console.error('Failed to update user profile:', error);
    }
  };

  const registerUser = async (newUser: Omit<User, 'id' | 'approved'>): Promise<User> => {
    const safeName = newUser.name?.trim() || newUser.username;
    let user: User = { ...newUser, name: safeName, id: '', approved: false };

    // If registering parent with child info, attempt automatic linking
    if (user.role === 'parent' && user.child && user.child.name && user.child.birthDate) {
      const matched = registeredChildren.find(
        c => c.name.trim() === user.child!.name.trim() && c.birthDate === user.child!.birthDate && !c.parentId
      );
      if (matched) {
        // ensure parent's child.classId matches the registered child's class
        user = { ...user, child: { ...user.child, classId: matched.classId } };
      }
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        const createdUser = await res.json();
        setUsers([...users, createdUser]);
        
        // Link child if matched
        if (user.role === 'parent' && user.child && user.child.name && user.child.birthDate) {
          const matched = registeredChildren.find(
            c => c.name.trim() === user.child!.name.trim() && c.birthDate === user.child!.birthDate && !c.parentId
          );
          if (matched) {
            setRegisteredChildren(prev => prev.map(c => c.id === matched.id ? { ...c, parentId: createdUser.id } : c));
          }
        }
        
        return createdUser;
      }
    } catch (error) {
      console.error('Failed to register user:', error);
    }

    // Fallback: create locally
    const id = (users.length + 1).toString();
    user = { ...user, id };
    setUsers([...users, user]);
    return user;
  };

  const updateUserStatus = async (userId: string, approved: boolean) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, approved } : u);
    setUsers(updatedUsers);
    try {
      const user = users.find(u => u.id === userId);
      if (user) {
        await fetch(`${API_BASE}/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...user, approved }),
        });
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    try {
      await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const addPost = async (newPost: Omit<Post, 'id' | 'date'>): Promise<Post> => {
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        const post = await res.json();
        setPosts(prev => [post, ...prev]);
        return post;
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to add post:', error);
      throw error; // 에러를 다시 throw하여 호출하는 쪽에서 처리할 수 있도록
    }
  };

  const updatePost = async (id: number, updatedPost: Partial<Post>): Promise<Post> => {
    // 현재 상태를 함수형 업데이트로 저장
    let originalPosts: Post[] = [];
    let originalPost: Post | undefined;
    
    setPosts(prev => {
      originalPosts = [...prev];
      originalPost = prev.find(p => p.id === id);
      // Optimistic update
      return prev.map(p => p.id === id ? { ...p, ...updatedPost } : p);
    });
    
    if (!originalPost) {
      // 원래 상태로 롤백
      setPosts(originalPosts);
      throw new Error('Post not found');
    }
    
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPost),
      });
      if (res.ok) {
        const post = await res.json();
        // 서버에서 반환된 데이터로 업데이트
        setPosts(prev => prev.map(p => p.id === id ? post : p));
        return post;
      } else {
        // 실패 시 롤백
        setPosts(originalPosts);
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
    } catch (error) {
      // 실패 시 롤백
      setPosts(originalPosts);
      console.error('Failed to update post:', error);
      throw error;
    }
  };

  const deletePost = async (postId: number): Promise<void> => {
    // 함수형 업데이트로 원본 상태 저장
    let originalPosts: Post[] = [];
    setPosts(prev => {
      originalPosts = [...prev];
      return prev.filter(p => p.id !== postId); // Optimistic update
    });
    
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: 'DELETE',
      });
      // 성공 (200-299) 또는 404 (이미 삭제됨)는 정상 처리
      if (res.ok || res.status === 404) {
        return; // 삭제 완료
      }
      // 서버 오류인 경우 로컬 삭제 유지
      if (res.status >= 500) {
        console.warn('서버 오류. 로컬에서만 삭제됩니다.');
        return;
      }
      // 기타 오류는 롤백
      setPosts(originalPosts);
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${res.status}`);
    } catch (error: any) {
      // 네트워크 오류인 경우 로컬에서만 삭제 (fallback)
      const isNetworkError = !error.message || 
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.name === 'TypeError' ||
        error.name === 'NetworkError';
      
      if (isNetworkError) {
        console.warn('서버 연결 실패. 로컬에서만 삭제됩니다.');
        return; // 로컬 삭제는 이미 완료됨
      }
      // 실패 시 롤백
      setPosts(originalPosts);
      console.error('Failed to delete post:', error);
      throw error;
    }
  };

  const addAlbumPhoto = async (newPhoto: Omit<AlbumPhoto, 'id' | 'date'>): Promise<AlbumPhoto> => {
    try {
      const res = await fetch(`${API_BASE}/album-photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto),
      });
      if (res.ok) {
        const photo = await res.json();
        setAlbumPhotos(prev => [photo, ...prev]);
        return photo;
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
    } catch (error) {
      console.error('Failed to add album photo:', error);
      throw error;
    }
  };

  const deleteAlbumPhoto = async (photoId: number): Promise<void> => {
    // 함수형 업데이트로 원본 상태 저장
    let originalPhotos: AlbumPhoto[] = [];
    setAlbumPhotos(prev => {
      originalPhotos = [...prev];
      return prev.filter(p => p.id !== photoId); // Optimistic update
    });
    
    try {
      const res = await fetch(`${API_BASE}/album-photos/${photoId}`, {
        method: 'DELETE',
      });
      // 성공 (200-299) 또는 404 (이미 삭제됨)는 정상 처리
      if (res.ok || res.status === 404) {
        return; // 삭제 완료
      }
      // 서버 오류인 경우 로컬 삭제 유지
      if (res.status >= 500) {
        console.warn('서버 오류. 로컬에서만 삭제됩니다.');
        return;
      }
      // 기타 오류는 롤백
      setAlbumPhotos(originalPhotos);
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${res.status}`);
    } catch (error: any) {
      // 네트워크 오류인 경우 로컬에서만 삭제 (fallback)
      const isNetworkError = !error.message || 
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.name === 'TypeError' ||
        error.name === 'NetworkError';
      
      if (isNetworkError) {
        console.warn('서버 연결 실패. 로컬에서만 삭제됩니다.');
        return; // 로컬 삭제는 이미 완료됨
      }
      // 실패 시 롤백
      setAlbumPhotos(originalPhotos);
      console.error('Failed to delete album photo:', error);
      throw error;
    }
  };

  const addRegisteredChild = async (newChild: Omit<RegisteredChild, 'id'>) => {
    // Attempt to auto-link with existing parent
    let child: RegisteredChild = { ...newChild, id: '' };
    const parentUser = users.find(u => 
      u.role === 'parent' && 
      u.child && 
      u.child.name.trim() === child.name.trim() && 
      u.child.birthDate === child.birthDate
    );
    if (parentUser) {
      child = { ...child, parentId: parentUser.id };
    }

    try {
      const res = await fetch(`${API_BASE}/registered-children`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChild),
      });
      if (res.ok) {
        const createdChild = await res.json();
        setRegisteredChildren([...registeredChildren, createdChild]);
      }
    } catch (error) {
      console.error('Failed to add registered child:', error);
      // Fallback: add locally
      child = { ...child, id: Date.now().toString() };
      setRegisteredChildren([...registeredChildren, child]);
    }
  };

  const updateRegisteredChild = async (id: string, updates: Partial<RegisteredChild>) => {
    const updatedChildren = registeredChildren.map(c => c.id === id ? { ...c, ...updates } : c);
    setRegisteredChildren(updatedChildren);
    try {
      await fetch(`${API_BASE}/registered-children/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to update registered child:', error);
    }
  };

  const deleteRegisteredChild = async (id: string) => {
    setRegisteredChildren(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`${API_BASE}/registered-children/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete registered child:', error);
    }
  };

  const matchChildWithParent = (childName: string, birthDate: string): RegisteredChild | null => {
    const child = registeredChildren.find(
      c => c.name.trim() === childName.trim() && c.birthDate === birthDate && !c.parentId
    );
    return child || null;
  };

  const addClass = async (newClass: Omit<ClassData, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass),
      });
      if (res.ok) {
        const classData = await res.json();
        setClasses([...classes, classData]);
      }
    } catch (error) {
      console.error('Failed to add class:', error);
      // Fallback: add locally
      const classData: ClassData = {
        ...newClass,
        id: Date.now().toString()
      };
      setClasses([...classes, classData]);
    }
  };

  const updateClass = async (id: string, updates: Partial<ClassData>) => {
    const updatedClasses = classes.map(c => c.id === id ? { ...c, ...updates } : c);
    setClasses(updatedClasses);
    try {
      await fetch(`${API_BASE}/classes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to update class:', error);
    }
  };

  const deleteClass = async (id: string): Promise<void> => {
    // 함수형 업데이트로 원본 상태 저장
    let originalClasses: ClassData[] = [];
    setClasses(prev => {
      originalClasses = [...prev];
      return prev.filter(c => c.id !== id); // Optimistic update
    });
    
    try {
      const res = await fetch(`${API_BASE}/classes/${id}`, {
        method: 'DELETE',
      });
      // 성공 (200-299) 또는 404 (이미 삭제됨)는 정상 처리
      if (res.ok || res.status === 404) {
        return; // 삭제 완료
      }
      // 서버 오류인 경우 로컬 삭제 유지
      if (res.status >= 500) {
        console.warn('서버 오류. 로컬에서만 삭제됩니다.');
        return;
      }
      // 기타 오류는 롤백
      setClasses(originalClasses);
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${res.status}`);
    } catch (error: any) {
      // 네트워크 오류인 경우 로컬에서만 삭제 (fallback)
      const isNetworkError = !error.message || 
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.name === 'TypeError' ||
        error.name === 'NetworkError';
      
      if (isNetworkError) {
        console.warn('서버 연결 실패. 로컬에서만 삭제됩니다.');
        return; // 로컬 삭제는 이미 완료됨
      }
      // 실패 시 롤백
      setClasses(originalClasses);
      console.error('Failed to delete class:', error);
      throw error;
    }
  };

  const addTeacher = async (newTeacher: Omit<Teacher, 'id'>) => {
    try {
      const res = await fetch(`${API_BASE}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacher),
      });
      if (res.ok) {
        const teacher = await res.json();
        setTeachers([...teachers, teacher]);
      }
    } catch (error) {
      console.error('Failed to add teacher:', error);
      // Fallback: add locally
      const teacher: Teacher = {
        ...newTeacher,
        id: Date.now().toString()
      };
      setTeachers([...teachers, teacher]);
    }
  };

  const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
    const updatedTeachers = teachers.map(t => t.id === id ? { ...t, ...updates } : t);
    setTeachers(updatedTeachers);
    try {
      await fetch(`${API_BASE}/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to update teacher:', error);
    }
  };

  const deleteTeacher = async (id: string): Promise<void> => {
    // 함수형 업데이트로 원본 상태 저장
    let originalTeachers: Teacher[] = [];
    setTeachers(prev => {
      originalTeachers = [...prev];
      return prev.filter(t => t.id !== id); // Optimistic update
    });
    
    try {
      const res = await fetch(`${API_BASE}/teachers/${id}`, {
        method: 'DELETE',
      });
      // 성공 (200-299) 또는 404 (이미 삭제됨)는 정상 처리
      if (res.ok || res.status === 404) {
        return; // 삭제 완료
      }
      // 서버 오류인 경우 로컬 삭제 유지
      if (res.status >= 500) {
        console.warn('서버 오류. 로컬에서만 삭제됩니다.');
        return;
      }
      // 기타 오류는 롤백
      setTeachers(originalTeachers);
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${res.status}`);
    } catch (error: any) {
      // 네트워크 오류인 경우 로컬에서만 삭제 (fallback)
      const isNetworkError = !error.message || 
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.name === 'TypeError' ||
        error.name === 'NetworkError';
      
      if (isNetworkError) {
        console.warn('서버 연결 실패. 로컬에서만 삭제됩니다.');
        return; // 로컬 삭제는 이미 완료됨
      }
      // 실패 시 롤백
      setTeachers(originalTeachers);
      console.error('Failed to delete teacher:', error);
      throw error;
    }
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      siteSettings, updateSiteSettings,
      currentUser, login, logout, updateUserProfile, registerUser,
      users, updateUserPassword, updateUserStatus, deleteUser,
      posts, addPost, updatePost, deletePost,
      albumPhotos, addAlbumPhoto, deleteAlbumPhoto,
      registeredChildren, addRegisteredChild, updateRegisteredChild, deleteRegisteredChild, matchChildWithParent,
      classes, addClass, updateClass, deleteClass,
      teachers, addTeacher, updateTeacher, deleteTeacher
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
}
