import 'product_model.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  double get totalPrice => product.price * quantity;

  Map<String, dynamic> toOrderMessage() => {
        'name': product.name,
        'price': product.price,
        'qty': quantity,
        'total': totalPrice,
      };
}
