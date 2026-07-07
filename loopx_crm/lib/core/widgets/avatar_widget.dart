import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme/app_colors.dart';

class AvatarWidget extends StatelessWidget {
  final String? imageUrl;
  final String? name;
  final double size;
  final bool showOnline;
  final bool isOnline;

  const AvatarWidget({
    super.key,
    this.imageUrl,
    this.name,
    this.size = 40,
    this.showOnline = false,
    this.isOnline = false,
  });

  Gradient _getPlaceholderGradient() {
    final hash = (name ?? '?').hashCode;
    final index = hash.abs() % 4;
    switch (index) {
      case 0:
        return const LinearGradient(
          colors: [Color(0xFF0284C7), Color(0xFF38BDF8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 1:
        return const LinearGradient(
          colors: [Color(0xFF6366F1), Color(0xFF818CF8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 2:
        return const LinearGradient(
          colors: [Color(0xFF10B981), Color(0xFF34D399)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 3:
      default:
        return const LinearGradient(
          colors: [Color(0xFFF59E0B), Color(0xFFFBBF24)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: ClipOval(
            child: imageUrl != null && imageUrl!.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl: imageUrl!,
                    width: size,
                    height: size,
                    fit: BoxFit.cover,
                    placeholder: (_, url) => _fallback,
                    errorWidget: (_, url, error) => _fallback,
                  )
                : _fallback,
          ),
        ),
        if (showOnline)
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: size * 0.28 >= 10 ? size * 0.28 : 10,
              height: size * 0.28 >= 10 ? size * 0.28 : 10,
              decoration: BoxDecoration(
                color: isOnline ? AppColors.success : AppColors.textMuted,
                shape: BoxShape.circle,
                border: Border.all(
                  color: Theme.of(context).scaffoldBackgroundColor,
                  width: 2,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget get _fallback {
    final initials = (name ?? '?').trim().isEmpty ? '?' : (name!.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').join());
    final displayInitials = initials.length > 2 ? initials.substring(0, 2) : initials;

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: _getPlaceholderGradient(),
      ),
      child: Center(
        child: Text(
          displayInitials.toUpperCase(),
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.38,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
          ),
        ),
      ),
    );
  }
}
