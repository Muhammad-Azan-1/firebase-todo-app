// ========================================
// PERSISTENT COUNTDOWN TIMER - DEMO
// ========================================
// This demonstrates how the timer persists
// across page refreshes using localStorage
// ========================================

const { setTimeout } = require("node:timers/promises");

const COOLDOWN_KEY = "emailVerifyCooldownEnd";

// ========================================
// STEP 1: START COOLDOWN (When user clicks "Resend")
// ========================================
function startCooldown(seconds) {
    // Calculate the END TIME (not the remaining seconds!)
    // Example: If now is 10:00:00 and cooldown is 30 seconds
    // endTime = 10:00:30 (stored as milliseconds timestamp)

    const endTime = Date.now() + (seconds * 1000);

    console.log("📧 Email sent! Starting cooldown...");
    console.log("⏰ Current time:", new Date().toLocaleTimeString());
    console.log("🏁 End time:", new Date(endTime).toLocaleTimeString());
    console.log("💾 Saving to localStorage:", endTime);

    localStorage.setItem(COOLDOWN_KEY, String(endTime));

    // Start the visual countdown
    tick();
}

// ========================================
// STEP 2: CALCULATE REMAINING TIME
// ========================================
function getRemainingSeconds() {
    const endTimeStr = localStorage.getItem(COOLDOWN_KEY);

    if (!endTimeStr) {
        console.log("❌ No cooldown saved in localStorage");
        return 0;
    }

    const endTime = Number(endTimeStr);
    const now = Date.now();
    const remainingMs = endTime - now;
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    console.log("---");
    console.log("📖 Reading from localStorage...");
    console.log("🏁 Saved end time:", new Date(endTime).toLocaleTimeString());
    console.log("⏰ Current time:", new Date(now).toLocaleTimeString());
    console.log("⏳ Remaining:", remainingSeconds, "seconds");

    return Math.max(0, remainingSeconds);
}

// ========================================
// STEP 3: COUNTDOWN TICK (Every second)
// ========================================
function tick() {
    const remaining = getRemainingSeconds();

    if (remaining > 0) {
        console.log(`\n🔄 Button shows: "Resend in ${remaining}s"`);

        // Schedule next tick in 1 second
        setTimeout(tick, 1000);
    } else {
        console.log("\n✅ Cooldown finished! Button shows: 'Resend Verification Email'");
        localStorage.removeItem(COOLDOWN_KEY);
        console.log("🗑️ Removed cooldown from localStorage");
    }
}

// ========================================
// STEP 4: ON PAGE LOAD - Check for existing cooldown
// ========================================
function onPageLoad() {
    console.log("\n🌐 PAGE LOADED!");
    console.log("Checking localStorage for existing cooldown...\n");

    const remaining = getRemainingSeconds();

    if (remaining > 0) {
        console.log(`\n⚡ Found existing cooldown! Resuming from ${remaining}s`);
        tick();
    } else {
        console.log("\n🆗 No active cooldown. Ready to send email.");
    }
}

// ========================================
// RUN THE DEMO
// ========================================

console.log("========================================");
console.log("PERSISTENT COUNTDOWN TIMER DEMO");
console.log("========================================\n");

// Simulate: User clicks "Resend Email" button
// startCooldown(30);

// Simulate: Page loads (refresh or navigate back)
onPageLoad();

// ========================================
// TO TEST IN BROWSER CONSOLE:
// ========================================
// 1. Open browser console
// 2. Run: startCooldown(30)
// 3. Watch countdown
// 4. Refresh page (countdown continues from where it was!)
// 5. Or run: localStorage.clear() to reset
// ========================================

// user clicks "Resend" at 10:00:00
// ├── endTime = 10:00:30 (saved to localStorage)
// ├── Button shows: "Resend in 30s"
// │
// ├── 10:00:10 → "Resend in 20s"
// ├── 10:00:15 → User navigates away to /profile
// │              └── setTimeout stops (clearTimeout runs)
// │              └── localStorage still has: 10:00:30 ✅
// │
// ├── 10:00:25 → User comes back to /verifyEmail
// │              └── Page loads, reads localStorage
// │              └── Calculates: 10:00:30 - 10:00:25 = 5 seconds
// │              └── Button shows: "Resend in 5s" ✅
// │
// └── 10:00:30 → Cooldown finished, localStorage cleared


setTimeout(()=>{
    console.log('rnjunjfr3')
},2000)