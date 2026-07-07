import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:getwidget/getwidget.dart';
import '../../../../ui/app_button.dart';
import '../../../../data/models/pipeline_model.dart';
import '../providers/pipelines_provider.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/avatar_widget.dart';
import '../../../../core/widgets/glass_container.dart';

class PipelinesScreen extends ConsumerWidget {
  const PipelinesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pipelinesAsync = ref.watch(pipelinesProvider);
    final selectedId = ref.watch(selectedPipelineIdProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppScaffold(
      title: 'Sales Pipelines',
      actions: [
        IconButton(
          icon: const Icon(Icons.add_chart_rounded),
          tooltip: 'Add Deal',
          onPressed: () => _showAddDealDialog(context, ref),
        ),
      ],
      body: pipelinesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => _buildError(context, ref, e.toString()),
        data: (data) {
          if (data.pipelines.isEmpty) {
            return _buildEmptyState(context, ref);
          }
          final activePipelineId = selectedId ?? data.pipelines.first.id;
          final pipeline = data.pipelines.firstWhere(
            (p) => p.id == activePipelineId,
            orElse: () => data.pipelines.first,
          );
          final stages = data.stagesForPipeline(pipeline.id);
          if (stages.isEmpty) {
            return Center(child: Text('No stages for "${pipeline.name}"'));
          }

          return Column(
            children: [
              // Pipeline Selector & Stats Header
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
                child: GlassContainer(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  opacity: isDark ? 0.35 : 0.65,
                  borderOpacity: isDark ? 0.2 : 0.15,
                  child: Column(
                    children: [
                      _buildPipelineSelector(context, ref, data.pipelines, activePipelineId, pipeline.name, isDark),
                      const SizedBox(height: 8),
                      _buildAnalyticsSummary(context, data, isDark),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 96),
                  scrollDirection: Axis.horizontal,
                  itemCount: stages.length,
                  itemBuilder: (context, index) {
                    final stage = stages[index];
                    final deals = data.dealsForStage(stage.id);
                    final stageValue = deals.fold<double>(0, (sum, d) => sum + d.value);
                    return _buildStageColumn(context, ref, stage, deals, stageValue, isDark);
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildPipelineSelector(BuildContext context, WidgetRef ref,
      List<PipelineModel> pipelines, String activeId, String activeName, bool isDark) {
    if (pipelines.length <= 1) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Align(
          alignment: Alignment.centerLeft,
          child: Text(
            activeName,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButtonFormField<String>(
                value: activeId,
                decoration: InputDecoration(
                  fillColor: isDark ? AppColors.surface2 : AppColors.surface2Light,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
                items: pipelines.map((p) => DropdownMenuItem(value: p.id, child: Text(p.name, style: const TextStyle(fontWeight: FontWeight.bold)))).toList(),
                onChanged: (v) {
                  if (v != null) ref.read(selectedPipelineIdProvider.notifier).state = v;
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnalyticsSummary(BuildContext context, PipelinesData data, bool isDark) {
    final openDeals = data.deals.where((d) => d.status == 'open').toList();
    final totalValue = openDeals.fold<double>(0, (s, d) => s + d.value);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          _analyticsChip(context, '${openDeals.length} active deals', Icons.insights_rounded, isDark),
          _analyticsChip(context, 'Pipeline Value: ${Formatters.formatCompactCurrency(totalValue, currency: 'INR')}',
              Icons.monetization_on_rounded, isDark),
        ],
      ),
    );
  }

  Widget _analyticsChip(BuildContext context, String label, IconData icon, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.primary),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
          ),
        ],
      ),
    );
  }

  Widget _buildStageColumn(BuildContext context, WidgetRef ref, PipelineStageModel stage,
      List<DealModel> deals, double totalValue, bool isDark) {
    final color = Color(int.parse('0xFF${stage.color.replaceAll('#', '')}'));
    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stage Column Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withValues(alpha: 0.25)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        stage.name,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${deals.length}',
                        style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Value: ${Formatters.formatCompactCurrency(totalValue, currency: 'INR')}',
                  style: TextStyle(fontSize: 11, color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Deals list with DragTarget
          Expanded(
            child: DragTarget<String>(
              onWillAccept: (data) => data != null,
              onAccept: (dealId) {
                ref.read(pipelinesProvider.notifier).updateDealStage(dealId, stage.id);
              },
              builder: (context, candidateData, rejectedData) {
                final isOver = candidateData.isNotEmpty;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  decoration: BoxDecoration(
                    color: isOver ? color.withValues(alpha: 0.05) : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                    border: isOver ? Border.all(color: color.withValues(alpha: 0.3), width: 1.5) : null,
                  ),
                  child: deals.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.dashboard_customize_outlined, size: 36, color: color.withValues(alpha: 0.2)),
                              const SizedBox(height: 8),
                              Text(
                                isOver ? 'Drop deal here' : 'No deals here',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 11),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: EdgeInsets.zero,
                          itemCount: deals.length,
                          itemBuilder: (context, index) => _buildDraggableDealCard(context, deals[index], color, isDark),
                        ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDraggableDealCard(BuildContext context, DealModel deal, Color stageColor, bool isDark) {
    final card = _buildDealCard(context, deal, stageColor, isDark);
    
    return LongPressDraggable<String>(
      data: deal.id,
      feedback: Material(
        color: Colors.transparent,
        child: SizedBox(
          width: 260,
          child: card,
        ),
      ),
      childWhenDragging: Opacity(
        opacity: 0.35,
        child: card,
      ),
      child: card,
    );
  }

  Widget _buildDealCard(BuildContext context, DealModel deal, Color stageColor, bool isDark) {
    // Generate deterministic mock tags for CRM visual polish
    final hash = deal.title.hashCode;
    final isHighPriority = hash % 3 == 0;
    final priorityLabel = isHighPriority ? 'High' : (hash % 3 == 1 ? 'Medium' : 'Low');
    final priorityColor = isHighPriority ? AppColors.error : (hash % 3 == 1 ? AppColors.warning : AppColors.success);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showDealQuickActions(context, deal),
          borderRadius: BorderRadius.circular(14),
          child: GFCard(
            color: isDark ? AppColors.surface : AppColors.surfaceLight,
            elevation: 0,
            padding: const EdgeInsets.all(16),
            margin: EdgeInsets.zero,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: stageColor.withValues(alpha: 0.35), width: 1.0),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Title & Priority Tag
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        deal.title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, height: 1.3),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: priorityColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: priorityColor.withValues(alpha: 0.25), width: 0.5),
                      ),
                      child: Text(
                        priorityLabel,
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: priorityColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Middle Section: Deal Value & Assignee Initial avatar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.monetization_on_outlined, size: 14, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          Formatters.formatCompactCurrency(deal.value, currency: deal.currency),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                    AvatarWidget(
                      name: hash % 2 == 0 ? 'Raj Patel' : 'Nisha Sen',
                      size: 24,
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Footer: Company Ref & Date
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        hash % 2 == 0 ? 'Enterprise Corp' : 'Retailer Group',
                        style: TextStyle(fontSize: 10.5, color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight, fontWeight: FontWeight.w600),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (deal.expectedCloseDate != null) ...[
                      Row(
                        children: [
                          const Icon(Icons.calendar_today_rounded, size: 10, color: AppColors.textMuted),
                          const SizedBox(width: 4),
                          Text(
                            Formatters.formatDate(deal.expectedCloseDate!),
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(fontSize: 10),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref, String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
            const SizedBox(height: 12),
            Text('Failed to load pipelines', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(message, style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            AppButton(
              label: 'Retry Loading',
              onPressed: () => ref.read(pipelinesProvider.notifier).refresh(),
              variant: AppButtonVariant.filled,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.account_tree_outlined,
              size: 64,
              color: isDark ? AppColors.textMuted : AppColors.textMutedLight,
            ),
            const SizedBox(height: 16),
            Text('No pipelines configured', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text(
              'Create your first pipeline stages to track deals progress',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 20),
            AppButton(
              label: 'Create Custom Pipeline',
              onPressed: () {},
              variant: AppButtonVariant.gradient,
            ),
          ],
        ),
      ),
    );
  }

  void _showAddDealDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add Sales Deal', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: const [
              TextField(decoration: InputDecoration(labelText: 'Deal Title (e.g. SaaS Setup)')),
              SizedBox(height: 12),
              TextField(decoration: InputDecoration(labelText: 'Deal Value (INR)')),
              SizedBox(height: 12),
              TextField(decoration: InputDecoration(labelText: 'Company Association')),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            AppButton(
              label: 'Add Deal',
              onPressed: () => Navigator.pop(context),
              variant: AppButtonVariant.filled,
            ),
          ],
        );
      },
    );
  }

  void _showDealQuickActions(BuildContext context, DealModel deal) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                deal.title,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Current Value: ${Formatters.formatCompactCurrency(deal.value, currency: deal.currency)}',
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.arrow_forward_rounded, color: AppColors.success),
                title: const Text('Advance to Next Stage'),
                onTap: () => Navigator.pop(context),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.check_circle_outline_rounded, color: AppColors.info),
                title: const Text('Mark Deal as WON'),
                onTap: () => Navigator.pop(context),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.cancel_outlined, color: AppColors.error),
                title: const Text('Mark Deal as LOST'),
                onTap: () => Navigator.pop(context),
              ),
            ],
          ),
        );
      },
    );
  }
}

