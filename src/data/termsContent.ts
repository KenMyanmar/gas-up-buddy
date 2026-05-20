export type Lang = "en" | "mm";

export const termsPreamble: Record<Lang, string> = {
  en: `These "Terms and Conditions" are set for user ("User" "You" "Your" "Yours") who are going to use 8484Gas ("Mini App") or Merchant ("8484Gas") in KBZPay App. Those who use 8484Gas (Mini App) shall follow the rules in these Terms and Conditions. By accessing 8484Gas (Mini App) and obtaining the 8484Gas (Mini App) service, it is considered that users have read, understood and accepted the Terms and Conditions, including the policies and additional Terms and Conditions available on 8484Gas (Mini App) or available by hyperlink. In the case of directly or indirectly harming users' interests including users' personal information due to ignorance of users in registering to get this service, 8484Gas (Mini App) Payment Agency of KBZ Bank (KBZPay) and its members shall not be held to any liability. Terms and Conditions to get 8484Gas (Mini App) service are as follows:`,
  mm: `ဤ "စည်းမျဥ်းစည်းကမ်း သတ်မှတ်ချက်များ" သည် KBZPay App ရှိ ကုန်သည် ("8484Gas") ၏ 8484Gas ("Mini App") ကို ဝင်ရောက်အသုံးပြုမည့် အသုံးပြုသူ ("သင်"၊ "သင့်"၊ "သင်၏"၊ "သင်တို့၏") မှ လိုက်နာရမည့် စည်းမျဉ်းစည်းကမ်း သတ်မှတ်ချက်များဖြစ်ပါသည်။ 8484Gas (Mini App) ကို ရယူအသုံးပြုသူများအနေဖြင့် ဤ စည်းမျဉ်းစည်းကမ်း သတ်မှတ်ချက်များအတိုင်း လိုက်နာရမည်ဖြစ်ပါသည်။ KBZPay Blue App တွင် ရှိသော 8484Gas (Mini App) ကို ဝင်ရောက်အသုံးပြု၍ 8484Gas (Mini App) ဝန်ဆောင်မှုကို ရယူ အသုံးပြုသူများသည် Mini App တွင်ရရှိနိုင်သော သို့မဟုတ် ဟိုက်ပါလင့်ခ်ဖြင့် ရရှိနိုင်သော မူဝါဒများနှင့် ထပ်မံဖြည့်စွက်ထားသော စည်းမျဥ်းစည်းကမ်းသတ်မှတ်ချက်များအပါအဝင် စည်းကမ်းသတ်မှတ်ချက်များကို ဖတ်ရှုနားလည်၍ သဘောတူလက်ခံခြင်းဖြစ်သည်။ ဤဝန်ဆောင်မှုကို မှတ်ပုံတင်၍ ရယူရာတွင် အသုံးပြုသူ၏ ပေါ့လျော့မှု တစ်စုံတစ်ရာကြောင့် တိုက်ရိုက်သော်လည်းကောင်း၊ သွယ်ဝိုက်၍သော်လည်းကောင်း၊ အသုံးပြုသူ၏ ကိုယ်ရေးကိုယ်တာ အချက်အလက်များနှင့် ငွေကြေးအပါအဝင် အကျိုးစီးပွားထိခိုက်မှုဖြစ်ပေါ်လာပါက 8484Gas (Mini App) ငွေပေးချေမှုဆိုင်ရာ အေဂျင်စီ ကမ္ဘောဇဘဏ် (ဤနေရာမှစ၍ "KBZ" ဟု ရည်ညွှန်းသုံးနှုန်းသွားမည်ဖြစ်သည်) ၊ 8484Gas နှင့် ၎င်းတို့၏အဖွဲ့ဝင်တို့ထံတွင် တစ်စုံတစ်ရာ တာဝန်ရှိမည် မဟုတ်ပါ။ 8484Gas (Mini App) ဝန်ဆောင်မှုကို အသုံးပြုရန်အတွက် စည်းမျဉ်းစည်းကမ်း အသေးစိတ်မှာ အောက်ပါအတိုင်း ဖြစ်ပါသည်။`,
};

export interface TermsSection {
  en: { title: string; body: string };
  mm: { title: string; body: string };
}

export const termsSections: TermsSection[] = [
  {
    en: {
      title: "1. DEFINITIONS",
      body: `1.1 "Business Day" means a day other than a Saturday, Sunday, public holiday, or bank holiday in Myanmar.

1.2 "KBZ Bank" means Kanbawza Bank Limited and all the branches of KBZ Bank, including any branches that shall be set up by KBZ Bank in the future.

1.3 "KYC" means "Know Your Customers", requirements for registering issued by the Central Bank of Myanmar and/or other authorities.

1.4 "Mini App" means the 8484Gas (Mini App) owned by the KBZPay, a Mini App that can be used in the KBZPay, and KBZPay acts as an agent on behalf of the Merchant to perform the functions of this Mini App and the functions of the App to facilitate Users' orders.

1.5 "Myanmar Kyat" means the official currency of the Republic of the Union of Myanmar.

1.6 "Refund" means any full or part pay that the Customer refuses to honor or demands a refund of because the goods/services purchased from the Merchant were not as they were promised or were defective, deficient, incomplete and/or unsatisfactory for any reason whatsoever or if any Customer order was cancelled by the Customer.

1.7 "Services" means products and services offered by Merchants in 8484Gas (Mini App) for users, for which service fees can be paid through KBZPay.

1.8 "Service Fees" means all fees and costs charged for using the Service of 8484Gas (Mini App).

1.9 "User/Customer" means users who are end-customers of the 8484Gas (Mini App).

1.10 "Vendors" means an individual or company that supplies services to the Customer through the 8484Gas (Mini App) in the KBZPay.`,
    },
    mm: {
      title: "၁။ အဓိပ္ပါယ်ဖွင့်ဆိုချက်",
      body: `၁၊၁။ "အလုပ်လုပ်ရက်" ဆိုသည်မှာ မြန်မာနိုင်ငံရှိ စနေ၊ တနင်္ဂနွေနေ့၊ အများပြည်သူအလုပ်ပိတ်ရက် သို့မဟုတ် ဘဏ်ပိတ်ရက်မဟုတ်သည့် နေ့ရက်များကို ဆိုလိုခြင်းဖြစ်သည်။

၁၊၂။ "ကမ္ဘောဇဘဏ်" ဆိုသည်မှာ ကမ္ဘောဇဘဏ်လီမိတက်နှင့် အနာဂတ်တွင် ကမ္ဘောဇဘဏ်မှ တည်ထောင်မည့် ကမ္ဘောဇဘဏ်ခွဲများ အပါအဝင် ယခုလက်ရှိ ကမ္ဘောဇဘဏ်ခွဲများအားလုံးကို ဆိုလိုသည်။

၁၊၃။ "KYC" ဆိုသည်မှာ မြန်မာနိုင်ငံတော်ဗဟိုဘဏ်နှင့်/သို့ အခြား အခွင့်အာဏာပိုင်များမှ ထုတ်ပြန်ထားသော "သင်၏ ဖောက်သည်ကို သိပါ" ဟူသော မှတ်ပုံတင် မှတ်ပုံတင်ရာတွင် လိုအပ်သော အချက်အလက်များကို ဆိုလိုသည်။

၁၊၄။ "Mini App" ဆိုသည်မှာ ကုန်သည်မှပိုင်ဆိုင်သော 8484Gas (Mini App) ကိုဆိုလိုခြင်းဖြစ်ပြီး KBZPay တွင်အသုံးပြုနိုင်သော Mini App တစ်ခုဖြစ်ပြီး ဤ Mini App ၏လုပ်ဆောင်ချက်များနှင့် အသုံးပြုသူများ၏မှာယူမှုကို လွယ်ကူချောမွေ့စေရန်အတွက် App ၏ လုပ်‌ဆောင်ချက်များအား ကုန်သည်ကိုယ်စား ဆောင်ရွက်ပေးသည့် အေးဂျင့်အဖြစ် KBZPay မှလုပ်ဆောင်ပါသည်။

၁၊၅။ "မြန်မာကျပ်" ဆိုသည်မှာ ပြည်ထောင်စုသမ္မတ မြန်မာနိုင်ငံအတွင်း တရားဝင်သုံးစွဲနေသည့် ငွေကြေးကို ဆိုလိုသည်။

၁၊၆။ "ငွေ" ဆိုသည်မှာ ကုန်သည်ထံမှဝယ်ယူသည့် ကုန်စည်/ဝန်ဆောင်မှုများသည် ကုန်သည်မှ ဖော်ပြထားသည့် အရည်အသွေးနှင့်ကိုက်ညီမှုမရှိခြင်း သို့မဟုတ် ယိုယွင်းပျက်စီးမှုရှိခြင်း၊ ချို့တဲ့မှု၊ ပြည့်စုံမှုမရှိခြင်း နှင့် သို့မဟုတ် မည်သည့်အကြောင်းကြောင့်ဖြစ်စေ ကျေနပ်မှုမရှိခြင်း သို့မဟုတ် ဝယ်ယူသည့် အသုံးပြုသူ၏ မှာယူမှုကို အသုံးပြုသူမှဖျက်သိမ်းခြင်းတို့ကြောင့် အသုံးပြုသူမှပေးချေရန်ငြင်းဆိုခြင်းပြုထားသည် မည်သည့်တစ်စိတ်တစ်ပိုင်း ပေး‌ချေထားမှုအတွက်ဖြစ်စေ သို့မဟုတ် ပမာဏအပြည့်အဝ ပေးချေထားမှုအတွက်ဖြစ်စေ ပြန်အမ်းငွေတောင်းဆိုခြင်း သို့မဟုတ် ငွေပြန်အမ်းပေးရန် တောင်းဆိုခြင်းတို့ကို ဆိုလိုသည်။

၁၊၇။ "ဝန်ဆောင်မှုများ" ဆိုသည်မှာ KBZPay ဖြင့် ငွေပေးချေခြင်းပြုနိုင်သည့် အသုံးပြုသူများမှ ရယူအသုံးပြုနိုင်သော Mini App အတွင်း ကုန်သည်မှ ကမ်းလှမ်းသည့် ကုန်စည်နှင့် ဝန်ဆောင်မှုကို ဆိုလိုခြင်းဖြစ်သည်။

၁၊၈။ "ဝန်ဆောင်ခ" ဆိုသည်မှာ 8484Gas (Mini App) မှ ထုတ်ပြန်ထားသော ဝန်ဆောင်မှုအသုံးပြုမှုအတွက် ကောက်ခံသည့် အခကြေးငွေ၊ ကောက်ခံမှုအားလုံးကို ဆိုလိုပါသည်။

၁၊၉။ "အသုံးပြုသူ (သို့မဟုတ်) ၀ယ်ယူသူ" ဆိုသည်မှာ Mini App အား အသုံးပြုသည့် အသုံးပြုသူများကို ဆိုလိုခြင်ဖြစ်သည်။

၁၊၁၀။ "မိတ်ဖက်ဝန်ဆောင်မှု လုပ်ငန်း/ပေးသူ" ဆိုသည်မှာ KBZPay ရှိ 8484Gas (Mini App) မှတစ်ဆင့် အသုံးပြုသူများအား ဝန်ဆောင်မှုပေးသည့် တစ်ဦးချင်း သို့မဟုတ် ကုမ္ပဏီတစ်ခုဖြစ်သည်။`,
    },
  },
  {
    en: {
      title: "2. OBTAINING AND USING 8484GAS (MINI APP)",
      body: `2.1 Users are responsible for ensuring that their own software and hardware are suitable and up-to-date.

2.2 In case of any dispute arising from the cancellation, any change processes and the services received by the Customer, the Customer can directly contact the 8484Gas Call Center support through the contact methods mentioned in Clause 30 and 8484Gas will make a decision on these complaints.

2.3 This Service can be achieved by those who are 18 years of age and above. Those who wish to use this Service but are under 18 years of age shall agree and accept these Terms and Conditions, and with the approval of parent(s) or legal guardian(s) who are liable for any payment the Users under 18 years of age can obtain this Service. Without the approval of parent(s) or legal guardian(s), the Service User under 18 years of age shall cease using this Service by accessing 8484Gas (Mini App). This applies to the existing laws of the Republic of the Union of Myanmar.

2.4 You are prohibited from utilizing 8484Gas's products for unlawful or unauthorized activities and must adhere to all legal regulations while using the Service. All communications, including emails and text messages, exchanged between you and 8484Gas, KBZPay may be recorded either to protect the rights, to ensure quality and for legal considerations.

2.5 All normal KBZPay Terms and Conditions apply.`,
    },
    mm: {
      title: "၂။ 8484GAS (Mini App) အား ရယူအသုံးပြုခြင်း",
      body: `၂၊၁။ အသုံးပြုသူများသည် ၎င်းတို့၏ကိုယ်ပိုင်ဆော့ဖ်ဝဲလ်နှင့် ဟာ့ဒ်ဝဲများ သင့်လျော်ပြီး ခေတ်မီကြောင်း သေချာစေရန်အတွက် တာဝန်ရှိပါသည်။

၂၊၂။ ပယ်ဖျက်ခြင်း ၊ အပြောင်းအလဲလုပ်ငန်းစဉ်များနှင့် သုံးစွဲသူမှရရှိသောဝန်ဆောင်မှုများမှ အငြင်းပွားမှုများ ပေါ်ပေါက်လာပါက သုံးစွဲသူများသည် ဆက်သွယ်ရန် ဖော်ပြထားသည့် နည်းလမ်းများထဲမှ အပိုဒ် (၃၀) ရှိ 8484Gas Call center အကူအညီကို တိုက်ရိုက် ဆက်သွယ်နိုင်ပြီး အဆိုပါတိုင်ကြားမှုများအပေါ်တွင် 8484Gas မှ ဆုံးဖြတ်ချက် ပြုလုပ်မည် ဖြစ်ပါသည်။

၂၊၃။ ဤဝန်ဆောင်မှုကို တရားဝင်စာချုပ်ချုပ်ဆိုနိုင်သည့် အရွယ်ရောက်ပြီးသည့် အသက် ၁၈ နှစ်နှင့် အထက်ရှိသူ သို့မဟုတ် ဥပဒေအရ အရည်အချင်းပြည့်မီသူများသာ အသုံးပြုနိုင်မည်ဖြစ်သည်။ ဤသည်မှာ ပြည်ထောင်စုသမ္မတမြန်မာနိုင်ငံတော်၏ တည်ဆဲဥပဒေများနှင့်အညီ အဓိပ္ပါယ်ဖွင့်ဆိုခြင်းဖြစ်ပါသည်။ အသက် ၁၈ နှစ်အောက် အသုံးပြုသူများအနေဖြင့် ဤဝန်ဆောင်မှုကိုဝယ်ယူအသုံးပြုလိုပါက ဤစည်းမျဥ်းစည်းကမ်း သတ်မှတ်ချက်များကို လက်ခံပြီး ကျသင့်သည့် အခကြေးငွေများအားလုံးကို တာဝန်ယူရန် သဘောတူထားသည့် မိဘ(များ) သို့မဟုတ် တရားဝင် အုပ်ထိန်းသူ(များ)၏ သဘောတူညီချက်ကို ရယူ၍ ၁၈ နှစ်အောက် အသုံးပြုသူမှ ဤဝန်ဆောင်မှုကို ဝယ်ယူ အသုံးပြုနိုင်မည်ဖြစ်သည်။ အသက် ၁၈ နှစ်အောက် ဝယ်ယူသူအနေဖြင့် မိမိ၏ မိဘ(များ) သို့မဟုတ် တရားဝင် အုပ်ထိန်းသူ(များ)၏ သဘော တူညီချက်မရပါက၊ ဝယ်ယူသူသည် 8484Gas (Mini App) အသုံးပြု၍ ဝန်ဆောင်မှုအား အသုံးပြုဝင်ရောက်ခြင်းကို ချက်ချင်းရပ်ရပါမည်။ ဤနေရာတွင်ဖော်ပြထားသည့် စည်းမျဥ်းစည်းကမ်းများသည် ပြည်ထောင်စုသမ္မတမြန်မာနိုင်ငံ၏ တည်ဆဲဥပဒေများနှင့် အကျုံးဝင်မည်ဖြစ်သည်။

၂၊၄။ သင်သည် 8484Gas App (Mini App) ၏ထုတ်ကုန်များကို တရားမဝင် သို့မဟုတ် ခွင့်ပြုချက်မရှိဘဲ ရည်ရွယ်ချက် တစ်ခုခု အတွက် အသုံးမပြုနိုင်သလို ဝန်ဆောင်မှုအသုံးပြုရာတွင် ဥပဒေများကို ချိုးဖောက်ခြင်းမပြုရ။ ခေါ်ဆိုမှုများ၊ အီးမေးလ်နှင့် စာတိုပေးပို့သူအားလုံးအပါအဝင် မည်သည့် ဆက်သွယ်ရေး နည်းလမ်းဖြင့်မဆို သင်နှင့် 8484Gas နှင့်/သို့မဟုတ် KBZPay တို့ကြားတွင် အခွင့်အရေးများကိုကာကွယ်ရန်အတွက်သော်လည်းကောင်း၊ အရည်အသွေး အာမခံချက်နှင့် ဥပဒေရေးရာ ရည်ရွယ်ချက်များအတွက် မှတ်တမ်းတင်ထားနိုင်သည်။

၂၊၅။ KBZPay ဆိုင်ရာပုံမှန်စည်းမျဉ်းနှင့်စည်းကမ်း သတ်မှတ်ချက်များလည်း အကျုံးဝင်မည်ဖြစ်သည်။`,
    },
  },
  {
    en: {
      title: "3. MEMBER REGISTRATION",
      body: `3.1 In order to use this Service, you need to be a member of the 8484Gas (Mini App) service. The User must provide the necessary information requested during membership registration, which is current, accurate complete information must be entered.

3.2 To be able to provide Service to the User, to respond to the request of the User, to use in legal affairs, to enforce rules and regulations, to settle any affairs arising out of using the service, and to send information concerning with the Service, the User shall agree and grant KBZPay and 8484Gas (Mini App) to access User's information which have been filled when the registration was made to use this service for maintaining, sharing and disclosing. Registering in 8484Gas (Mini App) through the mobile phone of the User is considered that the User acknowledges and agrees to send all information on this service to the mobile phone or email of the user through SMS and SMS link.

3.3 For registration purposes, 8484Gas will collect and process your personal information, such as your name, electronic mail (e-mail) address, and your mobile phone number when you register. You must provide us with accurate, complete, and latest information and agree to provide 8484Gas with any proof of identity that we may reasonably request.

3.4 According to this Terms and Conditions, User agrees that KBZ has the right to provide personal information and Biometric data, and account data of the User to other parties (outside Service providers or agents), or User's data mentioned by the User in the Application to use this Service to subsidiaries of KBZ, Branches, financial institutions, Credit Bureau, representatives and legal organizations, and authorizes KBZ to do so.

3.5 User agrees to follow 8484Gas Mini App Privacy Policy through KBZPay Mini App, which may be regularly updated on 8484Gas Mini App. User shall also be responsible for regularly reviewing the Privacy Policy, including any amendments posted on the Mini App.

3.6 All users are presumed to have comprehended and accepted the aforementioned terms and conditions.`,
    },
    mm: {
      title: "၃။ အဖွဲ့ဝင်အဖြစ်မှတ်ပုံတင်ခြင်း",
      body: `၃၊၁။ အသုံးပြုသူသည် 8484Gas (Mini App) ဝန်ဆောင်မှုအားသုံးစွဲရန်အတွက် မှတ်ပုံတင်ရမည်ဖြစ်သည်။ မှတ်ပုံတင်ရာတွင် အသုံးပြုသူသည် တိကျသော၊ လက်ရှိအခြေအနေအတိုင်းဖြစ်သော၊ ပြည့်စုံသော အချက်အလက်များကို ရေးသွင်းရပါမည်။ အချက်အလက်များအား ပြည့်စုံစွာ ဖော်ပြခြင်းမရှိပါက ဝန်ဆောင်မှုကိုအသုံးပြုနိုင်မည်မဟုတ်ပါ။

၃၊၂။ အသုံးပြုသူအား ဝန်ဆောင်မှုပေးရန်နှင့် ဝန်ဆောင်မှုနှင့်ပတ်သက်၍ အသုံးပြုသူ၏တောင်းဆိုမှုများကို ပြန်လည်တုံ့ပြန်ပေးရန်၊ ဥပဒေကြောင်းအရ လုပ်ဆောင်ရန် ကိစ္စများရှိလာသည့်အခါ အသုံးပြုရန်၊ စည်းမျဉ်းစည်းကမ်းများ အကျိုးသက်ရောက်မှုရှိစေရန်၊ ဝန်ဆောင်မှုနှင့်ပတ်သက်၍ အခြားဖြစ်ပေါ်လာသော ကိစ္စအ၀၀ကို ဖြေရှင်းဆောင်ရွက်ရန်၊ ဤဝန်ဆောင်မှုနှင့် ပတ်သက်သည့် သတင်းအချက်အလက်များကို ပေးပို့ဆက်သွယ်ရန် လိုအပ်သောကြောင့် ဤဝန်ဆောင်မှုကိုအသုံးပြုရန် မှတ်ပုံတင်စဉ်က ဖြည့်သွင်းခဲ့သော အသုံးပြုသူ၏ အချက်အလက်များကို KBZPay နှင့် 8484Gas (Mini App) မှ ဝင်ရောက်ကြည့်ရှုခြင်း၊ ထိန်းသိမ်းမှုပြုလုပ်ခြင်း၊ မျှဝေခြင်းနှင့် ထုတ်ဖော်ခြင်းတိုတို့ ပြုလုပ်ရန် အသုံးပြုသူအနေဖြင့် သဘောတူလက်ခံမည်ဖြစ်သည်။ 8484Gas (Mini App) ဝန်ဆောင်မှု တွင် အသုံးပြုသူ၏ဖုန်းနံပါတ် နှင့်/သို့မဟုတ် Email ဖြင့် မှတ်ပုံတင်လိုက်ခြင်းသည် ဤဝန်ဆောင်မှုနှင့် ပတ်သက်သည့် အကြောင်းအရာများအားလုံးကို အသုံးပြုသူ၏ မိုဘိုင်းလ်ဖုန်း သို့မဟုတ် Email ထံသို့ SMS၊ စာတိုများနှင့် SMS Link များ ပေးပို့မည်ကို အသုံးပြုသူကသိရှိလက်ခံသဘောတူရာရောက်သည်။

၃၊၃။ 8484Gas တွင် မှတ်ပုံတင်စာရင်းသွင်းခြင်းအတွက် သင့်ကိုယ်ရေးကိုယ်တာ အချက်အလက်များကို ရယူသွားမည်ဖြစ်ပြီး၊ သင့်အမည်၊ အီးမေးလ်လိပ်စာ နှင့် မိုဘိုင်းဖုန်းနံပါတ် စသည့်အချက်အလက်များ ပါဝင်သည်။ စာရင်းသွင်းခြင်းပြုလုပ်သည့်အခါတွင် တိကျပြီး ပြည့်စုံသော နောက်ဆုံးအချက်အလက်များကို ပေးပို့ရမည်ဖြစ်ပြီး၊ 8484Gas မှ တောင်းဆိုပါက သင့်ကိုယ်ပိုင် အထောက်အထားများကို ထောက်ခံချက်ပေးရန် သဘောတူလက်ခံရမည်။

၃၊၄။ ကမ္ဘောဇသည် ဤစည်းမျဉ်းစည်းကမ်းသတ်မှတ်ချက်များအရ ပေးအပ်နေသော ဝန်ဆောင်မှုများနှင့် ပတ်သက်၍ အသုံးပြုသူ၏ကိုယ်ရေးအချက်အလက်များ၊ Biometric အချက်အလက်များနှင့် ငွေစာရင်းဆိုင်ရာအချက်အလက်များအား အခြားပါတီဝင်များ (ပြင်ပမှဝန်ဆောင်မှုပေးသူများ သို့မဟုတ် အေးဂျင့်များ) ထံသို့ဖြစ်စေ သို့မဟုတ် ဤဝန်ဆောင်မှုအား အသုံးပြုရန်အတွက် အသုံးပြုသူမှ Application ထဲတွင်ဖော်ပြထားသော အသုံးပြုသူ၏ အချက်အလက်များအား ကမ္ဘောဇ၏လုပ်ငန်းခွဲများ၊ ဘဏ်များ၊ ငွေရေးကြေးရေးအဖွဲ့အစည်းများ၊ ခရက်ဒစ်ဗျူရို၊ ကိုယ်စားလှယ်များနှင့် ဥပဒေရေးရာ အဖွဲ့အစည်းများထံသို့ လိုအပ်ပါက မျှဝေခြင်းနှင့် ထုတ်ဖော်ပြောဆိုခြင်းတို့ပြုနိုင်ကြောင်းကို အသုံးပြုသူက သဘောတူပြီး ထိုသို့ဆောင်ရွက်ပိုင်ခွင့်ကို ကမ္ဘောဇဘဏ်သို့ အပ်နှင်းထားပါသည်။

၃၊၅။ အသုံးပြုသူသည် KBZPay Mini App မှတစ်ဆင့် 8484Gas Mini App တွင် ပုံမှန် update လုပ်ထားသော 8484Gas Mini App Privacy Policy ကို လိုက်နာရန် သဘောတူပါသည်။ အသုံးပြုသူသည် Mini App တွင်တင်ထားသော Privacy Policy ၏ပြင်ဆင်ပြောင်းလဲမှုများ ကို အမြဲတမ်း ပြန်လည် စစ်ဆေးရန် အတွက်လည်း တာဝန်ရှိပါသည်။

၃၊၆။ အသုံးပြုသူသည် အထက်ဖော်ပြပါ ဤစည်းမျဉ်းစည်းကမ်း သတ်မှတ်ချက်များအား နားလည်သဘောပေါက်ပြီး လက်ခံသည်ဟု ယူဆပါသည်။`,
    },
  },
  {
    en: {
      title: "4. SCOPE OF 8484GAS SERVICES",
      body: `4.1 Through the KBZPay Mini App, User can easily book home delivery gas services. The ordering process begins when the User clicks "Order Gas Now" on the Mini App home page. Users can browse and select their preferred gas brands under the "Our Brands" section. Additionally, they can choose from various services — such as gas refilling, new cylinder installation, or cylinder exchange and select the appropriate cylinder size (kg) as needed. 8484Gas will send a booking confirmation to the user via SMS.

4.2 The User is responsible for providing accurate, complete, and up-to-date information when booking home delivery gas services, including the User's home address, contact phone number, and preferred service date and time. The User acknowledges and agrees that 8484Gas and KBZPay shall not be held responsible or liable for any issues arising from inaccurate or incorrect information provided by the User, including but not limited to service delays, delivery to the wrong location, or the inability to provide the service.

4.3 KBZPay and 8484Gas do not verify and guarantee that the information provided is accurate, complete, up-to-date, or error-free. We are not responsible for any inaccuracies, omissions, interruptions (due to site maintenance or other issues), or delays in information delivery.

4.4 Market conditions can change rapidly, making the provided information inaccurate or outdated. If there is encountered any issues, please contact customer service of the 8484Gas for assistance.

4.5 8484Gas (Mini App) does not make any representations, recommendations, or endorsements regarding the quality or ratings of the Vendors listed in 8484Gas (Mini App). KBZPay and 8484Gas disclaim any liability for claims or losses related to the quality or status of these Vendors. Vendors may be categorized based on various factors such as reviews or ratings, which are determined by automated algorithms subject to change at 8484Gas's discretion.

4.6 8484Gas reserves the right to reject any user or booking or cancel a booking confirmation, at its sole discretion and without providing reasons. Possible reasons for rejection or cancellation include but are not limited to, breaches of these Terms, sanctions or embargoes, regulatory prohibitions, suspected fraud or criminal activity, unavailability of services, provision of inaccurate or misleading information, credit card issues, inappropriate behavior, refusal to provide required information, or being listed on governmental or international 'blacklists.' 8484Gas may also cancel due to a 'Real Mistake' (defined below). KBZPay and 8484Gas may remove a user's membership, either temporarily or permanently, and Removed Users are prohibited from re-accessing the 8484Gas (Mini App) under a different name or through another user, as described in the Fraud Prevention Mechanism.

4.7 All payments for bookings or reservations shall be made directly with KBZPay in 8484Gas (Mini App).

4.8 KBZ acts as a payment agency between you and 8484Gas. The User acknowledges and agrees that KBZ shall not have any responsibility whatsoever for any issues arising directly with 8484Gas.`,
    },
    mm: {
      title: "၄။ 8484Gas ၏ ဝန်ဆောင်မှုများ",
      body: `၄၊၁။ KBZPay မှတဆင့် Mini App အတွင်း အသုံးပြုသူများသည် အိမ်တိုင်ရာရောက် ဂတ်စ်ဝန်ဆောင်မှုကို အလွယ်တကူ ကြိုတင်စာရင်းသွင်းနိုင်ပါသည်။ အသုံးပြုသူသည် Mini App ပင်မစာမျက်နှာရှိ "Order Gas Now" ကိုနှိပ်ခြင်းဖြင့် ဂတ်စ်မှာယူမှုလုပ်ငန်းစဉ်ကို စတင်နိုင်မည်ဖြစ်သည်။ အသုံးပြုသူသည် မိမိအသုံးပြုလိုသည့် ဂတ်စ်အမှတ်တံဆိပ်များကို "Our Brands" နေရာတွင် ကြည့်ရှုရွေးချယ်နိုင်ပါသည်။ ထို့အပြင် အသုံးပြုသူသည် ဂတ်စ်ဝန်ဆောင်မှုများဖြစ်သည့် ဂတ်စ်ဖြည့်ခြင်း၊ ဂတ်စ်အိုးအသစ်တပ်ဆင်ခြင်း သို့မဟုတ် ဂတ်စ်အိုးလဲလှယ်ခြင်းများကို ရွေးချယ်နိုင်ပြီး ဂတ်စ်အိုး အရွယ်အစား (kg) ကိုလည်း သင့်လျော်သလို ရွေးချယ်နိုင်ပါသည်။ 8484Gas သည် SMS မှတစ်ဆင့် အသုံးပြုသူထံသို့ ကြိုတင်မှာယူမှု အတည်ပြုချက်ကို ပေးပို့သွားမည်ဖြစ်ပါသည်။

၄၊၂။ အသုံးပြုသူသည် အိမ်တိုင်ရာရောက် ဂတ်စ်ဝန်ဆောင်မှုများကို ကြိုတင်စာရင်းသွင်းရာတွင် မိမိ၏ အိမ်လိပ်စာ၊ ဆက်သွယ်ရန်ဖုန်းနံပါတ်နှင့် ဝန်ဆောင်မှုရယူလိုသည့် ရက်စွဲ/အချိန် စသည့်အချက်အလက်များကို တိကျမှန်ကန်ပြီး နောက်ဆုံးပေါ်အခြေအနေများအတိုင်း ဖြည့်သွင်းရန် တာဝန်ရှိပါသည်။ အသုံးပြုသူ၏ မှားယွင်းသော အချက်အလက် ပေးသွင်းမှုများကြောင့် ဖြစ်ပေါ်လာသည့် မည်သည့်နောက်ဆက်တွဲ ပြဿနာများ (ဥပမာ - ဝန်ဆောင်မှုနောက်ကျခြင်း၊ မှားယွင်းသောနေရာသို့ ရောက်ရှိခြင်း သို့မဟုတ် ဝန်ဆောင်မှု မဆောင်ရွက်နိုင်ခြင်း) အတွက်မဆို 8484Gas နှင့် KBZPay တို့မှ တာဝန်ရှိမည် မဟုတ်ကြောင်း အသုံးပြုသူက သိရှိနားလည် သဘောတူပါသည်။

၄၊၃။ 8484Gas သည် ဝန်ဆောင်မှုအကောင်းဆုံးဖြင့် ဆက်လက်ဆောင်ရွက်သွားမည်ဖြစ်သော်လည်း 8484Gas တွင်ဖော်ပြထားသော အချက်အလက်များသည် အစဉ်သရွေ့ မှန်ကန်ခြင်း၊ ပြည့်စုံခြင်း၊ နောက်ဆုံးရရှိထားသောအချက်အလက်များဖြစ်မည်ဟု 8484Gas နှင့် KBZPay ဘက်မှ အာမခံခြင်းမပြုပါ။ ထို့ပြင် အသုံးပြုသူအမှားများဖြစ်သော (စာလုံးပေါင်းသတ်ပုံမှားယွင်းခြင်း၊ ပျက်ကွက်မှုများ) နှင့် အနှောင့်အယှက်များ (ဆိုက်ပြုပြင်ထိန်းသိမ်းမှု သို့မဟုတ် အခြားပြဿနာများကြောင့်) သို့မဟုတ် သတင်းအချက်အလက် ပေးပို့ရာတွင် ကြန့်ကြာမှုများအတွက် တာဝန်မယူပါ။

၄၊၄။ ဈေးကွက်အခြေအနေများသည် လျှင်မြန်စွာပြောင်းလဲနိုင်သောကြောင့် ထောက်ပံ့ပေးထားသော အချက်အလက်များသည် အတိအကျမဟုတ်ခြင်း (သို့မဟုတ်) ရက်လွန်နေခြင်းများ ဖြစ်နိုင်ပါသည်။ ပြဿနာတစ်စုံတစ်ရာကြုံတွေ့ပါက အကူအညီရယူရန် 8484Gas ၏ Customer Service သို့ ဆက်သွယ်ပါ။

၄၊၅။ ဤ 8484Gas (Mini App) သည် စာရင်းသွင်းထားသော မိတ်ဖက်ဝန်ဆောင်မှုပေးသူများ၏ အရည်အသွေး သို့မဟုတ် အဆင့်သတ်မှတ်ချက်များနှင့် ပတ်သက်၍ ကိုယ်စားပြုမှုများ၊ အကြံပြုချက်များ သို့မဟုတ် ထောက်ခံချက်များ ပြုလုပ်ထားခြင်းမရှိပါ။ မိတ်ဖက်ဝန်ဆောင်မှုလုပ်ငန်း၏ အရည်အသွေး သို့မဟုတ် အခြေအနေများမှ ဖြစ်ပေါ်လာသော တောင်းဆိုမှုများ၊ ဆုံးရှူံးမှုများနှင့် ပတ်သက်၍ KBZPay နှင့် 8484Gas သည် တာဝန်မရှိပါ။ 8484Gas ၏ ကိုယ်ပိုင်ဆုံးဖြတ်ချက်ဖြင့် အလိုအလျောက် ပြောင်းလဲနိုင်သော အယ်လဂိုရီသမ်များဖြင့် တွက်ချက်ဆုံးဖြတ်ထားသည့် သုံးသပ်ချက်များ သို့မဟုတ် အဆင့်သတ်မှတ်ချက်များကဲ့သို့ အမျိုးမျိုးသော အကြောင်းအချက်များအပေါ် အခြေခံ၍ မိတ်ဖက်ဝန်ဆောင်မှုပေးသူများကို အမျိုးအစားခွဲခြားထား နိုင်ပါသည်။

၄၊၆။ 8484Gas ၏ကိုယ်ပိုင်ဆုံးဖြတ်ချက်ဖြင့် အသုံးပြုသူ သို့မဟုတ် ကြိုတင်စာရင်းသွင်းခြင်း အတည်ပြုမှုအား အကြောင်းပြချက်မပေးဘဲ ပယ်ဖျက်ပိုင်ခွင့် ရှိပါသည်။ ငြင်းပယ်ခြင်း သို့မဟုတ် ပယ်ဖျက်ခြင်းအတွက် ဖြစ်နိုင်သော အကြောင်းရင်းများတွင် ဤစည်းမျဥ်းများကို ချိုးဖောက်ခြင်း၊ ပိတ်ဆို့အရေးယူမှုများ သို့မဟုတ် ပိတ်ဆို့မှုများ၊ စည်းမျဉ်းတားမြစ်ချက်များ၊ လိမ်လည်မှု သို့မဟုတ် ရာဇ၀တ်မှုဆိုင်ရာ လုပ်ဆောင်ချက်၊ ဝန်ဆောင်မှုများ မရရှိနိုင်ခြင်း၊ မမှန်ကန်သော သို့မဟုတ် လွဲမှားသောအချက်အလက်များကို ပံ့ပိုးပေးခြင်း၊ အကြွေးဝယ်ကတ် ပြဿနာများ၊ မသင့်လျော်သောအပြုအမူ၊ လိုအပ်သော အချက်အလက်များ ပံ့ပိုးပေးရန် ငြင်းဆိုခြင်း သို့မဟုတ် အစိုးရ သို့မဟုတ် နိုင်ငံတကာ 'အမည်ပျက်စာရင်း' တွင် စာရင်းသွင်းခံရခြင်းတို့ပါဝင်သည်။ သို့သော် အတိအကျ ကန့်သတ်ချက်မရှိပါ။ "အစစ်အမှန်အမှား" (အောက်တွင် သတ်မှတ်ဖော်ပြထားသည်) ကြောင့်လည်း ပယ်ဖျက်နိုင်ပါသည်။ KBZPay နှင့် 8484Gas သည် အသုံးပြုသူ၏အဖွဲ့ဝင်ခြင်းကို ယာယီ သို့မဟုတ် အပြီးအပိုင် ဖယ်ရှားနိုင်ပြီး ဖယ်ရှားလိုက်သောအသုံးပြုသူများသည် လိမ်လည်မှု ကာကွယ်ရေးယန္တရားတွင် ဖော်ပြထားသည့်အတိုင်း အခြားအမည်တစ်ခုဖြင့် 8484Gas (Mini App) အား ပြန်လည်ဝင်ရောက်ခြင်းမပြုရန် တားမြစ်ထားသည်။

၄၊၇။ ဝန်ဆောင်မှုများ၏ ကြိုတင် Booking နှင့် ပတ်သက်၍ 8484Gas Mini App ထဲတွင် KBZPay ဖြင့် တိုက်ရိုက် ငွေပေးချေရပါမည်ဖြစ်ပြီး KBZPay ဆိုင်ရာပုံမှန်စည်းမျဉ်းနှင့်စည်းကမ်း သတ်မှတ်ချက်များကိုလည်း လိုက်နာရမည်ဖြစ်သည်။

၄၊၈။ KBZ သည် သင်နှင့် 8484Gas ကြားတွင် ကြားခံအနေနှင့် ငွေပေးချေမှုဆိုင်ရာ အေဂျင်စီအဖြစ် ဆောင်ရွက်ပါသည်။ 8484Gas နှင့် တိုက်ရိုက်ဖြစ်ပေါ်လာသည့် ပြဿနာများအတွက် KBZ တွင်လုံးဝတာဝန်မရှိသည်ကို အသုံးပြုသူမှ သိရှိနားလည်သဘောတူပါသည်။`,
    },
  },
  {
    en: {
      title: "5. PRICE AND PROMOTION",
      body: `5.1 8484Gas may, from time to time, offer discounts and promotional campaigns in connection with the Services.

5.2 The availability of discounts and promotions are not guaranteed for all Users, and 8484Gas does not guarantee that any User will be able to receive or use any coupon. 8484Gas reserves the right, at its sole discretion and without prior notice, to cancel, modify, or restrict any coupon at any time.

5.3 The User acknowledges that all discounts and promotions are solely offered by 8484Gas and that KBZPay bears no responsibility or liability in relation thereto.`,
    },
    mm: {
      title: "၅။ ဈေးနှုန်းနှင့် ပရိုမိုးရှင်းအစီအစဉ်များ",
      body: `၅၊၁။ 8484Gas သည် လျှော့စျေးနှင့် ပရိုမိုးရှင်းများကို အခါအားလျော်စွာ ကမ်းလှမ်းနိုင်ပါသည်။

၅၊၂။ လျှော့စျေးနှင့် ပရိုမိုးရှင်းများကို အသုံးပြုသူတိုင်း ရရှိရန် (သို့မဟုတ်) အသုံးပြုနိုင်ရန် အာမခံချက်ထားခြင်း မရှိပါ။ 8484Gas အနေဖြင့် မည်သည့်လျှော့စျေးနှင့် ပရိုမိုးရှင်းအစီအစကိုမဆို ကြိုတင်အကြောင်းကြားခြင်း မရှိဘဲ ပယ်ဖျက်ခြင်း၊ ပြောင်းလဲခြင်း သို့မဟုတ် ကန့်သတ်ခြင်းတို့ကို ပြုလုပ်ပိုင်ခွင့်ရှိပါသည်။

၅၊၃။ 8484Gas မှကမ်းလှမ်းသော လျှော့စျေးနှင့် ပရိုမိုးရှင်းများသည် 8484Gas ဖြင့်သာသက်ဆိုင်ပြိး KBZPay တွင်တာဝန်မရှိကြောင်း သိရှိနားလည်သဘောတူပါသည်။`,
    },
  },
  {
    en: {
      title: "6. ADDITIONAL CHARGES AND REFUND",
      body: `6.1 Prices listed on the 8484Gas (Mini App) are subject to specific conditions and may vary based on booking availability, duration, and other factors. These prices may include additional taxes and charges, or, in some cases, may exclude them. Users are responsible for verifying the total cost, delivery fees and terms upon receiving the confirmation In-app noti and must check the booking details. For any service-related inquiries, Users can contact 8484Gas Customer Service during operational hours.`,
    },
    mm: {
      title: "၆။ ထပ်လောင်းကောက်ခံမှုများနှင့် အခွန်အခ",
      body: `၆၊၁။ 8484Gas (Mini App) တွင်ဖော်ပြထားသောစျေးနှုန်းများသည် သတ်မှတ်ထားသောအခြေအနေများပေါ်တွင် မူတည်ပြီး ကြိုတင်မှာယူနိုင်မှု၊ ကြာမြင့်ချိန်နှင့် အခြားအချက်များပေါ်မူတည်၍ ကွဲပြားနိုင်ပါသည်။ ဤစျေးနှုန်းများတွင် အပိုအခွန်များနှင့် အခကြေးငွေများ ပါဝင်နိုင်သည် သို့မဟုတ် အချို့ကိစ္စများတွင် ၎င်းတို့ကို ဖယ်ထုတ်နိုင်သည်။ အသုံးပြုသူများသည် အတည်ပြုအီးမေးလ်ကို လက်ခံရရှိပြီးနောက် စုစုပေါင်း ကုန်ကျစရိတ်၊ သယ်ယူပို့ဆောင်ခ နှင့် စည်းကမ်းချက်များကို စစ်ဆေးရန် တာဝန်ရှိပြီး ကြိုတင်စာရင်းသွင်းမှု အသေးစိတ်များကို စစ်ဆေးရပါမည်။ မည်သည့်ဝန်ဆောင်မှုနှင့်မဆို ပတ်သက်သည့် စုံစမ်းမေးမြန်းမှုများကို အသုံးပြုသူများသည် လုပ်ငန်းလည်ပတ်ချိန်အတွင်း 8484Gas Customer Service သို့ ဆက်သွယ်နိုင်ပါသည်။`,
    },
  },
  {
    en: {
      title: "7. USER ACCOUNT",
      body: `7.1 During registration, KBZPay and 8484Gas will collect and process your personal information, including your name and mobile phone number. You must provide accurate, complete, and up-to-date information and agree to furnish any reasonable proof of identity upon request.

7.2 Your account is for your exclusive use. You represent and warrant that you will not authorize any third party to use your identity or account unless expressly permitted by KBZPay and 8484Gas.

7.3 You may not assign or transfer your account to anyone else.

7.4 You are responsible for maintaining the security and confidentiality of your account password and any identification provided to you. If your password is disclosed in any manner, leading to unauthorized use of your account or identity, any orders made from such unauthorized use will still be regarded as valid, and 8484Gas will process those orders. You acknowledge that KBZPay and 8484Gas are not liable for any loss or damage resulting from the misuse of your account.

7.5 If you lose control over your account (for instance, if your account is hacked or your phone is stolen, you must promptly notify KBZPay so that we can temporarily block or inactivate your account as needed. Please be aware that you are responsible for all activity conducted through your account and may be held liable for any misuse, even if it is perpetrated by other.

7.6 KBZPay and 8484Gas reserve the right to temporarily block, delete, or inactivate a User's account at its sole discretion and without prior notice. The grounds for such actions may include, but are not limited to:

a. Breach of these Terms,
b. Prohibitions set forth by regulations,
c. Fraud or theft, or indications or suspicions thereof,
d. Suspicion of criminal activity,
e. Suspicious ordering practices,
f. Providing inaccurate, erroneous, or misleading information,
g. Inappropriate behavior, threats, or insults,
h. Refusal to provide requested information,
i. Practical impediments,
j. Communication difficulties or breakdowns, or
k. Being listed on any "black lists" or "watch lists" by governments or international organizations.`,
    },
    mm: {
      title: "၇။ အသုံးပြုသူအကောင့်",
      body: `၇၊၁။ စာရင်းသွင်းစဉ်အတွင်း သင့်အမည်၊ အီးမေးလ်လိပ်စာနှင့် မိုဘိုင်းဖုန်းနံပါတ်တို့အပါအဝင် သင်၏ ကိုယ်ရေးကိုယ်တာအချက်အလက်များကို KBZPay နှင့် 8484Gas သည် စုဆောင်းပြီး စီမံဆောင်ရွက်ပါမည်။ သင်သည် တိကျသော၊ ပြည့်စုံပြီး နောက်ဆုံးဖြစ်ပေါ်သောအချက်အလက်များကို ပေးဆောင်ရမည်ဖြစ်ပြီး တောင်းဆိုမှုအရ ကျိုးကြောင်းဆီလျော်သော အထောက်အထား တစ်ခုခုကို ပေးဆောင်ရန် သဘောတူရပါမည်။

၇၊၂။ သင့်အကောင့်သည် သင်၏သီးသန့်အသုံးပြုမှုအတွက်ဖြစ်သည်။ KBZPay နှင့် 8484Gas မှ အတိအလင်း ခွင့်မပြုပါက သင်၏ အထောက်အထား သို့မဟုတ် အကောင့်ကို အသုံးပြုရန် ပြင်ပအဖွဲ့အစည်းကို ခွင့်ပြုမည်မဟုတ်ကြောင်း သင်မှ အာမခံပါသည်။

၇၊၃။ သင့်အကောင့်ကို အခြားမည်သူ့ကိုမျှ တာဝန်ပေးအပ်ခြင်း သို့မဟုတ် လွှဲပြောင်းခြင်းမပြုရပါ။

၇၊၄။ သင့်အကောင့်စကားဝှက်၏ လုံခြုံရေးနှင့် လျှို့ဝှက်ထားမှုကို ထိန်းသိမ်းရန် သင့်တွင် တာဝန်ရှိပါသည်။ သင့်စကားဝှက်ကို မည်သည့်နည်းဖြင့်မဆို ထုတ်ဖော်ထားပါက သင့်အကောင့် သို့မဟုတ် အထောက်အထားကို ခွင့်ပြုချက်မရှိဘဲ အသုံးပြုခြင်းသို့ ဦးတည်သွားပါက ထိုကဲ့သို့ ခွင့်ပြုချက်မရှိဘဲ အသုံးပြုခြင်းမှ ပြုလုပ်သော မည်သည့်အမှာစာကိုမဆို တရားဝင်အဖြစ် မှတ်ယူမည်ဖြစ်ပြီး ထိုအမှာစာများကို 8484Gas မှ ဆောင်ရွက်ပါမည်။ သင့်အကောင့်ကို အလွဲသုံးစား လုပ်ခြင်းကြောင့် ဖြစ်ပေါ်လာသည့် ဆုံးရှုံးမှု သို့မဟုတ် ပျက်စီးဆုံးရှုံးမှုများအတွက် KBZPay နှင့် 8484Gas တွင် တာဝန်မရှိကြောင်း သင်မှအသိအမှတ်ပြုပါသည်။

၇၊၅။ သင့်အကောင့်ကို ထိန်းချုပ်နိုင်မှု ဆုံးရှုံးသွားပါက (ဥပမာ၊ သင့်အကောင့်ကို ဟက်ခ်ခံရခြင်း သို့မဟုတ် သင့်ဖုန်းအခိုးခံရပါက) သင့်အကောင့်ကို လိုအပ်သလို ယာယီပိတ်ဆို့ခြင်း သို့မဟုတ် သက်ဝင်မှုမရှိနိုင်စေရန်အတွက် KBZPay အားချက်ခြင်းအကြောင်းကြားရပါမည်။ သင့်အကောင့်မှတစ်ဆင့် ဆောင်ရွက်ပြီး အခြားသူတစ်ဦးမှ ကျူးလွန်ခဲ့လျှင်ပင် အလွဲသုံးစားမှုများအတွက် သင့်တွင်တာဝန်ရှိပါသည်။

၇၊၆။ KBZPay နှင့် 8484Gas သည် ၎င်း၏ကိုယ်ပိုင် တစ်ခုတည်းသောဆုံးဖြတ်ချက်ဖြင့် ကြိုတင်သတိပေးခြင်း မရှိဘဲ အသုံးပြုသူ၏အကောင့်အား ယာယီပိတ်ဆို့ခြင်း၊ ဖျက်ခြင်း သို့မဟုတ် သက်ဝင်မှု မရှိစေရန် ဆောင်ရွက်ခြင်းအတွက် အခွင့်အရေးကို လက်ဝယ်ရှိပါသည်။ ထိုသို့သော လုပ်ဆောင်ချက်များအတွက် အောက်ပါအကြောင်းရင်းများ ပါဝင်နိုင်သော်လည်း ကန့်သတ်ထားခြင်းမရှိပါ။

(က) စည်းကမ်းချက်များအားဖောက်ဖျက်မှု၊
(ခ) နည်းဥပဒေများဖြင့် တားမြစ်ထားခြင်း၊
(ဂ) လိမ်လည်မှု သို့မဟုတ် ခိုးမှု၊ သို့မဟုတ် ထိုတွင်ပါရှိသော စွပ်စွဲမှု သို့မဟုတ် သံသယရှိမှုများ
(ဃ) ရာဇ၀တ်မှုဆိုင်ရာ မသင်္ကာမှု၊
(င) မသင်္ကာဖွယ်ရာ လုပ်ဆောင်မှုများ
(စ) မမှန်ကန်သော၊ မှားယွင်းသော၊ သို့မဟုတ် လွဲမှားသော အချက်အလက်များကို ပေးဆောင်ခြင်း၊
(ဆ) မသင့်လျော်သော အပြုအမူ၊ ခြိမ်းခြောက်ခြင်း၊ သို့မဟုတ် စော်ကားခြင်း၊
(ဇ) တောင်းဆိုထားသော အချက်အလက်များကို ပေးရန် ငြင်းဆိုခြင်း၊
(ဈ) လက်တွေ့ပေါ်ပေါက်သော အတားအဆီးများ၊
(ည) ဆက်သွယ်ရေးအခက်အခဲ သို့မဟုတ် ချို့ယွင်းချက်များ သို့မဟုတ်
(ဋ) အစိုးရများ သို့မဟုတ် နိုင်ငံတကာအဖွဲ့အစည်းများမှ မည်သည့် "အမည်ပျက်စာရင်း" သို့မဟုတ် "စောင့်ကြည့်စာရင်း" တွင် စာရင်းသွင်းခံရခြင်း။`,
    },
  },
  {
    en: {
      title: "8. PAYMENT DETAILS AND PROCEDURES",
      body: `8.1 Payments shall be made in the specified amount as indicated by KBZPay only through KBZPay.

8.2 All reservations must be accompanied by payment within the specified time limit. Failure to make the required payment may result in KBZPay exercising its right to cancel all associated reservations.`,
    },
    mm: {
      title: "၈။ ငွေပေးချေမှုအသေးစိတ်နှင့် လုပ်ထုံးလုပ်နည်းများ",
      body: `၈၊၁။ ငွေပေးချေမှုများကို KBZPay မှချမှတ်သော ပမာဏအတိုင်း KBZPay ဖြင့် ပေးချေရပါမည်။

၈၊၂။ ကြိုတင်မှာယူမှုအားလုံးသည် သတ်မှတ်ထားသော အချိန်ကန့်သတ်ချက်အတွင်း ငွေပေးချေမှုဖြင့် ဆောင်ရွက်သွားရပါမည်။ လိုအပ်သောငွေပေးချေမှုပြုလုပ်ရန် ပျက်ကွက်ပါက KBZPay သည် ဆက်စပ်ကြိုတင်မှာယူ မှုများအားလုံးကို ပယ်ဖျက်ရန် ၎င်း၏အခွင့်အရေးကို ကျင့်သုံးပါမည်။`,
    },
  },
  {
    en: {
      title: "9. RIGHTS AND OBLIGATIONS",
      body: `9.1 8484Gas hereby grants the User certain limited rights (constituting a "Limited License") to access and use the 8484Gas (Mini App) to the extent expressly permitted by these Terms. This Limited License is non-transferable and non-assignable. In connection with this Limited License, no other rights or licenses concerning the use of the 8484Gas (Mini App) are granted; all rights not expressly granted herein remain the exclusive property of 8484Gas or other third-party owners of such rights. The content available on the 8484Gas (Mini App), including the software infrastructure used to provide such content, is wholly owned by 8484Gas or its suppliers and service providers, including, but not limited to, its Vendors (as applicable). You may use the 8484Gas (Mini App) to place orders, and you guarantee that you will not submit false reservation requests. You also declare that the payment information you provide is accurate, and you guarantee that you will provide a valid email address, mailing address, and other relevant contact information.

9.2 In relation to the Terms of Use of the 8484Gas (Mini App), you agree not to use the 8484Gas (Mini App) or the Content for commercial purposes or for any use other than personal use, or for unlawful purposes as prohibited by law, nor engage in any actions that violate these Terms. Without the prior written consent of KBZPay and 8484Gas, you agree not to modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, sell, or re-sell any information, software, products, or services obtained in connection with the 8484Gas (Mini App). Furthermore, you agree not to:

9.2.1 use this 8484Gas (Mini App) or the Content for commercial purposes without obtaining prior permission from 8484Gas;
9.2.2 access, monitor or copy any Content on the 8484Gas (Mini App) using any technology, software, or any program either manually or automatically for any purpose without obtaining prior written permission from 8484Gas;
9.2.3 engage in any activity that imposes or could impose, an unreasonable burden on the 8484Gas (Mini App) or its infrastructure;
9.2.4 create a major link to this 8484Gas (Mini App) including but not limited to the booking pathway for any purpose without obtaining prior written permission from 8484Gas;
9.2.5 resell, utilize, copy, monitor (including but not limited to the use or installation of spider or scraping programs), display, download, or engage in any content production, software, products, or services available through the 8484Gas (Mini App) for commercial purposes or competitive activities;
9.2.6 reproduce the 8484Gas (Mini App) (via a "frame" or "mirror") or establish any portion of this 8484Gas (Mini App) on any other website without obtaining prior written permission from 8484Gas;
9.2.7 send any announcements to or through the Site that violate any applicable laws, regulations, or rules, or that may facilitate unlawful or criminal activities;
9.2.8 transmit or provide links to any materials that defame, slander, or contain false information;
9.2.9 transmit or provide links to any communications that contain defamatory, slanderous, or false statements;
9.2.10 transmit or disseminate communications that may infringe upon the intellectual property rights or other rights of any individual or entity, including, but not limited to, copyrights, patents, trademarks, trade secrets, confidential information, or proprietary publications;
9.2.11 transmit any communications that are prohibited by applicable law or that violate any rights and obligations arising from existing contractual relationships;
9.2.12 imitate any individual or entity for any purpose;
9.2.13 manipulate or falsify information to conceal the origin of any statements provided;
9.2.14 use the 8484Gas (Mini App) in any manner that could damage, disable, hinder, or interfere with its functionality or the use of the 8484Gas (Mini App) by other users. Additionally, you must not cause damage, disruption, or limit the functionality of any software, hardware, or telecommunications equipment;
9.2.15 gain unauthorized access to, or make unauthorized modifications to, the 8484Gas (Mini App) or any related websites, accounts, computer systems, or networks connected to the 8484Gas (Mini App) through hacking, password theft, or any other similar means;
9.2.16 obtain or attempt to obtain any materials or information through means not intentionally provided by the 8484Gas (Mini App), including, but not limited to, any other destinations featured on the 8484Gas (Mini App). This includes, but is not limited to, the collection of information about others, such as email addresses;
9.2.17 engage in fraudulent activities or actions intended to manipulate search engine results pages ("SERPs") or perform unethical search engine optimization ("SEO"). Unethical SEO practices, which may be deemed as "spamdexing," include but are not limited to cloaking, misleading metadata, improper use of title tags, content scraping, link schemes, Google bombing, irrelevant search keywords, hidden text or links, and the posting of spam comments, among other related activities; or
9.2.18 undertake any actions that may negatively impact or cause harm to the 8484Gas (Mini App), 8484Gas, its affiliates, employees, or 8484Gas's reputation.

9.3 Unless explicitly stated otherwise, you are not permitted to create links to any pages other than the Main Site pages, nor to frames, web pages, or materials contained therein. Additionally, you may not link to any part of the 8484Gas (Mini App) in a commercial email without the express written consent of 8484Gas.

9.4 By placing an order through this 8484Gas (Mini App), you represent and warrant that you are not subject to any prohibitions or restrictions imposed by any sanctions program, nor are you subject to any penalties under any anti-money laundering regulations.`,
    },
    mm: {
      title: "၉။ ရပိုင်ခွင့်များနှင့် တာဝန်များ",
      body: `၉၊၁။ 8484Gas သည် ဤစည်းမျဥ်းစည်းကမ်းများမှ အတိအလင်းခွင့်ပြုထားသည့်အတိုင်းအတာအထိ 8484Gas (Mini App) ကိုဝင်ရောက်အသုံးပြုရန် အသုံးပြုသူအား အချို့သောကန့်သတ်အခွင့်အရေးများ ("Limited License") ကို ပေးပါသည်။ ဤကန့်သတ်လိုင်စင်သည် လွှဲပြောင်း၍မရသည့်အပြင် တာဝန်ပေးအပ်ခြင်း မပြုနိုင်ပါ။ ဤကန့်သတ်လိုင်စင်နှင့် စပ်လျဉ်း၍ 8484Gas (Mini App) ကိုအသုံးပြုခြင်းနှင့်ပတ်သက်သည့် အခြားအခွင့်အရေးများ သို့မဟုတ် အသုံးပြုခွင့်များကို ပေးအပ်ထားခြင်းမရှိပါ။ ဤနေရာတွင် အတိအလင်း ဖော်ပြထားခြင်းမရှိသော အခွင့်အရေးများအားလုံးသည် 8484Gas ၏ သီးသန့်ပိုင်ဆိုင်မှု သို့မဟုတ် ယင်းအခွင့်အရေးများ၏ အခြားပြင်ပအဖွဲ့အစည်းပိုင်ရှင်များအဖြစ် ကျန်ရှိနေပါသည်။

၉၊၂။ 8484Gas (Mini App) ၏အသုံးပြုမှုစည်းမျဉ်းများနှင့်စပ်လျဉ်း၍ သင်သည် "8484Gas (Mini App)" တွင်ပါရှိသည့် အကြောင်းအရာကို စီးပွားဖြစ်ရည်ရွယ်ချက်အတွက် သို့မဟုတ် ကိုယ်ရေးကိုယ်တာအသုံးပြုမှုမှလွဲ၍ အခြားမည်သည့် အသုံးပြုမှု အတွက်မဆို သို့မဟုတ် ဥပဒေအရ တားမြစ်ထားသည့် ဥပဒေမဲ့ရည်ရွယ်ချက်များအတွက် အသုံးမပြုရန် သင်သဘောတူပြီး ယင်းတို့ကို ဖောက်ဖျက်သည့်လုပ်ဆောင်ချက်များတွင် ပါဝင်ခြင်းမရှိကြောင်း သင်မှသဘောတူ ပါသည်။ ထို့အပြင် သင်မှ သဘောတူညီထားသည်မှာ -

၉၊၂၊၁။ 8484Gas ထံမှ ကြိုတင်ခွင့်ပြုချက်မရယူဘဲ စီးပွားဖြစ်ရည်ရွယ်ချက်များအတွက် ဤ 8484Gas (Mini App) သို့မဟုတ် အကြောင်းအရာကို အသုံးပြုခြင်း။
၉၊၂၊၂။ 8484Gas ထံမှ ကြိုတင်စာရေးသားခွင့်ပြုချက်မရယူဘဲ မည်သည့်ရည်ရွယ်ချက် အတွက်မဆို နည်းပညာ၊ ဆော့ဖ်ဝဲလ် သို့မဟုတ် မည်သည့်ပရိုဂရမ်ကိုမဆို ကိုယ်တိုင် သို့မဟုတ် အလိုအလျောက် အသုံးပြု၍ ဝင်ရောက်ကြည့်ရှုခြင်း၊ စောင့်ကြည့်ခြင်း သို့မဟုတ် ကူးယူခြင်း။
၉၊၂၊၃။ 8484Gas (Mini App) သို့မဟုတ် ၎င်း၏အခြေခံအဆောက်အအုံအတွက် ဝန်ထုပ်ဝန်ပိုးဖြစ်စေသော သို့မဟုတ် ပြစ်ဒဏ်ချမှတ်နိုင်သည့် ကျိုးကြောင်း ဆီလျော်မှုမရှိသော မည်သည့်လှုပ်ရှားမှုတွင်မဆို ပါဝင်ခြင်း။
၉၊၂၊၄။ 8484Gas ထံမှ ကြိုတင်ရေးသားခွင့်ပြုချက်မရယူဘဲ မည်သည့်ရည်ရွယ်ချက် အတွက်မဆို ကြိုတင်စာရင်းသွင်းခြင်းလမ်းကြောင်းကို ကန့်သတ်ထားခြင်းမရှိဘဲ ဤ 8484Gas (Mini App) သို့ ဝင်ရောက်ရန် အဓိကလင့်ခ်တစ်ခု ဖန်တီးခြင်း အပါအဝင်။
၉၊၂၊၅။ ပြန်လည်ရောင်းချခြင်း၊ အသုံးပြုခြင်း၊ မိတ္တူကူးခြင်း၊ စောင့်ကြည့်ခြင်း (ပင့်ကူ သို့မဟုတ် ခြစ်ထုတ်ခြင်းပရိုဂရမ်များကို အသုံးပြုခြင်း သို့မဟုတ် အကန့်အသတ်မရှိ တပ်ဆင်ခြင်းအပါအဝင်) စီးပွားဖြစ်ရည်ရွယ်ချက်များ သို့မဟုတ် ပြိုင်ဆိုင်မှုဆိုင်ရာ လုပ်ဆောင်ချက်များအတွက် 8484Gas (Mini App) မှတဆင့်ရရှိနိုင်သည့် အကြောင်းအရာ ထုတ်လုပ်ခြင်း၊ ဆော့ဖ်ဝဲ၊ ထုတ်ကုန်များ သို့မဟုတ် ဝန်ဆောင်မှုများကို ပြသခြင်း၊ ဒေါင်းလုဒ်လုပ်ခြင်း သို့မဟုတ် ပါဝင်ဆောင်ရွက်ခြင်း။
၉၊၂၊၆။ 8484Gas (Mini App) ကို ပြန်လည်ထုတ်လုပ်ခြင်း ("ပုံစံ" သို့မဟုတ် "အလားတူပုံစံ" မှတဆင့်) သို့မဟုတ် 8484Gas ထံမှ ကြိုတင်စာရေးသားခွင့်ပြုချက်မရယူဘဲ အခြားဝဘ်ဆိုဒ်တွင် ဤ 8484Gas (Mini App) ၏ မည်သည့်အပိုင်းကိုမဆို ထည့်သွင်းဆောင်ရွက်ခြင်း။
၉၊၂၊၇။ သက်ဆိုင်ရာ ဥပဒေများ၊ စည်းမျဉ်းများ သို့မဟုတ် စည်းကမ်းများကို ဖောက်ဖျက်သည့် သို့မဟုတ် ဥပဒေမဲ့ သို့မဟုတ် ရာဇ၀တ်မှုဆိုင်ရာ လုပ်ဆောင်ချက်များကို လွယ်ကူချောမွေ့စေမည့် မည်သည့် ကြေညာချက်ကိုမဆို ပေးပို့ခြင်း။
၉၊၂၊၈။ အသရေဖျက်ခြင်း၊ ဆဲဆိုခြင်း၊ သို့မဟုတ် မှားယွင်းသောအချက်အလက်များ ပါ၀င်သည့် မည်သည့်အကြောင်းအရာများသို့ လင့်ခ်များပေးပို့ခြင်း သို့မဟုတ် ပံ့ပိုးပေးခြင်း။
၉၊၂၊၉။ အသရေဖျက်ခြင်း၊ ဆဲဆိုခြင်း၊ သို့မဟုတ် မှားယွင်းသောအချက်အလက်များ ပါ၀င်သောမည်သည့်အကြောင်းအရာများသို့ လင့်ခ်များပေးပို့ခြင်း သို့မဟုတ် ပံ့ပိုးပေးခြင်း။
၉၊၂၊၁၀။ မူပိုင်ခွင့်များ၊ ကုန်အမှတ်တံဆိပ်များ၊ ကုန်သွယ်မှုလျှို့ဝှက်ချက်များ၊ လျှို့ဝှက်အချက် အလက်များ၊ သို့မဟုတ် မူပိုင်ခွင့်ဆိုင်ရာ ထုတ်ဝေမှုများအပါအဝင် မည်သည့်ပုဂ္ဂိုလ် သို့မဟုတ် အဖွဲ့အစည်း၏ အခြားအခွင့်အရေးများကို ထိပါးစေသည့် ဆက်သွယ်ရေးများ ထုတ်လွှင့်ခြင်း သို့မဟုတ် ဖြန့်ဝေခြင်း။
၉၊၂၊၁၁။ တည်ဆဲဥပဒေအရ တားမြစ်ထားသော သို့မဟုတ် တည်ဆဲစာချုပ်ဆိုင်ရာ ဆက်ဆံရေးများမှ ဖြစ်ပေါ်လာသည့် အခွင့်အရေးနှင့် တာဝန်များကို ချိုးဖောက်သော မည်သည့်ဆက်ဆံရေးများကိုမဆို ပေးပို့ခြင်း။
၉၊၂၊၁၂။ မည်သည့်ရည်ရွယ်ချက်အတွက်မဆို တစ်ဦးချင်း သို့မဟုတ် အဖွဲ့အစည်းကို အတုအပပြုုလုပ်ခြင်း။
၉၊၂၊၁၃။ ပေးထားသည့်ထုတ်ပြန်ချက်များ၏ မူရင်းကိုဖုံးကွယ်ရန် အချက်အလက်များကို ကြိုးကိုင်ခြင်း သို့မဟုတ် အတုအယောင်ပြုလုပ်ခြင်း။
၉၊၂၊၁၄။ 8484Gas (Mini App) ကို ပျက်စီးစေခြင်း၊ ပိတ်ခြင်း၊ အဟန့်အတား သို့မဟုတ် အနှောင့်အယှက်ဖြစ်စေသော မည်သည့်နည်းဖြင့်မဆို ၎င်း၏လုပ်ဆောင်နိုင်စွမ်း သို့မဟုတ် အခြားအသုံးပြုသူများမှ 8484Gas (Mini App) ၏အသုံးပြုမှုကို ထိခိုက်စေနိုင်ခြင်း၊ ထို့အပြင်၊ သင်သည် မည်သည့်ဆော့ဖ်ဝဲလ်၊ ဟာ့ဒ်ဝဲ သို့မဟုတ် ဆက်သွယ်ရေးပစ္စည်းကိရိယာများ၏ လုပ်ဆောင်နိုင်စွမ်းကို ထိခိုက်စေခြင်း၊ အနှောင့်အယှက်ဖြစ်စေခြင်း သို့မဟုတ် ကန့်သတ်ခြင်းမပြုရပါ။
၉၊၂၊၁၅။ 8484Gas (Mini App) သို့မဟုတ် သက်ဆိုင်ရာ ဝဘ်ဆိုဒ်များ၊ အကောင့်များ၊ ကွန်ပျူတာစနစ်များ၊ သို့မဟုတ် ဟက်ကာ၊ စကားဝှက် ခိုးယူမှု သို့မဟုတ် အခြားအလားတူ နည်းလမ်းများမှတစ်ဆင့် Site သို့ ချိတ်ဆက်ထားသော ကွန်ရက်များသို့ ခွင့်ပြုချက်မရှိဘဲ ဝင်ရောက်ခွင့် သို့မဟုတ် ခွင့်ပြုချက်မရှိဘဲ ပြုပြင်မွမ်းမံမှုများ ပြုလုပ်ခြင်း။
၉၊၂၊၁၆။ 8484Gas (Mini App) မှ ရည်ရွယ်ချက်ရှိရှိ ပံ့ပိုးပေးသော နည်းလမ်းများမှတဆင့် ပစ္စည်းများ သို့မဟုတ် အချက်အလက်များကို ရယူရန် သို့မဟုတ် ကြိုးပမ်းခြင်း အပါအဝင်၊ သို့သော် အကန့်အသတ်မရှိစေဘဲ 8484Gas (Mini App) ပေါ်ရှိ အခြားနေရာများ ပါဝင်သည်။ ၎င်းတွင် အီးမေးလ်လိပ်စာများကဲ့သို့သော အခြားသူများ၏ အချက်အလက်စုဆောင်းမှုများ ပါဝင်သည်။ သို့သော် ကန့်သတ်ချက်မရှိစေရ။
၉၊၂၊၁၇။ ရှာဖွေရေးအင်ဂျင် ရလဒ်စာမျက်နှာများ ("SERPs") သို့မဟုတ် ကျင့်ဝတ်မဲ့ရှာဖွေရေးအင်ဂျင် ပိုမိုကောင်းမွန်အောင်ပြုလုပ်ခြင်း ("SEO") ကို ကြိုးကိုင်ရန် ရည်ရွယ်သော လိမ်လည်လှည့်ဖြားသည့် လှုပ်ရှားမှုများ သို့မဟုတ် လုပ်ဆောင်မှုများတွင် ပါဝင်ခြင်း။ "spamdexing" ဟု မှတ်ယူနိုင်သည့် ကျင့်ဝတ်မဲ့ SEO အလေ့အကျင့်များတွင် ဖုံးကွယ်ခြင်း၊ အထင်မှားစေသော မက်တာဒေတာ၊ ခေါင်းစဉ်တက်ဂ်များကို မသင့်လျော်စွာ အသုံးပြုခြင်း၊ လင့်ခ်အစီအစဉ်များ၊ Google BOOMING ကဲ့သို့ မသက်ဆိုင်သော ရှာဖွေရေးသော့ချက်စာလုံးများ၊ ဝှက်ထားသော စာသား သို့မဟုတ် လင့်ခ်များ နှင့် အခြားသော ဆက်စပ်လှုပ်ရှားမှုများကြားတွင် spam မှတ်ချက်များတင်ခြင်းများ သို့မဟုတ်
၉၊၂၊၁၈။ 8484Gas (Mini App)၊ 8484Gas၊ ၎င်း၏ တွဲဖက်များ၊ ဝန်ထမ်းများ သို့မဟုတ် 8484Gas ၏ ဂုဏ်သိက္ခာကို ထိခိုက်စေနိုင်သော သို့မဟုတ် ထိခိုက်နစ်နာစေမည့် မည်သည့် လုပ်ဆောင်မှုမျိုးကိုမဆို ပြုလုပ်ခြင်းတို့ မဆောင်ရွက်ရန်ဖြစ်သည်။

၉၊၃။ အခြားနည်းဖြင့် အတိအလင်းဖော်ပြထားခြင်းမရှိပါက၊ ပင်မဆိုက်စာမျက်နှာများမှလွဲ၍ အခြားစာမျက်နှာများ၊ ဘောင်များ၊ ဝဘ်စာမျက်နှာများ သို့မဟုတ် ၎င်းတွင်ပါရှိသော အကြောင်းအရာများကို သင်အားဖန်တီးခွင့်မပြုပါ။ ထို့အပြင် သင်သည် 8484Gas ၏ ရှင်းလင်းစွား ရေးသားထားသော ခွင့်ပြုချက်မရှိဘဲ စီးပွားဖြစ်အီးမေးလ်ဖြင့် 8484Gas (Mini App) ၏ မည်သည့်အစိတ်အပိုင်းကိုမျှ လင့်ခ်ချိတ်ဆက်ခြင်းမပြုရပါ။

၉၊၄။ ဤ 8484Gas (Mini App) မှတစ်ဆင့် ကြိုတင်မှာယူခြင်းဖြင့် သင်သည် မည်သည့် ပိတ်ဆို့အရေးယူမှု အစီအစဉ်မှ ချမှတ်ထားသော တားမြစ်ချက် သို့မဟုတ် ကန့်သတ်ချက်များကို မလိုက်နာကြောင်းနှင့် ငွေကြေးခဝါချမှု ဆန့်ကျင်ရေး စည်းမျဉ်းများအောက်တွင် မည်သည့်ပြစ်ဒဏ်မှ ခံထားခြင်း မဟုတ်ကြောင်း အာမခံပါသည်။`,
    },
  },
  {
    en: {
      title: "10. RIGHTS TO USER CONTENT",
      body: `10.1 By completing a booking, you consent to receive electronic communications from KBZpay and 8484Gas, which may include invitations to submit reviews or feedback regarding the Vendors you have selected. 8484Gas reserves the exclusive right to determine whether your review will be published on the 8484Gas (Mini App). Any reviews displayed by 8484Gas may include your comments, service ratings, and your name.

10.2 In providing a review, you agree to ensure that:

a. you own and control all rights to the reviews you submit to the 8484Gas (Mini App);
b. the content of your review is accurate and free from misrepresentation; and
c. the use, performance, or transmission of your review's content does not violate these Terms or any applicable laws and regulations, does not infringe upon any third party's rights, and does not cause harm to any party.

10.3 You are fully responsible for the content of the reviews you provide or submit. You grant 8484Gas (Mini App) the authority to take action in the event that any party violates your rights or the rights of KBZPay and 8484Gas.

10.4 Content reviews provided will be considered non-confidential, and 8484Gas has no obligation to treat them as confidential information. Without limiting any provisions in these Terms, 8484Gas retains sole discretion to use the content reviews as it deems appropriate, which may include, but is not limited to, removing, modifying, or otherwise editing the reviews. 8484Gas has no obligation to compensate you for any content you submit in a review, including content that has been altered, removed, or edited. 8484Gas is also not obligated to credit or mention authors or any third parties associated with the reviews.

10.5 In any case, you hereby agree that regarding the content of the reviews:

a) You do not require any attribution or identification for any derivative works created from your reviews;
b) You consent to the use of all content from reviews submitted to 8484Gas by 8484Gas and its employees, 8484Gas (Mini App), successors, and assigns in any manner and at any time. This includes, but is not limited to, publishing, modifying, and reproducing the review in whole or in part;
c) You hereby waive all rights and agree not to claim any rights in the content review.`,
    },
    mm: {
      title: "၁၀။ အသုံးပြုသူ၏အခွင့်အရေးများ",
      body: `၁၀၊၁။ ကြိုတင်စာရင်းသွင်းခြင်းကို ပြီးမြောက်ခြင်းဖြင့် သင်သည် သင်ရွေးချယ်ထားသော မိတ်ဖက်ဝန်ဆောင်မှုပေးသူများ နှင့် ပတ်သက်သည့် သုံးသပ်ချက်များနှင့် အကြံပြုချက်များကို တင်ပြရန် ဖိတ်ကြားချက်များ အပါအဝင် KBZPay နှင့် 8484Gas မှ အီလက်ထရွန်နစ် ဆက်သွယ်မှုများကို လက်ခံရယူရန် သဘောတူညီပါသည်။ 8484Gas သည် သင့်သုံးသပ်ချက်ကို 8484Gas (Mini App) ပေါ်တွင် လွှင့်တင်ခြင်းရှိမရှိ ဆုံးဖြတ်ရန် သီးသန့်အခွင့်အရေးကို လက်ဝယ်ရှိသည်။ 8484Gas မှပြသထားသည့် ဝန်ဆောင်မှုအဆင့် သတ်မှတ်ချက်များ သုံးသပ်ချက်တိုင်းတွင် သင့်မှတ်ချက်များနှင့် သင့်အမည်ပါဝင်နိုင်ပါသည်။

၁၀၊၂။ သုံးသပ်မှုပေးရာတွင်၊ သေချာစေရန် သင်သဘောတူသည်မှာ -

(က) 8484Gas (Mini App) သို့ သင်တင်ပြသော သုံးသပ်ချက်များအတွက် အခွင့်အရေးအားလုံးကို ထိန်းချုပ်ခြင်း။
(ခ) သင့်သုံးသပ်ချက်၏ အကြောင်းအရာသည် တိကျပြီး လွဲမှားစွာ တင်ပြခြင်းမှ ကင်းလွတ်ခြင်းဖြစ်ကြောင်း။
(ဂ) သင့်သုံးသပ်ချက်၏ အကြောင်းအရာကို အသုံးပြုခြင်း၊ စွမ်းဆောင်ရည် သို့မဟုတ် ထုတ်လွှင့်ခြင်းသည် ဤစည်းမျဥ်းစည်းမျဥ်းများ သို့မဟုတ် တည်ဆဲဥပဒေများနှင့် စည်းမျဉ်းများကို ချိုးဖောက်ခြင်းမရှိပါ မည်သည့်တတိယပါတီ၏အခွင့်အရေးကိုမျှ မထိပါးစေဘဲ မည်သည့်ပါတီကိုမျှ ထိခိုက်မှုမဖြစ်စေခြင်း တို့ဖြစ်သည်။

၁၀၊၃။ သင်ပံ့ပိုးပေးသော သို့မဟုတ် တင်ပြသည့် သုံးသပ်ချက်များ၏ အကြောင်းအရာအတွက် သင်သည် အပြည့်အဝ တာဝန်ရှိပါသည်။ သင့်အခွင့်အရေးများ သို့မဟုတ် KBZPay နှင့် 8484Gas ၏အခွင့်အရေးများကို မည်သည့်ပါတီကမဆို ချိုးဖောက်ပါက အရေးယူဆောင်ရွက်ရန် 8484Gas (Mini App) ကို သင်မှအခွင့်အာဏာပေးထားသည်။

၁၀၊၄။ ပေးထားသော အကြောင်းအရာ သုံးသပ်ချက်များကို လျှို့ဝှက်မဟုတ်ဟု ယူဆမည်ဖြစ်ပြီး 8484Gas သည် ၎င်းတို့အား လျှို့ဝှက်အချက်အလက်များအဖြစ် သဘောထားရန် တာဝန်မရှိပါ။ ဤစည်းမျဥ်းစည်းမျဥ်းများတွင် မည်သည့်ပြဋ္ဌာန်းချက်ကိုမျှ ကန့်သတ်ခြင်းမရှိဘဲ၊ 8484Gas သည် သင့်လျော်သည်ဟု ယူဆသည့် အကြောင်းအရာသုံးသပ်ချက်များကို အသုံးပြုရန် သုံးသပ်ချက်များကို ဖယ်ရှားခြင်း၊ ပြုပြင်ခြင်း သို့မဟုတ် အခြားနည်းဖြင့် တည်းဖြတ်ခြင်းတွင် အကန့်အသတ်မရှိ ပါဝင်နိုင်သော်လည်း ကန့်သတ်မထားပါ။ 8484Gas သည် ပြောင်းလဲခြင်း၊ ဖယ်ရှားခြင်း သို့မဟုတ် တည်းဖြတ်ထားသော အကြောင်းအရာများအပါအဝင် ပြန်လည်သုံးသပ်မှုတစ်ခုတွင် သင်တင်ပြသည့်အကြောင်းအရာများအတွက် သင့်အား လျော်ကြေးပေးရန်တာဝန်မရှိပါ။ 8484Gas သည် ရေးသားသူများ သို့မဟုတ် သုံးသပ်ချက်များနှင့် ဆက်စပ်နေသည့် မည်သည့်ပြင်ပအဖွဲ့အစည်းကိုမဆို ခရက်ဒစ် သို့မဟုတ် ဖော်ပြရန် တာဝန်မရှိပါ။

၁၀၊၅။ မည်သို့ပင်ဆိုစေ၊ သုံးသပ်ချက်၏ အကြောင်းအရာနှင့်ပတ်သက်၍ ဤတွင် သင်သဘောတူသည်မှာ -

(၁) သင့်သုံးသပ်ချက်များမှ ဖန်တီးထားသော ဆင်းသက်လာသည့် မည်သည့် လက်ရာများအတွက်မဆို ထည့်သွင်းဖော်ပြခြင်း သို့မဟုတ် သက်သေခံခြင်း မလိုအပ်ပါ။
(၂) 8484Gas နှင့် ၎င်း၏ဝန်ထမ်းများ၊ 8484Gas (Mini App)၊ ဆက်ခံသူများ၊ နှင့် တာဝန်ပေးထားသူများအား တင်ပြသော သုံးသပ်ချက်များအားလုံးအား မည်သည့်နည်းနှင့်မဆို အချိန်မရွေး 8484Gas မှ အသုံးပြုရန် သင်သဘောတူညီပါသည်။
(၃) ဤတွင် သင်သည် အကြောင်းအရာပြန်လည်သုံးသပ်ခြင်းတွင် အခွင့်အရေး အားလုံးကို စွန့်လွှတ်ပြီး မည်သည့်အခွင့်အရေးကိုမဆို မတောင်းဆိုရန် သဘောတူပါသည်။`,
    },
  },
  {
    en: {
      title: "11. USEAGE RESTRICTIONS",
      body: `You hereby agree not to use the 8484Gas (Mini App) or its Content for any unlawful or unauthorized activities. You agree that you will not employ any equipment, software, or technologies that may obstruct or attempt to obstruct the operation of this 8484Gas (Mini App). Additionally, you agree not to use this 8484Gas (Mini App) or its Content for commercial purposes. You also agree not to seek, create, search for, use, or send automated agents or other technologies to collect or obtain information from this 8484Gas (Mini App) or otherwise interact with it.`,
    },
    mm: {
      title: "၁၁။ အသုံးပြုမှု ကန့်သတ်ချက်များ",
      body: `ဥပဒေမဲ့ သို့မဟုတ် ခွင့်ပြုချက်မရှိဘဲ လုပ်ဆောင်မှုများအတွက် 8484Gas (Mini App) သို့မဟုတ် ၎င်း၏ အကြောင်းအရာကို အသုံးမပြုရန် ဤတွင် သင်သဘောတူပါသည်။ ဤ 8484Gas (Mini App) ၏လည်ပတ်မှုကို အဟန့်အတားဖြစ်စေသော သို့မဟုတ် အနှောက်အယှက် ဖြစ်စေသော မည်သည့်စက်ပစ္စည်း၊ ဆော့ဖ်ဝဲ သို့မဟုတ် နည်းပညာများကိုမျှ အသုံးချမည်မဟုတ်ကြောင်း သင်သဘောတူပါသည်။ ထို့အပြင်၊ သင်သည် ဤ 8484Gas (Mini App) သို့မဟုတ် ၎င်း၏အကြောင်းအရာကို စီးပွားဖြစ်ရည်ရွယ်ချက်အတွက် အသုံးမပြုရန် သဘောတူပါသည်။`,
    },
  },
  {
    en: {
      title: "12. LIMITATION OF LIABLILITY",
      body: `Without prejudice to the provisions of these terms, each party's liability is limited and excluded to the fullest extent permitted by law, excluding personal injury and death. KBZPay and 8484Gas will not be held liable for any losses or damages, whether direct or indirect, arising from or related to your use of this 8484Gas (Mini App) or any links contained within it. This includes, but is not limited to, special, incidental, punitive, or consequential damages, as well as other economic losses, even if KBZPay and 8484Gas have been notified of the potential for such losses or damages. Your sole remedy in this case is to discontinue use of the 8484Gas (Mini App).`,
    },
    mm: {
      title: "၁၂။ တာဝန်ဝတ္တရားကန့်သတ်ချက်",
      body: `ဤစည်းမျဥ်းစည်းမျဥ်းများပါ ပြဌာန်းချက်များကို ထိခိုက်စေခြင်းမရှိဘဲ ပုဂ္ဂိုလ်ရေးဒဏ်ရာနှင့် သေဆုံးခြင်းမှအပ ဥပဒေအရ ခွင့်ပြုထားသည့် အတိုင်းအတာအထိ ပါတီတစ်ခုချင်းစီ၏ တာဝန်ဝတ္တရားကို အကန့်အသတ်နှင့် ချန်လှပ်ထားသည်။ တိုက်ရိုက် သို့မဟုတ် သွယ်ဝိုက်ဖြစ်စေ ၊ ဤ 8484Gas (Mini App) ကို သင်အသုံးပြုခြင်း သို့မဟုတ် ၎င်းအတွင်းတွင်ပါရှိသော လင့်ခ်များပါရှိသော မည်သည့် ဆုံးရှုံးမှု သို့မဟုတ် ပျက်စီးမှုများအတွက် KBZPay နှင့် 8484Gas တို့မှ တာဝန်ရှိမည်မဟုတ်ပါ။ ဤကိစ္စတွင် သင်၏တစ်ခုတည်းသော ကုစားမှုမှာ 8484Gas (Mini App) ၏အသုံးပြုမှုကို ရပ်ဆိုင်းရန်ဖြစ်သည်။`,
    },
  },
  {
    en: {
      title: "13. IDEMNIFICATION",
      body: `You agree to indemnify and hold KBZPay and 8484Gas, along with its employees, affiliates, staff, and partners, harmless from any and all claims, demands, liabilities, damages, or losses, including legal fees, arising from third-party claims related to:

a. your use of the 8484Gas (Mini App);
b. any Content provided, given, or accessed through this 8484Gas (Mini App);
c. your violation of these Terms;
d. any infringement of other rights or obligations; and/or
e. any actions or omissions by you, whether negligent, unlawful, or otherwise.`,
    },
    mm: {
      title: "၁၃။ နစ်နာကြေးပေးလျော်ခြင်း",
      body: `သင်သည် KBZPay နှင့် 8484Gas တို့နှင့်တကွ ၎င်း၏ဝန်ထမ်းများ၊ တွဲဖက်လုပ်ကိုင်သူများ၊ ဝန်ထမ်းများနှင့် လုပ်ဖော်ကိုင်ဖက်များအား မည်သည့်အရာနှင့်မျှ အန္တရာယ်မရှိစေရန်နှင့် တရားဝင် အခကြေးငွေများအပါအဝင် ပြင်ပအဖွဲ့အစည်းမှ အရေးဆိုမှုများမှ ပေါ်ပေါက်လာသော အရေးဆိုမှု၊ တောင်းဆိုမှု၊ တာဝန်ခံမှု၊ ပျက်စီးမှု၊ သို့မဟုတ် ဆုံးရှုံးမှုများအားလုံးအတွက် နစ်နာကြေးပေးရမည်ဖြစ်ကြောင်း သဘောတူညီထားသည်မှာ -

(က) သင်သည် 8484Gas (Mini App) အားအသုံးပြုခြင်း၊
(ခ) ဤ 8484Gas (Mini App) မှတစ်ဆင့် ပံ့ပိုးပေးထားသည့် သို့မဟုတ် ပေးထားသည်များအား ဝင်ရောက်ကြည့်ရှုသည့် အကြောင်းအရာတစ်ခုခု
(ဂ) ဤစည်းမျဥ်းစည်းကမ်းများအား သင်ချိုးဖောက်မှု၊
(ဃ) အခြားအခွင့်အရေး သို့မဟုတ် တာဝန်များကို ချိုးဖောက်ခြင်း၊ နှင့်/သို့မဟုတ်
(င) ပေါ့ဆမှု၊ ဥပဒေမဲ့ဖြစ်စေ သို့မဟုတ် အခြားနည်းဖြင့်ဖြစ်စေ သင်ပြုလုပ်သည့် လုပ်ဆောင်ချက် သို့မဟုတ် ပျက်ကွက်မှုများ။`,
    },
  },
  {
    en: {
      title: "14. THIRD PARTY LINKS AND CONTENTS",
      body: `8484Gas (Mini App) may include links to websites operated by parties other than 8484Gas. KBZPay and 8484Gas do not control these sites or links and are not responsible for their content, privacy practices, or any other activities associated with them. 8484Gas, along with other third parties, may upload automated search results or provide links to additional sites. 8484Gas offers opportunities for third parties to deliver, load, transmit, or otherwise provide any information, data, text, images, sounds, graphics, videos, messages, reviews, or other materials ("Content") through this 8484Gas (Mini App). 8484Gas does not review or control the sites, sources, or the Content. You acknowledge that KBZPay and 8484Gas are not responsible for the content or availability of such sites and resources, and KBZPay and 8484Gas do not endorse or recommend, nor are KBZPay and 8484Gas responsible for the origins of the site or the Content. You agree to release KBZPay and 8484Gas from any and all liabilities, expenses, losses, or damages, whether directly or indirectly caused, or allegedly caused, by or in connection with your use of the Content, site, or resource.`,
    },
    mm: {
      title: "၁၄။ တတိယအဖွဲ့အစည်း လင့်ခ်များနှင့် အကြောင်းအရာများ",
      body: `8484Gas (Mini App) တွင် 8484Gas မှလွဲ၍ အခြားပါတီများမှ လုပ်ဆောင်သော ဝဘ်ဆိုဒ်များသို့ လင့်ခ်များ ပါဝင်နိုင်သည်။ KBZPay နှင့် 8484Gas သည် ဤဆိုက်များ သို့မဟုတ် လင့်ခ်များကို ထိန်းချုပ်ခြင်းမရှိသည့်အပြင် ၎င်းတို့၏အကြောင်းအရာ၊ ကိုယ်ရေးကိုယ်တာ အလေ့အကျင့်များ သို့မဟုတ် ၎င်းတို့နှင့်ဆက်စပ်နေသည့် အခြားလုပ်ဆောင်ချက် များအတွက် တာဝန်မရှိပါ။ အကြောင်းအရာ၊ ဝဘ်ဆိုက် သို့မဟုတ် အရင်းအမြစ်ကို အသုံးပြုခြင်းဖြင့် တိုက်ရိုက်ဖြစ်စေ သို့မဟုတ် သွယ်ဝိုက်၍ဖြစ်စေ သို့မဟုတ် ဖြစ်ပေါ်စေသည်ဟု စွပ်စွဲခြင်းရှိ/မရှိ၊ ကုန်ကျစရိတ်များ၊ ဆုံးရှုံးမှုများ သို့မဟုတ် ပျက်စီးဆုံးရှုံးမှုများမှ KBZPay နှင့် 8484Gas ကို ဖြေလျှော့ပေးရန် သင်သဘောတူပါသည်။`,
    },
  },
  {
    en: {
      title: "15. TERMINATION, SUSPENDING AND CANCELLATION OF SERVICES",
      body: `The User can terminate the Service in Mini App, if the User has no wish to use 8484Gas (Mini App) Service. Without giving prior notice to the User, KBZPay or 8484Gas (Mini App) may terminate, suspend or cancel the Service at any time for any reason. The User agrees and accepts that KBZPay and 8484Gas (Mini App) shall not be responsible to anyone for such acts.`,
    },
    mm: {
      title: "၁၅။ ၀န်ဆောင်မှုရပ်ဆိုင်းခြင်း၊ ဆိုင်းငံ့ခြင်း၊ ဖျက်သိမ်းခြင်း",
      body: `အသုံးပြုသူအနေဖြင့် 8484Gas (Mini App) ဝန်ဆောင်မှုကို ဆက်လက်အသုံးမပြုလိုပါက ဝန်ဆောင်မှု ရပ်ဆိုင်းခြင်းဆိုင်ရာ နည်းလမ်းများအတိုင်း ဝန်ဆောင်မှုကို ရပ်ဆိုင်းနိုင်သည်။ မည်သည့်အကြောင်း ကြောင်းကြောင့်မဆို အသုံးပြုသူအား ကြိုတင်အကြောင်းကြားခြင်းမရှိဘဲ မည်သည့်အချိန်တွင်မဆို အသုံးပြုသူ၏ ဤဝန်ဆောင်မှု အသုံးပြုနေခြင်းကို ဖျက်သိမ်းခြင်း၊ ဆိုင်းငံ့ခြင်း၊ ရပ်ဆိုင်းခြင်းတို့ကို KBZPay မှဖြစ်စေ သို့မဟုတ် 8484Gas (Mini App) မှဖြစ်စေ ပြုလုပ်ခွင့်ရှိသည်။`,
    },
  },
  {
    en: {
      title: "16. SENDING NOTIFICATIONS",
      body: `By using the Service provided by 8484Gas (Mini App), the User agrees and accepts sending of notifications to the 8484Gas (Mini App) account of the User and making contact through the phone or email address which have been used to open 8484Gas (Mini App). Notifications on programs, promotion programs, and surveys collected from the Users will be sent to the Users by 8484Gas (Mini App) through a notification in the App or SMS or other means of communication. Moreover, the User accepts sending of information on payment to be made by the User for sending agreements, disclosure, and other information. 8484Gas (Mini App) has the right to send data, content, text, software, voice mail, photos, designs, videos, messages, and related contents and other content through 8484Gas (Mini App) to the User who has bought this Service. The User is the sole responsible person for the data provided when he is registered and any consequences arising out of such data.`,
    },
    mm: {
      title: "၁၆။ အသိပေးချက်များပေးပို့ခြင်း",
      body: `8484Gas (Mini App) ဝန်ဆောင်မှုကို အသုံးပြုခြင်းဖြင့် အသုံးပြုသူ၏ 8484Gas (Mini App) အကောင့်ထံသို့ အကြောင်းကြား ချက်များပေးပို့ခြင်း၊ 8484Gas (Mini App) အကောင့်ဖွင့်စဉ်က စာရင်းပေးသွင်းထားသော ဖုန်းနံပါတ် သို့မဟုတ် Email သို့ 8484Gas (Mini App) မှ ဆက်သွယ်ခြင်းတို့ကို သဘောတူလက်ခံပါသည်။ 8484Gas (Mini App) အနေဖြင့် အစီအစဉ်အသစ်များ၊ ပရိုမိုးရှင်းအစီအစဉ်များ၊ အသုံးပြုသူများထံမှစစ်တမ်းကောက်ယူခြင်းများ စသည်တို့ကို App ထဲမှ အသိပေးချက်များမှ တဆင့်ဖြစ်စေ၊ SMS ကတဆင့်ဖြစ်စေ၊ အခြားသော ဆက်သွယ်ရေး နည်းလမ်းများမှတဆင့်ဖြစ်စေ ဆက်သွယ်ပေးပို့သွားမှာ ဖြစ်ပါသည်။`,
    },
  },
  {
    en: {
      title: "17. LIMITATIONS",
      body: `17.1 8484Gas is for the User's personal and non-commercial use only. The User agrees that in receiving the Service, he will not take the following measures:

a. using other means which are not of the media arranged by 8484Gas (Mini App),
b. disrupting the Service or using other automatic means by using Robot, Spider, Scraper, Script, and Web Crawler.
c. concealing the source of receiving the Service by forging identifier codes or changing data.
d. conducting acts and using software that can harm 8484Gas (Mini App) server.
e. sending texts, writing emails, or using virus software to disrupt the Service.

17.2 User shall use the 8484Gas (Mini App) Service in accordance with the Terms and Conditions set 8484Gas (Mini App) Service. The User agrees that he/she will not use the 8484Gas (Mini App) Service by breaching the Terms and Conditions set by 8484Gas (Mini App) or exceeding the rules; and without the approval of the concerned official of 8484Gas (Mini App), he/she shall not use the social media Pages such as Facebook, Instagram, YouTube and Web Page of the 8484Gas.

17.3 As a rule of using this Service, the User assures and guarantees that he will not use this Service with a purpose which is against the law. The User agrees that he will follow the existing law, regulations, bylaws and provisions relating to the use of Services.`,
    },
    mm: {
      title: "၁၇။ ကန့်သတ်တားမြစ်ချက်များ",
      body: `၁၇၊၁။ 8484Gas ဝန်ဆောင်မှုကို အသုံးပြုသူများအနေဖြင့် စီးပွားဖြစ်အသုံးပြုခွင့်မရှိပါ။ အသုံးပြုသူအနေဖြင့် ဝန်ဆောင်မှုအား ရယူရာတွင်

(က) 8484Gas (Mini App) မှ စီစဉ်ပေးထားသော ကြားခံစနစ် မဟုတ်သည့် အခြားနည်းလမ်းများကို အသုံးပြုခြင်း၊
(ခ) ဝန်ဆောင်မှုများရယူရာတွင် Robot၊ Spider၊ Scraper၊ Script၊ Web Crawler များအသုံးပြု၍ နှောင့်ယှက်ခြင်းများ ပြုလုပ်ခြင်းနှင့် အခြားအလိုအလျောက် နည်းလမ်းများကို အသုံးပြုခြင်း၊
(ဂ) ဝန်ဆောင်မှုကို ရယူခြင်း၏ ဇာတ်မြစ်ကို ဖုံးကွယ်ရန်အတွက် Identifier ကုဒ်နံပါတ်များကို အတုအပပြုလုပ်ခြင်း၊ အချက်အလက်များကို လိုသလိုပြုပြင်ခြင်း၊
(ဃ) 8484Gas (Mini App) ဆာဗာ အား ပျက်ဆီးစေမည့်လုပ်ရပ်များ၊ ဆော့ဖ်ဝဲလ်များ အသုံးပြုခြင်း၊
(င) နှောင့်ယှက်ဖျက်ဆီးလိုသော ရည်ရွယ်ချက်ဖြင့်စာများ၊ အီးမေးလ်များရေးသားခြင်း၊ ဗိုင်းရပ်စ်ပါသောဆော့ဖ်ဝဲလ်များ အသုံးပြုခြင်းများကို လုံး၀ မပြုလုပ်ပါဟု သဘောတူပါသည်။

၁၇၊၂။ အသုံးပြုသူသည် 8484Gas (Mini App) ဝန်ဆောင်မှုကို 8484Gas (Mini App) ဝန်ဆောင်မှုမှ သတ်မှတ်ပေးထားသော စည်းကမ်းများနှင့် သတ်မှတ်ချက်များဘောင်အတွင်းကသာ အသုံးပြုရမည် ဖြစ်သည်။

၁၇၊၃။ ဤဝန်ဆောင်မှုအသုံးပြုခြင်းဆိုင်ရာ စည်းကမ်းချက်အဖြစ် ဝန်‌ဆောင်မှုများအား ဥပဒေနှင့်မညီသည့် မည်သည့် ရည်ရွယ်ချက် အတွက်မှ အသုံးပြုမည်မဟုတ်ကြောင်းကို အသုံးပြုသူမှ အာမခံသည်ဖြစ်သည်။`,
    },
  },
  {
    en: {
      title: "18. INDEMNITY",
      body: `The User agrees to indemnify KBZ or KBZPay or 8484Gas, its directors or officers or staff or representatives or agents and third parties and save their harmless against any and all claims including but not limited to costs and damages including but not limited to, legal fees) arising from Customer's use of the Mini App or Customer's breach of these Terms.`,
    },
    mm: {
      title: "၁၈။ လျော်ကြေး",
      body: `အသုံးပြုသူမှ Mini App အား အသုံးပြုခြင်း သို့မဟုတ် ဤစည်းမျဉ်းစည်းကမ်းသတ်မှတ်ချက်များအား ချိုးဖောက်ခြင်းကြောင့် ဖြစ်ပေါ်လာသော 8484Gas သို့မဟုတ် ကမ္ဘောဇဘဏ် သို့မဟုတ် KBZPay၊ ၎င်း၏ဒါရိုက်တာများ၊ အရာရှိများ၊ ဝန်ထမ်းများ၊ ကိုယ်စားလှယ်များ၊ အေးဂျင့်များနှင့် တတိယအဖွဲ့အစည်း၏ ထိခိုက်နစ်နစ်မှုတောင်းဆိုချက်အားလုံး၊ တာဝန်ယူမှု၊ (ပါဝင်သော်လည်း အကန့်အသတ်မရှိ၊ တရားဝင်အခကြေးငွေများ) ကုန်ကျစရိတ်၊ ပျက်စီးမှုများအားလုံးအတွက် လျော်ကြေးပေးရန် အသုံးပြုသူမှသဘောတူသည်။`,
    },
  },
  {
    en: {
      title: "19. REPRESENTATION AND WARRANTIES",
      body: `The User acknowledges and agrees that the contents in 8484Gas (Mini App) is provided "as it is" and "as available". Accepting or using any contents, goods or products or Services displayed on 8484Gas (Mini App) is at the User's sole risk and discretion. All liabilities for loss and damages of the User or any party relating to using any content on 8484Gas (Mini App) or Services or any website links whether they are stated in the agreement or it is due to ignorance shall be excluded. Although KBZPay and 8484Gas (Mini App) have exerted reasonable efforts to make sure that Services provided can be achieved at all times, KBZPay and 8484Gas (Mini App) will not guarantee or represent that 8484Gas (Mini App) is safe or no technical problems or no interruption or no error or no virus. The User understands and agrees that KBZPay and 8484Gas (Mini App) will not be responsible for temporary interruption in the platform due to scheduled system maintenance, or the Internet or electronic communication or other forces. KBZ does not assume any liability for the quality, condition or other representations of the Services provided by 8484Gas or guarantee the accuracy or completeness of the information (including service information, photos and images of the services) displayed on the 8484Gas's listing/offering on the Mini App.`,
    },
    mm: {
      title: "၁၉။ ကိုယ်စားပြုချက်များ၊ အာမခံချက်များ",
      body: `8484Gas (Mini App) ပေါ်ရှိ အကြောင်းအရာများ "အရှိအတိုင်း" နှင့် "ရရှိနိုင်သည့်အတိုင်း သာပေးထားခြင်းဖြစ်ကြောင်းကို အသုံးပြုသူမှ သိရှိသဘောတူပြီး Mini App ပေါ်တွင် ဖော်ပြထားသော ဖော်ပြချက်များပေါ်တွင် မှီတည်၍ မည်သည့်အကြောင်းအရာကိုမဆို၊ ကုန်ပစ္စည်းများ၊ ထုတ်ကုန်များ သို့မဟုတ် ဝန်ဆောင်မှုများ၏ အသုံးပြုသူမှလက်ခံခြင်း သို့မဟုတ် ရယူအသုံးပြုခြင်းသည် အသုံးပြုသူတစ်ဦးတည်း၏ အန္တရာယ်နှင့် ဆုံးဖြတ်ချက်ဖြင့် လက်ခံရယူခြင်းဖြစ်သည်။`,
    },
  },
  {
    en: {
      title: "20. INTELLECTUAL PROPERTY RIGHTS",
      body: `KBZ is an owner of all intellectual property rights, whether in contents or wording, pictures, signs, logo, trade service marks, trade name as well as all design works, in all documents, websites of KBZ, and KBZPay Application. 8484Gas (Mini App) and its partners and other related businesses are owners of all intellectual property rights, whether in contents or wordings, of logo, the name of 8484Gas (Mini App), pictures, signs, and trade Service mark. name, logo and Service mark. The User must not exploit the intellectual property right of KBZ or make any advertisement of the 8484Gas Mini App without receiving prior written consent from KBZ. The User shall not perform or allow any third party to perform any action that might cause damage to the image, trademark, trade name, or other intellectual property right of KBZ.`,
    },
    mm: {
      title: "၂၀။ အသိဉာဏ်ပစ္စည်းများဆိုင်ရာ မူပိုင်ခွင့်",
      body: `စာရွက်စာတမ်း၊ ကမ္ဘောဇ၏ဝဘ်ဆိုက်နှင့် KBZPay Application ဝန်ဆောင်မှု အမည်နှင့် ကုန်အမှတ်တံဆိပ်များအပါအဝင် အားလုံးတွင် အကြောင်းအရာအဖြစ်ဖြင့်ဖြစ်စေ၊ စကားအသုံးအနှုန်း ပုံစံအဖြစ် ဖြင့်ဖြစ်စေ ပါရှိသော ကုန်အမှတ်တံဆိပ်၊ သင်္ကေတ၊ စာလုံးအမှတ်အသား၊ လုပ်ငန်းဝန်ဆောင်မှု အမှတ်အသား၊ ကုန်အမှတ်တံဆိပ်အမည်နှင့်  ဒီဇိုင်းလက်ရာအားလုံး၏ ဉာဏပစ္စည်းဆိုင်ရာ မူပိုင်ခွင့်အရပ်ရပ်သည် ကမ္ဘောဇ၏မူပိုင် ဖြစ်သည်။`,
    },
  },
  {
    en: {
      title: "21. DISCLAIMER",
      body: `In any situation, KBZ including its staff, directors, agents, representatives, and subsidiaries; 8484Gas (Mini App) and its partners, members, staff, representatives, and those who have been granted copyright shall not be responsible for the loss of the User and other parties directly or indirectly for breaching of the said Terms and Conditions by the User or due to information received from the Service, software, products, and Service; lawsuit, litigation, court decision, loss and liabilities according to the agreement or civil case or irrevocable responsibility or cost or damage or claims made against the User. The User understands and agrees that he is the only responsible person to settle such claims. Regarding the use of 8484Gas (Mini App), the remedial action to be taken is to terminate the use of 8484Gas (Mini App) by the User. Organizations of KBZ, its agents, representatives, and Service providers shall not be responsible directly or indirectly or as a consequence for damages and claims for using 8484Gas (Mini App) by the User.`,
    },
    mm: {
      title: "၂၁။ တာဝန်မရှိကြောင်းရှင်းလင်းဖော်ပြချက်",
      body: `မည်သည့်အခြေအနေတွင်ဖြစ်စေ အထက်ဖော်ပြပါ စည်းမျဉ်းစည်းများကို အသုံးပြုသူမှ ဖောက်ဖျက်ခြင်း၊ ချိုးဖောက်ခြင်းကြောင့် (သို့မဟုတ်) စာချုပ်အရဖြစ်စေ၊ တရားမနစ်နာမှုအရဖြစ်စေ၊ ယတိပြတ်တာဝန်ရှိမှုကြောင့် ဖြစ်စေ (သို့မဟုတ်) ဤ ဝန်ဆောင်မှုကို ရယူအသုံးပြုခြင်းကြောင့် ကုန်ကျစရိတ်၊ နစ်နာကြေး၊ တောင်းဆိုချက်၊ အရေးယူဆောင်ရွက်မှု၊ တရားစွဲ ဆိုခြင်း၊ ဥပဒေအဆုံးအဖြတ်၊ ဆုံးရှုံးမှုနှင့်တာဝန်ရှိမှုများ (သို့မဟုတ်) ဝန်ဆောင်မှုမှတဆင့် ရရှိသော အချက်အလက်များအတွက် ကမ္ဘောဇ (၎င်း၏ဝန်ထမ်းများ၊ ဒါရိုက်တာများ၊ အေးဂျင့်များ၊ ကိုယ်စားလှယ်များ၊ လုပ်ငန်းခွဲများအပါအဝင်)၊ 8484Gas (Mini App) နှင့် မိတ်ဖက်တို့တွင် ဥပဒေအရ တာဝန်မရှိစေရပါ။`,
    },
  },
  {
    en: {
      title: "22. FORCE MAJEURE",
      body: `The User understands that KBZ and 8484Gas (Mini App) shall not be liable for any failure of or delay in the performance of this Services for the period that such failure or delay is due to causes beyond its reasonable control, including but not limited to acts of God, war, strikes or labor disputes, embargoes, government orders, fire, flood, torrential rain, storm or other extreme weather conditions, riot, insurrection, civil commotion, sanctions, boycott, failure of electricity, equipment failure, or any other force majeure event. Performance of this Service will, to the extent that it is prevented, hindered or delayed by such circumstances, be suspended by KBZ and/or 8484Gas (Mini App) until such circumstances cease to exist. KBZ will not be liable to the User or any other party or be considered in breach of this terms and conditions for a failure to perform, or delay in performing, any such obligation set out in this terms and conditions while those circumstances continue.`,
    },
    mm: {
      title: "၂၂။ မလွန်ဆန်နိုင်သော ဖြစ်ရပ်များ",
      body: `ဤဝန်ဆောင်မှုကို ကမ္ဘောဇနှင့် 8484Gas (Mini App) က ဆောင်ရွက်ပေးနေစဉ်ကာလအတွင်း သဘာဝဘေးအန္တရာယ်၊ စစ်ဖြစ်ပွားမှု၊ ဆန္ဒပြမှု သို့မဟုတ် အလုပ်သမားအငြင်းပွားမှု၊ ကုန်သွယ်ရေးပိတ်ပင်မှု၊ အစိုးရအမိန့်၊ မီးလောင်ခြင်း၊ ရေကြီးခြင်း၊ မိုးသည်းထန်စွာ ရွာသွန်းခြင်း၊ မုန်တိုင်း သို့မဟုတ် အလွန်ဆိုးရွားသည့်ရာသီဥတုအခြေအနေများ၊ ဆူပူအုံကြွမှု၊ ပုန်ကန်မှု၊ လူထုမငြိမ်မသက်ဖြစ်မှု၊ စီးပွားရေးပိတ်ဆို့အရေးယူမှု၊ သပိတ်မှောက်မှု၊ လျှပ်စစ်ဓာတ်အား ပြတ်တောက်မှု၊ စက်ချွတ်ယွင်းမှု သို့မဟုတ် အခြားသောမလွန်ဆန်နိုင်သော ဖြစ်ရပ်များသာဖြစ်သည်ဟု ကန့်သတ်ထားမှု မရှိသော်လည်း ယင်းတို့အပါအဝင်ဖြစ်ပြီး ကမ္ဘောဇဘဏ် သို့မဟုတ် 8484Gas (Mini App) မှ ကျိုးကြောင်းဆီလျော်စွာ ထိန်းချုပ်နိုင်မှုထက် ကျော်လွန်နေသည့် ဖြစ်ရပ်များကြောင့် အချိန်ကာလတစ်ရပ်အထိ ဖြစ်ပေါ်လာရသည့် မည်သည့်လုပ်ငန်း ဆောင်ရွက်ရန် ပျက်ကွက်မှု သို့မဟုတ် နှောင့်နှေးမှုဖြစ်ခြင်း များအတွက်မဆို တာဝန်မရှိကြောင်းကို အသုံးပြုသူသည် နားလည်သဘောတူပါသည်။`,
    },
  },
  {
    en: {
      title: "23. NOTIFICATION",
      body: `The above-mentioned Terms and Conditions are legal. As it is deemed that the User understands and agrees to the Terms and Conditions starting from the time of using 8484Gas (Mini App), it is the sole responsibility of the User to use this Service without reading the Terms and Conditions.`,
    },
    mm: {
      title: "၂၃။ အသိပေးချက်",
      body: `အထက်ဖော်ပြပါ စည်းမျဉ်းစည်းကမ်းများသည် တရားဝင်ဖြစ်သည်။ အသုံးပြုသူအနေဖြင့် 8484Gas (Mini App) ဝန်ဆောင်မှုကို စတင်အသုံးပြုသည့် အချိန်မှစ၍ အသုံးပြုသူများစည်းမျဉ်းစည်းကမ်းများကို သိရှိသဘောတူ လက်ခံပြီးဖြစ်သည် ဟုမှတ်ယူသည့်အတွက် ထိုစည်းမျည်းစည်းကမ်းများကို မဖတ်ရှုဘဲ ဤဝန်ဆောင်မှုကို ရယူအသုံးပြုခြင်းသည် အသုံးပြုသူတစ်ဦးတည်း၏ တာဝန်သာ ဖြစ်သည်။`,
    },
  },
  {
    en: {
      title: "24. AMENDMENT",
      body: `The User acknowledges that KBZ and 8484Gas (Mini App) reserve the right to amend, modify or substitute any provisions of this Terms and Conditions or to the Services and/or any charges at any time for any reason at its sole discretion and without any prior notice. The amended Terms and Conditions are in effect as soon as they are posted online. It is considered that with continued use of 8484Gas (Mini App) is the User agrees to the amended Terms and Conditions. If the User does not agree with the whole or part of the amended version, the User shall terminate the use of 8484Gas (Mini App).`,
    },
    mm: {
      title: "၂၄။ ပြင်ဆင်ပြောင်းလဲခြင်း",
      body: `ကမ္ဘောဇနှင့် 8484Gas (Mini App) သည် မည်သည့်အချိန်တွင်မဆို တစ်စုံတစ်ရာသော အကြောင်းကြောင့် အသိပေး အကြောင်းကြားနိုင်ခြင်းမရှိဘဲ သတ်မှတ်ထားသော စည်းမျဉ်း စည်းကမ်းသတ်မှတ်ချက်များကို ပြင်ဆင်ပြောင်းလဲခြင်း၊ ရပ်စဲခြင်းနှင့်/ သို့မဟုတ် ပယ်ဖျက်ခွင့် နှင့် Mini App ၏ သွင်ပြင်လက္ခဏာများအား ပြောင်းလဲခွင့် နှင့်/သို့မဟုတ် ပြင်ဆင်၊ ဖြည့်စွက်၊ ပယ်ဖျက်ပိုင်ခွင့်တို့အား အခြေအနေအရ ပြုလုပ်ဆောင်ရွက်နိုင်သည်ကို အသုံးပြုသူသည် သိရှိနားလည်သဘောတူပါသည်။`,
    },
  },
  {
    en: {
      title: "25. SEVERABILITY",
      body: `Each of the provisions of this Terms and Conditions shall be several and distinct from one another. If any of the provisions of these Terms and Conditions becomes invalid, void, illegal or unenforceable in any respect under any law, the validity, legally and enforceability of the remaining provisions shall not in any way be thereby affected or impaired.`,
    },
    mm: {
      title: "၂၅။ ဆက်လက်အသက်ဝင်ခြင်း",
      body: `ဤစည်းကမ်းချက်များပါ ပြဋ္ဌာန်းချက်တစ်ရပ်ရပ်သည် တရားဝင်မှုမရှိတော့ခြင်း၊ ပျက်ပြယ်ခြင်း သို့မဟုတ် ဥပဒေတစ်ရပ်ရပ်အရ အာဏာသက်ရောက်မှုမရှိတော့ခြင်းများဖြစ်လာပါက ယင်းအပိုင်းသည်သာ ပျက်ပြယ်မည်ဖြစ်ပြီး ကျန်ပြဋ္ဌာန်းချက်များအား ထိခိုက်စေခြင်း သို့မဟုတ် ပျက်ပြယ်စေခြင်းများရှိမည်မဟုတ်ဘဲ ကျန်ပြဋ္ဌာန်းချက်များသည် ဆက်လက်အသက်ဝင်နေမည် ဖြစ်သည်။`,
    },
  },
  {
    en: {
      title: "26. ASSIGNMENT",
      body: `The User shall not assign its rights or obligations under these Terms and Conditions, in whole or in part, nor enter into any subcontract to perform any portion of these Terms and Conditions, without the written consent of KBZ.`,
    },
    mm: {
      title: "၂၆။ လွှဲပြောင်းခြင်း",
      body: `ဤစည်းမျဉ်းစည်းကမ်းသတ်မှတ်ချက်များအရ အသုံးပြုသူသည် မိမိ၏ အခွင့်အရေးများ သို့မဟုတ် တာဝန်ဝတ္တရားများ အားလုံးကိုဖြစ်စေ သို့မဟုတ် တစ်စိတ်တစ်ပိုင်းကိုဖြစ်စေ ပေးအပ်ခြင်း သို့မဟုတ် လွှဲပြောင်းခြင်းတို့အား ကမ္ဘောဇဘဏ်၏ စာဖြင့် ရေးသားဖော်ပြထားသော သဘောတူညီချက်မရှိဘဲ ဆောင်ရွက်ခြင်း မပြုရပါ။`,
    },
  },
  {
    en: {
      title: "27. GOVERNING LAW AND DISPUTE RESOLUTION",
      body: `These Terms and Conditions shall be governed by, and construed in accordance with, the laws of the Republic of the Union of Myanmar and the Courts in Myanmar shall have exclusive jurisdiction to solve any dispute arising from or under these Terms and Conditions.`,
    },
    mm: {
      title: "၂၇။ ဥပဒေသက်ရောက်မှုနှင့် တရားစီရင်ပိုင်ခွင့်",
      body: `အထက်ဖော်ပြပါ စည်းမျဉ်းစည်းကမ်းများနှင့် သတ်မှတ်ချက်များအားလုံးသည် ပြည်ထောင်စုသမ္မတမြန်မာနိုင်ငံ ၏တည်ဆဲဥပဒေများနှင့်အညီ အဓိပ္ပါယ်ဖော်ဆောင်ရမည် ဖြစ်သည်။ ဤဝန်ဆောင်မှုကို အသုံးပြုမှုကြောင့် ပေါ်ပေါက်လာသော အငြင်းပွားမှုတစ်စုံတစ်ရာ၊ ပြဿနာတစ်ခုခု ပေါ်ပေါက်လာပါက မြန်မာနိုင်ငံတော် တရားရုံးများတွင် တည်ဆဲဥပဒေများအရ ဖြေရှင်းဆောင်ရွက်မည်ဖြစ်ကြောင်း အသုံးပြုသူအနေဖြင့် သဘောတူလက်ခံပါသည်။`,
    },
  },
  {
    en: {
      title: "28. WAIVER",
      body: `Failure or delay on part of either party to enforce any provision(s) of these Terms and Conditions at any point of time shall not be construed to be a waiver by such party of such rights thereafter to enforce each and every provision of these Terms and Conditions.`,
    },
    mm: {
      title: "၂၈။ စွန့်လွှတ်ခြင်း",
      body: `ဤစည်းကမ်းချက်များပါ မည်သည့်ပြဋ္ဌာန်းချက်(များ) ကိုမဆို မည်သည့်အချိန်တွင်မဆို အကျိုးသက်ရောက်မှုရှိအောင် ဆောင်ရွက်ရန် မည်သည့်ဖက်ကမဆို ပျက်ကွက်ခြင်း သို့မဟုတ် နှောင့်နှေးခြင်းကို ဤစည်းကမ်းချက်များပါ ပြဋ္ဌာန်းချက် တစ်ခုစီတိုင်းနှင့် ပြဋ္ဌာန်းချက်အရပ်ရပ်ကို အာဏာသက်ရောက်အောင် လုပ်ဆောင်ပိုင်ခွင့်အား စွန့်လွှတ်ခြင်းဖြစ်သည်ဟု အဓိပ္ပာယ်ကောက်ယူခြင်းမရှိစေရ။`,
    },
  },
  {
    en: {
      title: "29. LANGUAGE",
      body: `This Terms and Conditions is made in both English and Myanmar and both versions shall be equally authentic and effective. In case of any discrepancy between two versions, the Myanmar version shall prevail.`,
    },
    mm: {
      title: "၂၉။ ဘာသာစကား",
      body: `ဤစည်းမျဉ်းနှင့်စည်းကမ်းသတ်မှတ်ချက်များအား အင်္ဂလိပ်၊ မြန်မာ နှစ်ဘာသာဖြင့် ပြုလုပ်ထားပြီး နှစ်မျိုးစလုံးသည် တူညီသော အဓိပ္ပာယ် သက်ရောက်မှုရှိမည်ဖြစ်သည်။ အင်္ဂလိပ်ဘာသာနှင့် မြန်မာဘာသာနှစ်မျိုးဖြင့် ပြုလုပ်ထားခြင်းဖြစ်သောကြောင့် ကွဲလွဲမှုတစ်စုံတစ်ရာရှိလျှင် မြန်မာဘာသာဖြင့် ရေးသားထားသည့် စည်းကမ်း သတ်မှတ်ချက်များကိုသာလျှင် အမှန်ယူရမည် ဖြစ်သည်။`,
    },
  },
  {
    en: {
      title: "30. CUSTOMER CONTACT",
      body: `If the User wishes to contact 8484Gas (Mini App) for further information, please contact the 8484Gas Call Center by calling or sending email or contact through the feature for Users in 8484Gas (Mini App).

8484Gas Hotline: 8484 (Long code : 09880441006)
Email: ken@parami.com`,
    },
    mm: {
      title: "၃၀။ ဆက်သွယ်ရန်",
      body: `အကယ်၍ အသုံးပြုသူသည် မေးခွန်းများ သို့မဟုတ် မှတ်ချက်များရှိ၍ 8484Gas (Mini App) ထံ ဆက်သွယ်လိုပါက၊ ကျေးဇူးပြု၍ 8484Gas Call Center သို့ ဖုန်းခေါ်ဆိုခြင်းဖြင့်ဖြစ်စေ အီးမေးလ်ပေးပို့ခြင်းဖြင့်ဖြစ်စေ သို့မဟုတ် 8484Gas (Mini App) အတွင်းရှိ အသုံးပြုသူများမေးမြန်းနိုင်သည့် feature မှတစ်ဆင့်ပေးပို့နိုင်ပါသည်။

8484Gas Hotline: 8484 (Long code : 09880441006)
Email: ken@parami.com`,
    },
  },
];

export const termsLabels: Record<Lang, { title: string; switchTo: string; footer: string; intro: string }> = {
  en: { title: "Terms & Conditions", switchTo: "MM", footer: "KBZ-approved · Last updated 2026-05-14", intro: "Preamble" },
  mm: { title: "စည်းမျဉ်းနှင့်စည်းကမ်းများ", switchTo: "EN", footer: "KBZ မှ အတည်ပြုပြီး · နောက်ဆုံးပြင်ဆင်သည် 2026-05-14", intro: "နိဒါန်း" },
};
