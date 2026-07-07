import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/network/supabase_client.dart';
import '../../../../data/models/broadcast_model.dart';

final broadcastsProvider = StreamProvider<List<BroadcastModel>>((ref) {
  final client = SupabaseManager.instance.client;
  final controller = StreamController<List<BroadcastModel>>();

  final channel = client.channel('public:broadcasts');

  Future<void> load() async {
    try {
      final data = await client
          .from(BroadcastModel.tableName)
          .select('*')
          .order('created_at', ascending: false);

      final list = (data as List)
          .map<BroadcastModel>((e) => BroadcastModel.fromJson(e as Map<String, dynamic>))
          .toList();
      controller.add(list);
    } catch (e, st) {
      if (!controller.isClosed) {
        controller.addError(e, st);
      }
    }
  }

  load();

  channel
      .onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: BroadcastModel.tableName,
        callback: (_) async => await load(),
      )
      .subscribe();

  ref.onDispose(() {
    channel.unsubscribe();
    controller.close();
  });

  return controller.stream;
});

class CampaignsService {
  static SupabaseClient get _client => SupabaseManager.instance.client;

  static Future<void> toggleStatus(String id, String newStatus) async {
    await _client
        .from(BroadcastModel.tableName)
        .update({'status': newStatus})
        .eq('id', id);
  }

  static Future<void> delete(String id) async {
    await _client
        .from(BroadcastModel.tableName)
        .delete()
        .eq('id', id);
  }

  static Future<void> duplicate(BroadcastModel broadcast) async {
    final user = SupabaseManager.instance.currentUser;
    if (user == null) throw Exception('User not logged in');

    final profileData = await _client
        .from('profiles')
        .select('account_id')
        .eq('user_id', user.id)
        .single();

    final accountId = profileData['account_id'] as String?;

    await _client.from(BroadcastModel.tableName).insert({
      'name': '${broadcast.name} (Copy)',
      'template_name': broadcast.templateName,
      'template_language': broadcast.templateLanguage,
      'status': 'draft',
      'total_recipients': 0,
      'sent_count': 0,
      'delivered_count': 0,
      'read_count': 0,
      'replied_count': 0,
      'failed_count': 0,
      'user_id': user.id,
      'account_id': accountId,
    });
  }
}
