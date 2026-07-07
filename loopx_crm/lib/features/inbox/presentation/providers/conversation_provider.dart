import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/supabase_client.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// UI model for conversation list
class ConversationItem {
  final String id;
  final String contactName;
  final String? avatarUrl;
  final String lastMessage;
  final DateTime lastMessageAt;
  final int unreadCount;
  final String status;

   const ConversationItem({
    required this.id,
    required this.contactName,
    this.avatarUrl,
    required this.lastMessage,
    required this.lastMessageAt,
    this.unreadCount = 0,
    this.status = 'open',
  });
}

final conversationsProvider = StreamProvider<List<ConversationItem>>((ref) {
  final client = SupabaseManager.instance.client;
  final channel = client.channel('public:conversations');
  final controller = StreamController<List<ConversationItem>>();

  // Helper to fetch and emit the current list
  Future<void> _load() async {
    final data = await client
        .from('conversations')
        .select('*, contact:contacts(*)')
        .order('last_message_at', ascending: false);
    final list = (data as List).map<ConversationItem>((e) {
      // e is a JSON map with joined contact fields
      final contact = e['contact'] as Map<String, dynamic>?;
      return ConversationItem(
        id: e['id'] as String,
        contactName: contact?['name'] as String? ?? 'Unknown',
        avatarUrl: contact?['avatar_url'] as String?,
        lastMessage: e['last_message_text'] as String? ?? '',
        lastMessageAt: DateTime.parse(e['last_message_at'] as String),
        unreadCount: (e['unread_count'] as int?) ?? 0,
        status: e['status'] as String? ?? 'open',
      );
    }).toList();
    controller.add(list);
  }

  // Initial load
  _load();

  // Subscribe to realtime changes for the conversations table
  channel
      .onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'conversations',
        callback: (payload) async {
          // Re-fetch entire list on any change; more granular diff can be added later
          await _load();
        },
      )
      .subscribe();

  // Clean up on provider dispose
  ref.onDispose(() {
    channel.unsubscribe();
    controller.close();
  });

  return controller.stream;
});