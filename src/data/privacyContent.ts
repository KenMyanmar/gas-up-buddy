export type Lang = "en" | "mm";

export interface PrivacySection {
  en: { title: string; body: string };
  mm: { title: string; body: string };
}

export const privacySections: PrivacySection[] = [
  {
    en: {
      title: "1. Introduction",
      body: `This Privacy Policy ("Policy") explains how 8484 Co., Ltd. ("we," "our," or "8484Gas") collects, uses, shares, and protects your personal information when you access and use the 8484Gas Mini App ("Mini App") within the KBZPay application.

This Policy forms part of the 8484Gas Mini App Terms and Conditions and should be read together with those terms. By accessing and using the Mini App, you confirm that you have read and understood this Policy and consent to the collection, use, and disclosure of your personal information as described herein. If you do not agree with this Policy, please do not use the Mini App.`,
    },
    mm: {
      title: "၁။ နိဒါန်း",
      body: `ဤကိုယ်ရေးအချက်အလက်ဆိုင်ရာ မူဝါဒ ("မူဝါဒ") သည် သင်သည် KBZPay application အတွင်းရှိ 8484Gas Mini App ("Mini App") ကို ဝင်ရောက်အသုံးပြုသည့်အခါ 8484 Co., Ltd. ("ကျွန်ုပ်တို့", "ကျွန်ုပ်တို့၏" သို့မဟုတ် "8484Gas") က သင်၏ ကိုယ်ရေးအချက်အလက်များကို မည်သို့ စုဆောင်း၊ အသုံးပြု၊ မျှဝေ နှင့် ကာကွယ်ပုံကို ရှင်းလင်းဖော်ပြထားပါသည်။

ဤမူဝါဒသည် 8484Gas Mini App ၏ Terms and Conditions ၏ တစ်စိတ်တစ်ပိုင်းဖြစ်ပြီး အဆိုပါ စည်းကမ်းသတ်မှတ်ချက်များနှင့်အတူ ဖတ်ရှုသင့်ပါသည်။ သင်သည် Mini App ကို ဝင်ရောက်အသုံးပြုခြင်းအားဖြင့် ဤမူဝါဒကို ဖတ်ရှုနားလည်ပြီး ဖြစ်ကြောင်းနှင့် ဤတွင် ဖော်ပြထားသည့်အတိုင်း သင်၏ ကိုယ်ရေးအချက်အလက်များကို စုဆောင်း၊ အသုံးပြု နှင့် ဖော်ထုတ်မျှဝေရန် သဘောတူကြောင်း အတည်ပြုပါသည်။ ဤမူဝါဒကို သဘောမတူပါက Mini App ကို အသုံးမပြုရပါ။`,
    },
  },
  {
    en: {
      title: "2. About Us",
      body: `8484Gas is a multi-brand LPG (Liquefied Petroleum Gas) delivery coordination platform operated by 8484 Co., Ltd. We connect verified independent delivery agents with customers to provide home gas services on demand in Yangon and other parts of Myanmar.

Under this Policy, 8484 Co., Ltd. is the data controller of your personal information. Kanbawza Bank Limited ("KBZ"), which operates KBZPay, is a separate data controller for payment service components and any data collected directly through the KBZPay application. How KBZ handles your information is governed by KBZ's own privacy policy and the terms of the KBZPay application.`,
    },
    mm: {
      title: "၂။ ကျွန်ုပ်တို့အကြောင်း",
      body: `8484Gas သည် 8484 Co., Ltd. မှ လည်ပတ်သည့် multi-brand LPG (Liquefied Petroleum Gas) ပို့ဆောင်ရေး ညှိနှိုင်းပလက်ဖောင်းဖြစ်ပါသည်။ ကျွန်ုပ်တို့သည် စိစစ်အတည်ပြုထားသော လွတ်လပ်သည့် ပို့ဆောင်ရေးကိုယ်စားလှယ်များနှင့် ဖောက်သည်များကို ချိတ်ဆက်ပေးပြီး ရန်ကုန်နှင့် မြန်မာနိုင်ငံ၏ အခြားဒေသများတွင် လိုအပ်သလို အိမ်သုံးဓာတ်ငွေ့ ဝန်ဆောင်မှုများ ပေးပါသည်။

ဤမူဝါဒအရ 8484 Co., Ltd. သည် သင်၏ ကိုယ်ရေးအချက်အလက်များ၏ data controller ဖြစ်ပါသည်။ KBZPay ကို လည်ပတ်သည့် Kanbawza Bank Limited ("KBZ") သည် ငွေပေးချေမှုဆိုင်ရာ ဝန်ဆောင်မှုအပိုင်းများနှင့် KBZPay application မှ တိုက်ရိုက် စုဆောင်းသော ဒေတာများအတွက် သီးခြား data controller ဖြစ်ပါသည်။ သင်၏ အချက်အလက်များကို ၎င်းတို့ မည်သို့ ကိုင်တွယ်ပုံကို KBZ ၏ ကိုယ်ပိုင် privacy policy နှင့် KBZPay application ၏ စည်းကမ်းချက်များဖြင့် ထိန်းချုပ်ပါသည်။`,
    },
  },
  {
    en: {
      title: "3. Information We Collect",
      body: `3.1 Information You Provide Directly

When you register and use the Mini App, you may provide us with the following information:
• Name (full name or display name)
• Mobile phone number
• Email address (optional)
• Delivery address(es) — including township, ward, street name, and access notes
• Special delivery instructions
• Order details (gas brand, cylinder size in kilograms, service type — refill, new installation, or exchange)

3.2 Information Received from KBZPay

When you open the Mini App from within KBZPay and grant the corresponding authorisation prompt, KBZPay shares the following information with us via the JSAPI bridge ma.getAuthCode():
• A unique identifier (openid) used to recognise you across sessions
• Your mobile phone number registered with KBZPay
• Your KBZPay nickname (full name), if you grant the relevant authorisation scope

We do not receive your KBZPay password, PIN, account balance, card details, or any other financial credentials. The payment transaction itself is completed entirely within the KBZPay environment; 8484Gas servers only receive a transaction reference and status notification.

3.3 Information Collected Automatically During Use

• Device information (browser type, operating system, screen resolution)
• Session tokens used to maintain your authenticated state
• Mini App usage patterns (screens viewed, in-app actions, time spent)
• Approximate or precise location, if you grant permission, to support delivery address selection and service availability
• Order history and preferences accumulated over time
• Diagnostic and error logs to troubleshoot technical issues

3.4 Information Generated During Delivery

• Real-time location of the assigned delivery agent during active order fulfilment, to enable live order tracking
• Delivery completion timestamps and, in some cases, proof-of-delivery photos taken by the agent`,
    },
    mm: {
      title: "၃။ ကျွန်ုပ်တို့ စုဆောင်းသော အချက်အလက်များ",
      body: `၃.၁ သင်က တိုက်ရိုက် ပေးအပ်သော အချက်အလက်များ

သင်သည် Mini App တွင် စာရင်းသွင်းပြီး အသုံးပြုသည့်အခါ အောက်ပါ အချက်အလက်များကို ကျွန်ုပ်တို့ထံ ပေးအပ်နိုင်ပါသည်။
• အမည် (အမည်အပြည့်အစုံ သို့မဟုတ် ပြသမည့်အမည်)
• မိုဘိုင်းဖုန်းနံပါတ်
• Email လိပ်စာ (မဖြစ်မနေမဟုတ်)
• ပို့ဆောင်မည့် လိပ်စာ(များ) — မြို့နယ်၊ ရပ်ကွက်၊ လမ်းအမည် နှင့် ဝင်ရောက်ရန် မှတ်ချက်များ အပါအဝင်
• ပို့ဆောင်မှုဆိုင်ရာ အထူးညွှန်ကြားချက်များ
• အော်ဒါအသေးစိတ် (ဓာတ်ငွေ့အမှတ်တံဆိပ်၊ ကီလိုဂရမ်အလိုက် ဂတ်စ်ဘူးအရွယ်အစား၊ ဝန်ဆောင်မှုအမျိုးအစား — refill, အသစ်တပ်ဆင်ခြင်း သို့မဟုတ် လဲလှယ်ခြင်း)

၃.၂ KBZPay မှ လက်ခံရရှိသော အချက်အလက်များ

သင်သည် KBZPay အတွင်းမှ Mini App ကို ဖွင့်ပြီး သက်ဆိုင်ရာ authorisation prompt ကို ခွင့်ပြုသည့်အခါ KBZPay သည် JSAPI bridge ma.getAuthCode() မှတဆင့် အောက်ပါ အချက်အလက်များကို ကျွန်ုပ်တို့နှင့် မျှဝေပါသည်။
• session များအကြား သင်ကို မှတ်မိနိုင်စေရန် အသုံးပြုသည့် သီးသန့် identifier (openid)
• KBZPay တွင် စာရင်းသွင်းထားသော သင့် mobile phone number
• သင်က သက်ဆိုင်ရာ authorisation scope ကို ခွင့်ပြုပါက သင့် KBZPay nickname (အမည်အပြည့်အစုံ)

ကျွန်ုပ်တို့သည် သင်၏ KBZPay password, PIN, account balance, card details သို့မဟုတ် အခြား ငွေကြေးဆိုင်ရာ လျှို့ဝှက်အချက်အလက်များကို မရရှိပါ။ ငွေပေးချေမှုဆိုင်ရာ လုပ်ငန်းစဉ်ကို KBZPay ပတ်ဝန်းကျင်အတွင်းသာ အပြည့်အဝ ဆောင်ရွက်ပြီး 8484Gas server များသည် transaction reference နှင့် status notification ကိုသာ လက်ခံရရှိပါသည်။

၃.၃ အသုံးပြုနေစဉ် အလိုအလျောက် စုဆောင်းသည့် အချက်အလက်များ

• စက်ပစ္စည်းအချက်အလက်များ (browser အမျိုးအစား၊ operating system၊ screen resolution)
• သင်၏ authenticated state ကို ထိန်းသိမ်းရန် အသုံးပြုသော session token များ
• Mini App အသုံးပြုမှုပုံစံများ (ကြည့်ရှုသော screen များ၊ app အတွင်း လုပ်ဆောင်ချက်များ၊ အသုံးပြုချိန်)
• ပို့ဆောင်ရေးလိပ်စာရွေးချယ်မှုနှင့် ဝန်ဆောင်မှုရရှိနိုင်မှုကို ကူညီရန် သင်ခွင့်ပြုထားပါက အနီးစပ်ဆုံးတည်နေရာ သို့မဟုတ် တိကျသောတည်နေရာ
• အချိန်နှင့်အမျှ စုဆောင်းလာသော အော်ဒါမှတ်တမ်းနှင့် စိတ်ကြိုက်ရွေးချယ်မှုများ
• နည်းပညာဆိုင်ရာ ပြဿနာများကို ရှာဖွေဖြေရှင်းရန် diagnostic နှင့် error log များ

၃.၄ ပို့ဆောင်မှုအတွင်း ထွက်ပေါ်လာသော အချက်အလက်များ

• အော်ဒါပို့ဆောင်နေစဉ် live tracking ပြုလုပ်နိုင်ရန် ပေးပို့သည့် တာဝန်ကျ delivery agent ၏ real-time location
• ပို့ဆောင်မှုပြီးဆုံးချိန် timestamp နှင့် အချို့သော ကိစ္စများတွင် agent က ရိုက်ကူးထားသော proof-of-delivery ဓာတ်ပုံ`,
    },
  },
  {
    en: {
      title: "4. How We Use Your Information",
      body: `We use your personal information for the following purposes:

• To provide our services: processing your gas orders, calculating delivery fees, assigning delivery agents, notifying you of order status, and facilitating in-app payment through KBZPay
• To improve our services: analysing usage patterns, troubleshooting technical issues, optimising delivery routes, and developing new features
• To communicate with you: sending order confirmations, status updates, service announcements, and — only where you have opted in — promotional offers
• To meet legal obligations: complying with Myanmar law, responding to lawful requests from authorities, and maintaining records for tax and accounting purposes
• To prevent fraud and abuse: detecting suspicious activity, enforcing our Terms and Conditions, and protecting customers, agents, and our business`,
    },
    mm: {
      title: "၄။ သင်၏ အချက်အလက်များကို ကျွန်ုပ်တို့ အသုံးပြုပုံ",
      body: `ကျွန်ုပ်တို့သည် သင်၏ ကိုယ်ရေးအချက်အလက်များကို အောက်ပါ ရည်ရွယ်ချက်များအတွက် အသုံးပြုပါသည်။

• ဝန်ဆောင်မှု ပေးရန်: သင်၏ ဓာတ်ငွေ့အော်ဒါများကို ဆောင်ရွက်ခြင်း၊ ပို့ဆောင်ခ တွက်ချက်ခြင်း၊ delivery agent များ တာဝန်ချမှတ်ခြင်း၊ အော်ဒါအခြေအနေကို အသိပေးခြင်း နှင့် KBZPay မှတဆင့် app အတွင်း ငွေပေးချေမှုကို လွယ်ကူစေရန် ဆောင်ရွက်ခြင်း
• ဝန်ဆောင်မှု တိုးတက်စေရန်: အသုံးပြုမှုပုံစံများကို လေ့လာသုံးသပ်ခြင်း၊ နည်းပညာပိုင်းဆိုင်ရာ ပြဿနာများကို ဖြေရှင်းခြင်း၊ ပို့ဆောင်ရေးလမ်းကြောင်းများကို အကောင်းဆုံးဖြစ်အောင် ပြုပြင်ခြင်း နှင့် feature အသစ်များ တီထွင်ခြင်း
• သင်နှင့် ဆက်သွယ်ရန်: အော်ဒါအတည်ပြုချက်များ၊ အခြေအနေအပ်ဒိတ်များ၊ ဝန်ဆောင်မှုကြေညာချက်များနှင့် သင်သဘောတူထားသောအခါသာ promotional offer များ ပေးပို့ခြင်း
• ဥပဒေရေးရာ တာဝန်များ ပြည့်မီရန်: မြန်မာဥပဒေကို လိုက်နာခြင်း၊ အာဏာပိုင်များထံမှ ဥပဒေအရ မှန်ကန်သော တောင်းဆိုမှုများကို တုံ့ပြန်ခြင်း နှင့် အခွန်နှင့် စာရင်းကိုင်ရေးအတွက် မှတ်တမ်းများ ထိန်းသိမ်းခြင်း
• လိမ်လည်မှုနှင့် အလွဲသုံးစားမှုမှ ကာကွယ်ရန်: သံသယဖြစ်ဖွယ် လုပ်ဆောင်ချက်များကို ဖော်ထုတ်ခြင်း၊ Terms and Conditions ကို အကောင်အထည်ဖော်ခြင်း နှင့် ဖောက်သည်များ၊ agent များ၊ လုပ်ငန်းကို ကာကွယ်ခြင်း`,
    },
  },
  {
    en: {
      title: "5. Legal Basis for Data Processing",
      body: `We process your personal information on the basis of one or more of the following legal grounds, as applicable under Myanmar law and the laws of any other relevant jurisdiction:

• The performance of a contract between you and us (delivering the gas you have ordered and providing related services)
• Your consent (for example, when you authorise KBZPay to share your phone number and full name with us, or when you opt in to receive marketing communications)
• Our legitimate interests (improving our services, preventing fraud, and ensuring system security)
• Compliance with our legal obligations under Myanmar law

You may withdraw any consent you have given at any time. Withdrawing consent does not affect the lawfulness of processing carried out before that withdrawal. Some processing may continue on a different legal basis (for example, where we are required by law or where it is necessary to complete an active transaction).`,
    },
    mm: {
      title: "၅။ ဒေတာဆောင်ရွက်မှု၏ ဥပဒေရေးရာ အခြေခံ",
      body: `မြန်မာဥပဒေနှင့် သက်ဆိုင်ရာ အခြားတရားစီရင်ခွင့်ဒေသများ၏ ဥပဒေများအရ အသုံးချနိုင်သည့် အောက်ဖော်ပြပါ ဥပဒေရေးရာ အခြေခံတစ်ခု သို့မဟုတ် တစ်ခုထက်ပိုသော အခြေခံများပေါ်မူတည်၍ ကျွန်ုပ်တို့သည် သင်၏ ကိုယ်ရေးအချက်အလက်များကို ဆောင်ရွက်ပါသည်။

• သင်နှင့် ကျွန်ုပ်တို့အကြားရှိ စာချုပ်ကို အကောင်အထည်ဖော်ရန် (သင်မှာယူထားသော ဓာတ်ငွေ့ကို ပို့ဆောင်ပြီး ဆက်စပ်ဝန်ဆောင်မှုများ ပေးရန်)
• သင်၏ သဘောတူညီချက် (ဥပမာအားဖြင့် KBZPay အား သင့်ဖုန်းနံပါတ်နှင့် အမည်အပြည့်အစုံကို ကျွန်ုပ်တို့နှင့် မျှဝေရန် ခွင့်ပြုသည့်အခါ သို့မဟုတ် marketing communication များကို လက်ခံရန် ရွေးချယ်သည့်အခါ)
• ကျွန်ုပ်တို့၏ တရားဝင်အကျိုးစီးပွား (ဝန်ဆောင်မှုတိုးတက်စေခြင်း၊ လိမ်လည်မှုတားဆီးခြင်း နှင့် စနစ်လုံခြုံရေး သေချာစေခြင်း)
• မြန်မာဥပဒေအရ ဥပဒေရေးရာ တာဝန်များကို လိုက်နာရန်

သင်ပေးအပ်ထားသော သဘောတူညီချက်ကို မည်သည့်အချိန်တွင်မဆို ပြန်လည်ရုပ်သိမ်းနိုင်ပါသည်။ သဘောတူညီချက် ပြန်လည်ရုပ်သိမ်းခြင်းသည် ယင်းမတိုင်မီ ဆောင်ရွက်ခဲ့ပြီးသော processing များကို မထိခိုက်စေပါ။ ထို့ပြင် အချို့သော processing များသည် အခြား ဥပဒေရေးရာ အခြေခံများပေါ်တွင် ဆက်လက်ပြုလုပ်နိုင်ပါသည် (ဥပမာ — ဥပဒေအရ လိုအပ်သောအခါ သို့မဟုတ် လုပ်ဆောင်ဆဲ transaction တစ်ခုကို ပြီးစီးအောင် ဆောင်ရွက်ရန် လိုအပ်သောအခါ)။`,
    },
  },
  {
    en: {
      title: "6. How We Share Your Information",
      body: `We do not sell your personal information. We share it only as described below.

6.1 Assigned Delivery Agents

Once an order is assigned to a delivery agent, that agent receives your name, phone number, delivery address, and order details for the sole purpose of completing your delivery. Delivery agents are independent contractors within our partner network and are bound by agent terms that include obligations of confidentiality and respectful conduct.

6.2 KBZPay (Kanbawza Bank Limited)

As our payment processor and the platform host of the Mini App, KBZ receives the transaction information necessary to process your payment. KBZ's handling of your information is governed by KBZ's own privacy policy and is independent of this Policy.

6.3 Our Service Providers

We rely on trusted infrastructure and service providers, including:
• Supabase, Inc. — cloud database services (data is hosted in the Singapore region)
• DigitalOcean, LLC — cloud server infrastructure (servers located in the Singapore region)
• A messaging-platform provider — for in-app notifications, SMS, Viber, and Facebook Messenger notifications

These providers act as data processors and process your information only on our documented written instructions, under confidentiality and data-protection commitments.

6.4 Legal and Regulatory Authorities

We may share your information where required by Myanmar law, by court order, or in response to a lawful request. This may include preventing, investigating, detecting, or prosecuting criminal offences, as well as enforcing civil legal claims.

6.5 Corporate Transactions

If we merge with, are acquired by, or transfer assets to another company, your information may be transferred as part of that transaction. In the event of any such change, we will notify you and explain the rights you continue to hold under this Policy.`,
    },
    mm: {
      title: "၆။ သင်၏ အချက်အလက်များကို ကျွန်ုပ်တို့ မည်သို့ မျှဝေသနည်း",
      body: `ကျွန်ုပ်တို့သည် သင်၏ ကိုယ်ရေးအချက်အလက်များကို မရောင်းချပါ။ အောက်တွင် ဖော်ပြထားသည့်အတိုင်းသာ မျှဝေပါသည်။

၆.၁ တာဝန်ချမှတ်ထားသော Delivery Agent များနှင့်

အော်ဒါတစ်ခုကို delivery agent တစ်ဦးထံ တာဝန်ချမှတ်ပြီးနောက် ထို agent သည် သင်၏ အမည်၊ ဖုန်းနံပါတ်၊ ပို့ဆောင်မည့် လိပ်စာနှင့် အော်ဒါအသေးစိတ်များကို သင့်ပို့ဆောင်မှုကို ပြီးမြောက်စေရန် ရည်ရွယ်ချက်အတွက်သာ လက်ခံရရှိပါသည်။ Delivery agent များသည် ကျွန်ုပ်တို့၏ partner network အတွင်း လွတ်လပ်သည့် contractor များဖြစ်ပြီး လျှို့ဝှက်ထားရန်နှင့် လေးစားစွာ ဆောင်ရွက်ရန် တာဝန်များ ပါဝင်သော agent terms များကို လိုက်နာရပါသည်။

၆.၂ KBZPay (Kanbawza Bank Limited) နှင့်

ကျွန်ုပ်တို့၏ payment processor နှင့် Mini App ကို လက်ခံထားသည့် platform host အဖြစ် KBZ သည် သင်၏ ငွေပေးချေမှုကို ဆောင်ရွက်ရန် လိုအပ်သည့် transaction information ကို လက်ခံရရှိပါသည်။ သင်၏ အချက်အလက်များကို KBZ မည်သို့ ကိုင်တွယ်သည်မှာ KBZ ၏ ကိုယ်ပိုင် privacy policy အရ ဖြစ်ပြီး ဤမူဝါဒနှင့် သီးခြား လွတ်လပ်ပါသည်။

၆.၃ ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုပေးသူများနှင့်

ကျွန်ုပ်တို့သည် ယုံကြည်စိတ်ချရသော infrastructure နှင့် service provider များကို အသုံးပြုပါသည်။ ၎င်းတို့တွင် အောက်ပါသူများ ပါဝင်ပါသည်။
• Supabase, Inc. — cloud database service များ (ဒေတာကို စင်္ကာပူဒေသတွင် host လုပ်ထားသည်)
• DigitalOcean, LLC — cloud server infrastructure (server များ စင်္ကာပူဒေသတွင် တည်ရှိသည်)
• messaging-platform provider တစ်ဦး — app အတွင်း အသိပေးချက်များ၊ SMS, Viber နှင့် Facebook Messenger notification များအတွက်

ဤ provider များသည် data processor များအဖြစ် ဆောင်ရွက်ပြီး လျှို့ဝှက်ထားရှိမှုနှင့် data-protection ဆိုင်ရာ ကတိကဝတ်များအောက်တွင် ကျွန်ုပ်တို့၏ စာဖြင့် သတ်မှတ်ထားသော ညွှန်ကြားချက်များအတိုင်းသာ သင်၏ အချက်အလက်များကို ဆောင်ရွက်ပါသည်။

၆.၄ ဥပဒေရေးရာနှင့် စည်းမျဉ်းကြီးကြပ်ရေး အာဏာပိုင်များနှင့်

မြန်မာဥပဒေအရ လိုအပ်သောအခါ၊ တရားရုံးအမိန့်အရ သို့မဟုတ် ဥပဒေအရ မှန်ကန်သော တောင်းဆိုမှုတစ်ခုကို တုံ့ပြန်ရန် လိုအပ်သောအခါ မျှဝေပါသည်။ ၎င်းတွင် ရာဇဝတ်မှုများကို ကာကွယ်ရန်၊ စုံစမ်းစစ်ဆေးရန်၊ ဖော်ထုတ်ရန် သို့မဟုတ် တရားစွဲရန် အပြင် အရပ်ဘက်ဥပဒေဆိုင်ရာ တောင်းဆိုမှုများကို အကောင်အထည်ဖော်ရန်လည်း ပါဝင်နိုင်ပါသည်။

၆.၅ ကော်ပိုရိတ် လုပ်ငန်းလွှဲပြောင်းမှုအတွင်း

ကျွန်ုပ်တို့သည် အခြား ကုမ္ပဏီတစ်ခုနှင့် ပေါင်းစည်းလျှင်၊ ဝယ်ယူခံရလျှင် သို့မဟုတ် ပိုင်ဆိုင်မှုများကို လွှဲပြောင်းလျှင် သင်၏ အချက်အလက်များသည် ထို transaction ၏ တစ်စိတ်တစ်ပိုင်းအဖြစ် လွှဲပြောင်းခံရနိုင်ပါသည်။ ထိုသို့ပြောင်းလဲမှုတစ်ခုရှိပါက ကျွန်ုပ်တို့သည် သင့်အား အသိပေးပြီး ဤမူဝါဒအရ သင်ဆက်လက် ပိုင်ဆိုင်သော အခွင့်အရေးများကိုလည်း ရှင်းလင်းပြောကြားပါမည်။`,
    },
  },
  {
    en: {
      title: "7. International Data Transfers",
      body: `Your personal information is processed and stored on servers located in the Singapore region operated by Supabase and DigitalOcean. By using the Mini App, you consent to the transfer of your information outside Myanmar to the Singapore region.

We have selected providers that offer appropriate technical and organisational safeguards for data transfers, including encryption of data in transit and at rest, certified data-centre security standards, and contractual data-protection commitments.`,
    },
    mm: {
      title: "၇။ နိုင်ငံတကာသို့ ဒေတာလွှဲပြောင်းခြင်း",
      body: `သင်၏ ကိုယ်ရေးအချက်အလက်များကို စင်္ကာပူဒေသတွင် တည်ရှိသော Supabase နှင့် DigitalOcean ၏ server များပေါ်တွင် ဆောင်ရွက်ပြီး သိမ်းဆည်းထားပါသည်။ Mini App ကို အသုံးပြုခြင်းအားဖြင့် သင်၏ အချက်အလက်များကို မြန်မာနိုင်ငံပြင်ပ စင်္ကာပူဒေသသို့ လွှဲပြောင်းရန် သင်သဘောတူပါသည်။

ကျွန်ုပ်တို့သည် data transfer အတွက် သင့်လျော်သော နည်းပညာပိုင်းနှင့် စီမံခန့်ခွဲမှုဆိုင်ရာ ကာကွယ်မှုများ ပေးနိုင်သော provider များကို ရွေးချယ်ထားပြီး ၎င်းတွင် data in transit နှင့် at rest encryption၊ အသိအမှတ်ပြု data centre security standard များနှင့် စာချုပ်အရ data-protection commitment များ ပါဝင်ပါသည်။`,
    },
  },
  {
    en: {
      title: "8. Data Retention",
      body: `We retain your personal information for the periods set out below, after which we delete or anonymise it. Where law requires longer retention (for example, accounting and tax records), we retain the relevant data only for the period required and protect it accordingly.

• Active customer profile — for as long as your account is in use
• Inactive customer profile — 24 months after your last order, then deletion or anonymisation
• Order and transaction records — 7 years (Myanmar accounting and tax requirements)
• Marketing consent records — until you withdraw consent
• Delivery agent location logs — 30 days after order completion
• Technical and security logs — 90 days

If you request deletion of your information, we will delete the data we are not legally required to retain. We will tell you which data, if any, we must continue to retain and explain why.`,
    },
    mm: {
      title: "၈။ ဒေတာ ထိန်းသိမ်းကာလ",
      body: `ကျွန်ုပ်တို့သည် အောက်ပါကာလများအတိုင်း သင်၏ ကိုယ်ရေးအချက်အလက်များကို ထိန်းသိမ်းထားပြီး နောက်ပိုင်းတွင် ဖျက်ပစ်ခြင်း သို့မဟုတ် မည်သူဖြစ်ကြောင်း မသိသာအောင် anonymise ပြုလုပ်ပါသည်။ ဥပဒေအရ ပိုမိုကြာရှည် ထိန်းသိမ်းရန် လိုအပ်သော အချက်အလက်များ (ဥပမာ — စာရင်းကိုင်နှင့် အခွန်ဆိုင်ရာ မှတ်တမ်းများ) ရှိပါက ၎င်းတို့ကို ဥပဒေလိုအပ်ချက်အတွက်သာ ထိန်းသိမ်းပြီး သင့်လျော်စွာ ကာကွယ်ပါမည်။

• အသုံးပြုနေသော customer profile — သင့် account အသုံးပြုနေသရွေ့
• အသုံးမပြုတော့သော customer profile — နောက်ဆုံးအော်ဒါတင်ပြီး 24 လအထိ၊ ထို့နောက် ဖျက်ပစ်ခြင်း သို့မဟုတ် anonymise ပြုလုပ်ခြင်း
• အော်ဒါနှင့် transaction မှတ်တမ်းများ — 7 နှစ် (မြန်မာနိုင်ငံ၏ စာရင်းကိုင်နှင့် အခွန်ဆိုင်ရာ လိုအပ်ချက်များ)
• marketing consent မှတ်တမ်းများ — သဘောတူညီချက် ပြန်လည်ရုပ်သိမ်းသည့်အချိန်အထိ
• delivery agent location log များ — အော်ဒါပြီးဆုံးပြီး 30 ရက်
• နည်းပညာနှင့် လုံခြုံရေး log များ — 90 ရက်

သင်သည် သင်၏ အချက်အလက်များကို ဖျက်ပစ်ရန် တောင်းဆိုပါက ဥပဒေအရ ဆက်လက် ထိန်းသိမ်းထားရန် မလိုအပ်သော ဒေတာများကို ကျွန်ုပ်တို့ ဖျက်ပစ်ပါမည်။ ထို့အပြင် ဆက်လက် ထိန်းသိမ်းထားရမည့် ဒေတာများနှင့် ထိုသို့ ထိန်းသိမ်းရသည့် အကြောင်းရင်းကိုလည်း သင့်အား အသိပေးပါမည်။`,
    },
  },
  {
    en: {
      title: "9. Data Security",
      body: `We use technical and organisational measures designed to protect your personal information against unauthorised access, alteration, disclosure, or destruction. These include:

• HTTPS / TLS encryption for all data transmitted between your device and our servers
• Encryption of data at rest within our managed database environment
• Role-based access controls and database-level Row Level Security (RLS) policies
• HMAC signature verification for payment callback webhooks from KBZPay
• Restricted employee access on a strict need-to-know basis
• Periodic review of access logs and security controls

Despite these measures, no system can be guaranteed to be completely secure. We cannot guarantee the absolute security of information you transmit to us, and you do so at your own risk. In the event of a personal-data breach likely to cause significant harm to you, we will notify you and, where applicable, the relevant Myanmar authorities, as required by applicable law.`,
    },
    mm: {
      title: "၉။ ဒေတာ လုံခြုံရေး",
      body: `ကျွန်ုပ်တို့သည် သင်၏ ကိုယ်ရေးအချက်အလက်များကို ခွင့်ပြုချက်မရှိဘဲ ဝင်ရောက်ခြင်း၊ ပြောင်းလဲခြင်း၊ ဖော်ထုတ်ခြင်း သို့မဟုတ် ဖျက်ဆီးခြင်းမှ ကာကွယ်ရန် ရည်ရွယ်သော နည်းပညာပိုင်းနှင့် စီမံခန့်ခွဲမှုဆိုင်ရာ စီမံချက်များကို အသုံးပြုပါသည်။ ၎င်းတို့တွင် အောက်ပါတို့ ပါဝင်ပါသည်။

• သင့်စက်ပစ္စည်းနှင့် ကျွန်ုပ်တို့၏ server များအကြား ပို့လွှတ်သော data အားလုံးအတွက် HTTPS / TLS encryption
• ကျွန်ုပ်တို့၏ managed database environment အတွင်း data at rest encryption
• role-based access control များနှင့် database-level Row Level Security (RLS) policy များ
• KBZPay မှ payment callback webhook များအတွက် HMAC signature verification
• တင်းကျပ်သော need-to-know အခြေခံပေါ်တွင်သာ ဝန်ထမ်းများအတွက် ကန့်သတ်ထားသော access
• access log များနှင့် security control များကို အချိန်အလိုက် ပြန်လည်သုံးသပ်ခြင်း

ဤစီမံချက်များရှိသော်လည်း မည်သည့်စနစ်မဆို အပြည့်အဝ လုံခြုံသည်ဟု အာမခံ၍ မရပါ။ သင်က ကျွန်ုပ်တို့ထံ ပို့လွှတ်သော အချက်အလက်များ၏ အပြည့်အဝ လုံခြုံရေးကို ကျွန်ုပ်တို့ အာမခံမပေးနိုင်ပါ။ ထို့ကြောင့် သင်သည် မိမိကိုယ်ပိုင် အန္တရာယ်ကို လက်ခံ၍ ပို့လွှတ်ရပါသည်။ သင်အတွက် အရေးပါသော ထိခိုက်နစ်နာမှု ဖြစ်ပေါ်နိုင်သည့် personal-data breach တစ်ခု ဖြစ်ပွားပါက သက်ဆိုင်ရာ ဥပဒေအရ ကျွန်ုပ်တို့သည် သင့်အားနှင့် မြန်မာနိုင်ငံရှိ သက်ဆိုင်ရာ အာဏာပိုင်များအား အသိပေးပါမည်။`,
    },
  },
  {
    en: {
      title: "10. Your Rights",
      body: `Under applicable Myanmar law, you have the following rights in relation to your personal information:

• Right of access: to request a copy of the personal information we hold about you
• Right to rectification: to request correction of inaccurate or incomplete information
• Right to erasure: to request deletion of your personal information, subject to our legal retention obligations
• Right to withdraw consent: to withdraw any previously given consent
• Right to object: to object to processing based on our legitimate interests
• Right to restriction: to request that we restrict processing of your information in certain circumstances
• Right to lodge a complaint: with the relevant Myanmar data-protection or consumer-protection authority

To exercise these rights, please contact us using the details set out in section 13 below. We will respond within 30 days of receiving a complete request. We may need to verify your identity before acting on your request.`,
    },
    mm: {
      title: "၁၀။ သင်၏ အခွင့်အရေးများ",
      body: `သက်ဆိုင်ရာ မြန်မာဥပဒေအရ သင်သည် သင်၏ ကိုယ်ရေးအချက်အလက်များနှင့် ပတ်သက်၍ အောက်ပါ အခွင့်အရေးများကို ရရှိပါသည်။

• ဝင်ရောက်ကြည့်ရှုခွင့်: ကျွန်ုပ်တို့က သင့်အကြောင်း ထိန်းသိမ်းထားသော ကိုယ်ရေးအချက်အလက် မိတ္တူကို တောင်းဆိုခွင့်
• ပြင်ဆင်ခွင့်: မမှန်ကန်သော သို့မဟုတ် မပြည့်စုံသော အချက်အလက်များကို ပြင်ဆင်ပေးရန် တောင်းဆိုခွင့်
• ဖျက်ပစ်ခွင့်: ဥပဒေအရ ထိန်းသိမ်းထားရမည့် တာဝန်များကို မထိခိုက်စေဘဲ သင်၏ ကိုယ်ရေးအချက်အလက်များကို ဖျက်ပစ်ရန် တောင်းဆိုခွင့်
• သဘောတူညီချက် ပြန်လည်ရုပ်သိမ်းခွင့်: ယခင်က ပေးအပ်ထားသော သဘောတူညီချက်ကို ပြန်လည်ရုပ်သိမ်းခွင့်
• ကန့်ကွက်ခွင့်: ကျွန်ုပ်တို့၏ တရားဝင်အကျိုးစီးပွားအပေါ် အခြေခံထားသော processing များကို ကန့်ကွက်ခွင့်
• ကန့်သတ်ခွင့်: အချို့သော အခြေအနေများတွင် သင်၏ အချက်အလက်များကို processing လုပ်ခြင်းကို ကန့်သတ်ပေးရန် တောင်းဆိုခွင့်
• တိုင်ကြားခွင့်: သက်ဆိုင်ရာ မြန်မာနိုင်ငံ၏ data-protection သို့မဟုတ် consumer-protection authority ထံ တိုင်ကြားခွင့်

ဤအခွင့်အရေးများကို အသုံးပြုလိုပါက အောက်ပါ အပိုဒ် ၁၃ တွင် ဖော်ပြထားသော ဆက်သွယ်ရန် အချက်အလက်များမှတဆင့် ကျွန်ုပ်တို့ထံ ဆက်သွယ်ပါ။ ကျွန်ုပ်တို့သည် ပြည့်စုံသော တောင်းဆိုချက်ကို လက်ခံရရှိပြီး ရက် ၃၀ အတွင်း တုံ့ပြန်ပါမည်။ သင်၏ တောင်းဆိုချက်ကို ဖြည့်ဆည်းဆောင်ရွက်မီ ကျွန်ုပ်တို့သည် သင်၏ အထောက်အထားကို စစ်ဆေးရန် လိုအပ်နိုင်ပါသည်။`,
    },
  },
  {
    en: {
      title: "11. Children's Privacy",
      body: `The Mini App is intended for users aged 18 and above. Persons under the age of 18 may only use the service with the explicit consent of a parent or legal guardian who agrees to be responsible for all charges. We do not knowingly collect personal information from children under the age of 13. If we learn that we have collected the personal information of a child under 13 without verified parental consent, we will take steps to delete that information as quickly as possible.`,
    },
    mm: {
      title: "၁၁။ ကလေးသူငယ်များ၏ ကိုယ်ရေးအချက်အလက်",
      body: `Mini App သည် အသက် ၁၈ နှစ်နှင့် အထက် အသုံးပြုသူများအတွက် ရည်ရွယ်ထားပါသည်။ အသက် ၁၈ နှစ်မပြည့်သေးသူများသည် အခကြေးငွေများအတွက် တာဝန်ယူမည်ဟု သဘောတူသော မိဘ သို့မဟုတ် ဥပဒေအရ တာဝန်ရှိသူ၏ တိကျရှင်းလင်းသော သဘောတူညီချက်ဖြင့်သာ ဝန်ဆောင်မှုကို အသုံးပြုနိုင်ပါသည်။ ကျွန်ုပ်တို့သည် အသက် ၁၃ နှစ်အောက် ကလေးများထံမှ ကိုယ်ရေးအချက်အလက်များကို သိရှိထားလျက် မစုဆောင်းပါ။ မိဘ၏ အတည်ပြုထားသော သဘောတူညီချက်မရှိဘဲ အသက် ၁၃ နှစ်အောက် ကလေးတစ်ဦး၏ ကိုယ်ရေးအချက်အလက်ကို စုဆောင်းထားကြောင်း သိရှိလာပါက ထိုအချက်အလက်ကို အမြန်ဆုံး ဖျက်ပစ်ရန် လုပ်ဆောင်ပါမည်။`,
    },
  },
  {
    en: {
      title: "12. Local Storage and Tracking Technologies",
      body: `The Mini App uses browser local storage and session storage to maintain your authenticated session, remember your preferences, and improve the responsiveness of the service. These mechanisms are strictly necessary for the Mini App to function, and disabling them may affect service availability. The Mini App does not use third-party advertising cookies or cross-site tracking technologies.`,
    },
    mm: {
      title: "၁၂။ Local Storage နှင့် Tracking Technology များ",
      body: `Mini App သည် သင်၏ authenticated session ကို ထိန်းသိမ်းရန်၊ စိတ်ကြိုက်ရွေးချယ်မှုများကို မှတ်သားရန်နှင့် ဝန်ဆောင်မှု၏ တုံ့ပြန်မှုမြန်ဆန်မှုကို တိုးတက်စေရန် browser local storage နှင့် session storage ကို အသုံးပြုပါသည်။ ဤစနစ်များသည် Mini App လုပ်ဆောင်နိုင်ရန် မရှိမဖြစ် လိုအပ်ပြီး ၎င်းတို့ကို ပိတ်ထားပါက ဝန်ဆောင်မှုရရှိနိုင်မှုကို ထိခိုက်နိုင်ပါသည်။ Mini App သည် third-party advertising cookies များ သို့မဟုတ် cross-site tracking technology များကို အသုံးမပြုပါ။`,
    },
  },
  {
    en: {
      title: "13. Contact Us",
      body: `For privacy-related questions, requests to exercise your rights, or complaints, please contact us using the details below. We aim to respond to all enquiries within 30 days.

Email: ken@parami.com
Hotline: 8484 (long code: 09 880 441 006)
Postal address: 8484 Co., Ltd., Yangon, Myanmar [full registered address to be added]
Data Controller: 8484 Co., Ltd. (a company registered in Myanmar)`,
    },
    mm: {
      title: "၁၃။ ကျွန်ုပ်တို့ကို ဆက်သွယ်ရန်",
      body: `privacy နှင့်သက်ဆိုင်သော မေးခွန်းများ၊ သင်၏ အခွင့်အရေးများကို အသုံးပြုလိုသည့် တောင်းဆိုချက်များ သို့မဟုတ် တိုင်ကြားမှုများအတွက် အောက်ပါအချက်အလက်များဖြင့် ကျွန်ုပ်တို့ထံ ဆက်သွယ်နိုင်ပါသည်။ ကျွန်ုပ်တို့သည် စုံစမ်းမေးမြန်းမှုအားလုံးကို ရက် ၃၀ အတွင်း တုံ့ပြန်ရန် ရည်ရွယ်ပါသည်။

Email: ken@parami.com
Hotline: 8484 (ဖုန်းနံပါတ်: 09 880 441 006)
စာပို့လိပ်စာ: 8484 Co., Ltd., Yangon, Myanmar [registered address အပြည့်အစုံ ထပ်မံဖြည့်ရန်]
Data Controller: 8484 Co., Ltd. (မြန်မာနိုင်ငံတွင် မှတ်ပုံတင်ထားသော ကုမ္ပဏီ)`,
    },
  },
  {
    en: {
      title: "14. Changes to This Policy",
      body: `We may update this Policy from time to time to reflect changes in our practices, services, or applicable laws and regulations. We will notify you of significant changes through the Mini App and, where required, by direct notice (in-app notice or message). The "Last updated" date at the top of this Policy indicates when it was most recently revised. Continued use of the Mini App after a change takes effect indicates your acceptance of the updated Policy.`,
    },
    mm: {
      title: "၁၄။ ဤမူဝါဒ ပြောင်းလဲခြင်းများ",
      body: `ကျွန်ုပ်တို့၏ လုပ်ဆောင်ပုံများ၊ ဝန်ဆောင်မှုများ သို့မဟုတ် သက်ဆိုင်ရာ ဥပဒေ၊ စည်းမျဉ်းများ ပြောင်းလဲလာမှုကို ထင်ဟပ်စေရန် ဤမူဝါဒကို အချိန်နှင့်အမျှ အပ်ဒိတ်လုပ်နိုင်ပါသည်။ အရေးပါသော ပြောင်းလဲမှုများကို Mini App မှတဆင့် အသိပေးမည်ဖြစ်ပြီး လိုအပ်ပါက တိုက်ရိုက်အသိပေးချက် (app အတွင်း notice သို့မဟုတ် message) ဖြင့်လည်း အသိပေးပါမည်။ ဤမူဝါဒ၏ ထိပ်ပိုင်းရှိ "နောက်ဆုံးပြင်ဆင်သည့်နေ့" သည် နောက်ဆုံး ပြင်ဆင်ထားသည့် အချိန်ကို ပြသပါသည်။ ပြောင်းလဲမှုတစ်ရပ် သက်ရောက်ပြီးနောက် Mini App ကို ဆက်လက်အသုံးပြုခြင်းသည် အပ်ဒိတ်လုပ်ထားသော မူဝါဒကို သင်လက်ခံကြောင်း ဖော်ပြပါသည်။`,
    },
  },
  {
    en: {
      title: "15. Governing Law and Jurisdiction",
      body: `This Policy shall be governed by and interpreted in accordance with the laws of Myanmar. Any dispute arising from or in connection with this Policy and the processing of your personal information shall be subject to the exclusive jurisdiction of the courts of Myanmar.`,
    },
    mm: {
      title: "၁၅။ သက်ဆိုင်သော ဥပဒေနှင့် တရားစီရင်ခွင့်",
      body: `ဤမူဝါဒကို မြန်မာနိုင်ငံ၏ ဥပဒေများနှင့်အညီ အဓိပ္ပာယ်ဖွင့်ဆိုကာ အုပ်ချုပ်မည်ဖြစ်ပါသည်။ ဤမူဝါဒမှ ဖြစ်ပေါ်လာသော သို့မဟုတ် ဤမူဝါဒနှင့် သင်၏ ကိုယ်ရေးအချက်အလက်များကို ဆောင်ရွက်ခြင်းနှင့် ဆက်စပ်သော မည်သည့်အငြင်းပွားမှုမဆို မြန်မာနိုင်ငံရှိ တရားရုံးများ၏ သီးသန့် တရားစီရင်ခွင့်အောက်တွင်သာ ရှိမည်ဖြစ်ပါသည်။`,
    },
  },
  {
    en: {
      title: "17. Language",
      body: `This Policy is issued in both English and Myanmar. Both language versions have the same legal effect. In the event of any discrepancy between the two versions, the Myanmar version shall prevail.`,
    },
    mm: {
      title: "၁၇။ ဘာသာစကား",
      body: `ဤမူဝါဒကို အင်္ဂလိပ်ဘာသာနှင့် မြန်မာဘာသာဖြင့် ထုတ်ပြန်ပါသည်။ ဘာသာဗားရှင်းနှစ်ခုလုံးတွင် တူညီသော ဥပဒေရေးရာ အကျိုးသက်ရောက်မှု ရှိပါသည်။ ဘာသာဗားရှင်းနှစ်ခုကြား ကွဲလွဲမှု တစ်စုံတစ်ရာရှိပါက မြန်မာဘာသာဖြင့် ရေးသားထားသည့် ဗားရှင်းကိုသာ အမှန်ယူရမည် ဖြစ်သည်။`,
    },
  },
];

export const privacyLabels: Record<Lang, { title: string; switchTo: string; footer: string }> = {
  en: { title: "Privacy Policy", switchTo: "မြန်မာ", footer: "Draft v1.0 · Last updated 2026-05-19 · Pending KBZ review" },
  mm: { title: "ကိုယ်ရေးအချက်အလက်ဆိုင်ရာ မူဝါဒ", switchTo: "EN", footer: "မူကြမ်း v1.0 · နောက်ဆုံးပြင်ဆင်သည် 2026-05-19 · KBZ ပြန်လည်သုံးသပ်ဆဲ" },
};
