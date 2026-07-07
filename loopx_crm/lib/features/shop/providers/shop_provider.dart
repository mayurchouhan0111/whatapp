import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/product_model.dart';
import '../models/cart_model.dart';

List<Product> _allProducts = [
  Product(
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    description:
        'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and memory foam ear cushions. Features Bluetooth 5.2, multipoint connection, and Hi-Res audio.',
    price: 2499,
    mrp: 4999,
    imageUrl: 'https://picsum.photos/seed/head/400/500',
    galleryUrls: [
      'https://picsum.photos/seed/head1/400/500',
      'https://picsum.photos/seed/head2/400/500',
    ],
    category: 'Electronics',
    rating: 4.5,
    reviewCount: 2341,
    features: [
      'Active Noise Cancellation',
      '30hr Battery Life',
      'Bluetooth 5.2',
      'Hi-Res Audio',
      'Memory Foam Cushions',
    ],
    badge: '50% OFF',
  ),
  Product(
    id: '2',
    name: 'Premium Cotton Printed T-Shirt',
    description:
        'Soft 100% organic cotton t-shirt with a modern fit. Breathable fabric perfect for daily wear. Pre-shrunk and color-safe.',
    price: 599,
    mrp: 1299,
    imageUrl: 'https://picsum.photos/seed/tshirt/400/500',
    category: 'Fashion',
    rating: 4.3,
    reviewCount: 5123,
    features: ['100% Organic Cotton', 'Pre-shrunk', 'Breathable', 'Modern Fit'],
    badge: '54% OFF',
  ),
  Product(
    id: '3',
    name: 'Insulated Stainless Steel Bottle',
    description:
        'Double-wall vacuum insulated bottle. Keeps drinks cold 24hr or hot 12hr. BPA-free, leak-proof, 750ml capacity.',
    price: 799,
    mrp: 1599,
    imageUrl: 'https://picsum.photos/seed/bottle/400/500',
    category: 'Home & Kitchen',
    rating: 4.7,
    reviewCount: 1876,
    features: [
      'Double-wall Insulation',
      '750ml Capacity',
      'BPA-free',
      'Leak-proof',
    ],
    badge: '50% OFF',
  ),
  Product(
    id: '4',
    name: 'Vitamin C Brightening Face Serum',
    description:
        '20% Vitamin C serum with hyaluronic acid and vitamin E. Reduces dark spots, brightens skin, and boosts collagen.',
    price: 449,
    mrp: 899,
    imageUrl: 'https://picsum.photos/seed/serum/400/500',
    category: 'Beauty',
    rating: 4.4,
    reviewCount: 8923,
    features: [
      '20% Vitamin C',
      'Hyaluronic Acid',
      'Reduces Dark Spots',
      'Brightens Skin',
    ],
    badge: '50% OFF',
  ),
  Product(
    id: '5',
    name: 'Pro Fitness Yoga Mat',
    description:
        '6mm thick premium TPE yoga mat with alignment lines. Non-slip, eco-friendly, includes carrying strap.',
    price: 999,
    mrp: 1999,
    imageUrl: 'https://picsum.photos/seed/yoga/400/500',
    category: 'Sports',
    rating: 4.6,
    reviewCount: 3241,
    features: ['6mm Thickness', 'Non-slip Surface', 'Eco-friendly TPE', 'Alignment Lines'],
    badge: '50% OFF',
  ),
  Product(
    id: '6',
    name: 'Atomic Habits (Hardcover)',
    description:
        'The #1 New York Times bestseller by James Clear. Learn how to build good habits and break bad ones with practical strategies.',
    price: 399,
    mrp: 799,
    imageUrl: 'https://picsum.photos/seed/book/400/500',
    category: 'Books',
    rating: 4.8,
    reviewCount: 15234,
    features: ['Hardcover Edition', 'Bestseller', '320 Pages', 'Practical Guide'],
    badge: '50% OFF',
  ),
  Product(
    id: '7',
    name: 'Smart LED Desk Lamp',
    description:
        'Eye-care LED desk lamp with touch control, 3 color modes, 7 brightness levels, USB charging port, and 1hr auto-off.',
    price: 1299,
    mrp: 2499,
    imageUrl: 'https://picsum.photos/seed/lamp/400/500',
    category: 'Electronics',
    rating: 4.2,
    reviewCount: 1567,
    features: [
      'Touch Control',
      '3 Color Modes',
      'USB Charging Port',
      'Auto-off Timer',
    ],
    badge: '48% OFF',
  ),
  Product(
    id: '8',
    name: 'Handwoven Cotton Bedsheet Set',
    description:
        'Premium 100% cotton bedsheet set with 2 pillow covers. Handwoven by artisans. Soft, breathable, and fade-resistant.',
    price: 1199,
    mrp: 2499,
    imageUrl: 'https://picsum.photos/seed/bedsheet/400/500',
    category: 'Home & Kitchen',
    rating: 4.3,
    reviewCount: 2789,
    features: [
      '100% Cotton',
      'Handwoven',
      '2 Pillow Covers',
      'Fade-resistant',
    ],
    badge: '52% OFF',
  ),
  Product(
    id: '9',
    name: 'Wireless Bluetooth Earbuds',
    description:
        'True wireless earbuds with ENC noise cancellation, 40hr playtime, IPX5 waterproof, and ergonomic fit.',
    price: 1799,
    mrp: 3999,
    imageUrl: 'https://picsum.photos/seed/earbuds/400/500',
    category: 'Electronics',
    rating: 4.1,
    reviewCount: 6789,
    features: [
      'ENC Noise Cancellation',
      '40hr Battery Life',
      'IPX5 Waterproof',
      'Ergonomic Fit',
    ],
    badge: '55% OFF',
  ),
  Product(
    id: '10',
    name: 'Organic Green Tea Collection',
    description:
        'Premium Japanese green tea variety pack. Includes Matcha, Sencha, and Genmaicha. 60 tea bags total.',
    price: 349,
    mrp: 699,
    imageUrl: 'https://picsum.photos/seed/tea/400/500',
    category: 'Beauty',
    rating: 4.6,
    reviewCount: 4321,
    features: ['60 Tea Bags', '3 Varieties', 'Organic', 'Japanese Premium'],
    badge: '50% OFF',
  ),
  Product(
    id: '11',
    name: 'Minimalist Leather Watch',
    description:
        'Elegant analog watch with genuine leather strap. Japanese quartz movement, sapphire glass, 5ATM water resistant.',
    price: 1999,
    mrp: 4499,
    imageUrl: 'https://picsum.photos/seed/watch/400/500',
    category: 'Fashion',
    rating: 4.4,
    reviewCount: 3456,
    features: [
      'Japanese Quartz',
      'Genuine Leather',
      'Sapphire Glass',
      '5ATM Water Resistant',
    ],
    badge: '56% OFF',
  ),
  Product(
    id: '12',
    name: 'Kids Educational Building Blocks',
    description:
        '100-piece wooden building blocks set. Non-toxic paints, smooth edges. Boosts creativity and motor skills.',
    price: 699,
    mrp: 1499,
    imageUrl: 'https://picsum.photos/seed/blocks/400/500',
    category: 'Toys',
    rating: 4.7,
    reviewCount: 5678,
    features: ['100 Pieces', 'Wooden', 'Non-toxic', 'Educational'],
    badge: '53% OFF',
  ),
];

final categories = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Kitchen',
  'Beauty',
  'Sports',
  'Books',
  'Toys',
];

final selectedCategoryProvider = StateProvider<String>((ref) => 'All');

final searchQueryProvider = StateProvider<String>((ref) => '');

final filteredProductsProvider = Provider<List<Product>>((ref) {
  final category = ref.watch(selectedCategoryProvider);
  final query = ref.watch(searchQueryProvider).toLowerCase().trim();
  var products = _allProducts;
  if (category != 'All') {
    products = products.where((p) => p.category == category).toList();
  }
  if (query.isNotEmpty) {
    products = products.where((p) {
      return p.name.toLowerCase().contains(query) ||
          p.description.toLowerCase().contains(query);
    }).toList();
  }
  return products;
});

final groupedProductsProvider = Provider<Map<String, List<Product>>>((ref) {
  final category = ref.watch(selectedCategoryProvider);
  final products =
      category == 'All' ? _allProducts : _allProducts.where((p) => p.category == category).toList();
  final map = <String, List<Product>>{};
  for (final p in products) {
    map.putIfAbsent(p.category, () => []).add(p);
  }
  return map;
});

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  int itemIndex(String productId) =>
      state.indexWhere((item) => item.product.id == productId);

  void add(Product product, {int quantity = 1}) {
    final idx = itemIndex(product.id);
    if (idx >= 0) {
      state = [
        for (int i = 0; i < state.length; i++)
          if (i == idx)
            CartItem(product: product, quantity: state[i].quantity + quantity)
          else
            state[i]
      ];
    } else {
      state = [...state, CartItem(product: product, quantity: quantity)];
    }
  }

  void remove(String productId) {
    state = state.where((item) => item.product.id != productId).toList();
  }

  void setQuantity(String productId, int qty) {
    if (qty <= 0) {
      remove(productId);
      return;
    }
    state = [
      for (final item in state)
        if (item.product.id == productId)
          CartItem(product: item.product, quantity: qty)
        else
          item
    ];
  }

  void clear() => state = [];

  int get itemCount => state.fold(0, (s, i) => s + i.quantity);
  double get subtotal => state.fold(0.0, (s, i) => s + i.totalPrice);
  double get savings => state.fold(
      0.0, (s, i) => i.product.mrp != null ? s + (i.product.mrp! - i.product.price) * i.quantity : s);
  double get delivery => subtotal > 500 ? 0 : 40;
  double get handling => subtotal > 0 ? 20 : 0;
  double get grandTotal => subtotal + delivery + handling;
  bool get freeDelivery => subtotal > 500;
}

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>(
    (ref) => CartNotifier());

final cartSummaryProvider = Provider<Map<String, dynamic>>((ref) {
  final cart = ref.watch(cartProvider);
  final notifier = ref.read(cartProvider.notifier);
  return {
    'items': cart,
    'count': notifier.itemCount,
    'subtotal': notifier.subtotal,
    'savings': notifier.savings,
    'delivery': notifier.delivery,
    'handling': notifier.handling,
    'grandTotal': notifier.grandTotal,
    'freeDelivery': notifier.freeDelivery,
  };
});
