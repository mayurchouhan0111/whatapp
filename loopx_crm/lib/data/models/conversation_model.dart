import 'package:freezed_annotation/freezed_annotation.dart';
import 'contact_model.dart';

part 'conversation_model.freezed.dart';
part 'conversation_model.g.dart';

@freezed
class ConversationModel with _$ConversationModel {
  const ConversationModel._();
  const factory ConversationModel({
    required String id,
    required String userId,
    required String contactId,
    required String status,
    String? assignedAgentId,
    String? lastMessageText,
    DateTime? lastMessageAt,
    @Default(0) int unreadCount,
    String? accountId,
    DateTime? createdAt,
    DateTime? updatedAt,
    ContactModel? contact,
  }) = _ConversationModel;

  factory ConversationModel.fromJson(Map<String, dynamic> json) =>
      _$ConversationModelFromJson(json);

  static const String tableName = 'conversations';

  static const List<String> defaultSelect = [
    'id', 'user_id', 'contact_id', 'status',
    'assigned_agent_id', 'last_message_text', 'last_message_at',
    'unread_count', 'account_id', 'created_at', 'updated_at',
  ];

  bool get isOpen => status == 'open';
  bool get isClosed => status == 'closed';
}
