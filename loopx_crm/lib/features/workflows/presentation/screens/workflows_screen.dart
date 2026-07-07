import 'package:flutter/material.dart';
import '../../../../core/widgets/app_scaffold.dart';
import '../../../../core/theme/app_colors.dart';
import 'package:loopx_crm/features/campaigns/presentation/screens/campaigns_screen.dart';
import 'package:loopx_crm/features/automations/presentation/screens/automations_screen.dart';
import 'package:loopx_crm/features/flows/presentation/screens/flows_screen.dart';

class WorkflowsScreen extends StatefulWidget {
  const WorkflowsScreen({super.key});

  @override
  State<WorkflowsScreen> createState() => _WorkflowsScreenState();
}

class _WorkflowsScreenState extends State<WorkflowsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        setState(() {}); // Rebuild to update AppBar actions
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<Widget>? _buildActions() {
    if (_tabController.index == 0) {
      return [
        IconButton(
          icon: const Icon(Icons.add_alert_rounded),
          tooltip: 'New Broadcast',
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Open the web app to create broadcasts. Existing broadcasts appear here.'),
                duration: Duration(seconds: 3),
              ),
            );
          },
        ),
      ];
    }
    return null; // The other tabs (Automations & Flows) have built-in "Create/New" buttons inside their bodies
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return AppScaffold(
      title: 'Workflows & Outreach',
      actions: _buildActions(),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: isDark ? AppColors.surface : AppColors.surfaceLight,
              border: Border(
                bottom: BorderSide(
                  color: isDark ? AppColors.border : AppColors.borderLight,
                ),
              ),
            ),
            child: TabBar(
              controller: _tabController,
              indicatorColor: AppColors.primary,
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: AppColors.primary,
              unselectedLabelColor: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
              labelStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold),
              tabs: const [
                Tab(
                  icon: Icon(Icons.campaign_outlined, size: 20),
                  text: 'Broadcasts',
                ),
                Tab(
                  icon: Icon(Icons.bolt_outlined, size: 20),
                  text: 'Automations',
                ),
                Tab(
                  icon: Icon(Icons.alt_route_rounded, size: 20),
                  text: 'Chat Flows',
                ),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                CampaignsScreen(),
                AutomationsScreen(),
                FlowsScreen(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
