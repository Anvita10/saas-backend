exports.PHRASES = {
  completion: {
    high: [
      "🟢 Excellent productivity — tasks are flowing smoothly.",
      "🚀 Strong execution — work is being completed efficiently.",
    ],
    medium: [
      "🟡 Decent progress — but execution can be improved.",
      "⚖️ Balanced performance — some room for improvement.",
    ],
    low: [
      "🔴 Low completion rate — tasks are getting stuck.",
      "⚠️ Execution lag detected — work is not closing efficiently.",
    ],
  },

  workload: {
    overloaded: [
      "⚠️ Too many active tasks — possible workload bottleneck.",
      "📊 Tasks are piling up — execution pressure is high.",
    ],
    balanced: ["✅ Healthy workflow — tasks are being completed steadily."],
  },

  overdue: {
    critical: [
      "🚨 Critical: Many tasks are overdue — immediate action required.",
      "🔥 Deadlines slipping — urgent attention needed.",
    ],
    mild: [
      "⚠️ Some tasks are overdue — consider reprioritizing.",
      "⏳ Deadlines approaching — focus needed.",
    ],
    none: ["🟢 No overdue tasks — timelines are well managed."],
  },

  dropped: {
    high: ["⚠️ High number of dropped tasks — planning may need improvement."],
    low: ["ℹ️ Some tasks were dropped — review task relevance."],
  },

  suggestions: [
    "💡 Suggestion: Focus on clearing overdue tasks first.",
    "💡 Suggestion: Break tasks into smaller actionable units.",
    "💡 Suggestion: Improve planning to reduce unnecessary work.",
  ],
};

exports.TREND_PHRASES = {
  completion: {
    up: [
      "🚀 Completion rate improved compared to last week.",
      "📈 Team is closing more tasks than before.",
    ],
    down: [
      "📉 Completion rate dropped compared to last week.",
      "⚠️ Fewer tasks are being completed this week.",
    ],
    stable: ["⚖️ Completion rate is stable compared to last week."],
  },

  workload: {
    up: [
      "⚠️ Workload has increased this week.",
      "📊 More tasks are active compared to last week.",
    ],
    down: [
      "✅ Workload has reduced compared to last week.",
      "📉 Fewer active tasks this week.",
    ],
  },

  overdue: {
    up: ["🚨 Overdue tasks increased — deadlines slipping."],
    down: ["🟢 Overdue tasks reduced — better deadline control."],
    stable: ["⚖️ Overdue tasks are stable."],
  },

  momentum: {
    positive: ["🔥 Team momentum is improving week over week."],
    negative: ["🧊 Momentum slowdown detected this week."],
  },
};

