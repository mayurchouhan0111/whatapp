import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// A Riverpod StateNotifier that holds the current [ThemeMode].
///
/// The default mode follows the system setting. UI can read
/// `ref.watch(themeModeProvider)` and call `ref.read(themeModeProvider.notifier).toggle()`
/// to switch between light and dark.
class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier() : super(ThemeMode.light);

  /// Toggle between light and dark mode.
  void toggle() {
    state = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
  }

  /// Set a specific mode.
  void set(ThemeMode mode) {
    state = mode;
  }
}

/// Riverpod provider for the app's theme mode.
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier();
});
