import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Data types matching client-side interfaces
export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  type: 'notice' | 'event' | 'album' | 'board' | 'menu';
  classId?: string;
  parentId?: string;
  images?: string[];
}

export interface AlbumPhoto {
  id: number;
  url: string;
  title: string;
  date: string;
  classId?: string;
}

export interface AppUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'parent' | 'teacher' | 'nutritionist';
  child?: {
    name: string;
    age: number;
    classId: string;
    birthDate?: string;
  };
  phone?: string;
  classId?: string;
  approved: boolean;
}

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

export interface ClassData {
  id: string;
  name: string;
  age: string;
  teacher: string;
  color: string;
  description: string;
  schedule: Array<{ time: string; activity: string }>;
}

export interface RegisteredChild {
  id: string;
  name: string;
  birthDate: string;
  classId: string;
  parentId?: string;
}

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

interface AppData {
  posts: Post[];
  albumPhotos: AlbumPhoto[];
  users: AppUser[];
  teachers: Teacher[];
  classes: ClassData[];
  registeredChildren: RegisteredChild[];
  siteSettings: SiteSettings;
}

const DATA_FILE = join(process.cwd(), '.tmp', 'app-data.json');

function loadData(): AppData {
  if (existsSync(DATA_FILE)) {
    try {
      const data = readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load data file:', e);
    }
  }
  
  // Default data
  return {
    posts: [
      { id: 1, title: "[공지] 12월 겨울방학 안내", content: "겨울방학 기간은 12월 25일부터 1월 5일까지입니다.", author: "원장님", date: "2024-12-01", type: "notice" },
      { id: 2, title: "[행사] 크리스마스 산타 잔치", content: "아이들이 기다리던 산타 잔치가 열립니다!", author: "관리자", date: "2024-11-28", type: "event" },
    ],
    albumPhotos: [
      { id: 1, url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80", title: "가을 소풍", date: "2024-10-15" },
    ],
    users: [
      { id: '1', username: 'admin', password: '123', name: '관리자', role: 'admin', approved: true },
    ],
    teachers: [],
    classes: [],
    registeredChildren: [],
    siteSettings: {
      address: "서울 강서구 양천로75길 57 현대1차아파트 104동 102호",
      phone: "02-2659-7977",
      email: "yhee@naver.com",
      mapLink: "https://map.naver.com/p/search/서울 강서구 양천로75길 57",
      aboutDescription: "아이들의 꿈이 자라는 따뜻한 둥지, 코코베베어린이집입니다.",
      history: [],
      greetingTitle: "아이들의 꿈이 자라는 따뜻한 둥지",
      greetingMessage: "안녕하세요, 코코베베어린이집입니다.",
      greetingImageUrl: "",
      greetingSignature: "코코베베어린이집 박윤희 원장",
      philosophy: [],
      facilityImages: [],
    },
  };
}

function saveData(data: AppData): void {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save data file:', e);
  }
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // App data methods
  getPosts(): Promise<Post[]>;
  addPost(post: Omit<Post, 'id' | 'date'>): Promise<Post>;
  updatePost(id: number, post: Partial<Post>): Promise<Post | null>;
  deletePost(id: number): Promise<boolean>;
  
  getAlbumPhotos(): Promise<AlbumPhoto[]>;
  addAlbumPhoto(photo: Omit<AlbumPhoto, 'id' | 'date'>): Promise<AlbumPhoto>;
  deleteAlbumPhoto(id: number): Promise<boolean>;
  
  getAppUsers(): Promise<AppUser[]>;
  addAppUser(user: Omit<AppUser, 'id'>): Promise<AppUser>;
  updateAppUser(id: string, user: Partial<AppUser>): Promise<AppUser | null>;
  deleteAppUser(id: string): Promise<boolean>;
  
  getTeachers(): Promise<Teacher[]>;
  addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher | null>;
  deleteTeacher(id: string): Promise<boolean>;
  
  getClasses(): Promise<ClassData[]>;
  addClass(cls: Omit<ClassData, 'id'>): Promise<ClassData>;
  updateClass(id: string, cls: Partial<ClassData>): Promise<ClassData | null>;
  deleteClass(id: string): Promise<boolean>;
  
  getRegisteredChildren(): Promise<RegisteredChild[]>;
  addRegisteredChild(child: Omit<RegisteredChild, 'id'>): Promise<RegisteredChild>;
  updateRegisteredChild(id: string, child: Partial<RegisteredChild>): Promise<RegisteredChild | null>;
  deleteRegisteredChild(id: string): Promise<boolean>;
  
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: SiteSettings): Promise<SiteSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private data: AppData;

  constructor() {
    this.users = new Map();
    this.data = loadData();
  }

  private persist(): void {
    saveData(this.data);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    return [...this.data.posts];
  }

  async addPost(post: Omit<Post, 'id' | 'date'>): Promise<Post> {
    const newId = Math.max(0, ...this.data.posts.map(p => p.id)) + 1;
    const newPost: Post = {
      ...post,
      id: newId,
      date: new Date().toISOString().split('T')[0],
    };
    this.data.posts.push(newPost);
    this.persist();
    return newPost;
  }

  async updatePost(id: number, post: Partial<Post>): Promise<Post | null> {
    const index = this.data.posts.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.posts[index] = { ...this.data.posts[index], ...post };
    this.persist();
    return this.data.posts[index];
  }

  async deletePost(id: number): Promise<boolean> {
    const index = this.data.posts.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.posts.splice(index, 1);
    this.persist();
    return true;
  }

  // Album Photos
  async getAlbumPhotos(): Promise<AlbumPhoto[]> {
    return [...this.data.albumPhotos];
  }

  async addAlbumPhoto(photo: Omit<AlbumPhoto, 'id' | 'date'>): Promise<AlbumPhoto> {
    const newId = Math.max(0, ...this.data.albumPhotos.map(p => p.id)) + 1;
    const newPhoto: AlbumPhoto = {
      ...photo,
      id: newId,
      date: new Date().toISOString().split('T')[0],
    };
    this.data.albumPhotos.push(newPhoto);
    this.persist();
    return newPhoto;
  }

  async deleteAlbumPhoto(id: number): Promise<boolean> {
    const index = this.data.albumPhotos.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.albumPhotos.splice(index, 1);
    this.persist();
    return true;
  }

  // App Users
  async getAppUsers(): Promise<AppUser[]> {
    return [...this.data.users];
  }

  async addAppUser(user: Omit<AppUser, 'id'>): Promise<AppUser> {
    const newId = randomUUID();
    const newUser: AppUser = { ...user, id: newId };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  async updateAppUser(id: string, user: Partial<AppUser>): Promise<AppUser | null> {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...user };
    this.persist();
    return this.data.users[index];
  }

  async deleteAppUser(id: string): Promise<boolean> {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    this.persist();
    return true;
  }

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    return [...this.data.teachers];
  }

  async addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    const newId = randomUUID();
    const newTeacher: Teacher = { ...teacher, id: newId };
    this.data.teachers.push(newTeacher);
    this.persist();
    return newTeacher;
  }

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher | null> {
    const index = this.data.teachers.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.data.teachers[index] = { ...this.data.teachers[index], ...teacher };
    this.persist();
    return this.data.teachers[index];
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const index = this.data.teachers.findIndex(t => t.id === id);
    if (index === -1) return false;
    this.data.teachers.splice(index, 1);
    this.persist();
    return true;
  }

  // Classes
  async getClasses(): Promise<ClassData[]> {
    return [...this.data.classes];
  }

  async addClass(cls: Omit<ClassData, 'id'>): Promise<ClassData> {
    const newId = randomUUID();
    const newClass: ClassData = { ...cls, id: newId };
    this.data.classes.push(newClass);
    this.persist();
    return newClass;
  }

  async updateClass(id: string, cls: Partial<ClassData>): Promise<ClassData | null> {
    const index = this.data.classes.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.classes[index] = { ...this.data.classes[index], ...cls };
    this.persist();
    return this.data.classes[index];
  }

  async deleteClass(id: string): Promise<boolean> {
    const index = this.data.classes.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.classes.splice(index, 1);
    this.persist();
    return true;
  }

  // Registered Children
  async getRegisteredChildren(): Promise<RegisteredChild[]> {
    return [...this.data.registeredChildren];
  }

  async addRegisteredChild(child: Omit<RegisteredChild, 'id'>): Promise<RegisteredChild> {
    const newId = randomUUID();
    const newChild: RegisteredChild = { ...child, id: newId };
    this.data.registeredChildren.push(newChild);
    this.persist();
    return newChild;
  }

  async updateRegisteredChild(id: string, child: Partial<RegisteredChild>): Promise<RegisteredChild | null> {
    const index = this.data.registeredChildren.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.registeredChildren[index] = { ...this.data.registeredChildren[index], ...child };
    this.persist();
    return this.data.registeredChildren[index];
  }

  async deleteRegisteredChild(id: string): Promise<boolean> {
    const index = this.data.registeredChildren.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.registeredChildren.splice(index, 1);
    this.persist();
    return true;
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    return { ...this.data.siteSettings };
  }

  async updateSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
    this.data.siteSettings = { ...settings };
    this.persist();
    return this.data.siteSettings;
  }
}

export const storage = new MemStorage();
