import 'package:flutter/material.dart';
import '../../shop_constants.dart';

class StarRating extends StatelessWidget {
  final double rating;
  final double size;
  final Color color;
  final int reviewCount;

  const StarRating({
    super.key,
    required this.rating,
    this.size = 14,
    this.color = ShopColors.star,
    this.reviewCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(5, (i) {
          final star = i + 1;
          return Icon(
            star <= rating
                ? Icons.star_rounded
                : star - rating <= 0.5
                    ? Icons.star_half_rounded
                    : Icons.star_border_rounded,
            size: size,
            color: color,
          );
        }),
        if (reviewCount > 0) ...[
          const SizedBox(width: 4),
          Text(
            '($reviewCount)',
            style: const TextStyle(
              fontSize: 11,
              color: ShopColors.textSoft,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ],
    );
  }
}
