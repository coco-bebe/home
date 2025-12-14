import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import * as crypto from "crypto";

// 개인정보 및 인증 정보를 별도로 저장하는 보안 저장소

const SECRET_KEY = process.env.SECRET_KEY || 'cocobebe-default-secret-key-change-in-production';
const SALT_LENGTH = 16;

// 비밀번호 해싱 함수
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// 비밀번호 검증 함수
function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// 민감한 정보 암호화
function encrypt(text: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// 민감한 정보 복호화
function decrypt(encryptedText: string): string {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(SECRET_KEY, 'salt', 32);
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// 개인정보 인터페이스 (암호화되어 저장)
interface SecureUser {
  id: string;
  username: string;
  passwordHash: string; // 해시된 비밀번호
  name: string;
  role: 'admin' | 'parent' | 'teacher' | 'nutritionist';
  child?: {
    name: string;
    age: number;
    classId: string;
    birthDate?: string;
  };
  phone?: string; // 암호화되어 저장
  classId?: string;
  approved: boolean;
}

interface SecureTeacher {
  id: string;
  name: string;
  username: string;
  passwordHash: string; // 해시된 비밀번호
  phone?: string; // 암호화되어 저장
  classId: string;
  approved: boolean;
  photoUrl?: string;
}

interface SecureData {
  users: SecureUser[];
  teachers: SecureTeacher[];
}

const SECURE_DATA_FILE = join(process.cwd(), '.tmp', 'secure-data.json');

function loadSecureData(): SecureData {
  if (existsSync(SECURE_DATA_FILE)) {
    try {
      const data = readFileSync(SECURE_DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load secure data file:', e);
    }
  }
  
  return {
    users: [
      {
        id: '1',
        username: 'admin',
        passwordHash: hashPassword('123'),
        name: '관리자',
        role: 'admin',
        approved: true
      }
    ],
    teachers: []
  };
}

function saveSecureData(data: SecureData): void {
  try {
    writeFileSync(SECURE_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save secure data file:', e);
  }
}

// 클라이언트용 인터페이스 (비밀번호 제외)
export interface AppUser {
  id: string;
  username: string;
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
  phone?: string;
  classId: string;
  approved: boolean;
  photoUrl?: string;
}

export class SecureStorage {
  private data: SecureData;

  constructor() {
    this.data = loadSecureData();
  }

  private persist(): void {
    saveSecureData(this.data);
  }

  // 사용자 인증
  async verifyUser(username: string, password: string): Promise<AppUser | null> {
    const user = this.data.users.find(u => u.username === username);
    if (!user) return null;
    
    if (verifyPassword(password, user.passwordHash)) {
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        child: user.child,
        phone: user.phone ? decrypt(user.phone) : undefined,
        classId: user.classId,
        approved: user.approved
      };
    }
    return null;
  }

  // 선생님 인증
  async verifyTeacher(username: string, password: string): Promise<Teacher | null> {
    const teacher = this.data.teachers.find(t => t.username === username);
    if (!teacher) return null;
    
    if (verifyPassword(password, teacher.passwordHash)) {
      return {
        id: teacher.id,
        name: teacher.name,
        username: teacher.username,
        phone: teacher.phone ? decrypt(teacher.phone) : undefined,
        classId: teacher.classId,
        approved: teacher.approved,
        photoUrl: teacher.photoUrl
      };
    }
    return null;
  }

  // 사용자 추가 (비밀번호는 해시하여 저장)
  async addUser(user: Omit<AppUser, 'id'> & { password: string }): Promise<AppUser> {
    const newId = randomUUID();
    const secureUser: SecureUser = {
      id: newId,
      username: user.username,
      passwordHash: hashPassword(user.password),
      name: user.name,
      role: user.role,
      child: user.child,
      phone: user.phone ? encrypt(user.phone) : undefined,
      classId: user.classId,
      approved: user.approved || false
    };
    
    this.data.users.push(secureUser);
    this.persist();
    
    return {
      id: newId,
      username: user.username,
      name: user.name,
      role: user.role,
      child: user.child,
      phone: user.phone,
      classId: user.classId,
      approved: user.approved || false
    };
  }

  // 선생님 추가
  async addTeacher(teacher: Omit<Teacher, 'id'> & { password: string }): Promise<Teacher> {
    const newId = randomUUID();
    const secureTeacher: SecureTeacher = {
      id: newId,
      name: teacher.name,
      username: teacher.username,
      passwordHash: hashPassword(teacher.password),
      phone: teacher.phone ? encrypt(teacher.phone) : undefined,
      classId: teacher.classId,
      approved: teacher.approved || false,
      photoUrl: teacher.photoUrl
    };
    
    this.data.teachers.push(secureTeacher);
    this.persist();
    
    return {
      id: newId,
      name: teacher.name,
      username: teacher.username,
      phone: teacher.phone,
      classId: teacher.classId,
      approved: teacher.approved || false,
      photoUrl: teacher.photoUrl
    };
  }

  // 비밀번호 변경
  async updatePassword(userId: string, newPassword: string, isTeacher: boolean = false): Promise<boolean> {
    if (isTeacher) {
      const teacher = this.data.teachers.find(t => t.id === userId);
      if (!teacher) return false;
      teacher.passwordHash = hashPassword(newPassword);
    } else {
      const user = this.data.users.find(u => u.id === userId);
      if (!user) return false;
      user.passwordHash = hashPassword(newPassword);
    }
    this.persist();
    return true;
  }

  // 사용자 목록 조회 (비밀번호 제외)
  async getUsers(): Promise<AppUser[]> {
    return this.data.users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      child: u.child,
      phone: u.phone ? decrypt(u.phone) : undefined,
      classId: u.classId,
      approved: u.approved
    }));
  }

  // 선생님 목록 조회
  async getTeachers(): Promise<Teacher[]> {
    return this.data.teachers.map(t => ({
      id: t.id,
      name: t.name,
      username: t.username,
      phone: t.phone ? decrypt(t.phone) : undefined,
      classId: t.classId,
      approved: t.approved,
      photoUrl: t.photoUrl
    }));
  }
}

export const secureStorage = new SecureStorage();

