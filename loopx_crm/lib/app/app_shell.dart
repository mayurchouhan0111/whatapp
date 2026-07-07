import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_floating_bottom_bar/flutter_floating_bottom_bar.dart';
import '../core/theme/app_colors.dart';

class AppShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const AppShell({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    final bool isLarge = MediaQuery.of(context).size.width >= 800;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (isLarge) {
      // Use a side NavigationRail for tablets/desktop
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              selectedIndex: navigationShell.currentIndex,
              onDestinationSelected: (index) => navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex),
              backgroundColor: Theme.of(context).scaffoldBackgroundColor,
              elevation: 2,
              labelType: NavigationRailLabelType.selected,
              leading: const Padding(
                padding: EdgeInsets.only(top: 16.0),
                child: Icon(Icons.message_rounded, color: AppColors.primary, size: 32),
              ),
              destinations: const [
                NavigationRailDestination(
                  icon: Icon(Icons.dashboard_outlined),
                  selectedIcon: Icon(Icons.dashboard_rounded, color: AppColors.primary),
                  label: Text('Dashboard'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.chat_bubble_outline_rounded),
                  selectedIcon: Icon(Icons.chat_bubble_rounded, color: AppColors.primary),
                  label: Text('Inbox'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.people_outline_rounded),
                  selectedIcon: Icon(Icons.people_rounded, color: AppColors.primary),
                  label: Text('Contacts'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.timeline_outlined),
                  selectedIcon: Icon(Icons.timeline_rounded, color: AppColors.primary),
                  label: Text('Pipelines'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.alt_route_outlined),
                  selectedIcon: Icon(Icons.alt_route_rounded, color: AppColors.primary),
                  label: Text('Workflows'),
                ),
              ],
            ),
            const VerticalDivider(width: 1),
            Expanded(child: navigationShell),
          ],
        ),
      );
    }

    final double screenWidth = MediaQuery.of(context).size.width;

    // Mobile: Modern floating navigation bar that responds to scroll events automatically
    return Scaffold(
      body: BottomBar(
        body: navigationShell,
        layout: BottomBarLayout(
          width: screenWidth * 0.92,
          borderRadius: BorderRadius.circular(32),
        ),
        child: Container(
          height: 66,
          decoration: BoxDecoration(
            color: isDark 
                ? AppColors.surface.withValues(alpha: 0.85) 
                : AppColors.surfaceLight.withValues(alpha: 0.9),
            borderRadius: BorderRadius.circular(32),
            border: Border.all(
              color: isDark 
                  ? AppColors.border.withValues(alpha: 0.3) 
                  : AppColors.borderLight.withValues(alpha: 0.7),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.08),
                blurRadius: 20,
                spreadRadius: 2,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(context, 0, Icons.dashboard_outlined, Icons.dashboard_rounded, 'Dashboard'),
                _buildNavItem(context, 1, Icons.chat_bubble_outline_rounded, Icons.chat_bubble_rounded, 'Inbox'),
                _buildNavItem(context, 2, Icons.people_outline_rounded, Icons.people_rounded, 'Contacts'),
                _buildNavItem(context, 3, Icons.timeline_outlined, Icons.timeline_rounded, 'Pipelines'),
                _buildNavItem(context, 4, Icons.alt_route_outlined, Icons.alt_route_rounded, 'Workflows'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(BuildContext context, int index, IconData icon, IconData selectedIcon, String label) {
    final isSelected = navigationShell.currentIndex == index;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Expanded(
      child: InkWell(
        onTap: () => navigationShell.goBranch(index, initialLocation: index == navigationShell.currentIndex),
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: isSelected 
                    ? AppColors.primary.withValues(alpha: isDark ? 0.15 : 0.08) 
                    : Colors.transparent,
                shape: BoxShape.circle,
              ),
              child: Icon(
                isSelected ? selectedIcon : icon,
                color: isSelected 
                    ? AppColors.primary 
                    : (isDark ? AppColors.textSecondary : AppColors.textSecondaryLight),
                size: 22,
              ),
            ),
            const SizedBox(height: 1),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected 
                    ? AppColors.primary 
                    : (isDark ? AppColors.textMuted : AppColors.textMutedLight),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
