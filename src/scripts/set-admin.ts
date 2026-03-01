import * as admin from 'firebase-admin';

// Inicjalizacja Firebase z domyślnymi uprawnieniami serwera GCP
admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'festive-dolphin-483819-i1', // fallback to your actual project ID
});

const args = process.argv.slice(2);
const userEmail = args[0];

if (!userEmail) {
    console.error("❌ BŁĄD: Musisz podać adres e-mail jako parametr wywołania!");
    console.log("👉 Użycie: npx ts-node src/scripts/set-admin.ts <twoj-email@gmail.com>");
    process.exit(1);
}

const grantAdminRole = async (email: string) => {
    try {
        const user = await admin.auth().getUserByEmail(email);

        // Ustawiamy uprawnienia Custom Claims w Firebase: admin=true oraz role='admin'
        await admin.auth().setCustomUserClaims(user.uid, {
            admin: true,
            role: 'admin'
        });

        console.log(`✅ SUKCES! Użytkownik ${email} otrzymał dożywotnią rolę Administratora bazy wiedzy.`);
        console.log(`⚠️ Pamiętaj, aby przelogować się na frontendzie o ile już byłeś zalogowany.`);
        process.exit(0);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.error(`❌ Użytkownik ${email} nie został znaleziony w bazie Firebase! Najpierw stwórz konto przez Firebase Console lub na żywo w aplikacji React.`);
        } else {
            console.error("❌ Błąd podczas nadawania uprawnień:", error);
        }
        process.exit(1);
    }
};

grantAdminRole(userEmail);
