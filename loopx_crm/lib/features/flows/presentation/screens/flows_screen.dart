import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../data/models/flow_model.dart';
import '../providers/flows_provider.dart';

class FlowsScreen extends ConsumerWidget {
  const FlowsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(flowsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return state.when(
      data: (flows) => _buildContent(context, ref, flows, isDark),
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
                'Error loading flows: ${err.toString()}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.refresh(flowsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, List<FlowModel> flows, bool isDark) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
      children: [
        // Beta Header Card
        _buildBetaHeader(context, isDark),
        const SizedBox(height: 16),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Interactive Flowcharts',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            TextButton.icon(
              onPressed: () => _showCreateFlowDialog(context, ref),
              icon: const Icon(Icons.add, size: 16),
              label: const Text('New Flow', style: TextStyle(fontSize: 12)),
            ),
          ],
        ),
        const SizedBox(height: 8),

        if (flows.isEmpty)
          _buildEmptyState(context, ref, isDark)
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: flows.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final flow = flows[index];
              return _buildFlowCard(context, ref, flow, isDark);
            },
          ),
      ],
    );
  }

  Widget _buildBetaHeader(BuildContext context, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.new_releases_outlined, color: AppColors.warning, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      'FLOWS PLATFORM',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.warning),
                    ),
                    SizedBox(width: 6),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppColors.warning,
                        borderRadius: BorderRadius.all(Radius.circular(8)),
                      ),
                      child: Text(
                        'BETA',
                        style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 3),
                Text(
                  'Build branching, button-driven WhatsApp conversations. Ideal for Welcome Menus, FAQs, and Lead Triage before handoff.',
                  style: TextStyle(fontSize: 10.5, height: 1.35, color: AppColors.textSecondaryLight),
                ),
              ],
            ),
          ),
        ],
      ),
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
              color: AppColors.info.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.alt_route_rounded, color: AppColors.info, size: 28),
          ),
          const SizedBox(height: 12),
          const Text(
            'No interactive flows created',
            style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          const Text(
            'Create automated flows to route customers to answers or assign to appropriate agents.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11.5, color: AppColors.textMuted),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => _showCreateFlowDialog(context, ref),
            icon: const Icon(Icons.add, size: 16),
            label: const Text('Create Your First Flow', style: TextStyle(fontSize: 12)),
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

  Widget _buildFlowCard(BuildContext context, WidgetRef ref, FlowModel flow, bool isDark) {
    Color statusColor = flow.status == 'active'
        ? AppColors.success
        : flow.status == 'archived'
            ? AppColors.textMuted
            : AppColors.warning;

    return GFCard(
      color: isDark ? AppColors.surface : AppColors.surfaceLight,
      elevation: 0,
      padding: EdgeInsets.zero,
      margin: EdgeInsets.zero,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(
        color: isDark ? AppColors.border : AppColors.borderLight,
      ),
      content: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Open the web app to edit flows. View and manage flows here.'),
              duration: Duration(seconds: 3),
            ),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.alt_route_rounded, color: AppColors.primary, size: 18),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          flow.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5),
                        ),
                        if (flow.description != null && flow.description!.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            flow.description!,
                            style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: statusColor.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          flow.status == 'active'
                              ? Icons.play_arrow_rounded
                              : flow.status == 'archived'
                                  ? Icons.archive_outlined
                                  : Icons.edit_rounded,
                          size: 10,
                          color: statusColor,
                        ),
                        const SizedBox(width: 3),
                        Text(
                          flow.status.toUpperCase(),
                          style: TextStyle(color: statusColor, fontSize: 8, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                _describeTrigger(flow),
                style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
              ),
              const Divider(height: 20),
              Row(
                children: [
                  const Icon(Icons.chat_bubble_outline_rounded, size: 12, color: AppColors.textMuted),
                  const SizedBox(width: 4),
                  Text(
                    '${flow.executionCount} execution${flow.executionCount == 1 ? '' : 's'}',
                    style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                  ),
                  const Spacer(),
                  TextButton.icon(
                    onPressed: () => _toggleStatus(context, ref, flow.id, flow.status),
                    icon: Icon(
                      flow.status == 'active' ? Icons.pause_rounded : Icons.play_arrow_rounded,
                      size: 14,
                    ),
                    label: Text(
                      flow.status == 'active' ? 'Pause' : 'Activate',
                      style: const TextStyle(fontSize: 11),
                    ),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                  const SizedBox(width: 4),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 18),
                    onPressed: () => _deleteFlow(context, ref, flow.id, flow.name),
                    style: IconButton.styleFrom(
                      padding: EdgeInsets.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _describeTrigger(FlowModel flow) {
    if (flow.triggerType == 'keyword') {
      final keywords = flow.triggerConfig['keywords'];
      if (keywords is List && keywords.isNotEmpty) {
        return 'Triggers on keywords: ${keywords.join(", ")}';
      }
      return 'Triggers on keyword (none set)';
    }
    if (flow.triggerType == 'first_inbound_message') {
      return "Triggers on contact's first inbound message";
    }
    return 'Manual Trigger';
  }

  Future<void> _toggleStatus(BuildContext context, WidgetRef ref, String id, String currentStatus) async {
    try {
      await FlowsService.toggleStatus(id, currentStatus);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(currentStatus == 'active' ? 'Flow paused (set to draft)' : 'Flow activated'),
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

  Future<void> _deleteFlow(BuildContext context, WidgetRef ref, String id, String name) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Flow?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Text('This permanently deletes "$name". Active customer sessions will end immediately.'),
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
        await FlowsService.delete(id);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Flow deleted')),
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

  void _showCreateFlowDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final keywordController = TextEditingController();
    String triggerType = 'keyword';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Create New Flow', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Flow Name', hintText: 'e.g. FAQ Menu'),
                ),
                const SizedBox(height: 12),
                const Text('Trigger Type', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                const SizedBox(height: 4),
                DropdownButtonFormField<String>(
                  value: triggerType,
                  items: const [
                    DropdownMenuItem(value: 'keyword', child: Text('On Keywords', style: TextStyle(fontSize: 13))),
                    DropdownMenuItem(value: 'first_inbound_message', child: Text('First Inbound Message', style: TextStyle(fontSize: 13))),
                    DropdownMenuItem(value: 'manual', child: Text('Manual (API/Agent)', style: TextStyle(fontSize: 13))),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => triggerType = val);
                  },
                ),
                if (triggerType == 'keyword') ...[
                  const SizedBox(height: 10),
                  TextField(
                    controller: keywordController,
                    decoration: const InputDecoration(
                      labelText: 'Keywords',
                      hintText: 'Comma separated, e.g. hi, hello, start',
                    ),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final name = nameController.text.trim();
                if (name.isNotEmpty) {
                  Navigator.pop(context);
                  
                  Map<String, dynamic> config = {};
                  if (triggerType == 'keyword') {
                    final words = keywordController.text
                        .split(',')
                        .map((e) => e.trim())
                        .where((e) => e.isNotEmpty)
                        .toList();
                    config['keywords'] = words;
                  }

                  try {
                    await FlowsService.createFlow(
                      name: name,
                      triggerType: triggerType,
                      triggerConfig: config,
                      description: 'Chatbot flow created via mobile',
                    );
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Created flow: $name')),
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
      ),
    );
  }
}
