import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static const String appName = 'LoopX CRM';
  static const String tagline = 'WhatsApp CRM, Built for Growth';
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';
  static const String defaultCurrency = 'USD';
  static const int connectionTimeout = 15000;
  static const int receiveTimeout = 15000;
}
