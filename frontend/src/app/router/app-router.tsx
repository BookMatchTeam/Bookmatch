import { Navigate, createBrowserRouter } from 'react-router'

import { AuthenticatedLayout } from '@/app/router/layouts/authenticated-layout'
import { PublicLayout } from '@/app/router/layouts/public-layout'
import { NotFoundPage } from '@/app/router/not-found-page'
import { paths } from '@/app/router/paths'

export const appRouter = createBrowserRouter([
  {
    Component: PublicLayout,
    children: [
      {
        index: true,
        element: <Navigate to={paths.signIn} replace />,
      },
      {
        path: paths.signIn,
        lazy: async () => {
          const { SignInPage } = await import(
            '@/features/auth/pages/sign-in-page'
          )

          return { Component: SignInPage }
        },
      },
      {
        path: paths.signUp,
        lazy: async () => {
          const { SignUpPage } = await import('@/features/auth/pages/sign-up-page')

          return { Component: SignUpPage }
        },
      },
      {
        path: paths.recoverPassword,
        lazy: async () => {
          const { RecoverPasswordPage } = await import(
            '@/features/auth/pages/recover-password-page'
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
            '@/features/discovery/pages/discovery-page'
          )

          return { Component: DiscoveryPage }
        },
      },
      {
        path: paths.matches,
        lazy: async () => {
          const { MatchesPage } = await import(
            '@/features/matches/pages/matches-page'
          )

          return { Component: MatchesPage }
        },
      },
      {
        path: paths.messages,
        lazy: async () => {
          const { MessagesPage } = await import(
            '@/features/chat/pages/messages-page'
          )

          return { Component: MessagesPage }
        },
      },
      {
        path: paths.profile,
        lazy: async () => {
          const { ProfilePage } = await import(
            '@/features/profile/pages/profile-page'
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
