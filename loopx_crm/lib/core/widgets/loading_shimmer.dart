import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../theme/app_colors.dart';

class LoadingShimmer extends StatelessWidget {
  final int itemCount;
  final Widget Function(int index) itemBuilder;

  const LoadingShimmer({
    super.key,
    this.itemCount = 5,
    required this.itemBuilder,
  });

  factory LoadingShimmer.list({
    int itemCount = 5,
    double height = 72,
    double borderRadius = 12,
  }) {
    return LoadingShimmer(
      itemCount: itemCount,
      itemBuilder: (index) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        child: Container(
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
      ),
    );
  }

  factory LoadingShimmer.cardGrid({
    int itemCount = 4,
    double height = 100,
  }) {
    return LoadingShimmer(
      itemCount: itemCount,
      itemBuilder: (index) => Container(
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Theme.of(context).brightness == Brightness.dark
          ? AppColors.surface2
          : Colors.grey[300]!,
      highlightColor: Theme.of(context).brightness == Brightness.dark
          ? AppColors.surface
          : Colors.grey[100]!,
      child: Column(
        children: List.generate(itemCount, (i) => itemBuilder(i)),
      ),
    );
  }
}
