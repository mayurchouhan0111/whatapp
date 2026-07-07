import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/network/supabase_client.dart';
import '../../../../data/models/automation_model.dart';

/// Streams real‑time automations from Supabase
final automationsProvider = StreamProvider<List<AutomationModel>>((ref) {
  final client = SupabaseManager.instance.client;
  final controller = StreamController<List<AutomationModel>>();
  
  // Set up Supabase Realtime channel
  final channel = client.channel('public:automations');

  Future<void> load() async {
    try {
      final data = await client
          .from(AutomationModel.tableName)
          .select('*')
          .order('created_at', ascending: false);
      
      final list = (data as List)
          .map<AutomationModel>((e) => AutomationModel.fromJson(e as Map<String, dynamic>))
          .toList();
      controller.add(list);
    } catch (e, st) {
      if (!controller.isClosed) {
        controller.addError(e, st);
      }
    }
  }

  load();

  // Listen to table inserts, updates, and deletes
  channel
      .onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: AutomationModel.tableName,
        callback: (_) async => await load(),
      )
      .subscribe();

  ref.onDispose(() {
    channel.unsubscribe();
    controller.close();
  });

  return controller.stream;
});

/// A class exposing mutations on the automations table
class AutomationsService {
  static SupabaseClient get _client => SupabaseManager.instance.client;

  /// Toggles the is_active status of an automation in Supabase
  static Future<void> toggleActive(String id, bool isActive) async {
    await _client
        .from(AutomationModel.tableName)
        .update({'is_active': isActive})
        .eq('id', id);
  }

  /// Duplicates an automation by inserting a new copy with "(Copy)" suffix
  static Future<void> duplicate(AutomationModel automation) async {
    final newName = '${automation.name} (Copy)';
    
    // Fetch profile to resolve account_id
    final user = SupabaseManager.instance.currentUser;
    if (user == null) throw Exception('User not logged in');

    final profileData = await _client
        .from('profiles')
        .select('account_id')
        .eq('user_id', user.id)
        .single();
    
    final accountId = profileData['account_id'] as String?;

    await _client.from(AutomationModel.tableName).insert({
      'name': newName,
      'description': automation.description,
      'trigger_type': automation.triggerType,
      'trigger_config': automation.triggerConfig,
      'is_active': false,
      'execution_count': 0,
      'user_id': user.id,
      'account_id': accountId,
    });
  }

  /// Deletes an automation from Supabase
  static Future<void> delete(String id) async {
    await _client
        .from(AutomationModel.tableName)
        .delete()
        .eq('id', id);
  }

  /// Creates a new automation from a template slug
  static Future<void> createFromTemplate(String slug, String name, String description, String triggerType, Map<String, dynamic> config) async {
    final user = SupabaseManager.instance.currentUser;
    if (user == null) throw Exception('User not logged in');

    final profileData = await _client
        .from('profiles')
        .select('account_id')
        .eq('user_id', user.id)
        .single();
    
    final accountId = profileData['account_id'] as String?;

    await _client.from(AutomationModel.tableName).insert({
      'name': name,
      'description': description,
      'trigger_type': triggerType,
      'trigger_config': config,
      'is_active': false,
      'execution_count': 0,
      'user_id': user.id,
      'account_id': accountId,
    });
  }
}
