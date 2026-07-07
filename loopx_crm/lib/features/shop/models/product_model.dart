class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final double? mrp;
  final String imageUrl;
  final List<String> galleryUrls;
  final String category;
  final double rating;
  final int reviewCount;
  final bool inStock;
  final List<String> features;
  final String? badge;

  const Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.mrp,
    required this.imageUrl,
    this.galleryUrls = const [],
    required this.category,
    this.rating = 0,
    this.reviewCount = 0,
    this.inStock = true,
    this.features = const [],
    this.badge,
  });

  double? get discountPercent {
    if (mrp == null || mrp! <= price) return null;
    return ((mrp! - price) / mrp! * 100).roundToDouble();
  }

  double get savings {
    if (mrp == null || mrp! <= price) return 0;
    return mrp! - price;
  }
}
