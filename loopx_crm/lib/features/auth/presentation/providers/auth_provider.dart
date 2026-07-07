import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:developer' as developer;
import '../../../../core/network/supabase_client.dart';
import '../../../../data/models/profile_model.dart';
import '../../data/auth_repository_impl.dart';
import '../../../../data/datasources/supabase_datasource.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final User? user;
  final ProfileModel? profile;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.profile,
    this.errorMessage,
  });

  AuthState copyWith({
    AuthStatus? status,
    User? user,
    ProfileModel? profile,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      profile: profile ?? this.profile,
      errorMessage: errorMessage,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
  bool get isLoading => status == AuthStatus.loading;
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepositoryImpl _repository;

  AuthNotifier(this._repository) : super(const AuthState(status: AuthStatus.unauthenticated)) {
    // Auto session check removed to require explicit login
  }

  Future<void> _checkSession() async {
    final user = SupabaseManager.instance.currentUser;
    if (user != null) {
      state = state.copyWith(status: AuthStatus.loading, user: user);
      final profile = await _repository.getProfile(user.id);
      state = state.copyWith(
        status: AuthStatus.authenticated,
        profile: profile,
      );
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  String _mapErrorToMessage(dynamic error) {
    final errorString = error.toString().toLowerCase();

    if (error is AuthException) {
      return error.message;
    }

    if (error is PostgrestException) {
      switch (error.code) {
        case 'PGRST301':
        case '42501':
          return 'Access denied. Please check your permissions.';
        case '23505':
          return 'An account with this email already exists.';
        case '22P02':
          return 'Invalid data format.';
        default:
          return 'Database error: ${error.message}';
      }
    }

    if (errorString.contains('socketexception') ||
        errorString.contains('connection') ||
        errorString.contains('timeout') ||
        errorString.contains('network')) {
      return 'Network error. Please check your internet connection.';
    }

    if (errorString.contains('invalid') &&
        (errorString.contains('credential') || errorString.contains('password') || errorString.contains('email'))) {
      return 'Invalid email or password. Please try again.';
    }

    if (errorString.contains('user not found') || errorString.contains('email not confirmed')) {
      return 'Account not found. Please check your email or sign up.';
    }

    if (errorString.contains('weak password')) {
      return 'Password is too weak. Use at least 6 characters.';
    }

    if (errorString.contains('rate limit') || errorString.contains('too many requests')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    return 'Sign in failed: ${error.toString()}';
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final response = await _repository.signIn(email, password);
      final user = response.user;
      if (user == null) {
        state = state.copyWith(
          status: AuthStatus.error,
          errorMessage: 'Sign in failed. Please try again.',
        );
        return;
      }
      final profile = await _repository.getProfile(user.id);
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        profile: profile,
      );
    } on AuthException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
    } catch (e, stackTrace) {
      developer.log('Auth error (signIn): $e', name: 'AuthNotifier', error: e, stackTrace: stackTrace);
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: _mapErrorToMessage(e),
      );
    }
  }

  Future<void> signUp(String email, String password, {String? fullName}) async {
    state = state.copyWith(status: AuthStatus.loading, errorMessage: null);
    try {
      final response = await _repository.signUp(email, password, fullName: fullName);
      if (response.user != null) {
        state = state.copyWith(
          status: AuthStatus.authenticated,
          user: response.user,
        );
      } else {
        state = state.copyWith(
          status: AuthStatus.unauthenticated,
          errorMessage: 'Check your email for a confirmation link.',
        );
      }
    } on AuthException catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: e.message,
      );
    } catch (e, stackTrace) {
      developer.log('Auth error (signUp): $e', name: 'AuthNotifier', error: e, stackTrace: stackTrace);
      state = state.copyWith(
        status: AuthStatus.error,
        errorMessage: _mapErrorToMessage(e),
      );
    }
  }

  Future<void> signOut() async {
    await _repository.signOut();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  Future<void> refreshProfile() async {
    final user = state.user;
    if (user == null) return;
    final profile = await _repository.getProfile(user.id);
    state = state.copyWith(profile: profile);
  }
}

final authRepositoryProvider = Provider<AuthRepositoryImpl>((ref) {
  return AuthRepositoryImpl(SupabaseDataSource());
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});
