import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../data/models/automation_model.dart';
import '../providers/automations_provider.dart';

class AutomationsScreen extends ConsumerWidget {
  const AutomationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(automationsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return state.when(
      data: (automations) => _buildContent(context, ref, automations, isDark),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (err, stack) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
              const SizedBox(height: 12),
              Text(
                'Error loading automations: ${err.toString()}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.refresh(automationsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, List<AutomationModel> automations, bool isDark) {
    final showTemplates = automations.length < 3;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
      children: [
        if (showTemplates) ...[
          const Text(
            'Quick-start templates',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textMutedLight),
          ),
          const SizedBox(height: 8),
          _buildTemplatesGrid(context, ref, isDark),
          const SizedBox(height: 20),
        ],

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Active Workflows',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            if (!showTemplates)
              TextButton.icon(
                onPressed: () => _showCreateDialog(context, ref),
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Create New', style: TextStyle(fontSize: 12)),
              ),
          ],
        ),
        const SizedBox(height: 8),

        if (automations.isEmpty)
          _buildEmptyState(context, ref, isDark)
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: automations.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final a = automations[index];
              return _buildAutomationCard(context, ref, a, isDark);
            },
          ),
      ],
    );
  }

  Widget _buildTemplatesGrid(BuildContext context, WidgetRef ref, bool isDark) {
    final templates = [
      _Template(
        slug: 'welcome_message',
        name: 'Welcome Message',
        description: 'Send a friendly greeting when a customer opens a new chat.',
        icon: Icons.chat_bubble_outline_rounded,
        color: AppColors.primary,
        triggerType: 'welcome_message',
        config: {'message': 'Hello! Thanks for reaching out. How can we help you today?'},
      ),
      _Template(
        slug: 'out_of_office',
        name: 'Out of Office',
        description: 'Auto-reply when customers message outside business hours.',
        icon: Icons.schedule_rounded,
        color: AppColors.info,
        triggerType: 'out_of_office',
        config: {'message': 'We are currently offline. We will get back to you as soon as we return.'},
      ),
      _Template(
        slug: 'lead_qualifier',
        name: 'Lead Qualifier',
        description: 'Triage inbound requests before assigning to an agent.',
        icon: Icons.people_outline_rounded,
        color: AppColors.success,
        triggerType: 'lead_qualifier',
        config: {'questions': ['What is your company name?', 'How many users do you have?']},
      ),
      _Template(
        slug: 'follow_up_reminder',
        name: 'Follow-up Reminder',
        description: 'Send a reminder to follow up if a contact stops replying.',
        icon: Icons.notifications_active_outlined,
        color: AppColors.warning,
        triggerType: 'follow_up_reminder',
        config: {'delay_hours': 24, 'message': 'Just following up on our last conversation!'},
      ),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.35,
      ),
      itemCount: templates.length,
      itemBuilder: (context, index) {
        final t = templates[index];
        return InkWell(
          onTap: () => _createFromTemplate(context, ref, t),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surface : AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark ? AppColors.border : AppColors.borderLight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: t.color.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(t.icon, color: t.color, size: 18),
                ),
                const SizedBox(height: 8),
                Text(
                  t.name,
                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 3),
                Expanded(
                  child: Text(
                    t.description,
                    style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context, WidgetRef ref, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surface : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.border : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.bolt_rounded, color: AppColors.primary, size: 28),
          ),
          const SizedBox(height: 12),
          const Text(
            'No active automations yet',
            style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'Select a quick-start template above or create a new custom automation to get started.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11.5, color: AppColors.textMuted),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => _showCreateDialog(context, ref),
            icon: const Icon(Icons.add, size: 16),
            label: const Text('Create Blank Automation', style: TextStyle(fontSize: 12)),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAutomationCard(BuildContext context, WidgetRef ref, AutomationModel a, bool isDark) {
    String triggerLabel = a.triggerType.replaceAll('_', ' ').toUpperCase();

    return GFCard(
      color: isDark ? AppColors.surface : AppColors.surfaceLight,
      elevation: 0,
      padding: EdgeInsets.zero,
      margin: EdgeInsets.zero,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(
        color: isDark ? AppColors.border : AppColors.borderLight,
      ),
      content: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.bolt_rounded, color: AppColors.primary, size: 20),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                a.name,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: 8),
            if (a.isActive)
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (a.description != null && a.description!.isNotEmpty) ...[
              const SizedBox(height: 3),
              Text(
                a.description!,
                style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 6),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    triggerLabel,
                    style: const TextStyle(color: AppColors.primary, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
                Text(
                  '·  ${a.executionCount} run${a.executionCount == 1 ? '' : 's'}',
                  style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                ),
              ],
            ),
          ],
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Switch.adaptive(
              value: a.isActive,
              activeColor: AppColors.primary,
              onChanged: (newValue) => _toggleActive(context, ref, a.id, newValue),
            ),
            _buildPopupMenu(context, ref, a),
          ],
        ),
      ),
    );
  }

  Widget _buildPopupMenu(BuildContext context, WidgetRef ref, AutomationModel a) {
    return PopupMenuButton<String>(
      onSelected: (val) {
        if (val == 'duplicate') {
          _duplicate(context, ref, a);
        } else if (val == 'delete') {
          _delete(context, ref, a.id, a.name);
        } else if (val == 'logs') {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Open the web app to view detailed automation logs.'),
              duration: Duration(seconds: 3),
            ),
          );
        }
      },
      icon: const Icon(Icons.more_vert_rounded, size: 20, color: AppColors.textMuted),
      itemBuilder: (context) => [
        const PopupMenuItem(
          value: 'logs',
          child: Row(
            children: [
              Icon(Icons.receipt_long_rounded, size: 18),
              SizedBox(width: 8),
              Text('View Logs', style: TextStyle(fontSize: 13)),
            ],
          ),
        ),
        const PopupMenuItem(
          value: 'duplicate',
          child: Row(
            children: [
              Icon(Icons.copy_rounded, size: 18),
              SizedBox(width: 8),
              Text('Duplicate', style: TextStyle(fontSize: 13)),
            ],
          ),
        ),
        const PopupMenuDivider(),
        const PopupMenuItem(
          value: 'delete',
          child: Row(
            children: [
              Icon(Icons.delete_outline_rounded, size: 18, color: Colors.red),
              SizedBox(width: 8),
              Text('Delete', style: TextStyle(fontSize: 13, color: Colors.red)),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _toggleActive(BuildContext context, WidgetRef ref, String id, bool next) async {
    try {
      await AutomationsService.toggleActive(id, next);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next ? 'Automation activated' : 'Automation paused'),
            duration: const Duration(seconds: 1),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update status: $e')),
        );
      }
    }
  }

  Future<void> _duplicate(BuildContext context, WidgetRef ref, AutomationModel a) async {
    try {
      await AutomationsService.duplicate(a);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Automation duplicated')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to duplicate: $e')),
        );
      }
    }
  }

  Future<void> _delete(BuildContext context, WidgetRef ref, String id, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Automation?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Text('This permanently deletes "$name". This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await AutomationsService.delete(id);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Automation deleted')),
          );
        }
      } catch (e) {
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to delete: $e')),
          );
        }
      }
    }
  }

  void _createFromTemplate(BuildContext context, WidgetRef ref, _Template t) {
    final nameController = TextEditingController(text: 'My ${t.name}');
    final descController = TextEditingController(text: t.description);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Use Template: ${t.name}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Automation Name'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: descController,
              decoration: const InputDecoration(labelText: 'Description'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final name = nameController.text.trim();
              final desc = descController.text.trim();
              if (name.isNotEmpty) {
                Navigator.pop(context);
                try {
                  await AutomationsService.createFromTemplate(t.slug, name, desc, t.triggerType, t.config);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Created automation: $name')),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to create: $e')),
                    );
                  }
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  void _showCreateDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Blank Automation', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Automation Name', hintText: 'e.g. Lead Follow-up'),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: descController,
              decoration: const InputDecoration(labelText: 'Description', hintText: 'Optional notes'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              final name = nameController.text.trim();
              final desc = descController.text.trim();
              if (name.isNotEmpty) {
                Navigator.pop(context);
                try {
                  await AutomationsService.createFromTemplate('blank', name, desc, 'welcome_message', {});
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Created automation: $name')),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to create: $e')),
                    );
                  }
                }
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }
}

class _Template {
  final String slug;
  final String name;
  final String description;
  final IconData icon;
  final Color color;
  final String triggerType;
  final Map<String, dynamic> config;

  _Template({
    required this.slug,
    required this.name,
    required this.description,
    required this.icon,
    required this.color,
    required this.triggerType,
    required this.config,
  });
}
