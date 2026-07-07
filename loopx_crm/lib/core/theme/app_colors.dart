import 'package:flutter/material.dart';

class AppColors {
  // Brand — Slate/Sky/Indigo SaaS Palette
  static const Color primary = Color(0xFF0284C7);
  static const Color primaryDark = Color(0xFF0369A1);
  static const Color primaryLight = Color(0xFF38BDF8);
  static const Color primarySoft = Color(0x1A0284C7);

  // Neutrals (Dark Mode)
  static const Color background = Color(0xFF030712); // Slate/Gray 950
  static const Color surface = Color(0xFF0B0F19);    // Glassy Dark surface
  static const Color surface2 = Color(0xFF1E293B);   // Slate 800
  static const Color border = Color(0xFF1E293B);

  // Text (Dark Mode)
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // Accents & Semantics
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF6366F1); // Indigo

  // Light Mode Overrides
  static const Color backgroundLight = Color(0xFFF8FAFC); // Slate 50
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surface2Light = Color(0xFFF1F5F9);   // Slate 100
  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color textPrimaryLight = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF475569);
  static const Color textMutedLight = Color(0xFF94A3B8);

  // Gradients (Solid-filled linear gradients for API compatibility without gradient visual effect)
  static const Gradient primaryGradient = LinearGradient(
    colors: [Color(0xFF0284C7), Color(0xFF0284C7)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const Gradient accentGradient = LinearGradient(
    colors: [Color(0xFF38BDF8), Color(0xFF38BDF8)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

