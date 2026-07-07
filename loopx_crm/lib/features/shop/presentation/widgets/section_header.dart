import 'package:flutter/material.dart';
import '../../shop_constants.dart';

class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final VoidCallback? onViewAll;

  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
      child: Row(
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: ShopTheme.h3,
              fontWeight: ShopTheme.w600,
              color: ShopColors.text,
              letterSpacing: -0.3,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: ShopColors.greenBg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                subtitle!,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: ShopTheme.w600,
                  color: ShopColors.greenDark,
                ),
              ),
            ),
          ],
          const Spacer(),
          if (onViewAll != null)
            GestureDetector(
              onTap: onViewAll,
              child: Text(
                'View All →',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: ShopTheme.w600,
                  color: ShopColors.green.withValues(alpha: 0.9),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
