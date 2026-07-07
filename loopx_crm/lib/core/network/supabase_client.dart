import 'package:supabase_flutter/supabase_flutter.dart';
import '../constants/app_constants.dart';

class SupabaseManager {
  static SupabaseManager? _instance;
  late final SupabaseClient client;
  bool _isInitialized = false;
  String? _initializationError;

  SupabaseManager._();

  static SupabaseManager get instance {
    _instance ??= SupabaseManager._();
    return _instance!;
  }

  Future<void> initialize() async {
    if (_isInitialized) return;

    final url = AppConstants.supabaseUrl;
    final key = AppConstants.supabaseAnonKey;
    
    print('DEBUG: Initializing Supabase with URL: $url');

    if (url.isEmpty || key.isEmpty) {
      _initializationError = 'Supabase configuration missing. Please check your environment variables.';
      _isInitialized = true;
      throw Exception(_initializationError);
    }

    try {
      await Supabase.initialize(
        url: url,
        publishableKey: key,
        debug: false,
      );
      client = Supabase.instance.client;
      _isInitialized = true;
    } catch (e) {
      _initializationError = 'Unable to connect to the server. Please check your internet connection and try again.';
      _isInitialized = true;
      throw Exception(_initializationError);
    }
  }

  bool get isInitialized => _isInitialized;

  String? get initializationError => _initializationError;

  bool get isLoggedIn {
    if (!_isInitialized) throw Exception('Supabase not initialized');
    return client.auth.currentSession != null;
  }

  User? get currentUser {
    if (!_isInitialized) throw Exception('Supabase not initialized');
    return client.auth.currentUser;
  }

  String? get currentUserId {
    if (!_isInitialized) throw Exception('Supabase not initialized');
    return client.auth.currentUser?.id;
  }
}
