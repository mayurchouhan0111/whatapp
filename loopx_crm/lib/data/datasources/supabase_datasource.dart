import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/network/supabase_client.dart';

class SupabaseDataSource {
  final SupabaseClient _client;

  SupabaseDataSource() : _client = SupabaseManager.instance.client;

  SupabaseClient get client => _client;

  PostgrestQueryBuilder from(String table) => _client.from(table);

  Future<AuthResponse> signInWithEmail(String email, String password) {
    return _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<AuthResponse> signUp(String email, String password,
      {Map<String, dynamic>? data}) {
    return _client.auth.signUp(
      email: email,
      password: password,
      data: data,
    );
  }

  Future<void> signOut() => _client.auth.signOut();

  User? get currentUser => _client.auth.currentUser;

  RealtimeChannel subscribe(
    String channel,
    String table,
    {void Function(Map<String, dynamic>)? onInsert,
    void Function(Map<String, dynamic>)? onUpdate,
    void Function(Map<String, dynamic>)? onDelete,
    String? filter}) {
    return _client
        .channel(channel)
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: table,
          filter: filter != null
              ? PostgresChangeFilter(
                  type: PostgresChangeFilterType.eq,
                  column: filter.split('=').first.trim(),
                  value: filter.split('=').last.trim(),
                )
              : null,
          callback: (payload) {
            if (payload.eventType == PostgresChangeEvent.insert &&
                onInsert != null) {
              onInsert(payload.newRecord);
            } else if (payload.eventType == PostgresChangeEvent.update &&
                onUpdate != null) {
              onUpdate(payload.newRecord);
            } else if (payload.eventType == PostgresChangeEvent.delete &&
                onDelete != null) {
              onDelete(payload.newRecord);
            }
          },
        ).subscribe();
  }
}
