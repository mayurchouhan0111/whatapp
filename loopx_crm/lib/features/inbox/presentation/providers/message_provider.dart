import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/supabase_client.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class _MessageItem {
  final String text;
  final DateTime time;
  final bool isMe;

  const _MessageItem({required this.text, required this.time, required this.isMe});
}

// Family provider to get realtime messages for a given conversationId
final messagesProvider = StreamProvider.family<List<_MessageItem>, String>((ref, conversationId) {
  final client = SupabaseManager.instance.client;
  final channel = client.channel('public:messages_$conversationId');
  final controller = StreamController<List<_MessageItem>>();

  Future<void> _load() async {
    final data = await client
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at');
    final list = (data as List)
        .map<_MessageItem>((e) => _MessageItem(
              text: e['content_text'] as String? ?? e['text'] as String? ?? '',
              time: DateTime.parse(e['created_at'] as String),
              // Assuming sender_type "agent" means the logged-in user
              isMe: (e['sender_type'] as String?) == 'agent',
            ))
        .toList();
    controller.add(list);
  }

  // Initial load
  _load();

  // Listen for new inserts on this conversation
  channel
      .onPostgresChanges(
        event: PostgresChangeEvent.insert,
        schema: 'public',
        table: 'messages',
        filter: null,
        callback: (payload) async => await _load(),
      )
      .subscribe();

  ref.onDispose(() {
    channel.unsubscribe();
    controller.close();
  });

  return controller.stream;
});