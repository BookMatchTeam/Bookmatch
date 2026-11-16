import { Navigate, createBrowserRouter } from 'react-router'

import { AuthenticatedLayout } from '@/app/router/layouts/authenticated-layout'
import { NotFoundPage } from '@/app/router/not-found-page'
import { paths } from '@/app/router/paths'
import { AuthLayout } from '@/features/auth/layouts/auth-layout'

export const appRouter = createBrowserRouter([
  {
    index: true,
    element: <Navigate to={paths.signIn} replace />,
  },
  {
    Component: AuthLayout,
    children: [
      {
        path: paths.signIn,
        lazy: async () => {
          const { SignInPage } = await import(
            '@/features/auth/sign-in/sign-in-page'
          )

          return { Component: SignInPage }
        },
      },
      {
        path: paths.signUp,
        lazy: async () => {
          const { SignUpPage } = await import('@/features/auth/sign-up/sign-up-page')

          return { Component: SignUpPage }
        },
      },
      {
        path: paths.recoverPassword,
        lazy: async () => {
          const { RecoverPasswordPage } = await import(
            '@/features/auth/recover-password/recover-password-page'
          )

          return { Component: RecoverPasswordPage }
        },
      },
    ],
  },
  {
    Component: AuthenticatedLayout,
    children: [
      {
        path: paths.discovery,
        lazy: async () => {
          const { DiscoveryPage } = await import(
            '@/features/discovery/discovery/discovery-page'
          )

          return { Component: DiscoveryPage }
        },
      },
      {
        path: paths.matches,
        lazy: async () => {
          const { MatchesPage } = await import(
            '@/features/matches/matches/matches-page'
          )

          return { Component: MatchesPage }
        },
      },
      {
        path: paths.messages,
        lazy: async () => {
          const { MessagesPage } = await import(
            '@/features/chat/messages/messages-page'
          )

          return { Component: MessagesPage }
        },
      },
      {
        path: paths.profile,
        lazy: async () => {
          const { ProfilePage } = await import(
            '@/features/profile/profile/profile-page'
          )

          return { Component: ProfilePage }
        },
      },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
])
