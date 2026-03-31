exports.getAiSuggestion = async (req, res) => {
  const { category } = req.body;
  const suggestionsMap = {
    Tech: [
      "Build a React mini project",
      "Learn useEffect deeply",
      "Revise JavaScript closures",
    ],
    Fitness: [
      "Do 20 pushups",
      "Go for a 30 min walk",
      "Stretch for 15 minutes",
    ],
    Learning: ["Read 10 pages of a book", "Watch a coding tutorial"],
    Productivity: [
      "Plan your day",
      "Clean your workspace",
      "Write tomorrow's goals",
    ],
    Personal: ["Call a friend", "Journal your thoughts"],
    Fun: ["Watch a movie", "Listen to music"],
    Career: [
      "Update resume",
      "Apply to 5 jobs",
      "Practice interview questions",
    ],
  };

  const list = suggestionsMap[category] || ["Do something meaningful"];

  const random = list[Math.floor(Math.random() * list.length)];
  res.json({ suggestion: random });
};
