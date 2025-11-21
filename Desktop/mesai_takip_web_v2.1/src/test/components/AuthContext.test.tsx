import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import { ReactNode } from 'react'

// Mock the auth service at the top level with factory function
vi.mock('../../services/supabaseAuthService', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  logoutUser: vi.fn(),
  getCurrentUser: vi.fn(),
}))

// Get the mocked functions after the mock is defined
const { loginUser: mockLoginUser, registerUser: mockRegisterUser, logoutUser: mockLogoutUser, getCurrentUser: mockGetCurrentUser } = await vi.importMock<typeof import('../../services/supabaseAuthService')>()

// Test component to use the auth context
const TestComponent = () => {
  const { user, login, register, logout, isLoading } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not loading'}</div>
      <div data-testid="user">{user ? user.name : 'no user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => register('Test User', 'test@example.com', 'password', '2024-01-01')}>
        Register
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

describe('AuthContext', () => {
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

  it('should handle login successfully', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }

    mockLoginUser.mockResolvedValue(mockUser)

    renderWithAuthProvider(<TestComponent />)
    
    const loginButton = screen.getByText('Login')
    await userEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
    })
  })

  it('should handle login errors', async () => {
    const mockError = new Error('Invalid credentials')
    mockLoginUser.mockRejectedValue(mockError)

    renderWithAuthProvider(<TestComponent />)
    
    const loginButton = screen.getByText('Login')
    await userEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
    })
  })

  it('should handle logout', async () => {
    const mockUser = {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    }

    mockLoginUser.mockResolvedValue(mockUser)
    mockLogoutUser.mockResolvedValue(undefined)

    renderWithAuthProvider(<TestComponent />)
    
    // First login
    const loginButton = screen.getByText('Login')
    await userEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User')
    })

    // Then logout
    const logoutButton = screen.getByText('Logout')
    await userEvent.click(logoutButton)

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
    })
  })
})
