import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/network/supabase_client.dart';
import '../../../../data/models/pipeline_model.dart';

/// A snapshot of all pipeline data loaded from Supabase.
class PipelinesData {
  final List<PipelineModel> pipelines;
  final List<PipelineStageModel> stages;
  final List<DealModel> deals;

  const PipelinesData({
    this.pipelines = const [],
    this.stages = const [],
    this.deals = const [],
  });

  List<PipelineStageModel> stagesForPipeline(String pipelineId) =>
      stages.where((s) => s.pipelineId == pipelineId).toList()
        ..sort((a, b) => a.position.compareTo(b.position));

  List<DealModel> dealsForStage(String stageId) =>
      deals.where((d) => d.stageId == stageId).toList();
}

/// A Riverpod [StateNotifier] that manages loading, error, and data state for pipelines.
class PipelinesNotifier extends StateNotifier<AsyncValue<PipelinesData>> {
  final SupabaseClient _client;

  PipelinesNotifier(this._client) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    try {
      state = const AsyncValue.loading();
      // Fetch pipelines, stages and deals in parallel (matching web app pattern)
      final results = await Future.wait([
        _client.from('pipelines').select('*').order('created_at'),
        _client.from('pipeline_stages').select('*').order('position'),
        _client.from('deals').select('*').order('created_at', ascending: false),
      ]);

      final pipelinesList = (results[0] as List)
          .map((e) => PipelineModel.fromJson(e as Map<String, dynamic>))
          .toList();

      final stagesList = (results[1] as List)
          .map((e) => PipelineStageModel.fromJson(e as Map<String, dynamic>))
          .toList();

      final dealsList = (results[2] as List)
          .map((e) => DealModel.fromJson(e as Map<String, dynamic>))
          .toList();

      state = AsyncValue.data(PipelinesData(
        pipelines: pipelinesList,
        stages: stagesList,
        deals: dealsList,
      ));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async => _load();

  Future<bool> updateDealStage(String dealId, String stageId) async {
    final currentData = state.value;
    if (currentData == null) return false;

    // Optimistically update state
    final updatedDeals = currentData.deals.map((d) {
      if (d.id == dealId) {
        return d.copyWith(stageId: stageId);
      }
      return d;
    }).toList();

    state = AsyncValue.data(PipelinesData(
      pipelines: currentData.pipelines,
      stages: currentData.stages,
      deals: updatedDeals,
    ));

    try {
      await _client
          .from('deals')
          .update({'stage_id': stageId})
          .eq('id', dealId);
      return true;
    } catch (e) {
      // Revert state on error
      state = AsyncValue.data(currentData);
      return false;
    }
  }
}

/// Provider managing the selected pipeline ID.
final selectedPipelineIdProvider = StateProvider<String?>((ref) => null);

/// Provider that holds the full pipeline data state.
final pipelinesProvider =
    StateNotifierProvider<PipelinesNotifier, AsyncValue<PipelinesData>>((ref) {
  final client = SupabaseManager.instance.client;
  return PipelinesNotifier(client);
});
