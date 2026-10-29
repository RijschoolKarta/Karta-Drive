# Karta Drive
De planner voor rijinstructeurs: rijlessen, uren en inkomsten op één plek. Iedereen logt in met een eigen account en ziet alleen zijn eigen lessen, op al zijn apparaten.

## Koppelen aan Firebase (eenmalig)
1. Maak een project op https://console.firebase.google.com
2. Build → Authentication → Get started → zet **E-mail/wachtwoord** aan.
3. Build → Firestore Database → Create database (locatie `eur3`, production mode).
4. Firestore → Rules: plak de inhoud van `firestore.rules` en klik Publish.
5. Authentication → Settings → Authorized domains: voeg `rijschoolkarta.github.io` toe.
6. Project settings → Your apps → Web app (`</>`) → kopieer de `firebaseConfig` naar `firebase-config.js`.

Zolang `firebase-config.js` leeg is, bewaart de app de lessen alleen op het toestel (zonder inloggen).
