import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../data/datasources/supabase_datasource.dart';
import '../../data/dashboard_repository_impl.dart';

final dashboardRepositoryProvider = Provider<DashboardRepositoryImpl>((ref) {
  return DashboardRepositoryImpl(SupabaseDataSource());
});

class DashboardState {
  final DashboardMetrics? metrics;
  final bool isLoading;
  final String? errorMessage;

  const DashboardState({
    this.metrics,
    this.isLoading = false,
    this.errorMessage,
  });

  DashboardState copyWith({
    DashboardMetrics? metrics,
    bool? isLoading,
    String? errorMessage,
  }) {
    return DashboardState(
      metrics: metrics ?? this.metrics,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

class DashboardNotifier extends StateNotifier<DashboardState> {
  final DashboardRepositoryImpl _repository;

  DashboardNotifier(this._repository) : super(const DashboardState());

  Future<void> loadMetrics() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final metrics = await _repository.getMetrics();
      state = state.copyWith(metrics: metrics, isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Failed to load dashboard data.',
      );
    }
  }
}

final dashboardProvider =
    StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
  final notifier = DashboardNotifier(ref.read(dashboardRepositoryProvider));
  notifier.loadMetrics();
  return notifier;
});
