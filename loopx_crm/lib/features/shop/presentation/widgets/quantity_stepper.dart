import 'package:flutter/material.dart';
import '../../shop_constants.dart';

class QuantityStepper extends StatelessWidget {
  final int quantity;
  final ValueChanged<int> onChanged;
  final double size;

  const QuantityStepper({
    super.key,
    required this.quantity,
    required this.onChanged,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: ShopColors.greenBg,
        borderRadius: BorderRadius.circular(size / 2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _Button(
            icon: Icons.remove_rounded,
            size: size,
            onTap: quantity > 1 ? () => onChanged(quantity - 1) : null,
          ),
          SizedBox(
            width: size * 0.8,
            child: Center(
              child: Text(
                '$quantity',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: ShopColors.greenDark,
                ),
              ),
            ),
          ),
          _Button(
            icon: Icons.add_rounded,
            size: size,
            onTap: () => onChanged(quantity + 1),
          ),
        ],
      ),
    );
  }
}

class _Button extends StatelessWidget {
  final IconData icon;
  final double size;
  final VoidCallback? onTap;

  const _Button({
    required this.icon,
    required this.size,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(size / 2),
        child: Container(
          width: size,
          height: size,
          alignment: Alignment.center,
          child: Icon(
            icon,
            size: size * 0.5,
            color: onTap != null ? ShopColors.greenDark : ShopColors.textSoft,
          ),
        ),
      ),
    );
  }
}
