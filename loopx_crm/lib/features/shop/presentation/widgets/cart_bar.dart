import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/shop_provider.dart';
import '../../shop_constants.dart';

class CartBar extends ConsumerWidget {
  const CartBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cart = ref.watch(cartProvider);
    final summary = ref.watch(cartSummaryProvider);
    final count = summary['count'] as int;
    final subtotal = summary['subtotal'] as double;

    if (cart.isEmpty) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ShopColors.border.withValues(alpha: 0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: BackdropFilter(
          filter: _blurFilter(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Stack(
                  children: [
                    const Icon(Icons.shopping_cart_rounded,
                        size: 24, color: ShopColors.greenDark),
                    if (count > 0)
                      Positioned(
                        right: -4,
                        top: -4,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: ShopColors.danger,
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            '$count',
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: ShopTheme.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '$count Item${count > 1 ? 's' : ''}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: ShopColors.textSoft,
                        fontWeight: ShopTheme.w500,
                      ),
                    ),
                    Text(
                      '₹${subtotal.round()}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: ShopTheme.w700,
                        color: ShopColors.navy,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                Material(
                  color: ShopColors.green,
                  borderRadius: BorderRadius.circular(14),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(14),
                    onTap: () {
                      _navigateToCart(context);
                    },
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'View Cart',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: ShopTheme.w700,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(width: 6),
                          Icon(Icons.arrow_forward_rounded,
                              size: 16, color: Colors.white),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  ImageFilter _blurFilter() {
    return ImageFilter.blur(sigmaX: 20, sigmaY: 20);
  }

  void _navigateToCart(BuildContext context) {
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => const _CartScreenWrapper(),
        transitionsBuilder: (_, animation, __, child) {
          return SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0, 1),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            )),
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 350),
      ),
    );
  }
}

class _CartScreenWrapper extends StatelessWidget {
  const _CartScreenWrapper();

  @override
  Widget build(BuildContext context) {
    return const _CartScreenPlaceholder();
  }
}

class _CartScreenPlaceholder extends StatelessWidget {
  const _CartScreenPlaceholder();

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => const _CartScreenRedirect(),
        ),
      );
    });
    return const SizedBox.shrink();
  }
}

class _CartScreenRedirect extends StatelessWidget {
  const _CartScreenRedirect();

  @override
  Widget build(BuildContext context) {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (_) => const _CartScreenPlaceholder2(),
        ),
      );
    });
    return const SizedBox.shrink();
  }
}

class _CartScreenPlaceholder2 extends StatelessWidget {
  const _CartScreenPlaceholder2();

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}
