interface User {
  id: string;
  username: string;
  email?: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

class AuthService {
  private state: AuthState = {
    user: null,
    token: null
  };

  constructor() {
    // Load from localStorage on init
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        this.state = JSON.parse(savedAuth);
      } catch {
        localStorage.removeItem('auth');
      }
    }
  }

  async login(username: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.state = {
      user: data.user,
      token: data.token
    };

    localStorage.setItem('auth', JSON.stringify(this.state));
    return data.user;
  }

  async register(userData: { username: string; password: string; email?: string }): Promise<User> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data = await response.json();
    return data.user;
  }

  logout(): void {
    this.state = { user: null, token: null };
    localStorage.removeItem('auth');
  }

  getUser(): User | null {
    return this.state.user;
  }

  getToken(): string | null {
    return this.state.token;
  }

  isAuthenticated(): boolean {
    return !!this.state.user;
  }

  isAdmin(): boolean {
    return this.state.user?.role === 'admin';
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.state.token) {
      headers.Authorization = `Bearer ${this.state.token}`;
    }
    return headers;
  }
}

export const authService = new AuthService();
