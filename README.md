# tailwind-quiz

An interactive quiz app for testing and reinforcing knowledge of Tailwind CSS utility classes. Developers drill on Tailwind concepts — class names, responsive prefixes, and design patterns — with immediate feedback.

**Current progress:** Functional quiz flow is built: flip cards with CSS-to-Tailwind prompts, hints, scoring, auto-advance, a wrong-answer review mode, links to the relevant Tailwind docs page per question, and progress (wrong answers, seen questions, current position) persisted across sessions in the browser's `localStorage`. Progress is per browser — there's no account or cross-device sync.

**Final objective:** A polished, shareable quiz tool covering the Tailwind CSS utility class system, useful for onboarding new developers or sharpening one's own knowledge.

## Screenshots

![Quiz](screenshots/quiz.png)
![Wrong answer review](screenshots/quiz-wrong-answer.png)

## Tech Stack

- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS 3
