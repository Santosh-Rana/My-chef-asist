let currentEditingMessage = null; // To track which message is being edited

// Import Firebase Modules from CDN

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    updateProfile // <--- YEH WORD HONA SABSE ZAROORI HAI
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";


// --- CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyBJA41pJntF1m0cAkJ3lRHQ5Qm-mYNEUyc",
    authDomain: "ai-cook-7907d.firebaseapp.com",
    projectId: "ai-cook-7907d",
    storageBucket: "ai-cook-7907d.firebasestorage.app",
    messagingSenderId: "848684033447",
    appId: "1:848684033447:web:c7957edc8708537bfec282"
};

// --- CONFIGURATION ---
// Firebase config waisa hi rahega...

// UPDATE 1: Yahan nayi API Key (Split karke) aur Naya Model Daalein
const API_PART_1 = "sk-or-v1-da096da10d9ee9c9ace91f9d7";
const API_PART_2 = "9769e2f7bb954c3b1d194364fd72c4b7f7426b5";
const AI_MODEL = "google/gemini-2.0-flash-001"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

let conversationHistory = [];
let timers = [];
let isLoginMode = true;
let currentLanguage = localStorage.getItem('appLanguage') || 'en';
let currentSpeechUtterance = null;
let editingMessageId = null;

const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const themeToggle = document.getElementById('theme-toggle');

// --- MULTILINGUAL SUPPORT ---
const translations = {
    en: {
        welcome: "Hello, Chef! 👨‍🍳",
        whatCooking: "What are we cooking today?",
        quickActions: "Quick Actions",
        healthyBreakfast: "Healthy Breakfast",
        quickDinner: "15-min Dinner",
        paneerSpecial: "Paneer Special",
        chocolateDessert: "Chocolate Dessert",
        mealPlan: "Weekly Meal Plan", partyPlanner: "Bhoj/PartyPlanner ",
        trendingNow: "Trending Now",
        aiChef: "AI Chef",
        aiWelcome: "Namaste Chef! I'm your kitchen buddy with jokes hotter than chili peppers! 🥵 Tell me a dish name and I'll cook up the complete recipe with love! 🍲",
        all: "All",
        veg: "Veg",
        nonVeg: "Non-Veg",
        sweet: "Sweet",
        kitchenTimers: "Kitchen Timers ⏱️",
        noTimers: "No active timers. Tap + to add one! ⏱️",
        login: "Login",
        signUp: "Sign Up",
        emailAddress: "Email Address",
        password: "Password",
        noAccount: "Don't have an account?",
        masterChef: "Master Chef",
        themeColors: "Theme & Colors",
        alarmSounds: "Alarm Sounds",
        language: "Language",
        helpSupport: "Help & Support",
        logout: "Logout",
        home: "Home",
        recipes: "Recipes",
        timer: "Timer",
        profile: "Profile",
        chooseTheme: "🎨 Choose Theme",
        selectColorScheme: "Select your favorite color scheme",
        defaultPurple: "Default Purple",
        warmRose: "Warm Rose",
        freshGreen: "Fresh Green",
        spicyOrange: "Spicy Orange",
                oceanTheme: "Ocean Odyssey",
        sugarTheme: "Sweet Heart Sugar",
        indiaTheme: "Indian Flag",
        midnightTheme: "Midnight Sun",

        chooseAlarm: "🔔 Choose Alarm Sound",
        selectAlarmSound: "Select your timer alarm sound",
        classicBeep: "Classic Beep",
        gentleChime: "Gentle Chime",
        kitchenBell: "Kitchen Bell",
        urgentAlert: "Urgent Alert",
        selectLanguage: "Select Language",
        choosePreferredLanguage: "Choose your preferred language",
        newTimer: "⏱️ New Timer",
        setKitchenTimer: "Set your kitchen timer",
        timerName: "Timer Name",
        timerNamePlaceholder: "e.g. Boiling Eggs",
        setTime: "Set Time",
        hour: "Hour",
        min: "Min",
        sec: "Sec",
        quickPresets: "Quick Presets",
        cancel: "Cancel",
        startTimer: "Start Timer",
        edit: "Edit",
        copy: "Copy",
        whatsapp: "WhatsApp",
        readAloud: "Read Aloud",
        needAssistance: "Need assistance? We're here to help!",
        contactUs: "Contact Us",
        phone: "Phone",
        email: "Email",
        quickLinks: "Quick Links",
        privacyPolicy: "Privacy Policy",
        faq: "FAQ",
        lastUpdated: "Last Updated:",
        informationCollection: "1. Information We Collect",
        informationCollectionText: "We collect information that you provide directly to us, including your email address for authentication, recipe preferences, and usage data to improve your experience.",
        howWeUse: "2. How We Use Your Information",
        howWeUseText: "We use the information we collect to provide, maintain, and improve our services, send you technical notices and support messages, and personalize your experience.",
        dataSecurity: "3. Data Security",
        dataSecurityText: "We implement appropriate security measures to protect your personal information. Your data is encrypted and stored securely using Firebase services.",
        dataSharing: "4. Information Sharing",
        dataSharingText: "We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our application.",
        yourRights: "5. Your Rights",
        yourRightsText: "You have the right to access, update, or delete your personal information at any time. Contact us for assistance with these requests.",
        contactPrivacy: "6. Contact Us",
        contactPrivacyText: "If you have questions about this Privacy Policy, please contact us at ranasantosh3741@gmail.com or call +91 78550 91829.",
        loginNotice: "Sign up or log in to enable themes and customization."
    },
    hi: {
        welcome: "नमस्ते, शेफ! 👨‍🍳",
        whatCooking: "आज हम क्या पका रहे हैं?",
        quickActions: "त्वरित क्रियाएँ",
        healthyBreakfast: "स्वस्थ नाश्ता",
        quickDinner: "15-मिनट डिनर",
        paneerSpecial: "पनीर स्पेशल",
        chocolateDessert: "चॉकलेट मिठाई",
        mealPlan : "साप्ताहिक भोजन योजना", partyPlanner: "भोज / पार्टी योजना",
        trendingNow: "अभी ट्रेंडिंग",
        aiChef: "AI शेफ",
        aiWelcome: "नमस्ते शेफ! मैं आपका किचन बडी हूँ, मजाक मिर्च से भी ज्यादा गर्म! 🥵 मुझे कोई भी डिश का नाम बताओ, मैं पूरी रेसिपी प्यार से सजा के दूंगा! 🍲",
        all: "सभी",
        veg: "शाकाहारी",
        nonVeg: "मांसाहारी",
        sweet: "मीठा",
        kitchenTimers: "रसोई टाइमर ⏱️",
        noTimers: "कोई सक्रिय टाइमर नहीं। जोड़ने के लिए + दबाएं! ⏱️",
        login: "लॉगिन",
        signUp: "साइन अप",
        emailAddress: "ईमेल पता",
        password: "पासवर्ड",
        noAccount: "खाता नहीं है?",
        masterChef: "मास्टर शेफ",
        themeColors: "थीम और रंग",
        alarmSounds: "अलार्म ध्वनियाँ",
        language: "भाषा",
        helpSupport: "मदद और सहायता",
        logout: "लॉगआउट",
        home: "होम",
        recipes: "व्यंजन विधि",
        timer: "टाइमर",
        profile: "प्रोफ़ाइल",
        chooseTheme: "🎨 थीम चुनें",
        selectColorScheme: "अपनी पसंदीदा रंग योजना चुनें",
        defaultPurple: "डिफ़ॉल्ट पर्पल",
        warmRose: "वार्म रोज़",
        freshGreen: "फ्रेश ग्रीन",
        spicyOrange: "स्पाइसी ऑरेंज",
                oceanTheme: "महासागर ओडिसी",
        sugarTheme: "स्वीट हार्ट शुगर",
        indiaTheme: "भारतीय ध्वज",
        midnightTheme: "मध्यरात्रि सूर्य",

        chooseAlarm: "🔔 अलार्म ध्वनि चुनें",
        selectAlarmSound: "अपनी टाइमर अलार्म ध्वनि चुनें",
        classicBeep: "क्लासिक बीप",
        gentleChime: "जेंटल चाइम",
        kitchenBell: "किचन बेल",
        urgentAlert: "अर्जेंट अलर्ट",
        selectLanguage: "भाषा चुनें",
        choosePreferredLanguage: "अपनी पसंदीदा भाषा चुनें",
        newTimer: "⏱️ नया टाइमर",
        setKitchenTimer: "अपना किचन टाइमर सेट करें",
        timerName: "टाइमर का नाम",
        timerNamePlaceholder: "उदा. अंडे उबालना",
        setTime: "समय निर्धारित करें",
        hour: "घंटा",
        min: "मिनट",
        sec: "सेकंड",
        quickPresets: "त्वरित प्रीसेट",
        cancel: "रद्द करें",
        startTimer: "टाइमर शुरू करें",
        edit: "संपादित करें",
        copy: "कॉपी",
        whatsapp: "व्हाट्सएप",
        readAloud: "ज़ोर से पढ़ें",
        needAssistance: "सहायता की आवश्यकता है? हम मदद के लिए यहाँ हैं!",
        contactUs: "हमसे संपर्क करें",
        phone: "फ़ोन",
        email: "ईमेल",
        quickLinks: "त्वरित लिंक",
        privacyPolicy: "गोपनीयता नीति",
        faq: "अक्सर पूछे जाने वाले प्रश्न",
        lastUpdated: "अंतिम अपडेट:",
        informationCollection: "1. हम कौन सी जानकारी एकत्र करते हैं",
        informationCollectionText: "हम वह जानकारी एकत्र करते हैं जो आप सीधे हमें प्रदान करते हैं, जिसमें प्रमाणीकरण के लिए आपका ईमेल पता, व्यंजन प्राथमिकताएं, और आपके अनुभव को बेहतर बनाने के लिए उपयोग डेटा शामिल है।",
        howWeUse: "2. हम आपकी जानकारी का उपयोग कैसे करते हैं",
        howWeUseText: "हम एकत्रित जानकारी का उपयोग अपनी सेवाओं को प्रदान करने, बनाए रखने और सुधारने, आपको तकनीकी नोटिस और सहायता संदेश भेजने, और आपके अनुभव को व्यक्तिगत बनाने के लिए करते हैं।",
        dataSecurity: "3. डेटा सुरक्षा",
        dataSecurityText: "हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उपयुक्त सुरक्षा उपाय लागू करते हैं। आपका डेटा एन्क्रिप्ट किया गया है और Firebase सेवाओं का उपयोग करके सुरक्षित रूप से संग्रहीत किया गया है।",
        dataSharing: "4. जानकारी साझा करना",
        dataSharingText: "हम आपकी व्यक्तिगत जानकारी तीसरे पक्ष को नहीं बेचते, व्यापार नहीं करते, या किराए पर नहीं देते हैं। हम उन सेवा प्रदाताओं के साथ जानकारी साझा कर सकते हैं जो हमारे एप्लिकेशन को संचालित करने में हमारी सहायता करते हैं।",
        yourRights: "5. आपके अधिकार",
        yourRightsText: "आपको किसी भी समय अपनी व्यक्तिगत जानकारी तक पहुंचने, अपडेट करने या हटाने का अधिकार है। इन अनुरोधों में सहायता के लिए हमसे संपर्क करें।",
        contactPrivacy: "6. हमसे संपर्क करें",
        contactPrivacyText: "यदि इस गोपनीयता नीति के बारे में आपके कोई प्रश्न हैं, तो कृपया हमसे ranasantosh3741@gmail.com पर संपर्क करें या +91 78550 91829 पर कॉल करें।",
        loginNotice: "थीम और कस्टमाइज़ेशन सक्षम करने के लिए साइन अप या लॉगिन करें।"
    },
    hinglish: {
        welcome: "Hello, Chef! 👨‍🍳",
        whatCooking: "Aaj hum kya bana rahe hain?",
        quickActions: "Quick Actions",
        healthyBreakfast: "Healthy Breakfast",
        quickDinner: "15-min Dinner",
        paneerSpecial: "Paneer Special",
        chocolateDessert: "Chocolate Dessert",
        mealPlan: "Weekly Meal Plan", partyPlanner: "Bhoj/PartyPlanner ", 
        trendingNow: "Trending Now",
        aiChef: "AI Chef",
        aiWelcome: "Namaste Chef! Main tumhara kitchen buddy hun, jokes mirchi se bhi zyada garam! 🥵 Mujhe koi bhi dish ka naam batao, main poori recipe pyaar se serve karunga! 🍲",
        all: "Sabhi",
        veg: "Veg",
        nonVeg: "Non-Veg",
        sweet: "Sweet",
        kitchenTimers: "Kitchen Timers ⏱️",
        noTimers: "Koi active timers nahi. Add karne ke liye + dabayein! ⏱️",
        login: "Login",
        signUp: "Sign Up",
        emailAddress: "Email Address",
        password: "Password",
        noAccount: "Account nahi hai?",
        masterChef: "Master Chef",
        themeColors: "Theme aur Colors",
        alarmSounds: "Alarm Sounds",
        language: "Bhasha",
        helpSupport: "Help & Support",
        logout: "Logout",
        home: "Home",
        recipes: "Recipes",
        timer: "Timer",
        profile: "Profile",
        chooseTheme: "🎨 Theme Chuniye",
        selectColorScheme: "Apni pasandida color scheme chuniye",
        defaultPurple: "Default Purple",
        warmRose: "Warm Rose",
        freshGreen: "Fresh Green",
        spicyOrange: "Spicy Orange",
                oceanTheme: "Ocean Wala Blue",
        sugarTheme: "Sweet Heart Pink",
        indiaTheme: "Indian Tiranga",
        midnightTheme: "Midnight Dark",

        chooseAlarm: "🔔 Alarm Sound Chuniye",
        selectAlarmSound: "Apni timer alarm sound chuniye",
        classicBeep: "Classic Beep",
        gentleChime: "Gentle Chime",
        kitchenBell: "Kitchen Bell",
        urgentAlert: "Urgent Alert",
        selectLanguage: "Bhasha Chuniye",
        choosePreferredLanguage: "Apni pasandida bhasha chuniye",
        newTimer: "⏱️ Naya Timer",
        setKitchenTimer: "Apna kitchen timer set karein",
        timerName: "Timer ka Naam",
        timerNamePlaceholder: "jaise Boiling Eggs",
        setTime: "Time Set Karein",
        hour: "Ghanta",
        min: "Minute",
        sec: "Second",
        quickPresets: "Quick Presets",
        cancel: "Cancel",
        startTimer: "Timer Shuru Karein",
        edit: "Edit",
        copy: "Copy",
        whatsapp: "WhatsApp",
        readAloud: "Zor se Padhein",
        needAssistance: "Madad chahiye? Hum help ke liye yahan hain!",
        contactUs: "Humse Sampark Karein",
        phone: "Phone",
        email: "Email",
        quickLinks: "Quick Links",
        privacyPolicy: "Privacy Policy",
        faq: "FAQ",
        lastUpdated: "Last Updated:",
        informationCollection: "1. Hum Kaun Si Information Collect Karte Hain",
        informationCollectionText: "Hum woh information collect karte hain jo aap seedhe humein provide karte hain, jismein authentication ke liye aapka email address, recipe preferences, aur aapke experience ko behtar banane ke liye usage data shamil hai.",
        howWeUse: "2. Hum Aapki Information Ka Use Kaise Karte Hain",
        howWeUseText: "Hum collect ki gayi information ka use apni services provide karne, maintain karne aur improve karne, aapko technical notices aur support messages bhejne, aur aapke experience ko personalize karne ke liye karte hain.",
        dataSecurity: "3. Data Security",
        dataSecurityText: "Hum aapki personal information ki security ke liye appropriate security measures implement karte hain. Aapka data encrypted hai aur Firebase services use karke securely store kiya gaya hai.",
        dataSharing: "4. Information Sharing",
        dataSharingText: "Hum aapki personal information third parties ko nahi bechte, trade nahi karte, ya rent par nahi dete hain. Hum un service providers ke saath information share kar sakte hain jo humare application ko operate karne mein humari help karte hain.",
        yourRights: "5. Aapke Rights",
        yourRightsText: "Aapko kabhi bhi apni personal information tak pahunchne, update karne ya delete karne ka right hai. In requests mein assistance ke liye humse contact karein.",
        contactPrivacy: "6. Humse Contact Karein",
        contactPrivacyText: "Agar is Privacy Policy ke baare mein aapke koi questions hain, toh please humse ranasantosh3741@gmail.com par contact karein ya +91 78550 91829 par call karein.",
        loginNotice: "Themes aur customization enable karne ke liye sign up ya login karein."
    },
    or: {
        welcome: "ନମସ୍କାର, ରୋଷେୟା! 👨‍🍳",
        whatCooking: "ଆଜି ଆମେ କ'ଣ ରାନ୍ଧୁଛୁ?",
        quickActions: "ଶୀଘ୍ର କାର୍ଯ୍ୟ",
        healthyBreakfast: "ସୁସ୍ଥ ଜଳଖିଆ",
        quickDinner: "15-ମିନିଟ୍ ରାତ୍ରୀ ଭୋଜନ",
        paneerSpecial: "ପନୀର ସ୍ପେଶାଲ",
        chocolateDessert: "ଚକୋଲେଟ୍ ମିଠା",
       mealPlan: "ସାପ୍ତାହିକ ଖାଦ୍ୟ ଯୋଜନା",
        partyPlanner: "ଭୋଜି/ପାର୍ଟି ଯୋଜନା",
        trendingNow: "ବର୍ତ୍ତମାନ ଟ୍ରେଣ୍ଡିଂ",
        aiChef: "AI ରୋଷେୟା",
        aiWelcome: "ନମସ୍କାର ରୋଷେୟା! ମୁଁ ତୁମର ରୋଷେଇଘର ସାଙ୍ଗ, ମଜା ମରିଚ ଠାରୁ ଅଧିକ ଗରମ! 🥵 ମୋତେ କୌଣସି ଖାଦ୍ୟର ନାମ କୁହ, ମୁଁ ସମ୍ପୁର୍ଣ୍ଣ ରେସିପି ପ୍ରେମର ସହିତ ଦେବି! 🍲",
        all: "ସବୁ",
        veg: "ଶାକାହାରୀ",
        nonVeg: "ମାଂସାହାରୀ",
        sweet: "ମିଠା",
        kitchenTimers: "ରୋଷେଇଘର ଟାଇମର୍ ⏱️",
        noTimers: "କୌଣସି ସକ୍ରିୟ ଟାଇମର୍ ନାହିଁ। ଯୋଡିବା ପାଇଁ + ଦବାନ୍ତୁ! ⏱️",
        login: "ଲଗଇନ୍",
        signUp: "ସାଇନ୍ ଅପ୍",
        emailAddress: "ଇମେଲ୍ ଠିକଣା",
        password: "ପାସୱାର୍ଡ",
        noAccount: "ଖାତା ନାହିଁ?",
        masterChef: "ମାଷ୍ଟର ଶେଫ୍",
        themeColors: "ଥିମ୍ ଏବଂ ରଙ୍ଗ",
        alarmSounds: "ଆଲାର୍ମ ଧ୍ୱନି",
        language: "ଭାଷା",
        helpSupport: "ସାହାଯ୍ୟ ଏବଂ ସମର୍ଥନ",
        logout: "ଲଗଆଉଟ୍",
        home: "ହୋମ",
        recipes: "ରେସିପି",
        timer: "ଟାଇମର୍",
        profile: "ପ୍ରୋଫାଇଲ୍",
        chooseTheme: "🎨 ଥିମ୍ ବାଛନ୍ତୁ",
        selectColorScheme: "ଆପଣଙ୍କର ପସନ୍ଦର ରଙ୍ଗ ଯୋଜନା ବାଛନ୍ତୁ",
        defaultPurple: "ଡିଫଲ୍ଟ ବାଇଗଣୀ",
        warmRose: "ଉଷ୍ମ ଗୋଲାପ",
        freshGreen: "ସତେଜ ସବୁଜ",
        spicyOrange: "ମସଲାଦାର କମଳା",
                oceanTheme: "ସମୁଦ୍ର ନୀଳ",
        sugarTheme: "ମିଠା ହୃଦୟ",
        indiaTheme: "ଭାରତୀୟ ପତାକା",
        midnightTheme: "ମଧ୍ୟରାତ୍ରି ସୂର୍ଯ୍ୟ",

        chooseAlarm: "🔔 ଆଲାର୍ମ ଧ୍ୱନି ବାଛନ୍ତୁ",
        selectAlarmSound: "ଆପଣଙ୍କର ଟାଇମର୍ ଆଲାର୍ମ ଧ୍ୱନି ବାଛନ୍ତୁ",
        classicBeep: "କ୍ଲାସିକ୍ ବିପ୍",
        gentleChime: "ସୌମ୍ୟ ଚାଇମ୍",
        kitchenBell: "ରୋଷେଇଘର ବେଲ୍",
        urgentAlert: "ଜରୁରୀ ଆଲର୍ଟ",
        selectLanguage: "ଭାଷା ବାଛନ୍ତୁ",
        choosePreferredLanguage: "ଆପଣଙ୍କର ପସନ୍ଦର ଭାଷା ବାଛନ୍ତୁ",
        newTimer: "⏱️ ନୂଆ ଟାଇମର୍",
        setKitchenTimer: "ଆପଣଙ୍କର ରୋଷେଇଘର ଟାଇମର୍ ସେଟ୍ କରନ୍ତୁ",
        timerName: "ଟାଇମର୍ ନାମ",
        timerNamePlaceholder: "ଯେପରିକି ଅଣ୍ଡା ସିଝାଇବା",
        setTime: "ସମୟ ସେଟ୍ କରନ୍ତୁ",
        hour: "ଘଣ୍ଟା",
        min: "ମିନିଟ୍",
        sec: "ସେକେଣ୍ଡ",
        quickPresets: "ଶୀଘ୍ର ପ୍ରିସେଟ୍",
        cancel: "ବାତିଲ୍",
        startTimer: "ଟାଇମର୍ ଆରମ୍ଭ କରନ୍ତୁ",
        edit: "ସମ୍ପାଦନ",
        copy: "କପି",
        whatsapp: "ହ୍ୱାଟସ୍‌ଆପ୍",
        readAloud: "ଜୋରରେ ପଢନ୍ତୁ",
        needAssistance: "ସାହାଯ୍ୟ ଦରକାର? ଆମେ ସାହାଯ୍ୟ କରିବାକୁ ଏଠାରେ ଅଛୁ!",
        contactUs: "ଆମ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ",
        phone: "ଫୋନ୍",
        email: "ଇମେଲ୍",
        quickLinks: "ଶୀଘ୍ର ଲିଙ୍କ୍",
        privacyPolicy: "ଗୋପନୀୟତା ନୀତି",
        faq: "FAQ",
        lastUpdated: "ଶେଷ ଅପଡେଟ୍:",
        informationCollection: "1. ଆମେ କେଉଁ ସୂଚନା ସଂଗ୍ରହ କରୁ",
        informationCollectionText: "ଆମେ ସେହି ସୂଚନା ସଂଗ୍ରହ କରୁ ଯାହା ଆପଣ ସିଧାସଳଖ ଆମକୁ ପ୍ରଦାନ କରନ୍ତି, ଯେଉଁଥିରେ ପ୍ରାମାଣିକିକରଣ ପାଇଁ ଆପଣଙ୍କର ଇମେଲ ଠିକଣା, ରେସିପି ପସନ୍ଦ, ଏବଂ ଆପଣଙ୍କର ଅଭିଜ୍ଞତାକୁ ଉନ୍ନତ କରିବା ପାଇଁ ବ୍ୟବହାର ତଥ୍ୟ ଅନ୍ତର୍ଭୁକ୍ତ।",
        howWeUse: "2. ଆମେ ଆପଣଙ୍କର ସୂଚନା କିପରି ବ୍ୟବହାର କରୁ",
        howWeUseText: "ଆମେ ସଂଗ୍ରହ କରିଥିବା ସୂଚନାକୁ ଆମର ସେବା ପ୍ରଦାନ କରିବା, ରକ୍ଷଣାବେକ୍ଷଣ କରିବା ଏବଂ ଉନ୍ନତ କରିବା, ଆପଣଙ୍କୁ ବୈଷୟିକ ନୋଟିସ୍ ଏବଂ ସମର୍ଥନ ବାର୍ତ୍ତା ପଠାଇବା, ଏବଂ ଆପଣଙ୍କର ଅଭିଜ୍ଞତାକୁ ବ୍ୟକ୍ତିଗତ କରିବା ପାଇଁ ବ୍ୟବହାର କରୁ।",
        dataSecurity: "3. ତଥ୍ୟ ସୁରକ୍ଷା",
        dataSecurityText: "ଆମେ ଆପଣଙ୍କର ବ୍ୟକ୍ତିଗତ ସୂଚନାକୁ ସୁରକ୍ଷିତ ରଖିବା ପାଇଁ ଉପଯୁକ୍ତ ସୁରକ୍ଷା ପଦକ୍ଷେପ କାର୍ଯ୍ୟକାରୀ କରୁ। ଆପଣଙ୍କର ତଥ୍ୟ ଏନକ୍ରିପ୍ଟ କରାଯାଇଛି ଏବଂ Firebase ସେବା ବ୍ୟବହାର କରି ସୁରକ୍ଷିତ ଭାବରେ ସଂରକ୍ଷିତ ହୋଇଛି।",
        dataSharing: "4. ସୂଚନା ବାଣ୍ଟିବା",
        dataSharingText: "ଆମେ ଆପଣଙ୍କର ବ୍ୟକ୍ତିଗତ ସୂଚନା ତୃତୀୟ ପକ୍ଷକୁ ବିକ୍ରୟ କରୁନାହୁଁ, ବାଣିଜ୍ୟ କରୁନାହୁଁ, କିମ୍ବା ଭଡାରେ ଦେଉନାହୁଁ। ଆମେ ସେବା ପ୍ରଦାନକାରୀମାନଙ୍କ ସହିତ ସୂଚନା ବାଣ୍ଟିପାରିବା ଯେଉଁମାନେ ଆମର ଆବେଦନ ପରିଚାଳନାରେ ଆମକୁ ସାହାଯ୍ୟ କରନ୍ତି।",
        yourRights: "5. ଆପଣଙ୍କର ଅଧିକାର",
        yourRightsText: "ଆପଣଙ୍କର ଯେକୌଣସି ସମୟରେ ଆପଣଙ୍କର ବ୍ୟକ୍ତିଗତ ସୂଚନା ପ୍ରବେଶ, ଅପଡେଟ୍, କିମ୍ବା ବିଲୋପ କରିବାର ଅଧିକାର ଅଛି। ଏହି ଅନୁରୋଧରେ ସହାୟତା ପାଇଁ ଆମ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ।",
        contactPrivacy: "6. ଆମ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ",
        contactPrivacyText: "ଯଦି ଏହି ଗୋପନୀୟତା ନୀତି ବିଷୟରେ ଆପଣଙ୍କର କୌଣସି ପ୍ରଶ୍ନ ଅଛି, ଦୟାକରି ranasantosh3741@gmail.com ରେ ଆମ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ କିମ୍ବା +91 78550 91829 ରେ କଲ୍ କରନ୍ତୁ।",
        loginNotice: "ଥିମ୍ ଏବଂ କଷ୍ଟମାଇଜେସନ୍ ସକ୍ଷମ କରିବାକୁ ସାଇନ୍ ଅପ୍ କିମ୍ବା ଲଗଇନ୍ କରନ୍ତୁ।"
    },
    zh: {
        welcome: "你好，厨师！👨‍🍳",
        whatCooking: "今天我们做什么菜？",
        quickActions: "快速操作",
        healthyBreakfast: "健康早餐",
        quickDinner: "15分钟晚餐",
        paneerSpecial: "奶酪特色菜",
        chocolateDessert: "巧克力甜点",
        mealPlan: "每周膳食计划",
        partyPlanner: "派对策划",
        trendingNow: "现在流行",
        aiChef: "AI厨师",
        aiWelcome: "厨师您好！我是您的厨房伙伴，我的笑话比辣椒还辣！🥵 告诉我任何菜名，我会用爱为您准备完整的食谱！🍲",
        all: "全部",
        veg: "素食",
        nonVeg: "荤食",
        sweet: "甜品",
        kitchenTimers: "厨房计时器 ⏱️",
        noTimers: "没有活动计时器。点击+添加一个！⏱️",
        login: "登录",
        signUp: "注册",
        emailAddress: "电子邮件地址",
        password: "密码",
        noAccount: "没有账户？",
        masterChef: "大厨",
        themeColors: "主题和颜色",
        alarmSounds: "闹钟声音",
        language: "语言",
        helpSupport: "帮助与支持",
        logout: "退出",
        home: "主页",
        recipes: "食谱",
        timer: "计时器",
        profile: "个人资料",
        chooseTheme: "🎨 选择主题",
        selectColorScheme: "选择您喜欢的配色方案",
        defaultPurple: "默认紫色",
        warmRose: "温暖玫瑰",
        freshGreen: "清新绿色",
        spicyOrange: "辛辣橙色",
                oceanTheme: "海洋奥德赛",
        sugarTheme: "甜心糖",
        indiaTheme: "印度国旗",
        midnightTheme: "午夜太阳",

        chooseAlarm: "🔔 选择闹钟声音",
        selectAlarmSound: "选择您的计时器闹钟声音",
        classicBeep: "经典蜂鸣",
        gentleChime: "温和钟声",
        kitchenBell: "厨房铃声",
        urgentAlert: "紧急警报",
        selectLanguage: "选择语言",
        choosePreferredLanguage: "选择您喜欢的语言",
        newTimer: "⏱️ 新计时器",
        setKitchenTimer: "设置您的厨房计时器",
        timerName: "计时器名称",
        timerNamePlaceholder: "例如 煮鸡蛋",
        setTime: "设置时间",
        hour: "小时",
        min: "分钟",
        sec: "秒",
        quickPresets: "快速预设",
        cancel: "取消",
        startTimer: "开始计时",
        edit: "编辑",
        copy: "复制",
        whatsapp: "WhatsApp",
        readAloud: "朗读",
        needAssistance: "需要帮助？我们在这里提供帮助！",
        contactUs: "联系我们",
        phone: "电话",
        email: "电子邮件",
        quickLinks: "快速链接",
        privacyPolicy: "隐私政策",
        faq: "常见问题",
        lastUpdated: "最后更新：",
        informationCollection: "1. 我们收集哪些信息",
        informationCollectionText: "我们收集您直接提供给我们的信息，包括用于身份验证的电子邮件地址、食谱偏好以及用于改善您体验的使用数据。",
        howWeUse: "2. 我们如何使用您的信息",
        howWeUseText: "我们使用收集的信息来提供、维护和改进我们的服务，向您发送技术通知和支持消息，并个性化您的体验。",
        dataSecurity: "3. 数据安全",
        dataSecurityText: "我们实施适当的安全措施来保护您的个人信息。您的数据已加密，并使用Firebase服务安全存储。",
        dataSharing: "4. 信息共享",
        dataSharingText: "我们不会向第三方出售、交易或出租您的个人信息。我们可能会与帮助我们运营应用程序的服务提供商共享信息。",
        yourRights: "5. 您的权利",
        yourRightsText: "您有权随时访问、更新或删除您的个人信息。如需帮助，请联系我们。",
        contactPrivacy: "6. 联系我们",
        contactPrivacyText: "如果您对本隐私政策有任何疑问，请通过ranasantosh3741@gmail.com与我们联系或拨打+91 78550 91829。",
        loginNotice: "注册或登录以启用主题和自定义。"
    }
};

function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const key = elem.getAttribute('data-i18n');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            elem.textContent = translations[currentLanguage][key];
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
        const key = elem.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            elem.placeholder = translations[currentLanguage][key];
        }
    });
}

window.openLanguageSettings = () => {
    document.getElementById('language-modal').style.display = 'flex';
    document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-lang="${currentLanguage}"]`)?.classList.add('selected');
};

window.closeLanguageModal = () => {
    document.getElementById('language-modal').style.display = 'none';
};

window.selectLanguage = (lang) => {
    currentLanguage = lang;
    localStorage.setItem('appLanguage', lang);
    document.querySelectorAll('.language-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-lang="${lang}"]`)?.classList.add('selected');
    updatePageLanguage();
    setTimeout(() => closeLanguageModal(), 300);
};

// --- ALARM PRESETS ---
const alarmPresets = {
    beep: {
        name: "Classic Beep",
        icon: "notifications",
        play: () => {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, ctx.currentTime);
                    osc.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.3);
                }, i * 400);
            }
        }
    },
    chime: {
        name: "Gentle Chime",
        icon: "radio_button_checked",
        play: () => {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const frequencies = [523, 659, 784];
            frequencies.forEach((freq, i) => {
                setTimeout(() => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime);
                    gain.gain.setValueAtTime(0.3, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 1);
                }, i * 200);
            });
        }
    },
    bell: {
        name: "Kitchen Bell",
        icon: "notifications_active",
        play: () => {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.5);
        }
    },
    urgent: {
        name: "Urgent Alert",
        icon: "priority_high",
        play: () => {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const osc = ctx.createOscillator();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(1200, ctx.currentTime);
                    osc.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.15);
                }, i * 250);
            }
        }
    }
};

let selectedAlarm = localStorage.getItem('selectedAlarm') || 'beep';

// --- MATERIAL YOU THEMES ---
const materialThemes = {
    // --- Existing Themes ---
    default: {
        light: { '--primary': '#6750A4', '--primary-container': '#EADDFF', '--secondary': '#625B71', '--background': '#FFFBFE', '--surface': '#FFFBFE', '--text-main': '#1C1B1F' },
        dark: { '--primary': '#D0BCFF', '--primary-container': '#4F378B', '--secondary': '#CCC2DC', '--background': '#1C1B1F', '--surface': '#1C1B1F', '--text-main': '#E6E1E5' }
    },
    warm: {
        light: { '--primary': '#C4314B', '--primary-container': '#FFD9E2', '--secondary': '#775652', '--background': '#FFF8F6', '--surface': '#FFF8F6', '--text-main': '#201A1B' },
        dark: { '--primary': '#FFB1C8', '--primary-container': '#8C3249', '--secondary': '#E7BDB6', '--background': '#201A1B', '--surface': '#201A1B', '--text-main': '#ECE0E0' }
    },
    green: {
        light: { '--primary': '#006E26', '--primary-container': '#97F991', '--secondary': '#526350', '--background': '#FCFDF6', '--surface': '#FCFDF6', '--text-main': '#1A1C19' },
        dark: { '--primary': '#7BDC76', '--primary-container': '#005313', '--secondary': '#B8CCB5', '--background': '#1A1C19', '--surface': '#1A1C19', '--text-main': '#E2E3DD' }
    },
    orange: {
        light: { '--primary': '#825500', '--primary-container': '#FFDDB3', '--secondary': '#6F5B40', '--background': '#FFFBFF', '--surface': '#FFFBFF', '--text-main': '#1F1B16' },
        dark: { '--primary': '#FFB951', '--primary-container': '#633F00', '--secondary': '#E3C2A2', '--background': '#1F1B16', '--surface': '#1F1B16', '--text-main': '#EAE1D9' }
    },

    // --- NEW THEMES ---
    
    // 1. Ocean Odyssey (Water/Teal)
    ocean: {
        light: { '--primary': '#006684', '--primary-container': '#BFE8FF', '--secondary': '#4C616C', '--background': '#FBFCFE', '--surface': '#FBFCFE', '--text-main': '#191C1E' },
        dark: { '--primary': '#6CD2FF', '--primary-container': '#004D65', '--secondary': '#B3CAD6', '--background': '#191C1E', '--surface': '#191C1E', '--text-main': '#E1E2E4' }
    },

    // 2. Sweet-Heart-Sugar (Red & Pink)
    sugar: {
    light: { 
        '--primary': '#FF0000',           // Pure Red
        '--primary-container': '#FFEBEE', // Very Light Red/Pink
        '--secondary': '#74565F', 
        '--background': '#FFFBFF', 
        '--surface': '#FFFBFF', 
        '--text-main': '#201A1B' 
    },
    dark: { 
        '--primary': '#FF5252',           // Bright Red for Dark Mode
        '--primary-container': '#8E0000', // Dark Crimson
        '--secondary': '#E2BDC7', 
        '--background': '#1A0000',        // Deep Black-Red background
        '--surface': '#201A1B', 
        '--text-main': '#ECE0E0' 
    }
},

    // 3. Indian Flag (Saffron Primary, Green Secondary)
    india: {
        light: { '--primary': '#FF9933', '--primary-container': '#FFE5CC', '--secondary': '#138808', '--background': '#FFFFFF', '--surface': '#F8F9FA', '--text-main': '#000080' },
        dark: { '--primary': '#FFBD80', '--primary-container': '#E67300', '--secondary': '#88CC88', '--background': '#1A1A1A', '--surface': '#1A1A1A', '--text-main': '#E0E0E0' }
    },

    // 4. Midnight Sun (Dark Blue & Bright Yellow)
    midnight: {
        light: { '--primary': '#5856D6', '--primary-container': '#E7E7FF', '--secondary': '#FFC107', '--background': '#F2F2F7', '--surface': '#FFFFFF', '--text-main': '#1C1C1E' },
        dark: { '--primary': '#F9D423', '--primary-container': '#3A3A52', '--secondary': '#8E8E93', '--background': '#0D0D15', '--surface': '#151522', '--text-main': '#FFFFFF' }
    }
};

const savedTheme = localStorage.getItem('theme') || 'light-theme';
const savedThemePreset = localStorage.getItem('themePreset') || 'default';
document.body.className = savedTheme;
applyThemePreset(savedThemePreset);
themeToggle.querySelector('span').textContent = savedTheme === 'light-theme' ? 'dark_mode' : 'light_mode';

function applyThemePreset(presetName) {
    const isDark = document.body.classList.contains('dark-theme');
    const preset = materialThemes[presetName] || materialThemes.default;
    const colors = isDark ? preset.dark : preset.light;
    Object.keys(colors).forEach(key => {
        document.documentElement.style.setProperty(key, colors[key]);
    });
    localStorage.setItem('themePreset', presetName);
}

themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.contains('light-theme');
    document.body.className = isLight ? 'dark-theme' : 'light-theme';
    themeToggle.querySelector('span').textContent = isLight ? 'light_mode' : 'dark_mode';
    localStorage.setItem('theme', document.body.className);
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    applyThemePreset(localStorage.getItem('themePreset') || 'default');
});

// Theme & Alarm Modal Functions
window.openThemeSettings = () => {
    document.getElementById('theme-modal').style.display = 'flex';
    document.querySelectorAll('.theme-preset-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-theme="${localStorage.getItem('themePreset') || 'default'}"]`)?.classList.add('selected');
};

window.closeThemeModal = () => {
    document.getElementById('theme-modal').style.display = 'none';
};

window.selectThemePreset = (presetName) => {
    applyThemePreset(presetName);
    document.querySelectorAll('.theme-preset-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-theme="${presetName}"]`)?.classList.add('selected');
    setTimeout(() => closeThemeModal(), 300);
};

window.openAlarmSettings = () => {
    document.getElementById('alarm-modal').style.display = 'flex';
    document.querySelectorAll('.alarm-preset-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-alarm="${selectedAlarm}"]`)?.classList.add('selected');
};

window.closeAlarmModal = () => {
    document.getElementById('alarm-modal').style.display = 'none';
};

window.selectAlarm = (alarmType) => {
    selectedAlarm = alarmType;
    localStorage.setItem('selectedAlarm', alarmType);
    document.querySelectorAll('.alarm-preset-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-alarm="${alarmType}"]`)?.classList.add('selected');
    alarmPresets[alarmType].play();
};

// Help & Support Modal Functions
window.openHelpSupport = () => {
    document.getElementById('help-modal').style.display = 'flex';
};

window.closeHelpModal = () => {
    document.getElementById('help-modal').style.display = 'none';
};

window.showPrivacyPolicy = () => {
    document.getElementById('help-modal').style.display = 'none';
    document.getElementById('privacy-modal').style.display = 'flex';
};

window.closePrivacyModal = () => {
    document.getElementById('privacy-modal').style.display = 'none';
};

window.showFAQ = () => {
    alert('FAQ section coming soon!');
};

// Profile Picture Upload
window.triggerProfilePicUpload = () => {
    document.getElementById('profile-pic-input').click();
};

document.getElementById('profile-pic-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file');
        return;
    }
    
    const user = auth.currentUser;
    if (!user) {
        showToast('Please login first');
        return;
    }
    
    try {
        showToast('Uploading profile picture...');
        
        // Create a local URL for immediate display
        const localURL = URL.createObjectURL(file);
        
        // Update UI immediately
        const profilePicPreview = document.getElementById('profile-pic-preview');
        const profileIcon = document.querySelector('.profile-avatar .material-symbols-rounded');
        
        profilePicPreview.src = localURL;
        profilePicPreview.classList.remove('hidden');
        if (profileIcon) {
            profileIcon.style.display = 'none';
        }
        
        // Upload to Firebase Storage
        const storageRef = ref(storage, `profile-pics/${user.uid}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update with Firebase URL
        profilePicPreview.src = downloadURL;
        
        // Save to localStorage
        localStorage.setItem(`profilePic_${user.uid}`, downloadURL);
        
        showToast('Profile picture updated!');
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        showToast('Failed to upload profile picture');
    }
});

// Load profile picture on auth state change
// --- UPDATED PROFILE PICTURE LOGIC ---

// 1. Function to Load Profile Picture
// --- UPDATED PROFILE PICTURE LOGIC ---

// 1. Function to Load Profile Picture
// इस फंक्शन को अपने पुराने loadProfilePicture फंक्शन से रिप्लेस करें
function loadProfilePicture(user) {
    const profileImg = document.getElementById('profile-pic-preview'); 
    const profileIcon = document.querySelector('.profile-avatar .material-symbols-rounded');
    
    if (!profileImg) return;

    // Server URL को प्राथमिकता दें
    const photoURL = user.photoURL || localStorage.getItem('profilePic_' + user.uid);
    
    if (photoURL) {
        profileImg.src = photoURL;
        profileImg.classList.remove('hidden');
        if (profileIcon) profileIcon.style.display = 'none';
    }
}

// 2. Event Listener for Uploading
// यह कोड script.js में नीचे जहाँ Event Listeners हैं, वहाँ डालें
const profileInputElement = document.getElementById('profile-pic-input');

if (profileInputElement) {
    profileInputElement.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const user = auth.currentUser;
        if (!user) {
            showToast('Please login first');
            return;
        }

        try {
            showToast('Uploading profile picture...'); // यह आ रहा है

            // 1. Storage में फोटो भेजें
            const storageRef = ref(storage, `profile-pics/${user.uid}`);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);
            
            console.log("Image uploaded to storage:", downloadURL);

            // 2. Firebase User Profile अपडेट करें
            // अगर कोड यहाँ रुक रहा है, तो मतलब updateProfile import नहीं हुआ है
            await updateProfile(user, {
                photoURL: downloadURL
            });

            console.log("Firebase Profile Updated!");

            // 3. UI अपडेट करें
            const profileImg = document.getElementById('profile-pic-preview');
            const profileIcon = document.querySelector('.profile-avatar .material-symbols-rounded');
            
            if (profileImg) {
                profileImg.src = downloadURL;
                profileImg.classList.remove('hidden');
            }
            if (profileIcon) profileIcon.style.display = 'none';

            // 4. LocalStorage बैकअप
            localStorage.setItem('profilePic_' + user.uid, downloadURL);
            
            showToast('Profile updated permanently!'); // अब यह टोस्ट आएगा!

        } catch (error) {
            // अगर कोई गलती हुई, तो यहाँ पता चलेगा
            console.error("FULL ERROR DETAILS:", error);
            showToast('Update failed: ' + error.message);
        }
    });
}

// Tab Navigation
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetId = item.dataset.target;
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        views.forEach(view => {
            view.classList.remove('active-view');
            if (view.id === targetId) {
                view.classList.add('active-view');
            }
        });
    });
});

// Toast Notification
function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: calc(var(--nav-height) + 20px);
        left: 50%;
        transform: translateX(-50%);
        background: var(--text-main);
        color: var(--surface);
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 0.9rem;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Trending Recipes Data
const trendingRecipes = [
    { name: "Butter Chicken", img: "https://img.freepik.com/free-photo/massaman-curry-frying-pan-with-spices-cement-floor_1150-20777.jpg?t=st=1770010884~exp=1770014484~hmac=0ec68b823e512c8856397a2f44684993c23a8323c6d811a8d378d5349ed378f7&w=740", time: "45 min", filter: "non-veg" },
    { name: "Paneer Tikka", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300", time: "30 min", filter: "veg" },
    { name: "Gulab Jamun", img: "https://media.istockphoto.com/id/2202928068/photo/indian-cuisine.jpg?b=1&s=612x612&w=0&k=20&c=UfJag3_ZhdSbueOclv1HFQg6IzOWIb8c8zpnn5VL-bc=", time: "60 min", filter: "sweet" },
    { name: "Biryani", img: "https://media.istockphoto.com/id/2254897375/photo/indian-dish-chicken-biryani-with-basmati-rice.jpg?b=1&s=612x612&w=0&k=20&c=nMh1begS_p4aS0n8d4oBBuTxZxlg3rAdhSErUl3uAHc=", time: "90 min", filter: "non-veg" }
];

const allRecipes = [
      {
      name: "Royal Kesar Pista Ice Cream",
      img: "https://media.istockphoto.com/id/657090194/photo/rajwari-or-rajwadi-sweet-kesar-badam-pista-kulfi-or-ice-cream-candy.jpg?s=612x612&w=0&k=20&c=qr9qpyJKBHBy9iS9nQn-0h4f-xn6rE4TUOtXiYZwkoY=",
      time: "40 min (+freeze)",
      filter: "sweet"
  },
    { name: "Butter Chicken", img: "https://img.freepik.com/free-photo/massaman-curry-frying-pan-with-spices-cement-floor_1150-20777.jpg?t=st=1770010884~exp=1770014484~hmac=0ec68b823e512c8856397a2f44684993c23a8323c6d811a8d378d5349ed378f7&w=740", time: "45 min", filter: "non-veg" },
    { name: "Paneer Tikka", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300", time: "30 min", filter: "veg" },
    {
    name: "Classic Red Velvet Cake",
    img: "https://media.istockphoto.com/id/1212689559/photo/cake-red-velvet-on-two-white-plates-two-servings-on-a-black-background-birthday-holidays.jpg?s=612x612&w=0&k=20&c=gVElsA3hVme5mLDzSVq-et6txxsCBWnIeugYS19ulvc=",
    time: "60 min",
    filter: "sweet"
},
    { name: "Gulab Jamun", img: "https://media.istockphoto.com/id/2202928068/photo/indian-cuisine.jpg?b=1&s=612x612&w=0&k=20&c=UfJag3_ZhdSbueOclv1HFQg6IzOWIb8c8zpnn5VL-bc=", time: "60 min", filter: "sweet" },
    { name: "Biryani", img: "https://media.istockphoto.com/id/2254897375/photo/indian-dish-chicken-biryani-with-basmati-rice.jpg?b=1&s=612x612&w=0&k=20&c=nMh1begS_p4aS0n8d4oBBuTxZxlg3rAdhSErUl3uAHc=", time: "90 min", filter: "non-veg" },
    {
    name: "Oats & Almond Cookies",
    img: "https://media.istockphoto.com/id/1360030382/photo/sweet-almond-cookies.jpg?b=1&s=612x612&w=0&k=20&c=D-mXN-9Hb6dKIY79kQ-VDHEVdF-VDpVQdcDmdYZ6PYE=",
    time: "35 min",
    filter: "sweet"
}, 
    { name: "Dal Makhani", img: "https://media.istockphoto.com/id/1284747093/photo/dal-makhani-india-curry-made-from-lentils-beans-butter-and-cream.jpg?b=1&s=612x612&w=0&k=20&c=W7Fk8BJaShenTDi0Xdmq6VyQrH6RR0pSWpBj-OhUPQA=", time: "120 min", filter: "veg" },
    { name: "Rasmalai", img: "https://media.istockphoto.com/id/2229698116/photo/delicious-rasmalai-served-in-a-bowl-placed-beside-a-decorative-rakhi-and-a-traditional-roli.jpg?b=1&s=612x612&w=0&k=20&c=BTyXHox-sPi91DVn4uZ8TFE3JFh9ojJQ9pWs_Oes2kk=", time: "90 min", filter: "sweet" },
    { name: "Masala Dosa", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TWFzYWxhJTIwZG9zYXxlbnwwfHwwfHx8MA%3D%3D", time: "40 min", filter: "veg" },
    { name: "Chole Bhature", img: "https://media.istockphoto.com/id/1290033452/photo/fried-puri-and-chole-ki-sabzi-famous-indian-food.jpg?b=1&s=612x612&w=0&k=20&c=TRCo_fKlBJrJbhNPle5unA0SyVVElSa5MLDoh35Pojs=", time: "50 min", filter: "veg" },
    { name: "Veg Manchurian", img: "https://media.istockphoto.com/id/1284771655/photo/veg-manchurian-gravy-balls-in-black-bowl-in-dark-slate-table-top-vegetarian-manchurian-is.jpg?b=1&s=612x612&w=0&k=20&c=dWVG_KzDzLxR9zXsDj_WNFQjoUMQbALuZp2CKxJfWTs=", time: "30 min", filter: "veg" },
    {
    name: "Molten Choco Lava Cake",
    img: "https://media.istockphoto.com/id/177502848/photo/chocolate-cake-with-ice-cream-isolated.jpg?b=1&s=612x612&w=0&k=20&c=HRrv2m6YifdgL-6fqJKnUPDTUVBE9FYCGk52Pzjk7Sg=",
    time: "25 min",
    filter: "sweet"
},
    { name: "Hakka Noodles", img: "https://media.istockphoto.com/id/1159336993/photo/schezwan-noodles-with-vegetables-in-a-plate-on-a-white-wooden-background-top-view.jpg?b=1&s=612x612&w=0&k=20&c=vlpKA7ltaBDboUFIgreZGi0q7IjJ0WwcywJN2aVJ-Ec=", time: "25 min", filter: "veg" }
];

function renderRecipes() {
    const container = document.getElementById('home-trending-grid');
    container.innerHTML = '';
    trendingRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.img}" alt="${recipe.name}" class="recipe-img">
            <div class="recipe-info">
                <h3>${recipe.name}</h3>
                <p class="recipe-meta"><span class="material-symbols-rounded" style="font-size:16px;">schedule</span> ${recipe.time}</p>
                <button class="ask-ai-btn" onclick="askAIForRecipe('${recipe.name}')">
                    <span class="material-symbols-rounded">psychology</span>
                    <span>Ask AI for Recipe</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    const recipeList = document.getElementById('recipe-list-container');
    recipeList.innerHTML = '';
    allRecipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.filter = recipe.filter;
        card.innerHTML = `
            <img src="${recipe.img}" alt="${recipe.name}" class="recipe-img">
            <div class="recipe-info">
                <h3>${recipe.name}</h3>
                <p class="recipe-meta"><span class="material-symbols-rounded" style="font-size:16px;">schedule</span> ${recipe.time}</p>
                <button class="ask-ai-btn" onclick="askAIForRecipe('${recipe.name}')">
                    <span class="material-symbols-rounded">psychology</span>
                    <span>Ask AI for Recipe</span>
                </button>
            </div>
        `;
        recipeList.appendChild(card);
    });
}

window.askAIForRecipe = (recipeName) => {
    // Switch to AI Chat tab
    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-target="view-ai"]').classList.add('active');
    views.forEach(view => view.classList.remove('active-view'));
    document.getElementById('view-ai').classList.add('active-view');
    
    // Set prompt and submit
    promptInput.value = recipeName;
    chatForm.dispatchEvent(new Event('submit'));
};

function openRecipeDetail(recipe) {
    document.getElementById('modal-title').textContent = recipe.name;
    document.getElementById('modal-body').innerHTML = `
        <img src="${recipe.img}" style="width:100%; border-radius:12px; margin-bottom:16px;">
        <p style="color:var(--text-sub);">Time: ${recipe.time}</p>
        <p style="margin-top:12px;">This is a placeholder recipe detail. In a real app, you would fetch full recipe instructions here!</p>
    `;
    document.getElementById('recipe-modal').style.display = 'flex';
}

// Recipe Filter
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('#recipe-list-container .recipe-card').forEach(card => {
            if (filter === 'all' || card.dataset.filter === filter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ============================================================
// AI CHAT WITH IMAGE GENERATION & EDIT IN PLACE
// ============================================================
const chatForm = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const chatHistory = document.getElementById('chat-history');
const newChatBtn = document.getElementById('new-chat-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');

// Enhanced AI system prompt with chef personality
// --- ADVANCED SYSTEM PROMPT LOGIC ---
function getSmartSystemPrompt(userMessage, userLanguage) {
    const msg = userMessage.toLowerCase();
    
    // CASE 1: WEEKLY MEAL PLANNER
    if (msg.includes('meal plan') || msg.includes('diet') || msg.includes('weekly')) {
        const prompts = {
            en: `You are an expert Dietitian and Home Economist. 
            Goal: Create a 7-day Weekly Meal Plan (Breakfast, Lunch, Dinner).
            Rules:
            1. Food must be HEALTHY and EASY TO DIGEST.
            2. Must be TASTY but HOMEMADE.
            3. LOW COST/Budget-friendly (Avoid expensive fancy ingredients).
            4. Format: Use a clear layout (Day 1, Day 2...).
            5. End with a shopping tip to save money.`,
            
            hi: `आप एक विशेषज्ञ आहार विशेषज्ञ (Dietitian) हैं।
            लक्ष्य: 7-दिन की साप्ताहिक भोजन योजना (नाश्ता, दोपहर का भोजन, रात का खाना) बनाएं।
            नियम:
            1. खाना स्वस्थ और पचने में आसान होना चाहिए।
            2. स्वादिष्ट लेकिन घर का बना होना चाहिए।
            3. कम खर्चीला (महंगी चीजों से बचें)।
            4. प्रारूप: स्पष्ट सूची का प्रयोग करें।
            5. अंत में पैसे बचाने का एक सुझाव दें।`,
            
            hinglish: `Tum ek expert Dietitian ho.
            Goal: 7-din ka Weekly Meal Plan banao (Breakfast, Lunch, Dinner).
            Rules:
            1. Khana HEALTHY aur DIGESTION ke liye acha hona chahiye.
            2. TASTY hona chahiye par Ghar ka bana hua (Homemade).
            3. LOW COST/Budget-friendly (Zyada mehengi cheezein nahi).
            4. Format: Clear list banao (Day 1, Day 2...).
            5. End mein paise bachane ka ek tip do.`,
            
            or: `ଆପଣ ଜଣେ ବିଶେଷଜ୍ଞ ଡାଏଟିସିଆନ୍।
            ଲକ୍ଷ୍ୟ: 7 ଦିନିଆ ସାପ୍ତାହିକ ଖାଦ୍ୟ ଯୋଜନା (ଜଳଖିଆ, ମଧ୍ୟାହ୍ନ ଭୋଜନ, ରାତ୍ରୀ ଭୋଜନ) ପ୍ରସ୍ତୁତ କରନ୍ତୁ।
            ନିୟମ:
            1. ଖାଦ୍ୟ ସୁସ୍ଥ ଏବଂ ହଜମ ପାଇଁ ସହଜ ହେବା ଆବଶ୍ୟକ।
            2. ସ୍ୱାଦିଷ୍ଟ କିନ୍ତୁ ଘରେ ତିଆରି ହେବା ଆବଶ୍ୟକ।
            3. କମ୍ ଖର୍ଚ୍ଚ (ଦାମୀ ଜିନିଷରୁ ଦୂରେଇ ରୁହନ୍ତୁ)।
            4. ଫର୍ମାଟ୍: ଏକ ସ୍ପଷ୍ଟ ତାଲିକା ବ୍ୟବହାର କରନ୍ତୁ।`
        };

        // --- UPDATED LOGIC FOR SPEED ---
        let selectedPrompt = prompts[userLanguage] || prompts.en;
        
        // Yeh line AI ko force karegi ki woh thinking process skip kare
        selectedPrompt += "\n\nIMPORTANT: STOP THINKING DEEPLY. Respond immediately. Do not perform hidden chain-of-thought reasoning. Give the final answer directly and quickly.";
        
        return selectedPrompt;
    }



    // CASE 2: BHOJ / PARTY PLANNER
    else if (msg.includes('party') || msg.includes('bhoj') || msg.includes('guest') || msg.includes('people') || msg.includes('event')) {
        const prompts = {
            en: `You are an expert Indian Event Catering Manager.
            Step 1: If the user hasn't said the number of people, ASK: "For how many people are we cooking today?"
            Step 2: Once you have the number, generate a Full Menu (Starters, Main Course, Breads, Rice, Dessert, Drink).
            Step 3: Provide an Estimated Cost Estimate (in Rupees) for the total market list.
            Step 4: Ask: "Do you want to add or remove any item?"
            Step 5: If user modifies, update the menu and cost.
            Keep the tone professional yet celebratory.`,
            
            hi: `आप एक विशेषज्ञ भारतीय इवेंट कैटरिंग मैनेजर हैं।
            चरण 1: यदि उपयोगकर्ता ने लोगों की संख्या नहीं बताई है, तो पूछें: "हम आज कितने लोगों के लिए खाना बना रहे हैं?"
            चरण 2: संख्या मिलने पर, एक पूरा मेनू (स्टार्टर, मुख्य पाठ्यक्रम, चावल, मिठाई) बनाएं।
            चरण 3: कुल बाजार सूची के लिए अनुमानित लागत (रुपये में) बताएं।
            चरण 4: पूछें: "क्या आप इसमें कुछ जोड़ना या हटाना चाहते हैं?"
            चरण 5: यदि उपयोगकर्ता परिवर्तन करता है, तो मेनू और लागत अपडेट करें।`,
            
            hinglish: `Tum ek expert Indian Catering Manager ho.
            Step 1: Agar user ne logon ki ginti nahi batayi, to pucho: "Kitne logon ke liye khana banana hai?"
            Step 2: Number milne ke baad, Full Menu banao (Starters, Main Course, Sabzi, Rice, Dessert).
            Step 3: Total kharche ka Estimate (Rupees mein) batao.
            Step 4: Pucho: "Kya aap isme kuch add ya remove karna chahte hain?"
            Step 5: Agar user change bole, to menu aur cost update karo.`,
            
            or: `ଆପଣ ଜଣେ ବିଶେଷଜ୍ଞ ଇଭେଣ୍ଟ କ୍ୟାଟରିଂ ମ୍ୟାନେଜର।
            ପଦକ୍ଷେପ 1: ଯଦି ବ୍ୟବହାରକାରୀ ଲୋକଙ୍କ ସଂଖ୍ୟା କହିନାହାଁନ୍ତି, ତେବେ ପଚାରନ୍ତୁ: "ଆମେ ଆଜି କେତେ ଲୋକଙ୍କ ପାଇଁ ରାନ୍ଧୁଛୁ?"
            ପଦକ୍ଷେପ 2: ଥରେ ଆପଣ ସଂଖ୍ୟା ପାଇବା ପରେ, ଏକ ସମ୍ପୂର୍ଣ୍ଣ ମେନୁ (ଷ୍ଟାର୍ଟର୍, ମେନ୍ କୋର୍ସ, ଭାତ, ମିଠା) ପ୍ରସ୍ତୁତ କରନ୍ତୁ।
            ପଦକ୍ଷେପ 3: ମୋଟ ବଜାର ତାଲିକା ପାଇଁ ଆନୁମାନିକ ମୂଲ୍ୟ (ଟଙ୍କାରେ) ପ୍ରଦାନ କରନ୍ତୁ।
            ପଦକ୍ଷେପ 4: ପଚାରନ୍ତୁ: "ଆପଣ କୌଣସି ଜିନିଷ ଯୋଡିବାକୁ କିମ୍ବା ବାହାର କରିବାକୁ ଚାହୁଁଛନ୍ତି କି?"`
        };
        return prompts[userLanguage] || prompts.en;
    }

    // CASE 3: DEFAULT RECIPE CHEF (Existing Logic)
    else {
        // ... (Paste your existing Recipe System Prompts here from the previous code) ...
        // For brevity, I am using a reference to the previous prompt logic:
             // CASE 3: DEFAULT RECIPE CHEF
            // CASE 3: DEFAULT RECIPE CHEF
 
        const recipePrompts = {
            // Hum English text mein bol rahe hain ki Emojis use karo
            en: `You are Chef Master AI. Provide a complete recipe for: ${userMessage}. 
            CRITICAL INSTRUCTION: You MUST use Emojis for every ingredient and step. 
            Example: Use tomato emoji for tomato, fire emoji for cooking. 
            Make the output visually colorful using emojis.`,
            
            hi: `आप Chef Master AI हैं। ${userMessage} के लिए पूरी रेसिपी बताएं। 
            महत्वपूर्ण: आपको हर सामग्री और स्टेप के साथ इमोजी लगाना ही है। 
            जैसे टमाटर के लिए टमाटर वाला इमोजी, पकाने के लिए आग वाला इमोजी।`,
            
            hinglish: `Tum Chef Master AI ho. ${userMessage} ki poori recipe batao. 
            IMPORTANT: Har step aur ingredient ke saath Emojis lagana zaroori hai. 
            Jaise Tomato ke liye tomato emoji, Cooking ke liye fire emoji.`,
            
            or: `ଆପଣ ଶେଫ୍ ମାଷ୍ଟର AI। ${userMessage} ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ରେସିପି ପ୍ରଦାନ କରନ୍ତୁ।
            ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ: ପ୍ରତ୍ୟେକ ପଦକ୍ଷେପରେ ଇମୋଜି ବ୍ୟବହାର କରନ୍ତୁ।`,
            
            zh: `你是厨师大师AI。提供完整的食谱：${userMessage}。
            重要提示：必须使用表情符号来装饰食谱。`
        };
        return recipePrompts[userLanguage] || recipePrompts.en;
    }

}
// --- UPDATED CHAT FORM LISTENER ---
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = promptInput.value.trim();
    if (!userMessage) return;
    
    const messageId = Date.now();
    addMessage('user', userMessage, messageId);
    promptInput.value = '';
    
    // 1. SKELETON LOADER DIKHAYEIN (Purane dots ki jagah)
    const skeletonHTML = `
        <div class="skeleton-loader">
            <div class="skeleton-line title"></div>
            <div class="skeleton-line full"></div>
            <div class="skeleton-line medium"></div>
            <div class="skeleton-line full"></div>
            <div class="skeleton-line short"></div>
        </div>
    `;
    
    // Bot message add karein (Skeleton ke saath)
    const botMsgDiv = addMessage('bot', skeletonHTML, messageId + 1);
    
        try {
        const systemPrompt = getSmartSystemPrompt(userMessage, currentLanguage);
        
        // Purani history ko format karna
        const recentHistory = conversationHistory.slice(-6).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        // Naya Message Structure (Simple Text ke liye)
        const messages = [
            { role: 'system', content: systemPrompt },
            ...recentHistory, 
            { 
                role: 'user', 
                content: userMessage // Filhal text mode hai, agar image bhejna ho to yahan structure change hoga
            }
        ];
        
        // UPDATE 2: Naya Fetch SDK Logic (Headers & Body updated)
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_PART_1}${API_PART_2}`,
                "HTTP-Referer": window.location.href, // Auto-detect current site URL
                "X-Title": "Chef Master AI",          // App Name
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: messages
            })
        });
        
        const data = await response.json();

        // Error handling agar API se error aaye
        if (data.error) {
            throw new Error(data.error.message || 'API Error');
        }

        const botReply = data.choices[0].message.content;
        
        // Markdown ko HTML mein convert karein
        const htmlContent = marked.parse(botReply);
        
        // 2. SKELETON HATAYEIN AUR TYPING EFFECT SHURU KAREIN
        const contentDiv = botMsgDiv.querySelector('.chat-content');
        
        // Typewriter function call karein
        typeWriter(contentDiv, htmlContent, 0.5); 
        
        // History save karein
        conversationHistory.push({ role: 'user', content: userMessage, id: messageId });
        conversationHistory.push({ role: 'assistant', content: botReply, id: messageId + 1 });

    } catch (err) {
        console.error(err);
        botMsgDiv.querySelector('.chat-content').innerHTML = `<p style="color:#ff4d4d;">Error: ${err.message}. Please try again.</p>`;
    }

    // Scroll automatically neeche karte rahein
    const scrollInterval = setInterval(() => {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 100);
    
    // 2 second baad scroll rok dein
    setTimeout(() => clearInterval(scrollInterval), 2000);
});



function extractDishName(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Remove common question words
    const ignoreWords = ['how', 'to', 'make', 'cook', 'prepare', 'recipe', 'for', 'a', 'the', 'of', 'with', 'and', 'what', 'is', 'in', 'on', 'at', 'by', 'from', 'can', 'you', 'give', 'me', 'please'];
    
    const words = message.split(' ')
        .filter(word => !ignoreWords.includes(word))
        .filter(word => word.length > 1);
    
    return words.join(' ') || userMessage;
}

async function generateDishImage(dishName) {
    if (!dishName || dishName.trim().length < 2) {
        return null;
    }
    
    const encodedDish = encodeURIComponent(`${dishName} delicious food professional photography high quality 4k detailed`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedDish}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
    
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => {
            console.log('Image generation failed, using placeholder');
            resolve(`https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop&q=${Math.random()}`);
        };
        img.src = imageUrl;
    });
}

// Function to add message to UI (UPDATED FOR FULL WIDTH AI)
function addMessage(role, content, id = Date.now()) {
    const msgDiv = document.createElement('div');
    
    // Default classes
    msgDiv.className = `message ${role}-message`;
    msgDiv.dataset.messageId = id;
    
    if (role === 'user') {
        // --- USER MESSAGE (Bubble Style) ---
        msgDiv.innerHTML = `
            <div class="user-message-container">
                <div class="user-bubble">${content}</div>
                <div class="message-actions">
                    <button class="message-action-btn edit-btn" onclick="editMessage(${id}, '${content.replace(/'/g, "\\'")}')">
                        <span class="material-symbols-rounded">edit</span>
                    </button>
                </div>
            </div>
        `;
        
        // Right-click context menu for User
        msgDiv.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showUserContextMenu(e, content, id);
        });

    } else {
        // --- BOT MESSAGE (Full Width Document Style) ---
        
        // Yahan hum nayi class 'full-width-mode' add kar rahe hain
        msgDiv.classList.add('full-width-mode');

        msgDiv.innerHTML = `
            <div class="avatar"><span class="material-symbols-rounded">smart_toy</span></div>
            <div class="chat-content">${content}</div>
        `;
        
        // Right-click context menu for Bot
        msgDiv.addEventListener('contextmenu', (e) => showBotContextMenu(e, content));
    }
    
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return msgDiv;
}

// Edit message function
window.editMessage = function(messageId, currentContent) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    editingMessageId = messageId;
    
    messageElement.innerHTML = `
        <div class="user-edit-wrap">
            <textarea class="user-edit-input">${currentContent}</textarea>
            <div class="user-edit-actions">
                <button class="user-edit-cancel" onclick="cancelEdit(${messageId}, '${currentContent.replace(/'/g, "\\'")}')">Cancel</button>
                <button class="user-edit-save" onclick="saveEdit(${messageId})">Save & Send</button>
            </div>
        </div>
    `;
    
    // Focus and select all text
    const textarea = messageElement.querySelector('.user-edit-input');
    textarea.focus();
    textarea.setSelectionRange(0, textarea.value.length);
};

window.cancelEdit = function(messageId, originalContent) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    messageElement.innerHTML = `
        <div class="user-message-container">
            <div class="user-bubble">${originalContent}</div>
            <div class="message-actions">
                <button class="message-action-btn edit-btn" onclick="editMessage(${messageId}, '${originalContent.replace(/'/g, "\\'")}')">
                    <span class="material-symbols-rounded">edit</span>
                </button>
            </div>
        </div>
    `;
    editingMessageId = null;
};

window.saveEdit = function(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    const textarea = messageElement.querySelector('.user-edit-input');
    const newContent = textarea.value.trim();
    
    if (!newContent) {
        showToast('Message cannot be empty');
        return;
    }
    
    messageElement.innerHTML = `
        <div class="user-message-container">
            <div class="user-bubble">${newContent}</div>
            <div class="message-actions">
                <button class="message-action-btn edit-btn" onclick="editMessage(${messageId}, '${newContent.replace(/'/g, "\\'")}')">
                    <span class="material-symbols-rounded">edit</span>
                </button>
            </div>
        </div>
    `;
    
    const allMessages = Array.from(chatHistory.querySelectorAll('.message'));
    const currentIndex = allMessages.findIndex(msg => msg.dataset.messageId == messageId);
    
    if (currentIndex !== -1 && currentIndex + 1 < allMessages.length) {
        const nextMessage = allMessages[currentIndex + 1];
        if (nextMessage.classList.contains('bot-message')) {
            nextMessage.remove();
            conversationHistory = conversationHistory.filter(msg => msg.id !== (messageId + 1));
        }
    }
    
    const historyIndex = conversationHistory.findIndex(msg => msg.id === messageId);
    if (historyIndex !== -1) {
        conversationHistory[historyIndex].content = newContent;
    }
    
    promptInput.value = newContent;
    chatForm.dispatchEvent(new Event('submit'));
    editingMessageId = null;
};

window.triggerAIPrompt = (prompt) => {
    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-target="view-ai"]').classList.add('active');
    views.forEach(view => view.classList.remove('active-view'));
    document.getElementById('view-ai').classList.add('active-view');
    
    promptInput.value = prompt;
    chatForm.dispatchEvent(new Event('submit'));
};

newChatBtn.addEventListener('click', () => {
    conversationHistory = [];
    chatHistory.innerHTML = `
        <div class="bot-message message">
            <div class="avatar"><span class="material-symbols-rounded">smart_toy</span></div>
            <div class="chat-content">
                <p data-i18n="aiWelcome">${translations[currentLanguage].aiWelcome}</p>
            </div>
        </div>
    `;
});

clearChatBtn.addEventListener('click', () => {
    if (confirm('Clear all chat history?')) {
        conversationHistory = [];
        chatHistory.innerHTML = `
            <div class="bot-message message">
                <div class="avatar"><span class="material-symbols-rounded">smart_toy</span></div>
                <div class="chat-content">
                    <p data-i18n="aiWelcome">${translations[currentLanguage].aiWelcome}</p>
                </div>
            </div>
        `;
    }
});

// Context Menu Functions
function showUserContextMenu(e, content, messageId) {
    e.preventDefault();
    hideAllContextMenus();
    
    const menu = document.getElementById('user-ctx-menu');
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.classList.remove('hidden');
    
    // Store content and messageId for edit/copy
    menu.dataset.content = content;
    menu.dataset.messageId = messageId;
}

function showBotContextMenu(e, content) {
    e.preventDefault();
    hideAllContextMenus();
    
    const menu = document.getElementById('bot-ctx-menu');
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.classList.remove('hidden');
    
    // Store content for actions
    const chatContent = e.currentTarget.querySelector('.chat-content');
    const textContent = chatContent ? chatContent.innerText : content;
    menu.dataset.content = textContent;
}

function hideAllContextMenus() {
    document.querySelectorAll('.ctx-menu').forEach(menu => menu.classList.add('hidden'));
}

document.addEventListener('click', hideAllContextMenus);

// Context Menu Actions
document.getElementById('ctx-edit-btn').addEventListener('click', () => {
    const menu = document.getElementById('user-ctx-menu');
    const content = menu.dataset.content;
    const messageId = menu.dataset.messageId;
    
    if (messageId) {
        editMessage(parseInt(messageId), content);
    }
    hideAllContextMenus();
});

document.getElementById('ctx-copy-user-btn').addEventListener('click', () => {
    const menu = document.getElementById('user-ctx-menu');
    copyToClipboard(menu.dataset.content);
    hideAllContextMenus();
});

document.getElementById('ctx-copy-bot-btn').addEventListener('click', () => {
    const menu = document.getElementById('bot-ctx-menu');
    copyToClipboard(menu.dataset.content);
    hideAllContextMenus();
});

document.getElementById('ctx-whatsapp-btn').addEventListener('click', () => {
    const menu = document.getElementById('bot-ctx-menu');
    const content = menu.dataset.content;
    const url = `https://wa.me/?text=${encodeURIComponent(content)}`;
    window.open(url, '_blank');
    hideAllContextMenus();
});

document.getElementById('ctx-read-btn').addEventListener('click', () => {
    const menu = document.getElementById('bot-ctx-menu');
    const content = menu.dataset.content;
    readAloud(content);
    hideAllContextMenus();
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!');
    }).catch(err => {
        showToast('Failed to copy');
        console.error('Copy failed:', err);
    });
}

function readAloud(text) {
    // Stop any ongoing speech
    if (currentSpeechUtterance) {
        window.speechSynthesis.cancel();
        currentSpeechUtterance = null;
        showToast('Speech stopped');
        return;
    }
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language based on current app language
        const langMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'hinglish': 'hi-IN',
            'or': 'en-US', // Odia not widely supported, fallback to English
            'zh': 'zh-CN'
        };
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        const desiredLang = langMap[currentLanguage] || 'en-US';
        
        // Find a voice for the desired language
        let voice = voices.find(v => v.lang.includes(desiredLang.split('-')[0]));
        
        if (voice) {
            utterance.voice = voice;
            utterance.lang = desiredLang;
        } else {
            // Fallback to any available voice
            utterance.lang = 'en-US';
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => {
            showToast('Reading aloud...');
        };
        
        utterance.onend = () => {
            currentSpeechUtterance = null;
            showToast('Finished reading');
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            currentSpeechUtterance = null;
            
            // Check if speech synthesis is actually supported
            if (event.error === 'not-supported' || event.error === 'language-not-supported') {
                showToast('Text-to-speech not supported for this language');
            } else {
                showToast('Error reading text');
            }
        };
        
        currentSpeechUtterance = utterance;
        
        try {
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.error('Speech synthesis failed:', error);
            showToast('Speech synthesis failed. Please try a different language.');
        }
    } else {
        showToast('Text-to-speech not supported in your browser');
    }
}

// Initialize speech synthesis voices
if ('speechSynthesis' in window) {
    // Some browsers need this to load voices
    window.speechSynthesis.onvoiceschanged = () => {
        console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
    };
}

// ============================================================
// TIMER FUNCTIONS
// ============================================================
window.openTimerModal = () => {
    document.getElementById('timer-create-modal').style.display = 'flex';
};

window.closeTimerModal = () => {
    document.getElementById('timer-create-modal').style.display = 'none';
};

document.getElementById('add-timer-btn').addEventListener('click', openTimerModal);

// Time increment buttons
document.querySelectorAll('.time-inc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const step = parseInt(btn.dataset.step);
        const input = document.getElementById(targetId);
        let val = parseInt(input.value) || 0;
        val += step;
        if (targetId === 'timer-h-input') {
            val = ((val % 24) + 24) % 24;
        } else {
            val = ((val % 60) + 60) % 60;
        }
        input.value = val;
    });
});

// Quick preset chips
document.querySelectorAll('.timer-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const minutes = parseInt(chip.dataset.m);
        document.getElementById('timer-h-input').value = Math.floor(minutes / 60);
        document.getElementById('timer-m-input').value = minutes % 60;
        document.getElementById('timer-s-input').value = 0;
    });
});

// Start Timer button
document.getElementById('timer-start-btn').addEventListener('click', () => {
    const name = document.getElementById('timer-name-input').value.trim() || 'Kitchen Timer';
    const h = parseInt(document.getElementById('timer-h-input').value) || 0;
    const m = parseInt(document.getElementById('timer-m-input').value) || 0;
    const s = parseInt(document.getElementById('timer-s-input').value) || 0;
    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds <= 0) {
        showToast('Please set a time greater than 0');
        return;
    }
    const id = Date.now();
    timers.push({ id, name, totalSeconds, timeLeft: totalSeconds, isRunning: true, isPaused: false, animationFrame: null, lastTime: Date.now() });
    closeTimerModal();
    renderTimers();
    const timer = timers.find(t => t.id === id);
    if (timer) runTimerAnimation(timer);
});

function renderTimers() {
    const container = document.getElementById('timers-container');
    container.innerHTML = '';
    if (timers.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--text-sub); padding:40px;" data-i18n="noTimers">${translations[currentLanguage].noTimers}</p>`;
        return;
    }
    timers.forEach(t => {
        const hours = Math.floor(t.timeLeft / 3600);
        const minutes = Math.floor((t.timeLeft % 3600) / 60);
        const seconds = (t.timeLeft % 60);

        let displayTime = '';
        if (hours > 0) {
            displayTime = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
        } else {
            displayTime = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
        }

        const progress = (t.timeLeft / t.totalSeconds) * 100;
        const el = document.createElement('div');
        el.className = 'timer-card';
        el.innerHTML = `
            <div class="timer-info">
                <h3 class="timer-name">${t.name}</h3>
                <div class="timer-display">${displayTime}</div>
            </div>
            <div class="timer-progress-ring">
                <svg width="80" height="80">
                    <circle class="progress-ring-bg" cx="40" cy="40" r="35"></circle>
                    <circle class="progress-ring-circle" cx="40" cy="40" r="35" style="stroke-dashoffset: ${220 - (220 * progress / 100)}"></circle>
                </svg>
                <div class="timer-icon"><span class="material-symbols-rounded">${t.isRunning ? 'timer' : 'timer_off'}</span></div>
            </div>
            <div class="timer-controls">
                <button class="timer-btn" onclick="toggleTimer(${t.id})"><span class="material-symbols-rounded">${t.isRunning ? 'pause' : 'play_arrow'}</span></button>
                <button class="timer-btn" onclick="resetTimer(${t.id})"><span class="material-symbols-rounded">restart_alt</span></button>
                <button class="timer-btn delete" onclick="deleteTimer(${t.id})"><span class="material-symbols-rounded">delete</span></button>
            </div>
        `;
        container.appendChild(el);
    });
}

window.toggleTimer = (id) => {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;
    if (timer.isRunning) {
        timer.isRunning = false;
        if (timer.animationFrame) cancelAnimationFrame(timer.animationFrame);
    } else {
        timer.isRunning = true;
        timer.lastTime = Date.now();
        runTimerAnimation(timer);
    }
    renderTimers();
};

function runTimerAnimation(timer) {
    if (!timer.isRunning) return;
    const now = Date.now();
    const elapsed = (now - timer.lastTime) / 1000;
    if (elapsed >= 1) {
        timer.timeLeft = Math.max(0, timer.timeLeft - Math.floor(elapsed));
        timer.lastTime = now;
        renderTimers();
        if (timer.timeLeft <= 0) {
            timer.isRunning = false;
            alarmPresets[selectedAlarm].play();
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 200]);
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('⏰ Timer Finished!', { body: `${timer.name} is complete!` });
            } else {
                showToast(`⏰ ${timer.name} is done!`);
            }
            return;
        }
    }
    timer.animationFrame = requestAnimationFrame(() => runTimerAnimation(timer));
}

window.resetTimer = (id) => {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;
    if (timer.animationFrame) cancelAnimationFrame(timer.animationFrame);
    timer.timeLeft = timer.totalSeconds;
    timer.isRunning = false;
    renderTimers();
};

window.deleteTimer = (id) => {
    const timer = timers.find(t => t.id === id);
    if (timer?.animationFrame) cancelAnimationFrame(timer.animationFrame);
    timers = timers.filter(t => t.id !== id);
    renderTimers();
};

// ============================================================
// AUTH
// ============================================================
// Wait for DOM to be fully loaded before attaching event listeners 

// ============================================================
// AUTH & INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECT ELEMENTS INSIDE DOMContentLoaded
    const authContainer = document.getElementById('auth-container');
    const profileContainer = document.getElementById('user-profile-container');
    const authEmail = document.getElementById('auth-email');
    const authPass = document.getElementById('auth-password');
    const authActionBtn = document.getElementById('auth-action-btn');
    const authSwitchBtn = document.getElementById('auth-switch-btn');
    const authError = document.getElementById('auth-error');
    const loginNotice = document.getElementById('login-notice');

    // 2. AUTH UI EVENT LISTENERS
    if (authSwitchBtn) {
        authSwitchBtn.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            document.getElementById('auth-title').innerText = isLoginMode ? translations[currentLanguage].login : translations[currentLanguage].signUp;
            authActionBtn.innerText = isLoginMode ? translations[currentLanguage].login : translations[currentLanguage].signUp;
            document.getElementById('auth-switch-text').innerText = isLoginMode ? translations[currentLanguage].noAccount : "Already have an account?";
            authSwitchBtn.innerText = isLoginMode ? translations[currentLanguage].signUp : translations[currentLanguage].login;
            authError.innerText = '';
        });
    }

    if (authActionBtn) {
        authActionBtn.addEventListener('click', async () => {
            const email = authEmail.value;
            const pass = authPass.value;
            authError.innerText = '';
            
            if(!email || !pass) {
                authError.innerText = "Please enter both email and password";
                return;
            }

            try {
                if(isLoginMode) {
                    await signInWithEmailAndPassword(auth, email, pass);
                } else {
                    await createUserWithEmailAndPassword(auth, email, pass);
                }
            } catch (err) {
                // Friendly error messages
                let msg = err.message.replace('Firebase: ', '');
                if(msg.includes('auth/invalid-email')) msg = "Invalid email address.";
                if(msg.includes('auth/wrong-password')) msg = "Incorrect password.";
                if(msg.includes('auth/user-not-found')) msg = "User not found.";
                authError.innerText = msg;
            }
        });
    }

    // 3. FIREBASE AUTH OBSERVER (Moved INSIDE DOMContentLoaded)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            if(authContainer) authContainer.classList.add('hidden');
            if(profileContainer) profileContainer.classList.remove('hidden');
            
            if(document.getElementById('user-email-display')) {
                document.getElementById('user-email-display').innerText = user.email;
            }
            
            loadProfilePicture(user);
            
            if (loginNotice) loginNotice.style.display = 'none';
        } else {
            // User is signed out
            if(authContainer) authContainer.classList.remove('hidden');
            if(profileContainer) profileContainer.classList.add('hidden');
            
            if (loginNotice) loginNotice.style.display = 'flex';
        }
    });
});

// Window Load Initialization
window.addEventListener('load', () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    updatePageLanguage();
    
    // Smooth loading animation
    Promise.all([
        document.fonts.ready,
        new Promise(resolve => {
            // Check if Material Symbols font is loaded by measuring a test icon
            const checkIcon = () => {
                const testEl = document.createElement('span');
                testEl.className = 'material-symbols-rounded';
                testEl.textContent = 'home';
                testEl.style.position = 'absolute';
                testEl.style.visibility = 'hidden';
                document.body.appendChild(testEl);
                
                const width = testEl.offsetWidth;
                document.body.removeChild(testEl);
                
                if (width > 0) { // Font loaded and has width
                    resolve();
                } else {
                    setTimeout(checkIcon, 50);
                }
            };
            checkIcon();
        })
    ]).then(() => {
        document.body.classList.remove('app-loading');
        document.body.classList.add('app-ready');
    }).catch(() => {
        // Fallback if fonts take too long
        setTimeout(() => {
            document.body.classList.remove('app-loading');
            document.body.classList.add('app-ready');
        }, 500);
    });
});

// Global Logout function
window.handleLogout = () => signOut(auth);

// Render initial recipes
renderRecipes();





// --- UPDATED: Glitch-Free Typewriter Function ---
function typeWriter(element, html, speed = 10) {
    // Agar speed 0 hai, toh turant pura dikhao
    if (speed === 0) {
        element.innerHTML = html;
        if (window.twemoji) window.twemoji.parse(element);
        return;
    }

    let i = 0;
    let buffer = "";
    element.innerHTML = ""; 
    
    // Ek temporary hidden element banate hain emoji convert karne ke liye
    const tempDiv = document.createElement('div');

    function type() {
        if (i >= html.length) {
            // Safety ke liye last mein ek baar aur chala sakte hain, par zaroori nahi
            return; 
        }
        
        let char = html.charAt(i);
        let contentToAdd = char; // By default hum character add karenge
        let charLength = 1;      // Kitne steps aage badhna hai

        // 1. HTML Tags Skip Logic
        if (char === '<') {
            let tag = '';
            let tempIndex = i;
            while (tempIndex < html.length && html.charAt(tempIndex) !== '>') {
                tag += html.charAt(tempIndex);
                tempIndex++;
            }
            tag += '>'; 
            contentToAdd = tag;
            charLength = tag.length; // Pura tag skip karo
        } 
        
        // 2. EMOJI LOGIC (Magic Yahan Hai)
        // Check karte hain agar yeh Emoji ka pehla hissa hai
        else if (html.charCodeAt(i) >= 0xD800 && html.charCodeAt(i) <= 0xDBFF) {
            // Pura emoji nikalo (2 characters)
            const emojiChar = html.charAt(i) + html.charAt(i + 1);
            
            // --- TRICK START ---
            // Hum is emoji ko ek nakli div mein dalte hain
            tempDiv.innerText = emojiChar;
            
            // Twemoji se kehte hain ki is nakli div ko convert kar do
            if (window.twemoji) {
                window.twemoji.parse(tempDiv);
                // Ab hum text nahi, balki bani banayi <img> tag uthayenge
                contentToAdd = tempDiv.innerHTML;
            } else {
                contentToAdd = emojiChar;
            }
            // --- TRICK END ---

            charLength = 2; // Emoji 2 characters ka hota hai
        }
        
        // Buffer mein add karo (Ab agar emoji tha, toh seedha Image tag add hoga)
        buffer += contentToAdd;
        i += charLength;
        
        element.innerHTML = buffer; 
        
        setTimeout(type, speed); 
    }
    
    type();
}
