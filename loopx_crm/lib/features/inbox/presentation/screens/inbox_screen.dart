import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/avatar_widget.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/conversation_provider.dart';
import '../../../../core/widgets/skeleton_loader.dart';

class InboxScreen extends ConsumerStatefulWidget {
  const InboxScreen({super.key});

  @override
  ConsumerState<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends ConsumerState<InboxScreen> {
  String _filter = 'all';
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final conversationsAsync = ref.watch(conversationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Inbox Messages',
          style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: -0.5),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.mark_chat_read_outlined),
            tooltip: 'Mark all read',
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Sticky Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search chats or customer names...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                filled: true,
                fillColor: isDark ? AppColors.surface2 : AppColors.surface2Light,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: AppColors.primary, width: 1),
                ),
              ),
              onChanged: (v) => setState(() => _searchQuery = v),
            ),
          ),

          // Filters row
          Container(
            height: 38,
            margin: const EdgeInsets.only(bottom: 8),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _filterChip('All Chats', 'all'),
                const SizedBox(width: 8),
                _filterChip('Unread', 'unread'),
                const SizedBox(width: 8),
                _filterChip('Closed', 'closed'),
              ],
            ),
          ),

          // Conversation list
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => ref.refresh(conversationsProvider),
              child: conversationsAsync.when(
                loading: () => ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 96),
                  itemCount: 6,
                  itemBuilder: (_, __) => const SkeletonListTile(),
                ),
                error: (e, _) => Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.chat_bubble_outline_rounded, size: 48, color: AppColors.textMuted),
                        const SizedBox(height: 16),
                        const Text('Failed to load conversations'),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => ref.refresh(conversationsProvider),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                ),
                data: (convs) {
                  // Apply active filters
                  var filtered = convs;
                  if (_filter == 'unread') {
                    filtered = filtered.where((c) => c.unreadCount > 0).toList();
                  } else if (_filter == 'closed') {
                    filtered = filtered.where((c) => c.status == 'closed').toList();
                  }

                  // Apply search query
                  if (_searchQuery.isNotEmpty) {
                    filtered = filtered
                        .where((c) => c.contactName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
                            c.lastMessage.toLowerCase().contains(_searchQuery.toLowerCase()))
                        .toList();
                  }

                  if (filtered.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.question_answer_outlined,
                              size: 64,
                              color: isDark ? AppColors.textMuted : AppColors.textMutedLight,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No conversations found',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _searchQuery.isNotEmpty
                                  ? 'Try refining your search terms'
                                  : 'Active chats will appear here',
                              style: Theme.of(context).textTheme.bodySmall,
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 96),
                    itemCount: filtered.length,
                    separatorBuilder: (_, __) => Divider(
                      height: 1,
                      color: isDark ? AppColors.border : AppColors.borderLight,
                    ),
                    itemBuilder: (context, index) {
                      final conv = filtered[index];
                      return _conversationTile(context, conv, isDark);
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String value) {
    final isSelected = _filter == value;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return GestureDetector(
      onTap: () => setState(() => _filter = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : (isDark ? AppColors.surface2 : AppColors.surface2Light),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : (isDark ? AppColors.border : AppColors.borderLight),
            width: 1,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected
                  ? Colors.white
                  : (isDark ? AppColors.textSecondary : AppColors.textSecondaryLight),
            ),
          ),
        ),
      ),
    );
  }

  Widget _conversationTile(BuildContext context, ConversationItem conv, bool isDark) {
    return InkWell(
      onTap: () => context.push('/inbox/${conv.id}'),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AvatarWidget(
              name: conv.contactName,
              size: 48,
              showOnline: conv.status == 'open',
              isOnline: true,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          conv.contactName,
                          style: TextStyle(
                            fontWeight: conv.unreadCount > 0 ? FontWeight.w700 : FontWeight.w600,
                            fontSize: 15,
                            color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
                          ),
                        ),
                      ),
                      Text(
                        Formatters.formatRelativeTime(conv.lastMessageAt),
                        style: TextStyle(
                          fontSize: 11,
                          color: conv.unreadCount > 0
                              ? AppColors.primaryLight
                              : (isDark ? AppColors.textMuted : AppColors.textMutedLight),
                          fontWeight: conv.unreadCount > 0 ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Text(
                          conv.lastMessage,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 13,
                            color: conv.unreadCount > 0
                                ? (isDark ? AppColors.textPrimary : AppColors.textPrimaryLight)
                                : (isDark ? AppColors.textSecondary : AppColors.textSecondaryLight),
                            fontWeight: conv.unreadCount > 0 ? FontWeight.w600 : FontWeight.normal,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (conv.unreadCount > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.3),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Text(
                            '${conv.unreadCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

