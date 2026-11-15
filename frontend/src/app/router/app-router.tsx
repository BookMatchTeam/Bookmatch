import { Navigate, createBrowserRouter } from 'react-router'

import { AuthenticatedLayout } from '@/app/router/layouts/authenticated-layout'
import { PublicLayout } from '@/app/router/layouts/public-layout'
import { NotFoundPage } from '@/app/router/not-found-page'
import { paths } from '@/app/router/paths'
import {
  RecoverPasswordPage,
  SignInPage,
  SignUpPage,
} from '@/features/auth/pages/auth-pages'
import { MessagesPage } from '@/features/chat/pages/messages-page'
import { DiscoveryPage } from '@/features/discovery/pages/discovery-page'
import { MatchesPage } from '@/features/matches/pages/matches-page'
import { ProfilePage } from '@/features/profile/pages/profile-page'

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
        Component: SignInPage,
      },
      {
        path: paths.signUp,
        Component: SignUpPage,
      },
      {
        path: paths.recoverPassword,
        Component: RecoverPasswordPage,
      },
    ],
  },
  {
    Component: AuthenticatedLayout,
    children: [
      {
        path: paths.discovery,
        Component: DiscoveryPage,
      },
      {
        path: paths.matches,
        Component: MatchesPage,
      },
      {
        path: paths.messages,
        Component: MessagesPage,
      },
      {
        path: paths.profile,
        Component: ProfilePage,
      },
    ],
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
])
