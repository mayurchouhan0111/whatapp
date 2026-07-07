import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../models/product_model.dart';
import '../../providers/shop_provider.dart';
import '../../shop_constants.dart';
import 'quantity_stepper.dart';

class ProductCard extends ConsumerStatefulWidget {
  final Product product;
  final VoidCallback onTap;

  const ProductCard({super.key, required this.product, required this.onTap});

  @override
  ConsumerState<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends ConsumerState<ProductCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animCtrl;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _scaleAnim = Tween<double>(begin: 1.0, end: 0.96).animate(
      CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  bool _inCart(String id) {
    return ref.read(cartProvider).any((item) => item.product.id == id);
  }

  int _cartQty(String id) {
    final idx =
        ref.read(cartProvider).indexWhere((item) => item.product.id == id);
    return idx >= 0 ? ref.read(cartProvider)[idx].quantity : 0;
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final inCart = _inCart(p.id);

    return GestureDetector(
      onTapDown: (_) => _animCtrl.forward(),
      onTapUp: (_) {
        _animCtrl.reverse();
        widget.onTap();
      },
      onTapCancel: () => _animCtrl.reverse(),
      child: AnimatedBuilder(
        animation: _scaleAnim,
        builder: (context, child) => Transform.scale(
          scale: _scaleAnim.value,
          child: child,
        ),
        child: Container(
          decoration: BoxDecoration(
            color: ShopColors.card,
            borderRadius: BorderRadius.circular(ShopTheme.radiusCard),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.06),
                blurRadius: 12,
                offset: const Offset(0, 2),
              ),
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 4,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              _ImageSection(product: p),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _CategoryTag(category: p.category),
                      const SizedBox(height: 4),
                      Text(
                        p.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: ShopTheme.w600,
                          color: ShopColors.text,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        p.description,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 11,
                          color: ShopColors.textSoft,
                          height: 1.3,
                        ),
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '₹${p.price.round()}',
                                    style: const TextStyle(
                                      fontSize: 17,
                                      fontWeight: ShopTheme.w700,
                                      color: ShopColors.navy,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  if (p.mrp != null) ...[
                                    const SizedBox(width: 4),
                                    Text(
                                      '₹${p.mrp!.round()}',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: ShopColors.textSoft.withValues(alpha: 0.7),
                                        decoration: TextDecoration.lineThrough,
                                        decorationColor: ShopColors.textSoft.withValues(alpha: 0.5),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              if (p.discountPercent != null)
                                Text(
                                  'Save ₹${p.savings.round()}',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: ShopTheme.w600,
                                    color: ShopColors.success,
                                  ),
                                ),
                            ],
                          ),
                          const Spacer(),
                          inCart
                              ? QuantityStepper(
                                  quantity: _cartQty(p.id),
                                  size: 28,
                                  onChanged: (q) =>
                                      ref.read(cartProvider.notifier).setQuantity(p.id, q),
                                )
                              : Material(
                                  color: ShopColors.green,
                                  borderRadius: BorderRadius.circular(20),
                                  child: InkWell(
                                    borderRadius: BorderRadius.circular(20),
                                    onTap: () {
                                      ref.read(cartProvider.notifier).add(p);
                                    },
                                    child: const SizedBox(
                                      width: 32,
                                      height: 32,
                                      child: Icon(
                                        Icons.add_shopping_cart_rounded,
                                        size: 16,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ImageSection extends StatelessWidget {
  final Product product;
  const _ImageSection({required this.product});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return Stack(
          children: [
            AspectRatio(
              aspectRatio: 0.82,
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  image: DecorationImage(
                    image: NetworkImage(product.imageUrl),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            if (product.badge != null)
              Positioned(
                top: 8,
                left: 0,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: const BoxDecoration(
                    color: ShopColors.danger,
                    borderRadius: BorderRadius.only(
                      topRight: Radius.circular(6),
                      bottomRight: Radius.circular(6),
                    ),
                  ),
                  child: Text(
                    product.badge!,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: ShopTheme.w700,
                      color: Colors.white,
                      letterSpacing: 0.3,
                    ),
                  ),
                ),
              ),
            if (product.discountPercent != null)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.92),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '-${product.discountPercent!.round()}%',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: ShopTheme.w700,
                      color: ShopColors.accent,
                    ),
                  ),
                ),
              ),
            if (!product.inStock)
              Positioned.fill(
                child: Container(
                  color: Colors.black.withValues(alpha: 0.4),
                  alignment: Alignment.center,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.7),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'Out of Stock',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: ShopTheme.w700,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

class _CategoryTag extends StatelessWidget {
  final String category;
  const _CategoryTag({required this.category});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: ShopColors.greenBg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        category,
        style: const TextStyle(
          fontSize: 9,
          fontWeight: ShopTheme.w600,
          color: ShopColors.greenDark,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}
