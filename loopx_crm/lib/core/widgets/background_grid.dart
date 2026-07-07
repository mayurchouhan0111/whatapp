import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class BackgroundGrid extends StatelessWidget {
  const BackgroundGrid({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    return Stack(
      children: [
        // Solid background base
        Container(
          color: isDark ? AppColors.background : AppColors.backgroundLight,
        ),
        // Ambient soft glowing circles (no gradient, just solid low opacity)
        Positioned(
          top: -100,
          left: -100,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: isDark ? 0.08 : 0.04),
              shape: BoxShape.circle,
            ),
          ),
        ),
        Positioned(
          bottom: -80,
          right: -80,
          child: Container(
            width: 250,
            height: 250,
            decoration: BoxDecoration(
              color: AppColors.info.withValues(alpha: isDark ? 0.08 : 0.04),
              shape: BoxShape.circle,
            ),
          ),
        ),
        // Grid Painter
        Positioned.fill(
          child: CustomPaint(
            painter: _GridPainter(isDark: isDark),
          ),
        ),
      ],
    );
  }
}

class _GridPainter extends CustomPainter {
  final bool isDark;

  _GridPainter({required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = isDark 
          ? AppColors.border.withValues(alpha: 0.15) 
          : AppColors.borderLight.withValues(alpha: 0.25)
      ..strokeWidth = 1.0;

    const double step = 40.0; // grid block size

    // Vertical lines
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    // Horizontal lines
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
