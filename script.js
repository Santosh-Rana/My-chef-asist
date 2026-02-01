// Import Firebase Modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
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

const API_PART_1 = "sk-or-v1-505ca83a270b6ef6b203509ed7f643147";
const API_PART_2 = "7a29a93b7c0649c78bcc36c55c8218a";
const AI_MODEL = "tngtech/deepseek-r1t2-chimera:free";
const IMAGE_MODEL = "black-forest-labs/flux-schnell:free";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

let conversationHistory = [];
let timers = [];
let isLoginMode = true;
let currentLanguage = localStorage.getItem('appLanguage') || 'en';
let currentSpeechUtterance = null;

const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const themeToggle = document.getElementById('theme-toggle');
const languageToggle = document.getElementById('language-toggle');

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
        trendingNow: "Trending Now",
        aiChef: "AI Chef",
        aiWelcome: "Hello! I'm Chef Master AI. I can help you with recipes, ingredients, or cooking tips. Ask me anything! 🍲",
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
        contactPrivacyText: "If you have questions about this Privacy Policy, please contact us at ranasantosh3741@gmail.com or call +91 78550 91829."
    },
    hi: {
        welcome: "नमस्ते, शेफ! 👨‍🍳",
        whatCooking: "आज हम क्या पका रहे हैं?",
        quickActions: "त्वरित क्रियाएँ",
        healthyBreakfast: "स्वस्थ नाश्ता",
        quickDinner: "15-मिनट डिनर",
        paneerSpecial: "पनीर स्पेशल",
        chocolateDessert: "चॉकलेट मिठाई",
        trendingNow: "अभी ट्रेंडिंग",
        aiChef: "AI शेफ",
        aiWelcome: "नमस्ते! मैं शेफ मास्टर AI हूं। मैं व्यंजनों, सामग्री या खाना पकाने के टिप्स में आपकी मदद कर सकता हूं। मुझसे कुछ भी पूछें! 🍲",
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
        contactPrivacyText: "यदि इस गोपनीयता नीति के बारे में आपके कोई प्रश्न हैं, तो कृपया हमसे ranasantosh3741@gmail.com पर संपर्क करें या +91 78550 91829 पर कॉल करें।"
    },
    hinglish: {
        welcome: "Hello, Chef! 👨‍🍳",
        whatCooking: "Aaj hum kya bana rahe hain?",
        quickActions: "Quick Actions",
        healthyBreakfast: "Healthy Breakfast",
        quickDinner: "15-min Dinner",
        paneerSpecial: "Paneer Special",
        chocolateDessert: "Chocolate Dessert",
        trendingNow: "Trending Now",
        aiChef: "AI Chef",
        aiWelcome: "Hello! Main Chef Master AI hun. Main aapko recipes, ingredients ya cooking tips mein help kar sakta hun. Mujhse kuch bhi puchiye! 🍲",
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
        contactPrivacyText: "Agar is Privacy Policy ke baare mein aapke koi questions hain, toh please humse ranasantosh3741@gmail.com par contact karein ya +91 78550 91829 par call karein."
    },
    or: {
        welcome: "ନମସ୍କାର, ରୋଷେୟା! 👨‍🍳",
        whatCooking: "ଆଜି ଆମେ କ'ଣ ରାନ୍ଧୁଛୁ?",
        quickActions: "ଶୀଘ୍ର କାର୍ଯ୍ୟ",
        healthyBreakfast: "ସୁସ୍ଥ ଜଳଖିଆ",
        quickDinner: "15-ମିନିଟ୍ ରାତ୍ରୀ ଭୋଜନ",
        paneerSpecial: "ପନୀର ସ୍ପେଶାଲ",
        chocolateDessert: "ଚକୋଲେଟ୍ ମିଠା",
        trendingNow: "ବର୍ତ୍ତମାନ ଟ୍ରେଣ୍ଡିଂ",
        aiChef: "AI ରୋଷେୟା",
        aiWelcome: "ନମସ୍କାର! ମୁଁ ଶେଫ୍ ମାଷ୍ଟର AI। ମୁଁ ରେସିପି, ସାମଗ୍ରୀ କିମ୍ବା ରନ୍ଧନ ଟିପ୍ସରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି। ମୋତେ କିଛି ପଚାରନ୍ତୁ! 🍲",
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
        contactPrivacyText: "ଯଦି ଏହି ଗୋପନୀୟତା ନୀତି ବିଷୟରେ ଆପଣଙ୍କର କୌଣସି ପ୍ରଶ୍ନ ଅଛି, ଦୟାକରି ranasantosh3741@gmail.com ରେ ଆମ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ କିମ୍ବା +91 78550 91829 ରେ କଲ୍ କରନ୍ତୁ।"
    },
    zh: {
        welcome: "你好，厨师！👨‍🍳",
        whatCooking: "今天我们做什么菜？",
        quickActions: "快速操作",
        healthyBreakfast: "健康早餐",
        quickDinner: "15分钟晚餐",
        paneerSpecial: "奶酪特色菜",
        chocolateDessert: "巧克力甜点",
        trendingNow: "现在流行",
        aiChef: "AI厨师",
        aiWelcome: "你好！我是Chef Master AI。我可以帮助您制作食谱、配料或烹饪技巧。问我任何问题！🍲",
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
        contactPrivacyText: "如果您对本隐私政策有任何疑问，请通过ranasantosh3741@gmail.com与我们联系或拨打+91 78550 91829。"
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

// Language Toggle
languageToggle.addEventListener('click', () => {
    openLanguageSettings();
});

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
    default: {
        light: { '--primary': '#6750A4', '--primary-container': '#EADDFF', '--secondary': '#625B71' },
        dark: { '--primary': '#D0BCFF', '--primary-container': '#4F378B', '--secondary': '#CCC2DC' }
    },
    warm: {
        light: { '--primary': '#C4314B', '--primary-container': '#FFD9E2', '--secondary': '#775652' },
        dark: { '--primary': '#FFB1C8', '--primary-container': '#8C3249', '--secondary': '#E7BDB6' }
    },
    green: {
        light: { '--primary': '#006E26', '--primary-container': '#97F991', '--secondary': '#526350' },
        dark: { '--primary': '#7BDC76', '--primary-container': '#005313', '--secondary': '#B8CCB5' }
    },
    orange: {
        light: { '--primary': '#825500', '--primary-container': '#FFDDB3', '--secondary': '#6F5B40' },
        dark: { '--primary': '#FFB951', '--primary-container': '#633F00', '--secondary': '#E3C2A2' }
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
function loadProfilePicture(user) {
    if (!user) return;
    
    const savedPic = localStorage.getItem(`profilePic_${user.uid}`);
    if (savedPic) {
        const profilePicPreview = document.getElementById('profile-pic-preview');
        const profileIcon = document.querySelector('.profile-avatar .material-symbols-rounded');
        
        if (profilePicPreview) {
            profilePicPreview.src = savedPic;
            profilePicPreview.classList.remove('hidden');
            profilePicPreview.style.display = 'block';
        }
        
        if (profileIcon) {
            profileIcon.style.display = 'none';
        }
    }
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
    { name: "Butter Chicken", img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300", time: "45 min", filter: "non-veg" },
    { name: "Paneer Tikka", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300", time: "30 min", filter: "veg" },
    { name: "Gulab Jamun", img: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=300", time: "60 min", filter: "sweet" },
    { name: "Biryani", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300", time: "90 min", filter: "non-veg" },
    { name: "Dal Makhani", img: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=300", time: "120 min", filter: "veg" },
    { name: "Rasmalai", img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300", time: "90 min", filter: "sweet" }
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
    
    // Render in recipes tab
    const recipeList = document.getElementById('recipe-list-container');
    recipeList.innerHTML = '';
    trendingRecipes.forEach(recipe => {
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
    promptInput.value = `How to make ${recipeName}? Give me the complete recipe with ingredients and step-by-step instructions.`;
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
// AI CHAT WITH IMAGE GENERATION
// ============================================================
const chatForm = document.getElementById('chat-form');
const promptInput = document.getElementById('prompt-input');
const chatHistory = document.getElementById('chat-history');
const newChatBtn = document.getElementById('new-chat-btn');
const clearChatBtn = document.getElementById('clear-chat-btn');

// इस पूरे कोड ब्लॉक को script.js में ढूंढें (chatForm.addEventListener) और इससे बदल दें
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = promptInput.value.trim();
    if (!userMessage) return;
    
    addMessage('user', userMessage);
    promptInput.value = '';
    
    // Skeleton Loading दिखाएं
    const botMsgDiv = addMessage('bot', `
        <div class="skeleton-loading">
            <div class="skeleton-image"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
        </div>
    `);
    
    try {
        // हम मानकर चलेंगे कि यूजर खाने के बारे में ही बात कर रहा है
        // डिश का नाम निकालने की कोशिश करें (अगर यूजर ने "Make Biryani" लिखा है या सिर्फ "Biryani")
        const dishName = extractDishName(userMessage);
        
        // इमेज जनरेट करें (नये फंक्शन के साथ)
        const imageUrl = await generateDishImage(dishName);
        
        // AI के लिए सख्त निर्देश (System Prompt)
        // यह AI को बताएगा कि अगर डिश का नाम मिले, तो सिर्फ रेसिपी ही देनी है
        const systemPrompt = `You are Chef Master AI. 
        CRITICAL INSTRUCTION: If the user sends a name of a dish (e.g., "Biryani", "Paneer", "Cake"), do NOT just describe it. 
        You MUST provide the COMPLETE RECIPE immediately.
        
        Format your response exactly like this:
        ## 🥘 ${dishName}
        
        **Description:**
        (A very short 1-line description)

        **🛒 Ingredients:**
        * (List ingredients with quantities)

        **👩‍🍳 Step-by-Step Instructions:**
        1. (Step 1)
        2. (Step 2...)
        
        **💡 Chef's Tips:**
        * (One pro tip)
        
        Current User Input: "${userMessage}"
        If the input is NOT a food item (like "Hello"), just chat normally.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ];
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_PART_1}${API_PART_2}`
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: messages
            })
        });
        
        const data = await response.json();
        const botReply = data.choices[0].message.content;
        
        // इमेज और टेक्स्ट को जोड़ें
        let htmlContent = '';
        if (imageUrl) {
            htmlContent += `<div class="recipe-image-container">
                <img src="${imageUrl}" alt="${dishName}" loading="lazy" style="width:100%; border-radius:12px;">
            </div>`;
        }
        
        // Markdown को HTML में बदलें
        htmlContent += marked.parse(botReply);
        
        botMsgDiv.querySelector('.chat-content').innerHTML = htmlContent;
        
        // हिस्ट्री में सेव करें
        conversationHistory.push({ role: 'user', content: userMessage });
        conversationHistory.push({ role: 'assistant', content: botReply });

    } catch (err) {
        console.error(err);
        botMsgDiv.querySelector('.chat-content').innerHTML = `<p style="color:#ff4d4d;">Error: ${err.message}. Please try again.</p>`;
    }
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
});

function extractDishName(userMessage) {
    // Simple extraction - can be improved
    const message = userMessage.toLowerCase();
    const words = message.split(' ');
    
    // Try to find dish name after common keywords
    const keywords = ['recipe for', 'make', 'cook', 'prepare', 'how to make', 'how to cook'];
    for (const keyword of keywords) {
        if (message.includes(keyword)) {
            const index = message.indexOf(keyword);
            const afterKeyword = message.substring(index + keyword.length).trim();
            return afterKeyword.split(/[,.\?!]/)[0].trim();
        }
    }
    
    // Fallback: return the whole message
    return userMessage;
}

// इस फंक्शन को script.js में रिप्लेस करें
async function generateDishImage(dishName) {
    // हम Pollinations AI का उपयोग करेंगे जो फ्री है और किसी API Key की जरूरत नहीं है
    // यह डिश के नाम के आधार पर तुरंत इमेज जनरेट करता है
    const encodedDish = encodeURIComponent(dishName + " delicious food photography high quality 4k");
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedDish}?width=800&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
    
    // इमेज प्रीलोड करें ताकि यूजर को तुरंत दिखे
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => resolve(imageUrl); // अगर एरर भी आए तो URL return करें
        img.src = imageUrl;
    });
}

function addMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}-message`;
    
    if (role === 'user') {
        msgDiv.innerHTML = `<div class="user-bubble">${content}</div>`;
        msgDiv.addEventListener('contextmenu', (e) => showUserContextMenu(e, content));
    } else {
        msgDiv.innerHTML = `
            <div class="avatar"><span class="material-symbols-rounded">smart_toy</span></div>
            <div class="chat-content">${content}</div>
        `;
        msgDiv.addEventListener('contextmenu', (e) => showBotContextMenu(e, content));
    }
    
    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
    return msgDiv;
}

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
function showUserContextMenu(e, content) {
    e.preventDefault();
    hideAllContextMenus();
    
    const menu = document.getElementById('user-ctx-menu');
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.classList.remove('hidden');
    
    // Store content for edit/copy
    menu.dataset.content = content;
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
    promptInput.value = content;
    promptInput.focus();
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
        utterance.lang = langMap[currentLanguage] || 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onend = () => {
            currentSpeechUtterance = null;
            showToast('Finished reading');
        };
        
        utterance.onerror = () => {
            currentSpeechUtterance = null;
            showToast('Error reading text');
        };
        
        currentSpeechUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        showToast('Reading aloud...');
    } else {
        showToast('Text-to-speech not supported');
    }
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
const authContainer = document.getElementById('auth-container');
const profileContainer = document.getElementById('user-profile-container');
const authEmail = document.getElementById('auth-email');
const authPass = document.getElementById('auth-password');
const authActionBtn = document.getElementById('auth-action-btn');
const authSwitchBtn = document.getElementById('auth-switch-btn');
const authError = document.getElementById('auth-error');

authSwitchBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? translations[currentLanguage].login : translations[currentLanguage].signUp;
    authActionBtn.innerText = isLoginMode ? translations[currentLanguage].login : translations[currentLanguage].signUp;
    document.getElementById('auth-switch-text').innerText = isLoginMode ? translations[currentLanguage].noAccount : "Already have an account?";
    authSwitchBtn.innerText = isLoginMode ? translations[currentLanguage].signUp : translations[currentLanguage].login;
    authError.innerText = '';
});

authActionBtn.addEventListener('click', async () => {
    const email = authEmail.value;
    const pass = authPass.value;
    authError.innerText = '';
    try {
        if(isLoginMode) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            await createUserWithEmailAndPassword(auth, email, pass);
        }
    } catch (err) {
        authError.innerText = err.message.replace('Firebase: ', '');
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        authContainer.classList.add('hidden');
        profileContainer.classList.remove('hidden');
        document.getElementById('user-email-display').innerText = user.email;
        loadProfilePicture(user);
    } else {
        authContainer.classList.remove('hidden');
        profileContainer.classList.add('hidden');
    }
});

window.handleLogout = () => signOut(auth);

window.addEventListener('load', () => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    updatePageLanguage();
});

renderRecipes();