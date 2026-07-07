import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/avatar_widget.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/message_provider.dart';
import '../providers/conversation_provider.dart';
import '../../../../core/network/supabase_client.dart';
import '../../../../ui/app_button.dart';
import '../../../../core/widgets/glass_container.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final String conversationId;

  const ChatScreen({super.key, required this.conversationId});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _messageController = TextEditingController();
  final _scrollController = ScrollController();
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  bool _sending = false;

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage(String text) async {
    if (text.trim().isEmpty) return;
    setState(() => _sending = true);
    try {
      await SupabaseManager.instance.client.from('messages').insert({
        'conversation_id': widget.conversationId,
        'content_text': text.trim(),
        'content_type': 'text',
        'sender_type': 'agent',
        'created_at': DateTime.now().toIso8601String(),
      });
      await SupabaseManager.instance.client
          .from('conversations')
          .update({'last_message_text': text.trim(), 'last_message_at': DateTime.now().toIso8601String()})
          .eq('id', widget.conversationId);
      _messageController.clear();
      // Auto-scroll to bottom
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent + 60,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to send: $e')));
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final messagesAsync = ref.watch(messagesProvider(widget.conversationId));
    
    // Find metadata for this conversation
    final conversations = ref.watch(conversationsProvider).value;
    final conv = conversations?.firstWhere(
      (c) => c.id == widget.conversationId,
      orElse: () => ConversationItem(
        id: widget.conversationId,
        contactName: 'Conversation',
        lastMessage: '',
        lastMessageAt: DateTime.now(),
        status: 'open',
      ),
    );

    final contactName = conv?.contactName ?? 'Conversation';
    final isOnline = conv?.status == 'open';

    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        leading: const BackButton(),
        titleSpacing: 0,
        title: GestureDetector(
          onTap: () => _scaffoldKey.currentState?.openEndDrawer(),
          behavior: HitTestBehavior.opaque,
          child: Row(
            children: [
              AvatarWidget(name: contactName, size: 38, showOnline: true, isOnline: isOnline),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      contactName,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, letterSpacing: -0.2),
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      isOnline ? 'Active Chat' : 'Inactive / Closed',
                      style: TextStyle(
                        fontSize: 11,
                        color: isOnline ? AppColors.success : AppColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.phone_outlined),
            tooltip: 'Call Customer',
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.info_outline_rounded),
            tooltip: 'Contact Details',
            onPressed: () => _scaffoldKey.currentState?.openEndDrawer(),
          ),
          PopupMenuButton<String>(
            onSelected: (v) {
              if (v == 'contact') {
                _scaffoldKey.currentState?.openEndDrawer();
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'assign', child: Text('Assign conversation')),
              const PopupMenuItem(value: 'close', child: Text('Close conversation')),
              const PopupMenuItem(value: 'contact', child: Text('View contact details')),
            ],
          ),
        ],
      ),
      endDrawer: _buildContactSidebarDrawer(context, contactName, conv?.status ?? 'open', isDark),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: messagesAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Failed to load messages: $e')),
              data: (messages) {
                if (messages.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.forum_outlined, size: 48, color: AppColors.textMuted),
                          const SizedBox(height: 16),
                          Text(
                            'No messages yet',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          const Text('Type below to send a WhatsApp template response.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12)),
                        ],
                      ),
                    ),
                  );
                }
                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final msg = messages[index];
                    return _messageBubble(msg, isDark);
                  },
                );
              },
            ),
          ),

          // Quick replies
          Container(
            height: 38,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _quickReply('Thank you for reaching out!'),
                _quickReply('Here is our pricing detail'),
                _quickReply('Can we schedule a call today?'),
              ],
            ),
          ),
          const SizedBox(height: 6),

          // Input field
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
            child: GlassContainer(
              padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
              opacity: isDark ? 0.35 : 0.65,
              borderOpacity: isDark ? 0.2 : 0.15,
              borderRadius: BorderRadius.circular(30),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.attach_file_rounded, size: 22),
                    onPressed: () {},
                    color: AppColors.textMuted,
                  ),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      style: const TextStyle(fontSize: 14),
                      decoration: const InputDecoration(
                        hintText: 'Type a message...',
                        filled: false,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                      ),
                      onSubmitted: _sending ? null : (v) => _sendMessage(v),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _sending ? null : () => _sendMessage(_messageController.text),
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      child: _sending
                          ? const SizedBox(
                              width: 18, height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.send_rounded, size: 18, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _messageBubble(dynamic msg, bool isDark) {
    final bubbleRadius = BorderRadius.only(
      topLeft: const Radius.circular(16),
      topRight: const Radius.circular(16),
      bottomLeft: Radius.circular(msg.isMe ? 16 : 4),
      bottomRight: Radius.circular(msg.isMe ? 4 : 16),
    );

    Widget innerBubble = Container(
      constraints: BoxConstraints(
        maxWidth: MediaQuery.of(context).size.width * 0.72,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            msg.text,
            style: TextStyle(
              color: msg.isMe ? Colors.white : (isDark ? AppColors.textPrimary : AppColors.textPrimaryLight),
              fontSize: 14,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                Formatters.formatTime(msg.time),
                style: TextStyle(
                  fontSize: 10,
                  color: msg.isMe
                      ? Colors.white.withValues(alpha: 0.7)
                      : (isDark ? AppColors.textMuted : AppColors.textMutedLight),
                ),
              ),
              if (msg.isMe) ...[
                const SizedBox(width: 4),
                const Icon(Icons.done_all_rounded, size: 12, color: Colors.white),
              ],
            ],
          ),
        ],
      ),
    );

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: msg.isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          Flexible(
            child: msg.isMe
                ? Container(
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: bubbleRadius,
                    ),
                    child: innerBubble,
                  )
                : GlassContainer(
                    opacity: isDark ? 0.35 : 0.65,
                    borderOpacity: isDark ? 0.2 : 0.15,
                    borderRadius: bubbleRadius,
                    padding: EdgeInsets.zero,
                    child: innerBubble,
                  ),
          ),
        ],
      ),
    );
  }

  Widget _quickReply(String text) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        label: Text(text, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
        onPressed: () => _sendMessage(text),
        backgroundColor: isDark ? AppColors.surface2 : AppColors.surface2Light,
        side: BorderSide(color: isDark ? AppColors.border : AppColors.borderLight, width: 1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }

  Widget _buildContactSidebarDrawer(BuildContext context, String name, String status, bool isDark) {
    return Drawer(
      width: 280,
      backgroundColor: isDark ? AppColors.background : AppColors.backgroundLight,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drawer header close
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Contact Profile',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Avatar & Name Centered
              Center(
                child: Column(
                  children: [
                    AvatarWidget(name: name, size: 72),
                    const SizedBox(height: 12),
                    Text(
                      name,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      status == 'open' ? 'Active Conversation' : 'Archived Thread',
                      style: TextStyle(
                        fontSize: 12,
                        color: status == 'open' ? AppColors.success : AppColors.textMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Tags Section
              Text(
                'CRM Tags',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  _sidebarTag('Hot Lead', AppColors.error),
                  _sidebarTag('Enterprise Client', AppColors.primary),
                  _sidebarTag('WhatsApp Inbound', AppColors.success),
                ],
              ),
              const SizedBox(height: 24),

              // Deal Details Card
              GlassContainer(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                opacity: isDark ? 0.35 : 0.65,
                borderOpacity: isDark ? 0.2 : 0.15,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.monetization_on_outlined, size: 16, color: AppColors.warning),
                        const SizedBox(width: 6),
                        Text(
                          'Active Deals',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Custom ERP Software Integration',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Value: ₹1,50,000  ·  Stage: Negotiation',
                      style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // AI Insights
              Row(
                children: [
                  const Icon(Icons.psychology_rounded, size: 18, color: AppColors.info),
                  const SizedBox(width: 6),
                  Text(
                    'AI Chat Summary',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Customer requested pricing details for the custom package. Raj (Agent) has sent the contract. Follow up requested by Monday.',
                style: TextStyle(
                  fontSize: 11,
                  height: 1.4,
                  color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
                ),
              ),
              const Spacer(),

              // Quick Actions footer
              SizedBox(
                width: double.infinity,
                child: AppButton(
                  label: 'Move Stage',
                  onPressed: () {},
                  variant: AppButtonVariant.gradient,
                  icon: Icons.double_arrow_rounded,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sidebarTag(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3), width: 0.5),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color),
      ),
    );
  }
}

