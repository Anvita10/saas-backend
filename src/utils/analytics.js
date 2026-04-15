const { PHRASES } = require("../data/data");

const STATUS_Category = {
  DONE: ["Completed"],
  ACTIVE: ["Pending", "In-Progress", "Todo"],
  DROPPED: ["Rejected"],
};

exports.deriveStats = (task) => {
  const currentDate = new Date();
  const totalTasks = task.length;

  const completedTasks = task.filter((val) =>
    STATUS_Category.DONE.includes(val.status),
  ).length;
  const activeTasks = task.filter((val) =>
    STATUS_Category.ACTIVE.includes(val.status),
  ).length;
  const rejectedTasks = totalTasks - (completedTasks + activeTasks);

  const completionRate =
    totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  const overdueTasks = task.filter(
    (val) =>
      STATUS_Category.ACTIVE.includes(val.status) &&
      new Date(val.dueDate) <= currentDate,
  ).length;
  return {
    totalTasks,
    completedTasks,
    activeTasks,
    rejectedTasks,
    completionRate,
    overdueTasks,
  };
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

exports.generateInsights = (analytics) => {
  const {
    totalTasks,
    completedTasks,
    activeTasks,
    rejectedTasks,
    completionRate,
    overdueTasks,
  } = analytics;

  // ✅ Edge Case
  if (totalTasks === 0) {
    return ["ℹ️ No tasks available for this period."];
  }

  const insights = [];

  // 🔴 Completion Performance
  if (completionRate >= 80) {
    insights.push({
      text: pickRandom(PHRASES.completion.high),
      priority: 1,
    });
  } else if (completionRate >= 50) {
    insights.push({
      text: pickRandom(PHRASES.completion.medium),
      priority: 2,
    });
  } else {
    insights.push({
      text: pickRandom(PHRASES.completion.low),
      priority: 3,
    });
  }

  // ⚖️ Workload Balance
  if (activeTasks > completedTasks) {
    insights.push({
      text: pickRandom(PHRASES.workload.overloaded),
      priority: 2,
    });
  } else {
    insights.push({
      text: pickRandom(PHRASES.workload.balanced),
      priority: 1,
    });
  }

  // 🚨 Overdue Analysis
  if (overdueTasks > 0) {
    if (overdueTasks > totalTasks * 0.3) {
      insights.push({
        text: `${pickRandom(PHRASES.overdue.critical)} (${overdueTasks} tasks affected)`,
        priority: 3,
      });
    } else {
      insights.push({
        text: `${pickRandom(PHRASES.overdue.mild)} (${overdueTasks} tasks affected)`,
        priority: 2,
      });
    }
  } else {
    insights.push({
      text: pickRandom(PHRASES.overdue.none),
      priority: 1,
    });
  }

  // 📉 Dropped Tasks
  if (rejectedTasks > 0) {
    if (rejectedTasks > totalTasks * 0.25) {
      insights.push({
        text: pickRandom(PHRASES.dropped.high),
        priority: 2,
      });
    } else {
      insights.push({
        text: pickRandom(PHRASES.dropped.low),
        priority: 1,
      });
    }
  }

  // 🧠 Suggestion Layer (always useful)
  if (completionRate < 60 || overdueTasks > 0) {
    insights.push({
      text: pickRandom(PHRASES.suggestions),
      priority: 2,
    });
  }

  // 🎯 FINAL: sort + pick top 3
  const finalInsights = insights
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)
    .map((i) => i.text);

  return finalInsights;
};
