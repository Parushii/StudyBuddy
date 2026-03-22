const QuizResult = require("../models/QuizResult");
const StudentProgress = require("../models/StudentProgress");

const calculateStreak = async (userId) => {
  try {
    const progressData = await StudentProgress.find({ userId });
    const quizResults = await QuizResult.find({ userId });

    const activityDates = new Set();

    const normalize = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };

    // From study time
    progressData.forEach((p) => {
      if (p.timeSpent > 0) {
        activityDates.add(normalize(p.updatedAt));
      }
    });

    // From quizzes
    quizResults.forEach((q) => {
      activityDates.add(normalize(q.createdAt));
    });

    const dates = Array.from(activityDates).sort((a, b) => b - a);

    if (dates.length === 0) return 0;

    let streak = 0;
    let current = new Date();
    current.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const diff = Math.round(
        (current - d) / (1000 * 60 * 60 * 24)
      );

      if (diff === 0 || diff === 1) {
        streak++;
        current = new Date(d);
        current.setHours(0, 0, 0, 0);
      } else if (diff > 1) {
        break;
      }
    }

    return streak;
  } catch (err) {
    console.error("Error calculating streak:", err);
    return 0;
  }
};

module.exports = calculateStreak;