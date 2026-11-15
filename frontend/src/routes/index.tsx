import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import HomePage from '@/pages/HomePage'
import ProfilePage from '@/pages/ProfilePage'
import LibraryPage from '@/pages/LibraryPage'
import AddBookPage from '@/pages/AddBookPage'
import ReadersPage from '@/pages/ReadersPage'
import MatchesPage from '@/pages/MatchesPage'
import GroupsPage from '@/pages/GroupsPage'
import MessagesPage from '@/pages/MessagesPage'
import BookDetailsPage from '@/pages/BookDetailsPage'
import OnboardingPage from '@/pages/OnboardingPage'
import AccountSetupPage from '@/pages/AccountSetupPage'
import { BooksStorage } from '@/services/booksStorage'

// Guarda de rota para telas que exigem usuário autenticado
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('bm_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

// Redirecionador inteligente para a tela inicial / raiz
function RootRedirect() {
  const token = localStorage.getItem('bm_token')
  const onboardingCompleted = localStorage.getItem('bm_onboarding_completed')
  const accountSetupCompleted = localStorage.getItem('bm_account_setup_completed')

  // Sem autenticação: vai direto para a tela de Login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Com login feito, se for conta nova sem preferências: onboarding de gêneros e livros
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  // Se já escolheu preferências mas ainda não configurou o perfil de leitor
  if (!accountSetupCompleted) {
    return <Navigate to="/configurar-perfil" replace />
  }

  // Usuário com perfil configurado e com livros: vai direto para os Matches
  if (BooksStorage.hasRegisteredBooks()) {
    return <Navigate to="/matches" replace />
  }

  // Usuário com perfil configurado sem livros: vai para o acervo pessoal
  return <Navigate to="/biblioteca" replace />
}

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/cadastro', element: <RegisterPage /> },
  { path: '/recuperar-senha', element: <ForgotPasswordPage /> },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/configurar-perfil',
    element: (
      <ProtectedRoute>
        <AccountSetupPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/leitores',
    element: (
      <ProtectedRoute>
        <ReadersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/biblioteca',
    element: (
      <ProtectedRoute>
        <LibraryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/adicionar-livro',
    element: (
      <ProtectedRoute>
        <AddBookPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/matches',
    element: (
      <ProtectedRoute>
        <MatchesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/grupos',
    element: (
      <ProtectedRoute>
        <GroupsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mensagens',
    element: (
      <ProtectedRoute>
        <MessagesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/livro/:id',
    element: (
      <ProtectedRoute>
        <BookDetailsPage />
      </ProtectedRoute>
    ),
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])


