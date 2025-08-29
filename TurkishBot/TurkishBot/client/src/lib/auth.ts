import { User } from "@shared/schema";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export class AuthManager {
  private static instance: AuthManager;
  private user: User | null = null;
  private token: string | null = null;

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadFromStorage(): void {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      
      if (token && userStr) {
        this.token = token;
        this.user = JSON.parse(userStr);
      }
    } catch (error) {
      console.error("Error loading auth data from storage:", error);
      this.logout();
    }
  }

  login(user: User, token: string): void {
    this.user = user;
    this.token = token;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    this.user = null;
    this.token = null;
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.user !== null && this.token !== null;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  updateUser(updatedUser: User): void {
    if (this.user) {
      this.user = { ...this.user, ...updatedUser };
      localStorage.setItem(USER_KEY, JSON.stringify(this.user));
    }
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }
}

export const authManager = AuthManager.getInstance();
