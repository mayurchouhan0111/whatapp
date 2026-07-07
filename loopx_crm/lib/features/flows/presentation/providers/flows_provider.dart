import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/network/supabase_client.dart';
import '../../../../data/models/flow_model.dart';

/// Streams real‑time flows from Supabase
final flowsProvider = StreamProvider<List<FlowModel>>((ref) {
  final client = SupabaseManager.instance.client;
  final controller = StreamController<List<FlowModel>>();
  
  // Set up Supabase Realtime channel
  final channel = client.channel('public:flows');

  Future<void> load() async {
    try {
      final data = await client
          .from(FlowModel.tableName)
          .select('*')
          .order('created_at', ascending: false);
      
      final list = (data as List)
          .map<FlowModel>((e) => FlowModel.fromJson(e as Map<String, dynamic>))
          .toList();
      controller.add(list);
    } catch (e, st) {
      if (!controller.isClosed) {
        controller.addError(e, st);
      }
    }
  }

  load();

  // Listen to table changes
  channel
      .onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: FlowModel.tableName,
        callback: (_) async => await load(),
      )
      .subscribe();

  ref.onDispose(() {
    channel.unsubscribe();
    controller.close();
  });

  return controller.stream;
});

/// A class exposing mutations on the flows table
class FlowsService {
  static SupabaseClient get _client => SupabaseManager.instance.client;

  /// Toggles flow status between active and draft
  static Future<void> toggleStatus(String id, String currentStatus) async {
    final nextStatus = currentStatus == 'active' ? 'draft' : 'active';
    await _client
        .from(FlowModel.tableName)
        .update({'status': nextStatus})
        .eq('id', id);
  }

  /// Deletes a flow from Supabase
  static Future<void> delete(String id) async {
    await _client
        .from(FlowModel.tableName)
        .delete()
        .eq('id', id);
  }

  /// Creates a new flow in Supabase
  static Future<void> createFlow({
    required String name,
    required String triggerType,
    required Map<String, dynamic> triggerConfig,
    String? description,
    String status = 'draft',
  }) async {
    final user = SupabaseManager.instance.currentUser;
    if (user == null) throw Exception('User not logged in');

    // Fetch profile to resolve account_id
    final profileData = await _client
        .from('profiles')
        .select('account_id')
        .eq('user_id', user.id)
        .single();
    
    final accountId = profileData['account_id'] as String?;

    await _client.from(FlowModel.tableName).insert({
      'name': name,
      'description': description,
      'status': status,
      'trigger_type': triggerType,
      'trigger_config': triggerConfig,
      'execution_count': 0,
      'user_id': user.id,
      'account_id': accountId,
    });
  }
}
