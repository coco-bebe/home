import React, { createContext, useContext, useState, useEffect } from 'react';
import { CLASSES as MOCK_CLASSES } from './mockData';

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
  role: 'admin' | 'parent' | 'teacher';
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
  type: 'notice' | 'event' | 'album' | 'board';
  classId?: string; 
  parentId?: string; // 알림장의 경우 특정 학부모에게만 보이도록
  images?: string[];
}

interface AppContextType {
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: SiteSettings) => void;
  currentUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateUserProfile: (user: Partial<User>) => void;
  registerUser: (user: Omit<User, 'id' | 'approved'>) => void;
  users: User[];
  updateUserPassword: (userId: string, password: string) => void;
  updateUserStatus: (userId: string, approved: boolean) => void;
  deleteUser: (userId: string) => void;
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'date'>) => void;
  updatePost: (id: number, post: Partial<Post>) => void;
  deletePost: (postId: number) => void;
  albumPhotos: AlbumPhoto[];
  addAlbumPhoto: (photo: Omit<AlbumPhoto, 'id' | 'date'>) => void;
  deleteAlbumPhoto: (photoId: number) => void;
  registeredChildren: RegisteredChild[];
  addRegisteredChild: (child: Omit<RegisteredChild, 'id'>) => void;
  updateRegisteredChild: (id: string, child: Partial<RegisteredChild>) => void;
  deleteRegisteredChild: (id: string) => void;
  matchChildWithParent: (childName: string, birthDate: string) => RegisteredChild | null;
  classes: ClassData[];
  addClass: (cls: Omit<ClassData, 'id'>) => void;
  updateClass: (id: string, cls: Partial<ClassData>) => void;
  deleteClass: (id: string) => void;
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
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
];

const MOCK_POSTS: Post[] = [
  { id: 1, title: "[공지] 12월 겨울방학 안내", content: "겨울방학 기간은 12월 25일부터 1월 5일까지입니다. 가정통신문을 참고해주세요.", author: "원장님", date: "2024-12-01", type: "notice" },
  { id: 2, title: "[행사] 크리스마스 산타 잔치", content: "아이들이 기다리던 산타 잔치가 열립니다! 빨간 옷을 입혀 보내주세요.", author: "관리자", date: "2024-11-28", type: "event" },
  { id: 3, title: "[식단] 12월 식단표 안내", content: "균형 잡힌 영양 식단표입니다. 알레르기가 있는 어린이는 미리 말씀해주세요.", author: "영양사", date: "2024-11-25", type: "notice" },
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('siteSettings');
    return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
     const saved = localStorage.getItem('users');
     return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
     const saved = localStorage.getItem('posts');
     return saved ? JSON.parse(saved) : MOCK_POSTS;
  });

  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>(() => {
      const saved = localStorage.getItem('albumPhotos');
      return saved ? JSON.parse(saved) : MOCK_ALBUM_PHOTOS;
  });

  const [registeredChildren, setRegisteredChildren] = useState<RegisteredChild[]>(() => {
      const saved = localStorage.getItem('registeredChildren');
      return saved ? JSON.parse(saved) : MOCK_REGISTERED_CHILDREN;
  });

  const [classes, setClasses] = useState<ClassData[]>(() => {
      const saved = localStorage.getItem('classes');
      return saved ? JSON.parse(saved) : MOCK_CLASSES;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
      const saved = localStorage.getItem('teachers');
      return saved ? JSON.parse(saved) : MOCK_TEACHERS;
  });

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

  // Persistence
  useEffect(() => { localStorage.setItem('siteSettings', JSON.stringify(siteSettings)); }, [siteSettings]);
  useEffect(() => { 
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
    else localStorage.removeItem('currentUser');
  }, [currentUser]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('albumPhotos', JSON.stringify(albumPhotos)); }, [albumPhotos]);
  useEffect(() => { localStorage.setItem('registeredChildren', JSON.stringify(registeredChildren)); }, [registeredChildren]);
  useEffect(() => { localStorage.setItem('classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('teachers', JSON.stringify(teachers)); }, [teachers]);

  const updateSiteSettings = (newSettings: SiteSettings) => setSiteSettings(newSettings);

  const login = (username: string, password: string) => {
    // 일반 사용자(학부모, 관리자) 로그인
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

  const updateUserPassword = (userId: string, password: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password } : u));
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, password });
    }
  };

  const updateUserProfile = (updates: Partial<User>) => {
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
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const registerUser = (newUser: Omit<User, 'id' | 'approved'>) => {
    const id = (users.length + 1).toString();
    const safeName = newUser.name?.trim() || newUser.username;
    let user: User = { ...newUser, name: safeName, id, approved: false };

    // If registering parent with child info, attempt automatic linking
    if (user.role === 'parent' && user.child && user.child.name && user.child.birthDate) {
      const matched = registeredChildren.find(
        c => c.name.trim() === user.child!.name.trim() && c.birthDate === user.child!.birthDate && !c.parentId
      );
      if (matched) {
        // link registered child to this new user
        setRegisteredChildren(prev => prev.map(c => c.id === matched.id ? { ...c, parentId: id } : c));

        // ensure parent's child.classId matches the registered child's class
        user = { ...user, child: { ...user.child, classId: matched.classId } };
      }
    }

    setUsers([...users, user]);
  };

  const updateUserStatus = (userId: string, approved: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved } : u));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const addPost = (newPost: Omit<Post, 'id' | 'date'>) => {
    const post: Post = {
      ...newPost,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setPosts([post, ...posts]);
  };

  const updatePost = (id: number, updatedPost: Partial<Post>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updatedPost } : p));
  };

  const deletePost = (postId: number) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const addAlbumPhoto = (newPhoto: Omit<AlbumPhoto, 'id' | 'date'>) => {
    const photo: AlbumPhoto = {
        ...newPhoto,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0]
    };
    setAlbumPhotos([photo, ...albumPhotos]);
  };

  const deleteAlbumPhoto = (photoId: number) => {
      setAlbumPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const addRegisteredChild = (newChild: Omit<RegisteredChild, 'id'>) => {
    let child: RegisteredChild = {
      ...newChild,
      id: Date.now().toString()
    };

    // Attempt to auto-link with existing parent
    const parentUser = users.find(u => 
      u.role === 'parent' && 
      u.child && 
      u.child.name.trim() === child.name.trim() && 
      u.child.birthDate === child.birthDate
    );
    if (parentUser) {
      child = { ...child, parentId: parentUser.id };
    }

    setRegisteredChildren([...registeredChildren, child]);
  };

  const updateRegisteredChild = (id: string, updates: Partial<RegisteredChild>) => {
    setRegisteredChildren(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteRegisteredChild = (id: string) => {
    setRegisteredChildren(prev => prev.filter(c => c.id !== id));
  };

  const matchChildWithParent = (childName: string, birthDate: string): RegisteredChild | null => {
    const child = registeredChildren.find(
      c => c.name.trim() === childName.trim() && c.birthDate === birthDate && !c.parentId
    );
    return child || null;
  };

  const addClass = (newClass: Omit<ClassData, 'id'>) => {
    const classData: ClassData = {
      ...newClass,
      id: Date.now().toString()
    };
    setClasses([...classes, classData]);
  };

  const updateClass = (id: string, updates: Partial<ClassData>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const addTeacher = (newTeacher: Omit<Teacher, 'id'>) => {
    const teacher: Teacher = {
      ...newTeacher,
      id: Date.now().toString()
    };
    setTeachers([...teachers, teacher]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

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
