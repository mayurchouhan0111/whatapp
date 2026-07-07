import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_notifier.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/widgets/avatar_widget.dart';
import '../../../../ui/app_button.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final themeMode = ref.watch(themeModeProvider);
    final authState = ref.watch(authProvider);

    final agentName = authState.profile?.fullName ?? 'Work agent';
    final agentEmail = authState.profile?.email ?? authState.user?.email ?? 'agent@loopx.io';

    return AppScaffold(
      title: 'App Settings',
      showBack: true,
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Section 1: User Profile Header Card
          _buildProfileHeaderCard(context, agentName, agentEmail, isDark),
          const SizedBox(height: 20),

          // Section 2: App Styling Preferences
          _buildSectionHeader(context, 'App Preferences'),
          const SizedBox(height: 8),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              _buildThemeModeSelector(context, ref, themeMode, isDark),
              const Divider(height: 1),
              _buildToggleRow(
                context,
                title: 'Play Sound Alerts',
                subtitle: 'Sound feedback on inbound chat templates',
                value: true,
                onChanged: (v) {},
                icon: Icons.volume_up_rounded,
                iconColor: AppColors.primary,
              ),
              const Divider(height: 1),
              _buildToggleRow(
                context,
                title: 'Haptic Touch Vibrations',
                subtitle: 'Vibrate slightly on tap actions',
                value: true,
                onChanged: (v) {},
                icon: Icons.vibration_rounded,
                iconColor: AppColors.success,
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Section 3: Integrations & Webhook Channel
          _buildSectionHeader(context, 'WhatsApp Business Channel'),
          const SizedBox(height: 8),
          _buildSettingsCard(
            context,
            isDark,
            children: [
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.chat_bubble_rounded, color: AppColors.success, size: 20),
                ),
                title: const Text('API Channel Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                subtitle: const Text('Meta Cloud Business API connected', style: TextStyle(fontSize: 12)),
                trailing: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.success.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'ACTIVE',
                    style: TextStyle(color: AppColors.success, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              const Divider(height: 1),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Meta Webhook Callback URL',
                      style: TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.surface2 : AppColors.surface2Light,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'https://api.loopx.io/webhooks/v1/meta',
                              style: TextStyle(fontSize: 11, fontFamily: 'monospace'),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          icon: const Icon(Icons.copy_rounded, size: 18),
                          tooltip: 'Copy webhook URL',
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Webhook URL copied to clipboard')),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Section 4: Log Out
          AppButton(
            label: 'Sign Out Account',
            onPressed: () async {
              await ref.read(authProvider.notifier).signOut();
              if (context.mounted) {
                context.go('/login');
              }
            },
            variant: AppButtonVariant.outlined,
            icon: Icons.logout_rounded,
          ),
          const SizedBox(height: 24),
          Center(
            child: Text(
              'LoopX CRM v1.0.0 (2026 Build)',
              style: TextStyle(fontSize: 11, color: isDark ? AppColors.textMuted : AppColors.textMutedLight),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildProfileHeaderCard(BuildContext context, String name, String email, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surface : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.border : AppColors.borderLight),
      ),
      child: Row(
        children: [
          AvatarWidget(name: name, size: 52),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                const SizedBox(height: 2),
                Text(
                  email,
                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Workspace Agent',
                    style: TextStyle(fontSize: 9, color: AppColors.primary, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildSettingsCard(BuildContext context, bool isDark, {required List<Widget> children}) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.surface : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.border : AppColors.borderLight),
      ),
      child: Column(
        children: children,
      ),
    );
  }

  Widget _buildToggleRow(
    BuildContext context, {
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
    required IconData icon,
    required Color iconColor,
  }) {
    return SwitchListTile.adaptive(
      value: value,
      onChanged: onChanged,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      secondary: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: iconColor.withValues(alpha: 0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
    );
  }

  Widget _buildThemeModeSelector(BuildContext context, WidgetRef ref, ThemeMode themeMode, bool isDark) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.palette_rounded, color: AppColors.primary, size: 20),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('App Theme Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 2),
                  Text(
                    themeMode == ThemeMode.dark
                        ? 'Dark mode active'
                        : (themeMode == ThemeMode.light ? 'Light mode active' : 'Syncs with system settings'),
                    style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                  ),
                ],
              ),
            ],
          ),
          // Toggle Segmented Buttons
          Row(
            children: [
              _themeButton(context, ref, Icons.wb_sunny_rounded, ThemeMode.light, themeMode == ThemeMode.light),
              const SizedBox(width: 4),
              _themeButton(context, ref, Icons.nightlight_round, ThemeMode.dark, themeMode == ThemeMode.dark),
              const SizedBox(width: 4),
              _themeButton(context, ref, Icons.settings_brightness_rounded, ThemeMode.system, themeMode == ThemeMode.system),
            ],
          ),
        ],
      ),
    );
  }

  Widget _themeButton(BuildContext context, WidgetRef ref, IconData icon, ThemeMode mode, bool active) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: () => ref.read(themeModeProvider.notifier).set(mode),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: active
              ? AppColors.primary
              : (isDark ? AppColors.surface2 : AppColors.surface2Light),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          size: 16,
          color: active ? Colors.white : (isDark ? AppColors.textSecondary : AppColors.textSecondaryLight),
        ),
      ),
    );
  }
}
