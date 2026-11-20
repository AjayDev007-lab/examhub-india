export type Language = "en" | "ta" | "hi" | "ml" | "kn" | "te";

export interface Translations {
  portalName: string;
  tagline: string;
  officialDisclaimer: string;
  checkResults: string;
  hallTickets: string;
  idCards: string;
  officialWebsites: string;
  aiAssistant: string;
  institutionPortal: string;
  adminPortal: string;
  studentLogin: string;
  register: string;
  dashboard: string;
  searchPlaceholder: string;
  verifiedOnly: string;
  allStates: string;
  allCategories: string;
  visitOfficial: string;
  applyOtr: string;
  authorityInfo: string;
  reportIssue: string;
  testPing: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    portalName: "EXAMHUB INDIA",
    tagline: "All Examination Documents and Official Portals in One Place",
    officialDisclaimer: "ExamHub India is an independent examination information platform and is not affiliated with any government department unless stated.",
    checkResults: "Check Results",
    hallTickets: "Hall Tickets",
    idCards: "Student ID Cards",
    officialWebsites: "Official Portals",
    aiAssistant: "AI Assistant",
    institutionPortal: "Institution Portal",
    adminPortal: "Admin Portal",
    studentLogin: "Student Login",
    register: "Register",
    dashboard: "My Dashboard",
    searchPlaceholder: "Search by authority, exam, or official domain...",
    verifiedOnly: "Verified Only",
    allStates: "All States & Union Territories",
    allCategories: "All Categories",
    visitOfficial: "Visit Official",
    applyOtr: "Apply / OTR",
    authorityInfo: "Authority Info",
    reportIssue: "Report Issue",
    testPing: "Test Server Health"
  },
  ta: {
    portalName: "எக்ஸாம்ஹப் இந்தியா",
    tagline: "அனைத்து தேர்வு ஆவணங்கள் மற்றும் அதிகாரப்பூர்வ தளங்கள் ஒரே இடத்தில்",
    officialDisclaimer: "எக்ஸாம்ஹப் இந்தியா ஒரு சுயாதீன தேர்வு தகவல் தளம். இது எந்தவொரு அரசு துறையுடனும் இணைக்கப்படவில்லை.",
    checkResults: "தேர்வு முடிவுகள்",
    hallTickets: "நுழைவுச்சீட்டு / ஹால் டிக்கெட்",
    idCards: "மாணவர் அடையாள அட்டை",
    officialWebsites: "அதிகாரப்பூர்வ தளங்கள்",
    aiAssistant: "AI உதவியாளர்",
    institutionPortal: "நிறுவன போர்டல்",
    adminPortal: "நிர்வாக போர்டல்",
    studentLogin: "மாணவர் உள்நுழைவு",
    register: "பதிவு செய்க",
    dashboard: "என் டாஷ்போர்டு",
    searchPlaceholder: "துறை, தேர்வு அல்லது வலைத்தளத்தைத் தேடுங்கள்...",
    verifiedOnly: "சரிபார்க்கப்பட்டது மட்டும்",
    allStates: "அனைத்து மாநிலங்கள் & யூனியன் பிரதேசங்கள்",
    allCategories: "அனைத்து பிரிவுகள்",
    visitOfficial: "அதிகாரப்பூர்வ தளத்திற்கு செல்",
    applyOtr: "விண்ணப்பிக்க / OTR",
    authorityInfo: "துறை தகவல்",
    reportIssue: "சிக்கலை புகாரளி",
    testPing: "இணைப்பைச் சோதிக்க"
  },
  hi: {
    portalName: "एग्जामहब इंडिया",
    tagline: "सभी परीक्षा दस्तावेज एवं आधिकारिक पोर्टल एक ही स्थान पर",
    officialDisclaimer: "एग्जामहब इंडिया एक स्वतंत्र परीक्षा सूचना पोर्टल है और यह किसी भी सरकारी विभाग से संबद्ध नहीं है।",
    checkResults: "परीक्षा परिणाम",
    hallTickets: "प्रवेश पत्र / हॉल टिकट",
    idCards: "छात्र पहचान पत्र",
    officialWebsites: "आधिकारिक पोर्टल",
    aiAssistant: "एआई सहायक",
    institutionPortal: "संस्थान पोर्टल",
    adminPortal: "व्यवस्थापक पोर्टल",
    studentLogin: "छात्र लॉगिन",
    register: "पंजीकरण",
    dashboard: "मेरा डैशबोर्ड",
    searchPlaceholder: "प्राधिकरण, परीक्षा या डोमेन खोजें...",
    verifiedOnly: "केवल सत्यापित",
    allStates: "सभी राज्य एवं केंद्र शासित प्रदेश",
    allCategories: "सभी श्रेणियां",
    visitOfficial: "आधिकारिक साइट पर जाएं",
    applyOtr: "आवेदन / ओटीआर",
    authorityInfo: "प्राधिकरण जानकारी",
    reportIssue: "समस्या की रिपोर्ट करें",
    testPing: "सर्वर पिंग टेस्ट"
  },
  ml: {
    portalName: "എക്സാംഹബ് ഇന്ത്യ",
    tagline: "എല്ലാ പരീക്ഷാ രേഖകളും ഔദ്യോഗിക പോർട്ടലുകളും ഒരിടത്ത്",
    officialDisclaimer: "എക്സാംഹബ് ഇന്ത്യ ഒരു സ്വതന്ത്ര പരീക്ഷാ വിവര പ്ലാറ്റ്‌ഫോമാണ്, ഇത് ഒരു സർക്കാർ വകുപ്പുമായും അഫിലിയേറ്റ് ചെയ്തിട്ടില്ല.",
    checkResults: "പരീക്ഷാ ഫലങ്ങൾ",
    hallTickets: "ഹാൾ ടിക്കറ്റ്",
    idCards: "വിദ്യാർത്ഥി ഐഡി കാർഡുകൾ",
    officialWebsites: "ഔദ്യോഗിക പോർട്ടലുകൾ",
    aiAssistant: "AI സഹായി",
    institutionPortal: "ഇൻസ്റ്റിറ്റ്യൂഷൻ പോർട്ടൽ",
    adminPortal: "അഡ്മിൻ പോർട്ടൽ",
    studentLogin: "വിദ്യാർത്ഥി ലോഗിൻ",
    register: "രജിസ്റ്റർ ചെയ്യുക",
    dashboard: "എന്റെ ഡാഷ്‌ബോർഡ്",
    searchPlaceholder: "അതോറിറ്റി, പരീക്ഷ അല്ലെങ്കിൽ വെബ്സൈറ്റ് തിരയുക...",
    verifiedOnly: "സ്ഥിരീകരിച്ചവ മാത്രം",
    allStates: "എല്ലാ സംസ്ഥാനങ്ങളും കേന്ദ്രഭരണ പ്രദേശങ്ങളും",
    allCategories: "എല്ലാ വിഭാഗങ്ങളും",
    visitOfficial: "ഔദ്യോഗിക സൈറ്റ് സന്ദർശിക്കുക",
    applyOtr: "അപേക്ഷിക്കുക / OTR",
    authorityInfo: "വിവരങ്ങൾ",
    reportIssue: "റിപ്പോർട്ട് ചെയ്യുക",
    testPing: "കണക്ഷൻ പരിശോധിക്കുക"
  },
  kn: {
    portalName: "ಎಕ್ಸಾಮ್‌ಹಬ್ ಇಂಡಿಯಾ",
    tagline: "ಎಲ್ಲಾ ಪರೀಕ್ಷಾ ದಾಖಲೆಗಳು ಮತ್ತು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ",
    officialDisclaimer: "ಎಕ್ಸಾಮ್‌ಹಬ್ ಇಂಡಿಯಾ ಸ್ವತಂತ್ರ ಪರೀಕ್ಷಾ ಮಾಹಿತಿ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಆಗಿದೆ ಮತ್ತು ಯಾವುದೇ ಸರ್ಕಾರಿ ಇಲಾಖೆಗೆ ಸಂಯೋಜಿತವಾಗಿಲ್ಲ.",
    checkResults: "ಫಲಿತಾಂಶಗಳು",
    hallTickets: "ಹಾಲ್ ಟಿಕೆಟ್",
    idCards: "ವಿದ್ಯಾರ್ಥಿ ಗುರುತಿನ ಚೀಟಿ",
    officialWebsites: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳು",
    aiAssistant: "AI ಸಹಾಯಕ",
    institutionPortal: "ಸಂಸ್ಥೆಯ ಪೋರ್ಟಲ್",
    adminPortal: "ನಿರ್ವಾಹಕ ಪೋರ್ಟಲ್",
    studentLogin: "ವಿದ್ಯಾರ್ಥಿ ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    dashboard: "ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    searchPlaceholder: "ಪ್ರಾಧಿಕಾರ, ಪರೀಕ್ಷೆ ಅಥವಾ ಡೊಮೇನ್ ಹುಡುಕಿ...",
    verifiedOnly: "ಪರಿಶೀಲಿಸಿದವು ಮಾತ್ರ",
    allStates: "ಎಲ್ಲಾ ರಾಜ್ಯಗಳು ಮತ್ತು ಕೇಂದ್ರಾಡಳಿತ ಪ್ರದೇಶಗಳು",
    allCategories: "ಎಲ್ಲಾ ವಿಭಾಗಗಳು",
    visitOfficial: "ಅಧಿಕೃತ ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ",
    applyOtr: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ / OTR",
    authorityInfo: "ಪ್ರಾಧಿಕಾರ ಮಾಹಿತಿ",
    reportIssue: "ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ",
    testPing: "ಸಂಪರ್ಕ ಪರೀಕ್ಷೆ"
  },
  te: {
    portalName: "ఎగ్జామ్‌హబ్ ఇండియా",
    tagline: "అన్ని పరీక్ష పత్రాలు మరియు అధికారిక పోర్టల్‌లు ఒకే చోట",
    officialDisclaimer: "ఎగ్జామ్‌హబ్ ఇండియా ఒక స్వతంత్ర పరీక్ష సమాచార వేదిక మరియు ప్రభుత్వ విభాగాలతో అనుబంధించబడలేదు.",
    checkResults: "పరీక్ష ఫలితాలు",
    hallTickets: "హాల్ టికెట్",
    idCards: "విద్యార్థి గుర్తింపు కార్డు",
    officialWebsites: "అధికారిక పోర్టల్స్",
    aiAssistant: "AI సహాయకుడు",
    institutionPortal: "సంస్థ పోర్టల్",
    adminPortal: "అడ్మిన్ పోర్టల్",
    studentLogin: "విద్యార్థి లాగిన్",
    register: "నమోదు చేసుకోండి",
    dashboard: "నా డ్యాష్‌బోర్డ్",
    searchPlaceholder: "అధికారం, పరీక్ష లేదా డొమైన్ శోధించండి...",
    verifiedOnly: "ధృవీకరించబడినవి మాత్రమే",
    allStates: "అన్ని రాష్ట్రాలు & కేంద్రపాలిత ప్రాంతాలు",
    allCategories: "అన్ని వర్గాలు",
    visitOfficial: "అధికారిక సైట్‌ను సందర్శించండి",
    applyOtr: "దరఖాస్తు చేసుకోండి / OTR",
    authorityInfo: "సమాచారం",
    reportIssue: "సమస్యను నివేదించండి",
    testPing: "కనెక్షన్‌ని పరీక్షించండి"
  }
};
