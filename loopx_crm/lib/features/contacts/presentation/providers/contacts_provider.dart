import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/network/supabase_client.dart';
import '../../../../data/models/contact_model.dart';

/// Streams real‑time contacts from Supabase with search support.
final contactsProvider =
    StreamProvider.family<List<ContactModel>, String>((ref, searchQuery) {
  final client = SupabaseManager.instance.client;
  final channel = client.channel('public:contacts');
  final controller = StreamController<List<ContactModel>>();

  Future<void> _load() async {
    try {
      dynamic query = client
          .from(ContactModel.tableName)
          .select(ContactModel.defaultSelect.join(','))
          .order('created_at', ascending: false);

      if (searchQuery.isNotEmpty) {
        query = query.or(
            'name.ilike.%$searchQuery%,phone.ilike.%$searchQuery%,email.ilike.%$searchQuery%');
      }

      final data = await query;
      final list = (data as List)
          .map<ContactModel>((e) => ContactModel.fromJson(e as Map<String, dynamic>))
          .toList();
      controller.add(list);
    } catch (e, st) {
      controller.addError(e, st);
    }
  }

  _load();

  channel
      .onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: ContactModel.tableName,
        callback: (_) async => await _load(),
      )
      .subscribe();

  ref.onDispose(() {
    channel.unsubscribe();
    controller.close();
  });

  return controller.stream;
});
