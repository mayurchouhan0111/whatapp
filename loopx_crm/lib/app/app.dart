import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'router.dart';
import '../core/theme/app_theme.dart';
import '../core/theme/theme_notifier.dart';

class LoopXApp extends ConsumerWidget {
  const LoopXApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'LoopX CRM',
      debugShowCheckedModeBanner: false,
theme: AppTheme.light,
       darkTheme: AppTheme.dark,
       themeMode: ref.watch(themeModeProvider),
      routerConfig: router,
    );
  }
}
