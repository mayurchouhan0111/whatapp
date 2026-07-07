import 'package:intl/intl.dart';

class Formatters {
  static String formatCurrency(double amount, {String currency = 'USD'}) {
    final format = NumberFormat.currency(
      symbol: _symbolFor(currency),
      decimalDigits: 0,
    );
    return format.format(amount);
  }

  static String formatCompactCurrency(double amount, {String currency = 'USD'}) {
    final symbol = _symbolFor(currency);
    if (amount >= 1000000) return '$symbol${(amount / 1000000).toStringAsFixed(1)}M';
    if (amount >= 1000) return '$symbol${(amount / 1000).toStringAsFixed(1)}k';
    return '$symbol${amount.toInt()}';
  }

  static String formatDate(DateTime date) {
    return DateFormat('MMM d, yyyy').format(date);
  }

  static String formatTime(DateTime date) {
    return DateFormat('h:mm a').format(date);
  }

  static String formatDateTime(DateTime date) {
    return DateFormat('MMM d, h:mm a').format(date);
  }

  static String formatRelativeTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return formatDate(date);
  }

  static String formatPhoneNumber(String phone) {
    if (phone.length == 12 && phone.startsWith('91')) {
      return '+91 ${phone.substring(2, 7)} ${phone.substring(7)}';
    }
    return phone;
  }

  static String _symbolFor(String currency) {
    switch (currency) {
      case 'USD': return '\$';
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '\$';
    }
  }
}
