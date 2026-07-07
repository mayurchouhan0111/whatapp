import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_colors.dart';

class SkeletonBlock extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SkeletonBlock({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Shimmer.fromColors(
      baseColor: isDark ? AppColors.surface2 : Colors.grey[300]!,
      highlightColor: isDark ? AppColors.surface : Colors.grey[100]!,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class SkeletonListTile extends StatelessWidget {
  const SkeletonListTile({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SkeletonBlock(width: 48, height: 48, borderRadius: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    const SkeletonBlock(width: 100, height: 16),
                    const Spacer(),
                    const SkeletonBlock(width: 50, height: 12),
                  ],
                ),
                const SizedBox(height: 8),
                const SkeletonBlock(width: double.infinity, height: 14),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SkeletonDetailView extends StatelessWidget {
  const SkeletonDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SkeletonBlock(width: 80, height: 80, borderRadius: 40),
          const SizedBox(height: 16),
          const SkeletonBlock(width: 150, height: 20),
          const SizedBox(height: 8),
          const SkeletonBlock(width: 100, height: 14),
          const SizedBox(height: 32),
          Align(
            alignment: Alignment.centerLeft,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                SkeletonBlock(width: 80, height: 16),
                SizedBox(height: 12),
                SkeletonBlock(width: double.infinity, height: 48, borderRadius: 12),
                SizedBox(height: 16),
                SkeletonBlock(width: 100, height: 16),
                SizedBox(height: 12),
                SkeletonBlock(width: double.infinity, height: 120, borderRadius: 12),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
