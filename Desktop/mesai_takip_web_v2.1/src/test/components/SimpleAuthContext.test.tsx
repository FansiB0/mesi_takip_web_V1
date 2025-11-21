import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { ReactNode } from 'react'

// Mock the auth service
vi.mock('../../services/supabaseAuthService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  logoutUser: vi.fn(),
  getCurrentUser: vi.fn(),
}))

// Get the mocked functions
const { loginUser: mockLoginUser, getCurrentUser: mockGetCurrentUser } = vi.hoisted(() => ({
  loginUser: vi.fn(),
  getCurrentUser: vi.fn(),
}));

// Simple test component
const TestComponent = () => {
  const { user, login, logout, isLoading } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not loading'}</div>
      <div data-testid="user">{user ? user.name : 'no user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

const renderWithAuthProvider = (component: ReactNode) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('AuthContext - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Default mock implementations
    mockGetCurrentUser.mockResolvedValue(null)
  })

  it('should initialize with no user and not loading', async () => {
    renderWithAuthProvider(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not loading')
    })
    expect(screen.getByTestId('user')).toHaveTextContent('no user')
  })

  it('should render login and logout buttons', () => {
    renderWithAuthProvider(<TestComponent />)
    
    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})
