import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/avatar_widget.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../ui/app_button.dart';
import '../providers/contacts_provider.dart';
import '../../../../data/models/contact_model.dart';

class ContactDetailScreen extends ConsumerStatefulWidget {
  final String contactId;

  const ContactDetailScreen({super.key, required this.contactId});

  @override
  ConsumerState<ContactDetailScreen> createState() => _ContactDetailScreenState();
}

class _ContactDetailScreenState extends ConsumerState<ContactDetailScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Find the contact from the provider using an empty search query list
    final contactsAsync = ref.watch(contactsProvider(''));
    
    return AppScaffold(
      title: 'Profile Detail',
      showBack: true,
      body: contactsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Failed to load profile details: $e')),
        data: (contacts) {
          final contact = contacts.firstWhere(
            (c) => c.id == widget.contactId,
            orElse: () => contacts.first,
          );

          final displayName = contact.name ?? contact.phone;

          return Column(
            children: [
              // Header Card
              Container(
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surface : AppColors.surfaceLight,
                  border: Border(
                    bottom: BorderSide(
                      color: isDark ? AppColors.border : AppColors.borderLight,
                      width: 1,
                    ),
                  ),
                ),
                child: Column(
                  children: [
                    Center(
                      child: Hero(
                        tag: 'avatar_${contact.id}',
                        child: AvatarWidget(
                          name: displayName,
                          size: 80,
                          imageUrl: contact.avatarUrl,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      displayName,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                            fontSize: 22,
                            letterSpacing: -0.3,
                          ),
                    ),
                    if (contact.company != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        contact.company!,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    // Quick Action Buttons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _actionCircleButton(Icons.phone_rounded, 'Call', () {}),
                        const SizedBox(width: 16),
                        _actionCircleButton(Icons.message_rounded, 'WhatsApp', () {}),
                        const SizedBox(width: 16),
                        _actionCircleButton(Icons.email_rounded, 'Email', () {}),
                      ],
                    ),
                  ],
                ),
              ),

              // Tab headers
              Container(
                color: isDark ? AppColors.surface : AppColors.surfaceLight,
                child: TabBar(
                  controller: _tabController,
                  indicatorColor: AppColors.primary,
                  labelColor: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
                  unselectedLabelColor: isDark ? AppColors.textMuted : AppColors.textMutedLight,
                  tabs: const [
                    Tab(text: 'Timeline'),
                    Tab(text: 'Deals'),
                    Tab(text: 'About'),
                  ],
                ),
              ),

              // Tab contents
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildTimelineTab(context, isDark),
                    _buildDealsTab(context, isDark),
                    _buildAboutTab(context, contact, isDark),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _actionCircleButton(IconData icon, String tooltip, VoidCallback onTap) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Tooltip(
      message: tooltip,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isDark ? AppColors.surface2 : AppColors.surface2Light,
            shape: BoxShape.circle,
            border: Border.all(
              color: isDark ? AppColors.border : AppColors.borderLight,
            ),
          ),
          child: Icon(icon, size: 20, color: AppColors.primary),
        ),
      ),
    );
  }

  Widget _buildTimelineTab(BuildContext context, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _timelineItem(
          context,
          'Deal stage moved to Proposal',
          'Sales pipeline step updated by system',
          'Yesterday, 4:30 PM',
          Icons.double_arrow_rounded,
          AppColors.warning,
        ),
        _timelineItem(
          context,
          'WhatsApp outbound template reply',
          'Agent sent price summary PDF sheet',
          '2 days ago, 11:20 AM',
          Icons.forum_outlined,
          AppColors.primary,
        ),
        _timelineItem(
          context,
          'Lead created in CRM directory',
          'Automated import from landing page lead form',
          '4 days ago, 9:00 AM',
          Icons.person_add_rounded,
          AppColors.success,
        ),
      ],
    );
  }

  Widget _timelineItem(BuildContext context, String title, String desc, String time, IconData icon, Color color) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 16, color: color),
            ),
            Container(
              width: 2,
              height: 48,
              color: isDark ? AppColors.border : AppColors.borderLight,
            ),
          ],
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 2),
              Text(
                desc,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                time,
                style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDealsTab(BuildContext context, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.surface : AppColors.surfaceLight,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: isDark ? AppColors.border : AppColors.borderLight),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Expanded(
                    child: Text(
                      'Custom ERP SaaS Integration',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'PROPOSAL',
                      style: TextStyle(color: AppColors.warning, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              const Text('Value: ₹1,50,000  ·  Owner: Agent', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
              const SizedBox(height: 16),
              Row(
                children: [
                  const Icon(Icons.calendar_today_rounded, size: 12, color: AppColors.textMuted),
                  const SizedBox(width: 4),
                  Text(
                    'Expected Close: ${Formatters.formatDate(DateTime.now().add(const Duration(days: 30)))}',
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAboutTab(BuildContext context, ContactModel contact, bool isDark) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        _infoRow(context, 'Phone Number', contact.phone, isDark),
        _infoRow(context, 'Email Address', contact.email ?? 'Not provided', isDark),
        _infoRow(context, 'Company Name', contact.company ?? 'Individual account', isDark),
        _infoRow(context, 'Account ID Reference', contact.accountId ?? 'Default Account', isDark),
        _infoRow(
          context,
          'Created Reference Date',
          Formatters.formatDate(contact.createdAt ?? DateTime.now()),
          isDark,
        ),
      ],
    );
  }

  Widget _infoRow(BuildContext context, String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
            ),
          ),
          const SizedBox(height: 8),
          Divider(color: isDark ? AppColors.border : AppColors.borderLight, height: 1),
        ],
      ),
    );
  }
}
