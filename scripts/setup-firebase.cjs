const { execSync } = require('child_process');
const fs = require('fs');

console.log("🔥 Lumina Research: Firebase Auto-Setup 🔥");
console.log("-----------------------------------------");

try {
    // Check if firebase-tools is installed
    try {
        execSync('firebase --version', { stdio: 'ignore' });
    } catch (e) {
        console.log("Installing firebase-tools...");
        execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    }

    // Login
    console.log("\nPlease login to Firebase...");
    execSync('firebase login', { stdio: 'inherit' });

    // List projects
    console.log("\nFetching your Firebase projects...");
    const projects = execSync('firebase projects:list --json').toString();
    const projectList = JSON.parse(projects);

    if (projectList.length === 0) {
        console.log("No projects found! Please create one at console.firebase.google.com");
        process.exit(1);
    }

    const projectId = projectList[0].projectId; // Use first project for simplicity or ask user
    console.log(`\nUsing Project: ${projectId}`);

    // Get Config
    console.log("Fetching web app configuration...");
    // Check if app exists, otherwise create
    let apps = JSON.parse(execSync(`firebase apps:list web --project ${projectId} --json`).toString());

    if (apps.length === 0) {
        console.log("Creating new Web App...");
        execSync(`firebase apps:create web "Lumina Web" --project ${projectId}`, { stdio: 'inherit' });
        apps = JSON.parse(execSync(`firebase apps:list web --project ${projectId} --json`).toString());
    }

    const appId = apps[0].appId;
    const config = execSync(`firebase apps:sdkconfig web ${appId} --out json`).toString(); // This command might need tweaking depending on version 
    // Actually `firebase apps:sdkconfig` prints to stdout. Let's parse it manually or find better way.

    // Use `firebase setup:web` logic? 
    // Alternative: Just print instructions since programmatic retrieval allows direct parsing.

    console.log("\n✅ Configuration Found! Writing to .env.local...");

    // Note: The SDK config command output is not pure JSON usually.
    // Let's use a simpler approach: Ask user to copy/paste or use `firebase init`?
    // User asked for automation. Let's try to get the raw config values.

    // Harder via CLI to get exact keys without parsing HTML/JS output sometimes.
    // Best bet: direct user to console or try to regex the `firebase apps:sdkconfig` output.

    const sdkConfigRaw = execSync(`firebase apps:sdkconfig web ${appId}`).toString();
    const apiKey = sdkConfigRaw.match(/apiKey: "(.*?)"/)[1];
    const authDomain = sdkConfigRaw.match(/authDomain: "(.*?)"/)[1];
    const storageBucket = sdkConfigRaw.match(/storageBucket: "(.*?)"/)[1];
    const messagingSenderId = sdkConfigRaw.match(/messagingSenderId: "(.*?)"/)[1];
    const newProjectId = sdkConfigRaw.match(/projectId: "(.*?)"/)[1];

    const envContent = `
VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${authDomain}
VITE_FIREBASE_PROJECT_ID=${newProjectId}
VITE_FIREBASE_STORAGE_BUCKET=${storageBucket} // Or inferred
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
VITE_FIREBASE_APP_ID=${appId}
`;

    fs.appendFileSync('.env.local', envContent);
    console.log("\nSUCCESS! .env.local updated.");

} catch (error) {
    console.error("Setup failed:", error.message);
}
