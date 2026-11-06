export const tutorialSteps = [
  { emoji: "🔍", title: "Welcome to the hunt", text: "Find 3 hidden posters, solve a riddle at each one, and race to the finish. Your phone is your guide.", tip: "No app to download. It all runs in your browser." },
  { emoji: "👥", title: "Your team", text: "Your team name and 4-digit PIN are your login. Remember your PIN: you can use it to log back in on any phone.", tip: "Playing on one phone is easiest. Teammates can join on their phones with the same name and PIN." },
  { emoji: "🧩", title: "Unlock the hunt", text: "Solve the start riddle to begin. Then you'll get your first clue, pointing to the location of a hidden poster.", tip: "Every team gets the stops in a different order, so following other teams won't help!" },
  { emoji: "📷", title: "Find it and scan it", text: "Follow your clue to the poster. Tap 'Scan poster' in the app and point your camera at the QR code.", tip: "Use the Scan button inside the app, so you stay logged in." },
  { emoji: "💡", title: "Crack the riddle", text: "Each poster has a riddle. Type your answer. Unlimited tries, and small typos are forgiven. Get it right and you'll get your next clue.", tip: "Scanned the wrong poster? No penalty. The app will just show your current clue." },
  { emoji: "🏆", title: "Be quick, be sharp", text: "Crack all 3 stops to finish. The FIRST 3 TEAMS TO FINISH win a prize, so think fast and move faster!", tip: "Your progress is saved, so you can take a break and come back. Just remember the clock doesn't stop for the other teams." },
  { emoji: "🎉", title: "Claim your prize", text: "When you finish, you'll get a QR code. Bring your WHOLE team to a staff member and show them the screen to claim your prize.", tip: "Each team can win only once." },
] as const

export const faqItems = [
  ["Do we need to download anything?", "No. The hunt runs in your phone's web browser."],
  ["How many people can be on a team?", "Teams of about 3 work best. Everyone can log in with the same team name and PIN, but one phone for scanning is easiest."],
  ["We forgot our PIN. What now?", "Find a staff member. They can reset it for you, and your progress stays saved."],
  ["The scanner isn't working.", "Make sure you allowed camera access, there's good light, and you're holding the phone steady about 20–30 cm from the code. You can also scan with your phone's normal camera app and log in with your team name and PIN."],
  ["We scanned a poster and it says it's not our next stop.", "Every team gets the stops in a different order. Check your clue on the dashboard and keep hunting. There's no penalty."],
  ["What if we get the answer wrong?", "Try again. There's no limit on tries, and small spelling mistakes are accepted."],
  ["We're stuck on a clue.", "Read it again slowly. Every word is a hint."],
  ["We closed the browser. Did we lose our progress?", "No. Open the hunt again and log in with your team name and PIN."],
  ["How do we win?", "The first 3 teams to crack all 3 stops win a prize."],
  ["How do we claim our prize?", "Show your finish screen's QR code to a staff member, with your whole team present."],
  ["Can we still play if the prizes are gone?", "Yes! You can still finish the hunt and celebrate with your team."],
  ["What information do you collect?", "Only your team name, your PIN (stored scrambled, never readable), and the times you solve each stop. No personal information."],
] as const
