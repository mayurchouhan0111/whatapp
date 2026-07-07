import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../data/models/profile_model.dart';
import '../../../data/datasources/supabase_datasource.dart';

class AuthRepositoryImpl {
  final SupabaseDataSource _dataSource;

  AuthRepositoryImpl(this._dataSource);

  Future<AuthResponse> signIn(String email, String password) {
    return _dataSource.signInWithEmail(email, password);
  }

  Future<AuthResponse> signUp(String email, String password,
      {String? fullName}) {
    return _dataSource.signUp(
      email,
      password,
      data: {'full_name': fullName ?? ''},
    );
  }

  Future<void> signOut() => _dataSource.signOut();

  Future<ProfileModel?> getProfile(String userId) async {
    final response = await _dataSource
        .from(ProfileModel.tableName)
        .select(ProfileModel.defaultSelect.join(','))
        .eq('user_id', userId)
        .maybeSingle();
    if (response == null) return null;
    return ProfileModel.fromJson(response);
  }

  Future<ProfileModel?> updateProfile(String userId, Map<String, dynamic> updates) async {
    final response = await _dataSource
        .from(ProfileModel.tableName)
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
    return ProfileModel.fromJson(response);
  }
}
