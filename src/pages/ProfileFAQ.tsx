import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Lang = "en" | "mm";

const faqs: { en: { q: string; a: string }; mm: { q: string; a: string } }[] = [
  {
    en: {
      q: "How do I order gas through KBZPay?",
      a: "Open KBZPay, go to the Mini App category, and tap the 8484Gas icon. You will be automatically logged in using your KBZPay phone number. From the Home Screen, tap 'ORDER GAS NOW', select your preferred brand, order type, cylinder size, confirm pricing, choose your payment method, and place your order. The entire process takes under 60 seconds.",
    },
    mm: {
      q: `KBZ Pay မှတစ်ဆင့် ဂတ်စ်ကို မည်သို့မှာယူရပါမည်နည်း။`,
      a: `KBZPay ကိုဖွင့်ပါ၊ Mini App အမျိုးအစားသို့သွားပါ၊ ထို့နောက် 8484Gas အိုင်ကွန်ကို နှိပ်ပါ။ သင့် KBZPay ဖုန်းနံပါတ်ဖြင့် အလိုအလျောက် Login ဝင်ရောက်ပြီးဖြစ်ပါမည်။ ပင်မစာမျက်နှာမှ ‘ORDER GAS NOW’ ကိုနှိပ်ပြီး သင်နှစ်သက်သော အမှတ်တံဆိပ်၊ မှာယူမှုအမျိုးအစား၊ ဆလင်ဒါအရွယ်အစားကို ရွေးချယ်ပါ။ ဈေးနှုန်းကို အတည်ပြုပြီး ငွေပေးချေမှုနည်းလမ်းကို ရွေးချယ်ကာ မှာယူမှုကို တင်သွင်းပါ။ တစ်ခုလုံးသော လုပ်ငန်းစဉ်သည် ၆၀ စက္ကန့်အတွင်း ပြီးဆုံးပါသည်။`,
    },
  },
  {
    en: {
      q: "Why don't I need to register or enter an OTP?",
      a: "When you access 8484Gas through KBZPay, your KBZPay registered phone number is automatically shared with 8484Gas to identify or create your account. This eliminates the need for separate registration or OTP verification. Your KBZPay identity is trusted end-to-end.",
    },
    mm: {
      q: `အဘယ်ကြောင့် မှတ်ပုံတင်ရန် သို့မဟုတ် OTP ထည့်သွင်းရန် မလိုအပ်ပါသနည်း။`,
      a: `KBZPay မှတစ်ဆင့် 8484Gas ကိုဝင်ရောက်သောအခါ သင်၏ KBZPay မှတ်ပုံတင်ထားသော ဖုန်းနံပါတ်ကို 8484Gas သို့ အလိုအလျောက် ပေးပို့ပြီး အကောင့်ကို သိရှိခြင်း သို့မဟုတ် ဖန်တီးခြင်းပြုပါသည်။ ထို့ကြောင့် သီးခြား မှတ်ပုံတင်ခြင်း သို့မဟုတ် OTP အတည်ပြုခြင်း မလိုအပ်တော့ပါ။ သင့် KBZPay အထောက်အထားကို အစမှအဆုံးထိ ယုံကြည်ခွင့်ပြုပါသည်။`,
    },
  },
  {
    en: {
      q: "Which gas brands can I order?",
      a: "8484Gas currently offers Easy Gas, Parami Gas, and an 'Any Brands' option that covers additional partner brands. The available brands may vary by your delivery location and agent availability.",
    },
    mm: {
      q: `မည်သည့် ဂတ်စ်အမှတ်တံဆိပ်များကို မှာယူနိုင်ပါသနည်း။`,
      a: `8484Gas တွင် လက်ရှိ Easy Gas၊ Parami Gas နှင့် အခြား မိတ်ဖက်အမှတ်တံဆိပ်များ ပါဝင်သော ‘Any Brands’ ရွေးချယ်စရာကို ပံ့ပိုးပေးပါသည်။ ရရှိနိုင်သော အမှတ်တံဆိပ်များသည် သင့်ပို့ဆောင်မည့်နေရာနှင့် အေးဂျင့်ရရှိနိုင်မှုပေါ် မူတည်၍ ကွဲပြားနိုင်ပါသည်။`,
    },
  },
  {
    en: {
      q: "What cylinder sizes are available?",
      a: "We offer 4 kg, 5 kg, 12.5 kg, 15 kg, and 20 kg cylinders. Availability depends on the selected brand and your delivery area. The 48 kg commercial cylinder is available through the 8484 hotline for business customers.",
    },
    mm: {
      q: `မည်သည့် ဆလင်ဒါအရွယ်အစားများ ရရှိနိုင်ပါသနည်း။`,
      a: `၄ ကီလို၊ ၅ ကီလို၊ ၁၂.၅ ကီလို၊ ၁၅ ကီလို နှင့် ၂၀ ကီလို ဆလင်ဒါများကို ပံ့ပိုးပေးပါသည်။ ရရှိနိုင်မှုသည် သင်ရွေးချယ်သော အမှတ်တံဆိပ်နှင့် ပို့ဆောင်နေရာပေါ် မူတည်ပါသည်။ ၄၈ ကီလို စီးပွားရေးသုံးဆလင်ဒါကို စီးပွားရေးဝယ်သူများအတွက် 8484 ဟော့လိုင်းမှတစ်ဆင့် မှာယူနိုင်ပါသည်။`,
    },
  },
  {
    en: {
      q: "What order types are available?",
      a: "8484Gas supports three order types: Refill (replace an empty cylinder of the same brand with a full one), New Setup (first-time installation including regulator and hose), and Exchange (swap your existing cylinder for a different gas brand, or swap an empty cylinder for a full one). You select your order type on Step 2 of the ordering flow. Each order type may show a different price and delivery fee on the Price Breakdown screen.",
    },
    mm: {
      q: `မည်သည့် မှာယူမှုအမျိုးအစားများ ရရှိနိုင်ပါသနည်း။`,
      a: `8484Gas တွင် မှာယူမှုအမျိုးအစား သုံးမျိုး ရှိပါသည်- ဂတ်စ်ပြန်ဖြည့်ခြင်း (Refill) - တူညီသော အမှတ်တံဆိပ်ရှိ ဗလာဆလင်ဒါကို အပြည့်ရှိသော ဆလင်ဒါနှင့် လဲလှယ်ခြင်း၊ အသစ်ဆင်ခြင်း (New Setup) - ရဂျူလေတာနှင့် ပိုက်အပါအဝင် ပထမဆုံးအကြိမ် တပ်ဆင်ခြင်း၊ နှင့် လဲလှယ်ခြင်း (Exchange) - လက်ရှိဆလင်ဒါကို အခြားအမှတ်တံဆိပ်တစ်ခုသို့ လဲလှယ်ခြင်း သို့မဟုတ် ဗလာဆလင်ဒါကို အပြည့်ရှိသောဆလင်ဒါနှင့် လဲလှယ်ခြင်း။ မှာယူမှုအမျိုးအစားကို မှာယူမှုလုပ်ငန်းစဉ်၏ အဆင့် ၂ တွင် ရွေးချယ်ရပါသည်။ မှာယူမှုအမျိုးအစားတစ်ခုချင်းစီတွင် Price Breakdown ဖန်သားပြင်ပေါ်တွင် မတူညီသော ဈေးနှုန်းနှင့် ပို့ဆောင်ခများ ပြသနိုင်ပါသည်။`,
    },
  },
  {
    en: {
      q: "How is the price calculated? What is the delivery fee?",
      a: "Gas price is calculated as: price per kg × cylinder size. For example, a 4 kg refill at 4,600 MMK/kg = 18,400 MMK. Refill orders include a flat 3,000 MMK delivery fee. New Setup orders have free delivery. The total price is shown transparently on the Price Breakdown screen before you confirm your order. Prices are locked at the time you place your order.",
    },
    mm: {
      q: `ဈေးနှုန်းကို မည်သို့တွက်ချက်ပါသနည်း။ ပို့ဆောင်ခမှာ မည်မျှရှိပါသနည်း။`,
      a: `ဂတ်စ်ဈေးနှုန်းကို ‘ကီလိုတစ်ကီလိုချင်းဈေးနှုန်း × ဆလင်ဒါအရွယ်အစား’ ဖြင့် တွက်ချက်ပါသည်။ ဥပမာ- ၄ ကီလို Refill ကို တစ်ကီလို ၄,၆၀၀ ကျပ် × ၄ = ၁၈,၄၀၀ ကျပ်။ Refill မှာယူမှုများတွင် ၃,၀၀၀ ကျပ် ပို့ဆောင်ခ တစ်သီးသန့်ပါဝင်ပါသည်။ New Setup မှာယူမှုများတွင် ပို့ဆောင်ခ အခမဲ့ဖြစ်သည်။ စုစုပေါင်းဈေးနှုန်းကို မှာယူမှုအတည်မပြုမီ Price Breakdown ဖန်သားပြင်တွင် ပွင့်လင်းစွာ ဖော်ပြပါသည်။ ဈေးနှုန်းများကို မှာယူမှုတင်သွင်းချိန်တွင် ပိတ်ထားပါသည်။`,
    },
  },
  {
    en: {
      q: "What payment methods are supported?",
      a: "In the KBZPay Mini App, you can pay using KBZPay (in-app payment with PIN confirmation). When paying with KBZPay, the payment amount is deducted from your KBZPay balance after you confirm with your PIN.",
    },
    mm: {
      q: `မည်သည့် ငွေပေးချေမှုနည်းလမ်းများ ပံ့ပိုးပေးပါသနည်း။`,
      a: `KBZPay Mini App အတွင်း သင်သည် KBZPay (PIN ဖြင့်အတည်ပြု၍ အက်ပ်အတွင်း ငွေပေးချေမှု) ဖြင့် ငွေပေးချေနိုင်ပါသည်။ KBZPay ဖြင့် ငွေပေးချေသောအခါ သင့် PIN ဖြင့် အတည်ပြုပြီးနောက် သင့် KBZPay လက်ကျန်ငွေမှ ငွေပမာဏကို နုတ်ယူပါသည်။`,
    },
  },
  {
    en: {
      q: "How long does delivery take?",
      a: "Delivery times depend on agent availability and your location. Typically, orders are fulfilled within 30 minutes to 2 hours during operating hours (7:00 AM to 7:00 PM Myanmar Standard Time). You can track your delivery status in real-time through the Mini App.",
    },
    mm: {
      q: `ပို့ဆောင်ရန် မည်မျှ ကြာပါသနည်း။`,
      a: `ပို့ဆောင်ချိန်သည် အေးဂျင့်ရရှိနိုင်မှုနှင့် သင့်တည်နေရာပေါ် မူတည်ပါသည်။ ပုံမှန်အားဖြင့် မှာယူမှုများကို လည်ပတ်ချိန် (မြန်မာစံတော်ချိန် မနက် ၇:၀၀ မှ ည ၇:၀၀) အတွင်း ၃၀ မိနစ်မှ ၂ နာရီအတွင်း ပြီးမြောက်ပါသည်။ Mini App မှတစ်ဆင့် သင့်ပို့ဆောင်မှုအခြေအနေကို အချိန်နှင့်တစ်ပြေးညီ ခြေရာခံနိုင်ပါသည်။`,
    },
  },
  {
    en: {
      q: "How do I track my order?",
      a: "After placing your order, you will see the Order Tracking screen with four status steps: Order Placed, Received by Delivery Agent, On the Way, and Delivered. Status updates are pushed to your screen in real-time. If you leave and return to the 8484Gas Mini App while an order is active, you will land directly on the tracking screen.",
    },
    mm: {
      q: `မှာယူမှုကို မည်သို့ ခြေရာခံရပါမည်နည်း။`,
      a: `မှာယူမှုတင်သွင်းပြီးနောက် Order Tracking ဖန်သားပြင်တွင် အခြေအနေလေးဆင့်ကို တွေ့မြင်ရပါမည်- Order Placed (မှာယူမှုတင်သွင်းပြီး)၊ Received by Delivery Agent (အေးဂျင့်လက်ခံပြီး)၊ On the Way (ပို့ဆောင်နေ)၊ နှင့် Delivered (ပို့ဆောင်ပြီး)။ အခြေအနေအသစ်များကို သင့်ဖန်သားပြင်သို့ အချိန်နှင့်တစ်ပြေးညီ တွန်းပို့ပါသည်။ မှာယူမှုတစ်ခု အသက်ဝင်နေစဉ် 8484Gas Mini App မှထွက်ပြီး ပြန်ဝင်သောအခါ Tracking ဖန်သားပြင်သို့ တိုက်ရိုက် ရောက်ရှိပါမည်။`,
    },
  },
  {
    en: {
      q: "What if I need to cancel my order?",
      a: "Orders that have already been paid via KBZPay cannot be cancelled. If you wish to cancel the order, please contact the 8484 hotline for assistance.",
    },
    mm: {
      q: `မှာယူမှုကို ပယ်ဖျက်လိုပါက မည်သို့ လုပ်ဆောင်ရပါမည်နည်း။`,
      a: `KBZPay ဖြင့် ငွေပေးချေထားပြီး ပယ်ဖျက်ခြင်း မပြုလုပ်နိုင်တော့ပါ။ ပယ်ဖျက်ရန် 8484 ဟော့လိုင်းသို့ ဆက်သွယ်ပါ။`,
    },
  },
  {
    en: {
      q: "What if the delivery is late or the cylinder is faulty?",
      a: "Please contact the 8484 hotline immediately if you experience any delivery issues, including late delivery, wrong product, or a damaged cylinder. 8484Gas investigates all reported issues and takes appropriate action. All delivery agents are monitored through our Safety Score system to maintain service quality.",
    },
    mm: {
      q: `ပို့ဆောင်ခြင်း နှောင့်နှေးပါက သို့မဟုတ် ဆလင်ဒါ ချွတ်ယွင်းနေပါက မည်သို့ လုပ်ဆောင်ရပါမည်နည်း။`,
      a: `ပို့ဆောင်ချိန်နှောင့်နှေးခြင်း၊ မှားယွင်းသော ထုတ်ကုန်၊ သို့မဟုတ် ပျက်စီးနေသော ဆလင်ဒါ အစရှိသော ပို့ဆောင်ရေးပြဿနာများ ကြုံတွေ့ပါက 8484 ဟော့လိုင်းသို့ ချက်ချင်း ဆက်သွယ်ပါ။ 8484Gas သည် တင်ပြထားသော ပြဿနာအားလုံးကို စုံစမ်းစစ်ဆေးပြီး သင့်လျော်သော အရေးယူဆောင်ရွက်မှုများ ပြုလုပ်ပါသည်။ ပို့ဆောင်ရေးအေးဂျင့်များအားလုံးကို ဝန်ဆောင်မှုအရည်အသွေး ထိန်းသိမ်းရန်အတွက် Safety Score စနစ်မှတစ်ဆင့် စောင့်ကြည့်ပါသည်။`,
    },
  },
  {
    en: {
      q: "How do I request a refund?",
      a: "Contact the 8484 hotline to request a refund. Refund eligibility is determined on a case-by-case basis. If approved, refunds for KBZPay payments are issued back to your KBZPay account. Processing times may vary depending on the nature of the issue.",
    },
    mm: {
      q: `ငွေပြန်အမ်းရန် မည်သို့ တောင်းဆိုရပါမည်နည်း။`,
      a: `ငွေပြန်အမ်းရန် 8484 ဟော့လိုင်းသို့ ဆက်သွယ်ပါ။ ငွေပြန်အမ်းခွင့်ကို ကိစ္စတစ်ခုချင်းအလိုက် ဆုံးဖြတ်ပါသည်။ အတည်ပြုပါက KBZPay ဖြင့် ပေးချေထားသော ငွေကြေးများကို သင့် KBZPay အကောင့်သို့ ပြန်လည်အမ်းပေးပါမည်။ ပြဿနာ၏ သဘောသဘာဝပေါ် မူတည်၍ ငွေပြန်အမ်းချိန် ကွဲပြားနိုင်ပါသည်။`,
    },
  },
  {
    en: {
      q: "Is my data safe? What data does 8484Gas collect?",
      a: "8484Gas collects your phone number (from KBZPay auto-login), name, delivery address, and order history. This data is used solely to process your orders and improve service quality. We do not sell your personal data to third parties. All data is encrypted in transit and at rest. Payment data is processed entirely by KBZPay — 8484Gas does not store any payment credentials, wallet balances, or PIN information.",
    },
    mm: {
      q: `ကျွန်ုပ်၏ အချက်အလက်များ လုံခြုံပါသလား။ 8484Gas က မည်သည့် အချက်အလက်များ စုဆောင်းပါသနည်း။`,
      a: `8484Gas သည် သင့်ဖုန်းနံပါတ် (KBZPay auto-login မှ)၊ အမည်၊ ပို့ဆောင်မည့်လိပ်စာနှင့် မှာယူမှုမှတ်တမ်းတို့ကို စုဆောင်းပါသည်။ ဤအချက်အလက်များကို သင့်မှာယူမှုများကို လုပ်ဆောင်ရန်နှင့် ဝန်ဆောင်မှုအရည်အသွေး မြှင့်တင်ရန်သာ အသုံးပြုပါသည်။ သင့်ကိုယ်ရေးကိုယ်တာအချက်အလက်များကို တတိယပါတီသို့ မရောင်းချပါ။ အချက်အလက်အားလုံးကို သွားလာစဉ်နှင့် သိမ်းဆည်းစဉ်တွင် encrypt ပြုလုပ်ထားပါသည်။ ငွေပေးချေမှုဆိုင်ရာ အချက်အလက်များကို KBZPay က အပြည့်အဝ ကိုင်တွယ်ဆောင်ရွက်ပါသည် — 8484Gas သည် မည်သည့် ငွေပေးချေမှုအထောက်အထား၊ ပိုက်ဆံအိတ်လက်ကျန်၊ သို့မဟုတ် PIN အချက်အလက်ကိုမျှ သိမ်းဆည်းမထားပါ။`,
    },
  },
  {
    en: {
      q: "Which cities and townships are covered?",
      a: "8484Gas currently serves 33 townships across Yangon. We are expanding phase by phase to Mandalay, Irrawaddy, Taunggyi, and other regions across Myanmar. The Mini App will show you whether your delivery address is within the current service area when you place an order.",
    },
    mm: {
      q: `မည်သည့် မြို့ကြီးများနှင့် မြို့နယ်များတွင် ဝန်ဆောင်မှုပေးပါသနည်း။`,
      a: `AnyGas သည် လက်ရှိ ရန်ကုန်တိုင်းရှိ မြို့နယ် ၃၃ ခုကို ဝန်ဆောင်မှုပေးနေပါသည်။ မန္တလေး၊ ဧရာဝတီ၊ တောင်ကြီး နှင့် မြန်မာနိုင်ငံတစ်ဝှမ်း အခြားဒေသများသို့ အဆင့်ဆင့် ချဲ့ထွင်နေပါသည်။ မှာယူမှု တင်သွင်းချိန်တွင် သင့်ပို့ဆောင်မည့်လိပ်စာသည် လက်ရှိဝန်ဆောင်မှုနယ်ပယ်အတွင်း ရှိ၊ မရှိကို Mini App မှ ပြသပေးပါမည်။`,
    },
  },
  {
    en: {
      q: "How do I contact customer support?",
      a: "You can reach 8484Gas customer support through the following channels: Hotline: 8484 (call anytime), Facebook: 8484Gas official page, or through the Mini App's Profile section. Our support team is available during operating hours (7:00 AM to 7:00 PM Myanmar Standard Time).\n\n8484Gas Hotline: 8484 (Long code: 09880441006)\nEmail: ken@parami.com",
    },
    mm: {
      q: `ဖောက်သည်ဝန်ဆောင်မှုသို့ မည်သို့ ဆက်သွယ်ရပါမည်နည်း။`,
      a: `AnyGas ဖောက်သည်ဝန်ဆောင်မှုသို့ အောက်ပါနည်းလမ်းများဖြင့် ဆက်သွယ်နိုင်ပါသည်- ဟော့လိုင်း- 8484 (အချိန်မရွေး ဖုန်းဆက်နိုင်)၊ Facebook- AnyGas တရားဝင် စာမျက်နှာ၊ သို့မဟုတ် Mini App ၏ Profile အပိုင်းမှတစ်ဆင့်။ ကျွန်ုပ်တို့၏ ဝန်ဆောင်မှုအဖွဲ့သည် လည်ပတ်ချိန် (မြန်မာစံတော်ချိန် မနက် ၇:၀၀ မှ ည ၇:၀၀) အတွင်း ရရှိနိုင်ပါသည်။

8484Gas Hotline:  8484 (Long code : 09880441006)

Email: ken@parami.com`,
    },
  },
];

const labels: Record<Lang, { title: string; switchTo: string; footer: string }> = {
  en: { title: "Help & FAQ", switchTo: "MM", footer: "KBZ-approved v1.1 · Last updated 2026-05-15" },
  mm: { title: "အကူအညီနှင့် FAQ", switchTo: "EN", footer: "KBZ မှ အတည်ပြုပြီး v1.1 · နောက်ဆုံးပြင်ဆင်သည် 2026-05-15" },
};

const ProfileFAQ = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>("mm");
  const t = labels[lang];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button
          onClick={() => navigate("/profile")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card"
          aria-label="Back to profile"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="flex-1 font-display text-lg font-extrabold text-foreground">{t.title}</h1>
        <button
          onClick={() => setLang(lang === "en" ? "mm" : "en")}
          className="h-9 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground"
          aria-label="Switch language"
        >
          {t.switchTo}
        </button>
      </div>

      <div className="px-5">
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => {
            const item = faq[lang];
            return (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-[14px] border border-border bg-card px-4 shadow-sm">
                <AccordionTrigger className="text-sm font-bold text-foreground text-left py-3.5 hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-3.5 whitespace-pre-line">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">{t.footer}</p>
      </div>
    </div>
  );
};

export default ProfileFAQ;