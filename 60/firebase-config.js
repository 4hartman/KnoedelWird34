/*
 * Firebase setup for the live-voting feature.
 *
 * The values below are PUBLIC by design — Firebase web keys end up in the
 * browser and are not secrets. Security comes from the Realtime Database
 * rules in the Firebase console, not from secrecy.
 *
 * ─── ONE-TIME SETUP (≈ 5 minutes) ───────────────────────────────────────────
 *
 *   1. Go to  https://console.firebase.google.com  and sign in with a Google
 *      account.
 *   2. Click "Add project". Name it anything (e.g. "KnoedelWird34-Live").
 *      Skip Google Analytics.
 *   3. In the left nav choose:  Build → Realtime Database → Create Database
 *      Region: europe-west1 (or whichever is closest).
 *      Start in "test mode" — that's fine for a one-night event.
 *   4. Top-left gear icon → Project settings → "Your apps" → click the web
 *      icon  </>  → register an app. A snippet appears with a `firebaseConfig`
 *      object. Copy ALL its values into the object below.
 *   5. Save this file and reload the quiz. Done.
 *
 * If you skip this setup or leave placeholders in, the quiz still works for
 * the player — viewer voting just stays disabled and the vote bar stays
 * hidden. So you can ship the page before configuring Firebase.
 *
 * ─── AFTER THE PARTY (optional) ─────────────────────────────────────────────
 *
 *   To lock the database down (recommended once you no longer need votes),
 *   replace the "test mode" rules in the Firebase console with:
 *
 *     {
 *       "rules": {
 *         "sessions": {
 *           ".read": false,
 *           ".write": false
 *         }
 *       }
 *     }
 *
 *   This stops any further reads/writes while leaving existing data intact.
 */

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyD50fPToc15MF3ivKGoaSkfSUMq5EyVrro",
  authDomain: "brave-reason-367609.firebaseapp.com",
  databaseURL: "https://brave-reason-367609-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "brave-reason-367609",
  storageBucket: "brave-reason-367609.firebasestorage.app",
  messagingSenderId: "1018562617771",
  appId: "1:1018562617771:web:cf19da192f567734c172ee",
  measurementId: "G-VYJWEC1T8Z"
};
