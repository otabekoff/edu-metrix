import React from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { AppLayout } from '@/app/AppLayout';
import { LandingPage } from '@/pages/landing/LandingPage';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { MentorDashboard } from '@/pages/mentor/MentorDashboard';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';

export interface VueRouteRecord {
  path: string;
  name?: string;
  component?: React.ComponentType<any>;
  children?: VueRouteRecord[];
  redirect?: string;
}

export function convertVueRouteToReactRoute(route: VueRouteRecord): RouteObject {
  const reactRoute: RouteObject = {
    path: route.path,
  };

  if (route.redirect) {
    reactRoute.element = <Navigate to={route.redirect} replace />;
  } else if (route.component) {
    const Component = route.component;
    reactRoute.element = <Component />;
  }

  if (route.children) {
    reactRoute.children = route.children.map(convertVueRouteToReactRoute);
  }

  return reactRoute;
}

const vueRoutes: VueRouteRecord[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        component: LandingPage,
      },
      {
        path: 'student',
        redirect: '/student/overview',
      },
      {
        path: 'student/:tab',
        component: StudentDashboard,
      },
      {
        path: 'mentor',
        redirect: '/mentor/journal',
      },
      {
        path: 'mentor/:tab',
        component: MentorDashboard,
      },
      {
        path: 'admin',
        redirect: '/admin/matrix',
      },
      {
        path: 'admin/:tab',
        component: AdminDashboard,
      },
    ],
  },
];

const basename =
  typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')
    ? '/edu-metrix'
    : undefined;

export const router = createBrowserRouter(vueRoutes.map(convertVueRouteToReactRoute), {
  basename,
});
export default router;
