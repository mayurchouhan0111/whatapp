import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/dashboard_provider.dart';
import '../../data/dashboard_repository_impl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/metric_card.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../ui/app_button.dart';
import '../../../../core/widgets/avatar_widget.dart';
import '../../../../core/widgets/glass_container.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppScaffold(
      title: 'LoopX CRM',
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          tooltip: 'Notifications',
          onPressed: () => _showNotificationsDrawer(context),
        ),
      ],
      body: RefreshIndicator(
        onRefresh: () => ref.read(dashboardProvider.notifier).loadMetrics(),
        child: state.isLoading
            ? const Center(child: CircularProgressIndicator())
            : state.errorMessage != null
                ? _buildError(context, ref)
                : _buildContent(context, state, isDark),
      ),
    );
  }

  Widget _buildError(BuildContext context, WidgetRef ref) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, size: 64, color: AppColors.error),
            const SizedBox(height: 16),
            const Text('Failed to load dashboard data'),
            const SizedBox(height: 16),
            AppButton(
              label: 'Retry Loading',
              onPressed: () => ref.read(dashboardProvider.notifier).loadMetrics(),
              variant: AppButtonVariant.filled,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, DashboardState state, bool isDark) {
    final metrics = state.metrics!;
    final currency = 'INR';

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        // Greeting & Header Card
        _buildGreetingCard(context, metrics, isDark),
        const SizedBox(height: 20),

        // KPI Cards Grid
        GridView.count(
          crossAxisCount: MediaQuery.of(context).size.width >= 600 ? 4 : 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          childAspectRatio: MediaQuery.of(context).size.width >= 900
              ? 1.5
              : (MediaQuery.of(context).size.width >= 600 ? 1.2 : 1.1),
          children: [
            MetricCard(
              title: 'Active Chats',
              value: metrics.activeConversations.toString(),
              icon: Icons.chat_bubble_outline_rounded,
              delta: 12,
              iconColor: AppColors.primary,
            ),
            MetricCard(
              title: 'New Leads',
              value: metrics.newContactsToday.toString(),
              icon: Icons.person_add_outlined,
              delta: 8,
              iconColor: AppColors.success,
            ),
            MetricCard(
              title: 'Open Value',
              value: Formatters.formatCompactCurrency(
                metrics.openDealsValue,
                currency: currency,
              ),
              icon: Icons.trending_up_rounded,
              delta: 15,
              iconColor: AppColors.warning,
              subtitle: '${metrics.openDealsCount} active deals',
            ),
            MetricCard(
              title: 'Sent Messages',
              value: metrics.messagesSentToday.toString(),
              icon: Icons.send_rounded,
              delta: 24,
              iconColor: AppColors.info,
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Quick Actions Row
        _buildQuickActions(context, isDark),
        const SizedBox(height: 24),

        // Revenue conversion line chart (fl_chart)
        _buildRevenueChart(context, isDark),
        const SizedBox(height: 24),

        // Smart AI Insights & Upcoming Tasks Side-by-Side or Stacked
        if (MediaQuery.of(context).size.width >= 720)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _buildAIInsights(context, metrics, isDark)),
              const SizedBox(width: 16),
              Expanded(child: _buildUpcomingTasks(context, metrics, isDark)),
            ],
          )
        else ...[
          _buildAIInsights(context, metrics, isDark),
          const SizedBox(height: 24),
          _buildUpcomingTasks(context, metrics, isDark),
        ],
        const SizedBox(height: 24),

        // Recent Activity Card
        _buildRecentActivity(context, isDark),
      ],
    );
  }

  Widget _buildGreetingCard(BuildContext context, DashboardMetrics metrics, bool isDark) {
    return GlassContainer(
      padding: const EdgeInsets.all(20),
      opacity: isDark ? 0.35 : 0.65,
      borderOpacity: isDark ? 0.2 : 0.15,
      child: Row(
        children: [
          GestureDetector(
            onTap: () => context.push('/dashboard/settings'),
            child: const AvatarWidget(
              name: 'LoopX User',
              size: 56,
              showOnline: true,
              isOnline: true,
            ),
          ),
          const SizedBox(width: 16),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Good ${_greeting()}, Agent',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 4),
                Text(
                  _greetingSubtitle(metrics.openDealsCount, metrics.activeConversations),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _greetingSubtitle(int dealsCount, int chatsCount) {
    if (dealsCount > 0 && chatsCount > 0) {
      return 'You have $dealsCount active deals and $chatsCount open conversations. Ready to close more?';
    } else if (dealsCount > 0) {
      return 'You have $dealsCount active deals in your pipeline today.';
    } else if (chatsCount > 0) {
      return 'You have $chatsCount open conversations waiting for you.';
    }
    return "Here is today's overview.";
  }

  Widget _buildQuickActions(BuildContext context, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Actions',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 44,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              AppButton(
                label: 'New Broadcast',
                onPressed: () => StatefulNavigationShell.of(context).goBranch(4),
                variant: AppButtonVariant.filled,
                icon: Icons.campaign_rounded,
              ),
              const SizedBox(width: 8),
              AppButton(
                label: 'Add Contact',
                onPressed: () => StatefulNavigationShell.of(context).goBranch(2),
                variant: AppButtonVariant.outlined,
                icon: Icons.person_add_rounded,
              ),
              const SizedBox(width: 8),
              AppButton(
                label: 'New Deal',
                onPressed: () => StatefulNavigationShell.of(context).goBranch(3),
                variant: AppButtonVariant.outlined,
                icon: Icons.add_chart_rounded,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRevenueChart(BuildContext context, bool isDark) {
    return GlassContainer(
      padding: const EdgeInsets.all(20),
      opacity: isDark ? 0.35 : 0.65,
      borderOpacity: isDark ? 0.2 : 0.15,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Revenue Forecast',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Estimated deal closure values',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: isDark ? AppColors.textMuted : AppColors.textMutedLight,
                          ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  '+12.4% vs last week',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.success,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 180,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: isDark ? AppColors.border : AppColors.borderLight,
                    strokeWidth: 1,
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 22,
                      interval: 1,
                      getTitlesWidget: (value, meta) {
                        const style = TextStyle(fontSize: 10, color: AppColors.textMuted);
                        switch (value.toInt()) {
                          case 1:
                            return const Text('Jan', style: style);
                          case 2:
                            return const Text('Feb', style: style);
                          case 3:
                            return const Text('Mar', style: style);
                          case 4:
                            return const Text('Apr', style: style);
                          case 5:
                            return const Text('May', style: style);
                          case 6:
                            return const Text('Jun', style: style);
                        }
                        return const Text('');
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 36,
                      getTitlesWidget: (value, meta) {
                        return Text(
                          '${(value / 1000).toInt()}k',
                          style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                        );
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                minX: 1,
                maxX: 6,
                minY: 0,
                maxY: 50000,
                lineBarsData: [
                  LineChartBarData(
                    spots: const [
                      FlSpot(1, 15000),
                      FlSpot(2, 28000),
                      FlSpot(3, 22000),
                      FlSpot(4, 38000),
                      FlSpot(5, 34000),
                      FlSpot(6, 48000),
                    ],
                    isCurved: true,
                    color: AppColors.primary,
                    barWidth: 4,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      color: AppColors.primary.withValues(alpha: 0.05),
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

  Widget _buildAIInsights(BuildContext context, DashboardMetrics metrics, bool isDark) {
    final insights = <_Insight>[
      if (metrics.activeConversations > 0)
        _Insight(
          '${metrics.activeConversations} active conversations need attention',
          'Engage with open chats to keep response times low and conversion high.',
          Icons.chat_bubble_outline_rounded,
          AppColors.primary,
        ),
      if (metrics.openDealsValue > 0)
        _Insight(
          'Pipeline value: ${Formatters.formatCompactCurrency(metrics.openDealsValue)} across ${metrics.openDealsCount} deals',
          'Move deals forward with timely follow-ups and personalized outreach.',
          Icons.trending_up_rounded,
          AppColors.success,
        ),
      if (metrics.newContactsToday > 0)
        _Insight(
          '${metrics.newContactsToday} new contacts today',
          'Reach out promptly to turn new leads into warm conversations.',
          Icons.person_add_outlined,
          AppColors.warning,
        ),
      if (metrics.messagesSentToday > 0)
        _Insight(
          '${metrics.messagesSentToday} messages sent today',
          messagesInsightSubtitle(metrics.messagesSentToday),
          Icons.send_rounded,
          AppColors.info,
        ),
    ];

    if (insights.isEmpty) {
      insights.add(_Insight(
        'No data yet',
        'Start using your CRM to see smart insights here.',
        Icons.psychology_rounded,
        AppColors.textMuted,
      ));
    }

    return GlassContainer(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      opacity: isDark ? 0.35 : 0.65,
      borderOpacity: isDark ? 0.2 : 0.15,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.psychology_rounded, color: AppColors.info, size: 20),
              const SizedBox(width: 8),
              Text(
                'AI Smart Insights',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...List.generate(insights.length, (i) {
            return Column(
              children: [
                if (i > 0) const Divider(height: 24),
                _insightItem(context, insights[i].title, insights[i].body, insights[i].icon, insights[i].color, isDark),
              ],
            );
          }),
        ],
      ),
    );
  }

  String messagesInsightSubtitle(int count) {
    if (count > 50) return 'High engagement today. Keep the momentum going.';
    if (count > 10) return 'Steady communication flow. Try a broadcast to boost reach.';
    return 'Team activity is low. Consider reaching out to more contacts.';
  }

  Widget _insightItem(BuildContext context, String title, String body, IconData icon, Color color, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 18),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 4),
              Text(
                body,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
                    ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildUpcomingTasks(BuildContext context, DashboardMetrics metrics, bool isDark) {
    final tasks = <_Task>[];

    if (metrics.activeConversations > 0) {
      tasks.add(_Task(
        'Follow up on ${metrics.activeConversations} open conversations',
        'Prioritize responses to maintain engagement',
        true,
      ));
    }
    if (metrics.openDealsCount > 0) {
      tasks.add(_Task(
        'Review ${metrics.openDealsCount} active deals',
        'Pipeline value: ${Formatters.formatCompactCurrency(metrics.openDealsValue)}',
        metrics.openDealsValue > 100000,
      ));
    }
    if (metrics.newContactsToday > 0) {
      tasks.add(_Task(
        'Reach out to ${metrics.newContactsToday} new contacts',
        'New leads added today — make first contact',
        false,
      ));
    }
    if (metrics.messagesSentToday == 0) {
      tasks.add(_Task(
        'Send first message of the day',
        'Start conversations to warm up the pipeline',
        true,
      ));
    }

    if (tasks.isEmpty) {
      tasks.add(_Task(
        'Explore your CRM dashboard',
        'No pending tasks right now',
        false,
      ));
    }

    return GlassContainer(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      opacity: isDark ? 0.35 : 0.65,
      borderOpacity: isDark ? 0.2 : 0.15,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.assignment_turned_in_outlined, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text(
                'Upcoming Tasks',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...List.generate(tasks.length, (i) {
            return Column(
              children: [
                if (i > 0) const Divider(height: 24),
                _taskItem(context, tasks[i].title, tasks[i].subtitle, tasks[i].isHighPriority, isDark),
              ],
            );
          }),
        ],
      ),
    );
  }

  Widget _taskItem(BuildContext context, String title, String time, bool isHighPriority, bool isDark) {
    return Row(
      children: [
        Icon(
          isHighPriority ? Icons.priority_high_rounded : Icons.radio_button_unchecked_rounded,
          color: isHighPriority ? AppColors.error : AppColors.textMuted,
          size: 18,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                  decoration: !isHighPriority ? TextDecoration.lineThrough : null,
                  color: !isHighPriority ? AppColors.textMuted : null,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                time,
                style: TextStyle(fontSize: 11, color: isDark ? AppColors.textMuted : AppColors.textMutedLight),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRecentActivity(BuildContext context, bool isDark) {
    return GlassContainer(
      padding: const EdgeInsets.all(20),
      opacity: isDark ? 0.35 : 0.65,
      borderOpacity: isDark ? 0.2 : 0.15,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('Recent Activity Logs', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              const Spacer(),
              TextButton(
                onPressed: () {},
                child: const Text('View All'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _activityItem(
            context,
            Icons.chat_rounded,
            'New message from Rajesh Kumar',
            'Just now',
            AppColors.primary,
            isDark,
          ),
          const Divider(),
          _activityItem(
            context,
            Icons.person_add_rounded,
            'Lead created: Ramesh Sharma',
            '10 min ago',
            AppColors.success,
            isDark,
          ),
          const Divider(),
          _activityItem(
            context,
            Icons.trending_up_rounded,
            'Deal "Acme Corp" moved to Won',
            '2 hours ago',
            AppColors.info,
            isDark,
          ),
        ],
      ),
    );
  }

  Widget _activityItem(BuildContext context, IconData icon, String title, String time, Color color, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 2),
                Text(
                  time,
                  style: TextStyle(
                    fontSize: 11,
                    color: isDark ? AppColors.textMuted : AppColors.textMutedLight,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  void _showNotificationsDrawer(BuildContext context) {
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Notifications',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Close'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              FutureBuilder(
                future: Future.delayed(const Duration(seconds: 0)),
                builder: (context, snapshot) {
                  return Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.check_circle_outline, color: AppColors.success),
                        title: const Text('System ready'),
                        subtitle: const Text('Your CRM is connected and operational.'),
                        trailing: const Icon(Icons.check, size: 18, color: AppColors.success),
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Insight {
  final String title;
  final String body;
  final IconData icon;
  final Color color;

  _Insight(this.title, this.body, this.icon, this.color);
}

class _Task {
  final String title;
  final String subtitle;
  final bool isHighPriority;

  _Task(this.title, this.subtitle, this.isHighPriority);
}
