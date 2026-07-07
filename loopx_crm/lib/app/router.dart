import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'app_shell.dart';

// Auth
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/auth/presentation/screens/signup_screen.dart';

// Main
import '../features/dashboard/presentation/screens/dashboard_screen.dart';
import '../features/inbox/presentation/screens/inbox_screen.dart';
import '../features/inbox/presentation/screens/chat_screen.dart';
import '../features/contacts/presentation/screens/contacts_screen.dart';
import '../features/contacts/presentation/screens/contact_detail_screen.dart';
import '../features/pipelines/presentation/screens/pipelines_screen.dart';
import '../features/workflows/presentation/screens/workflows_screen.dart';
import '../features/settings/presentation/screens/settings_screen.dart';

final routerProvider = Provider<GoRouter>((ref) {

  return GoRouter(
    initialLocation: '/login',
    debugLogDiagnostics: false,
    routes: [
      // Auth routes (no bottom nav)
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        name: 'signup',
        builder: (context, state) => const SignupScreen(),
      ),

      // Main shell with bottom nav
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            AppShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/dashboard',
                name: 'dashboard',
                builder: (context, state) => const DashboardScreen(),
                routes: [
                  GoRoute(
                    path: 'settings',
                    name: 'settings',
                    builder: (context, state) => const SettingsScreen(),
                  ),
                ],
              ),
            ],
          ),

          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/inbox',
                name: 'inbox',
                builder: (context, state) => const InboxScreen(),
                routes: [
                  GoRoute(
                    path: ':conversationId',
                    name: 'chat',
                    builder: (context, state) => ChatScreen(
                      conversationId: state.pathParameters['conversationId']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/contacts',
                name: 'contacts',
                builder: (context, state) => const ContactsScreen(),
                routes: [
                  GoRoute(
                    path: ':contactId',
                    name: 'contact_detail',
                    builder: (context, state) => ContactDetailScreen(
                      contactId: state.pathParameters['contactId']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/pipelines',
                name: 'pipelines',
                builder: (context, state) => const PipelinesScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/workflows',
                name: 'workflows',
                builder: (context, state) => const WorkflowsScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});

