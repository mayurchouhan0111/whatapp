import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/widgets/avatar_widget.dart';
import '../../../../core/utils/formatters.dart';
import '../providers/contacts_provider.dart';
import '../../../../ui/app_button.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/skeleton_loader.dart';

class ContactsScreen extends ConsumerStatefulWidget {
  const ContactsScreen({super.key});

  @override
  ConsumerState<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends ConsumerState<ContactsScreen> {
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
    final contactsAsync = ref.watch(contactsProvider(_searchQuery));

    return AppScaffold(
      title: 'Contacts Directory',
      actions: [
        IconButton(
          icon: const Icon(Icons.person_add_outlined),
          tooltip: 'Add Contact',
          onPressed: () => _showAddContactDialog(context),
        ),
      ],
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by name, phone or email...',
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
          
          // Content
          Expanded(
            child: contactsAsync.when(
              loading: () => ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 96),
                itemCount: 6,
                itemBuilder: (_, __) => const SkeletonListTile(),
              ),
              error: (e, _) => _buildError(context, e.toString()),
              data: (contacts) {
                if (contacts.isEmpty) {
                  return _buildEmptyState(context);
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.refresh(contactsProvider(_searchQuery)),
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
                    itemCount: contacts.length,
                    separatorBuilder: (_, __) => Divider(
                      height: 1,
                      color: isDark ? AppColors.border : AppColors.borderLight,
                    ),
                    itemBuilder: (context, index) {
                      final c = contacts[index];
                      final name = c.name ?? c.phone;
                      final emailAndCompany = [c.email, c.company].where((x) => x != null && x.isNotEmpty).join(' · ');

                      return InkWell(
                        onTap: () => context.push('/contacts/${c.id}'),
                        borderRadius: BorderRadius.circular(12),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                          child: Row(
                            children: [
                              Hero(
                                tag: 'avatar_${c.id}',
                                child: AvatarWidget(
                                  name: name,
                                  size: 46,
                                  imageUrl: c.avatarUrl,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            name,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 15,
                                              color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
                                            ),
                                          ),
                                        ),
                                        Text(
                                          Formatters.formatRelativeTime(c.createdAt ?? DateTime.now()),
                                          style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 10),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      emailAndCompany.isEmpty ? 'No email or company info' : emailAndCompany,
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 6),
                                    // Contact tag chips
                                    Row(
                                      children: [
                                        _tagBadge(
                                          index % 2 == 0 ? 'Hot Lead' : 'Customer',
                                          index % 2 == 0 ? AppColors.error : AppColors.primary,
                                        ),
                                        const SizedBox(width: 6),
                                        _tagBadge('WhatsApp Inbound', AppColors.success),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _tagBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.25), width: 0.5),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: color),
      ),
    );
  }

  Widget _buildError(BuildContext context, String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            Text('Failed to load contacts', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(message, style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            AppButton(
              label: 'Retry Loading',
              onPressed: () => ref.refresh(contactsProvider(_searchQuery)),
              variant: AppButtonVariant.filled,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.people_outline_rounded,
              size: 64,
              color: isDark ? AppColors.textMuted : AppColors.textMutedLight,
            ),
            const SizedBox(height: 16),
            Text(
              'No contacts found',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              _searchQuery.isNotEmpty ? 'Try a different search term' : 'Add your first contact to get started',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  void _showAddContactDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add New Contact', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              TextField(decoration: InputDecoration(labelText: 'Full Name')),
              SizedBox(height: 12),
              TextField(decoration: InputDecoration(labelText: 'Phone Number')),
              SizedBox(height: 12),
              TextField(decoration: InputDecoration(labelText: 'Company')),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            AppButton(
              label: 'Save Contact',
              onPressed: () => Navigator.pop(context),
              variant: AppButtonVariant.filled,
            ),
          ],
        );
      },
    );
  }
}

