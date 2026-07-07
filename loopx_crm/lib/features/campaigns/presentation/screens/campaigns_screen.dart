import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../data/models/broadcast_model.dart';
import '../providers/campaigns_provider.dart';

class CampaignsScreen extends ConsumerWidget {
  const CampaignsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(broadcastsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return state.when(
      data: (broadcasts) => _buildContent(context, ref, broadcasts, isDark),
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
                'Error loading broadcasts: ${err.toString()}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.refresh(broadcastsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, WidgetRef ref, List<BroadcastModel> broadcasts, bool isDark) {
    final totalSent = broadcasts.fold<int>(0, (sum, b) => sum + b.sentCount);
    final totalDelivered = broadcasts.fold<int>(0, (sum, b) => sum + b.deliveredCount);
    final totalRead = broadcasts.fold<int>(0, (sum, b) => sum + b.readCount);
    final avgReadRate = totalDelivered > 0 ? totalRead / totalDelivered : 0.0;

    return Column(
      children: [
        _buildAnalyticsHeader(context, broadcasts.length, totalSent, avgReadRate, isDark),
        const SizedBox(height: 12),

        Expanded(
          child: broadcasts.isEmpty
              ? _buildEmptyState(context, isDark)
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
                  itemCount: broadcasts.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final b = broadcasts[index];
                    return _buildBroadcastCard(context, ref, b, isDark);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildEmptyState(BuildContext context, bool isDark) {
    return Center(
      child: Container(
        margin: const EdgeInsets.all(16),
        padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surface : AppColors.surfaceLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? AppColors.border : AppColors.borderLight,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.campaign_outlined, color: AppColors.primary, size: 36),
            ),
            const SizedBox(height: 16),
            const Text(
              'No broadcasts yet',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Create your first broadcast campaign from the web app.\nBroadcasts can be managed here on mobile.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'active':
      case 'sending':
        return AppColors.success;
      case 'draft':
        return AppColors.textMuted;
      case 'sent':
      case 'completed':
        return AppColors.info;
      case 'scheduled':
        return AppColors.warning;
      case 'failed':
        return AppColors.error;
      default:
        return AppColors.textMuted;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'active':
      case 'sending':
        return Icons.campaign_rounded;
      case 'draft':
        return Icons.edit_note_rounded;
      case 'sent':
      case 'completed':
        return Icons.check_circle_outline_rounded;
      case 'scheduled':
        return Icons.schedule_rounded;
      case 'failed':
        return Icons.error_outline_rounded;
      default:
        return Icons.campaign_outlined;
    }
  }

  Widget _buildAnalyticsHeader(BuildContext context, int totalBroadcasts, int totalSent, double avgReadRate, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surface : AppColors.surfaceLight,
        border: Border(
          bottom: BorderSide(color: isDark ? AppColors.border : AppColors.borderLight),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _statBox(context, 'Broadcasts', totalBroadcasts.toString(), AppColors.primary),
          _statBox(context, 'Total Sent', totalSent.toString(), AppColors.info),
          _statBox(context, 'Avg Read Rate', '${(avgReadRate * 100).toInt()}%', AppColors.success),
        ],
      ),
    );
  }

  Widget _statBox(BuildContext context, String label, String value, Color color) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
          ),
        ),
      ],
    );
  }

  Widget _buildBroadcastCard(BuildContext context, WidgetRef ref, BroadcastModel b, bool isDark) {
    final color = _statusColor(b.status);
    final displayStatus = b.status == 'sending' ? 'active' : b.status;

    return GFCard(
      color: isDark ? AppColors.surface : AppColors.surfaceLight,
      elevation: 0,
      padding: EdgeInsets.zero,
      margin: EdgeInsets.zero,
      borderRadius: BorderRadius.circular(16),
      border: Border.all(
        color: isDark ? AppColors.border : AppColors.borderLight,
        width: 1,
      ),
      content: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Column(
          children: [
            ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              leading: Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _statusIcon(b.status),
                  color: color,
                  size: 20,
                ),
              ),
              title: Text(
                b.name,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5),
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4.0),
                child: Text(
                  '$displayStatus  ·  ${b.sentCount} sent / ${b.totalRecipients} total',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _daysAgo(b.createdAt),
                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                  ),
                  _buildPopupMenu(context, ref, b),
                ],
              ),
            ),
            if (b.sentCount > 0)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Column(
                  children: [
                    const Divider(height: 1),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _rateLabel(context, 'Delivery', '${(b.deliveryRate * 100).toInt()}%'),
                        _rateLabel(context, 'Read', '${(b.readRate * 100).toInt()}%'),
                        _rateLabel(context, 'Failed', '${b.failedCount}'),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: LinearProgressIndicator(
                        value: b.readRate,
                        minHeight: 6,
                        backgroundColor: isDark ? AppColors.surface2 : AppColors.surface2Light,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildPopupMenu(BuildContext context, WidgetRef ref, BroadcastModel b) {
    return PopupMenuButton<String>(
      onSelected: (val) async {
        if (val == 'delete') {
          await _delete(context, ref, b);
        } else if (val == 'duplicate') {
          await _duplicate(context, ref, b);
        }
      },
      icon: const Icon(Icons.more_vert_rounded, size: 20, color: AppColors.textMuted),
      itemBuilder: (context) => [
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

  Future<void> _delete(BuildContext context, WidgetRef ref, BroadcastModel b) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Broadcast?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Text('This permanently deletes "${b.name}". This action cannot be undone.'),
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
        await CampaignsService.delete(b.id);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Broadcast deleted')),
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

  Future<void> _duplicate(BuildContext context, WidgetRef ref, BroadcastModel b) async {
    try {
      await CampaignsService.duplicate(b);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Duplicated: ${b.name}')),
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

  String _daysAgo(DateTime date) {
    final diff = DateTime.now().difference(date);
    if (diff.inDays > 0) return '${diff.inDays}d ago';
    if (diff.inHours > 0) return '${diff.inHours}h ago';
    return '${diff.inMinutes}m ago';
  }

  Widget _rateLabel(BuildContext context, String label, String value) {
    return Row(
      children: [
        Text(
          '$label: ',
          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
        ),
        Text(
          value,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
