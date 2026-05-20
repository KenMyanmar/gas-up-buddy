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
      q: "KBZPay မှတစ်ဆင့် ဂက်စ်ကို မည်သို့ မှာယူရမလဲ။",
      a: "KBZPay ကိုဖွင့်ပြီး Mini App အမျိုးအစားသို့ သွားကာ 8484Gas icon ကို နှိပ်ပါ။ ထို့နောက် KBZPay တွင် မှတ်ပုံတင်ထားသော သင့်ဖုန်းနံပါတ်ဖြင့် အလိုအလျောက် login ဝင်သွားပါမည်။ Home Screen မှ ORDER GAS NOW ကိုနှိပ်ပြီး သင်လိုချင်သော brand၊ order type၊ cylinder size ကို ရွေးချယ်ပါ။ ထို့နောက် စျေးနှုန်းကို အတည်ပြု၍ payment method ကိုရွေးပြီး အော်ဒါတင်နိုင်ပါသည်။ လုပ်ငန်းစဉ်တစ်ခုလုံးသည် စက္ကန့် 60 အောက်သာ ကြာမြင့်ပါသည်။",
    },
  },
  {
    en: {
      q: "Why don't I need to register or enter an OTP?",
      a: "When you access 8484Gas through KBZPay, your KBZPay registered phone number is automatically shared with 8484Gas to identify or create your account. This eliminates the need for separate registration or OTP verification. Your KBZPay identity is trusted end-to-end.",
    },
    mm: {
      q: "ဘာကြောင့် Register လုပ်ရန် သို့မဟုတ် OTP ထည့်ရန် မလိုအပ်တာလဲ။",
      a: "သင်သည် KBZPay မှတစ်ဆင့် 8484Gas ကို အသုံးပြုသောအခါ KBZPay တွင် မှတ်ပုံတင်ထားသော သင့်ဖုန်းနံပါတ်ကို 8484Gas နှင့် အလိုအလျောက် မျှဝေပြီး သင့်အကောင့်ကို ခွဲခြားသတ်မှတ်ရန် သို့မဟုတ် အသစ်ဖန်တီးရန် အသုံးပြုပါသည်။ ထို့ကြောင့် သီးခြား Register လုပ်ခြင်း သို့မဟုတ် OTP ဖြင့် အတည်ပြုခြင်း မလိုအပ်တော့ပါ။ သင့် KBZPay identity ကို အစအဆုံး ယုံကြည်စိတ်ချစွာ အသုံးပြုထားပါသည်။",
    },
  },
  {
    en: {
      q: "Which gas brands can I order?",
      a: "8484Gas currently offers Easy Gas, Parami Gas, and an 'Any Brands' option that covers additional partner brands. The available brands may vary by your delivery location and agent availability.",
    },
    mm: {
      q: "ဘယ်ဂက်စ်အမှတ်တံဆိပ်တွေကို မှာယူနိုင်သလဲ။",
      a: "လက်ရှိ 8484Gas တွင် Easy Gas၊ Parami Gas နှင့် partner brand များ အပိုဆောင်း ပါဝင်သည့် Any Brands option ကို ရရှိနိုင်ပါသည်။ ရရှိနိုင်သော brand များသည် သင့်ပို့ဆောင်မည့် တည်နေရာနှင့် agent ရရှိနိုင်မှုအပေါ် မူတည်၍ ကွာခြားနိုင်ပါသည်။",
    },
  },
  {
    en: {
      q: "What cylinder sizes are available?",
      a: "We offer 4 kg, 5 kg, 12.5 kg, 15 kg, and 20 kg cylinders. Availability depends on the selected brand and your delivery area. The 48 kg commercial cylinder is available through the 8484 hotline for business customers.",
    },
    mm: {
      q: "ဘယ် cylinder size တွေ ရနိုင်သလဲ။",
      a: "4 kg၊ 5 kg၊ 12.5 kg၊ 15 kg နှင့် 20 kg cylinder များကို ရရှိနိုင်ပါသည်။ ရရှိနိုင်မှုသည် သင်ရွေးချယ်သော brand နှင့် ပို့ဆောင်မည့် ဒေသအပေါ် မူတည်ပါသည်။ စီးပွားရေးလုပ်ငန်းသုံး 48 kg commercial cylinder ကို 8484 hotline မှတစ်ဆင့် မှာယူနိုင်ပါသည်။",
    },
  },
  {
    en: {
      q: "What order types are available?",
      a: "8484Gas supports three order types: Refill (replace an empty cylinder of the same brand with a full one), New Setup (first-time installation including regulator and hose), and Exchange (swap your existing cylinder for a different gas brand, or swap an empty cylinder for a full one). You select your order type on Step 2 of the ordering flow. Each order type may show a different price and delivery fee on the Price Breakdown screen.",
    },
    mm: {
      q: "ဘယ်လို order type တွေ ရနိုင်သလဲ။",
      a: "8484Gas တွင် order type သုံးမျိုး ရရှိနိုင်ပါသည်။ Refill ဆိုသည်မှာ brand တူသော ဂက်စ်အိုးအလွတ်ကို ဂက်စ်အပြည့်ရှိသော အိုးဖြင့် အစားထိုးပေးခြင်းဖြစ်ပါသည်။ New Setup ဆိုသည်မှာ regulator နှင့် hose ပါဝင်သော ပထမအကြိမ် တပ်ဆင်ခြင်းဖြစ်ပါသည်။ Exchange ဆိုသည်မှာ လက်ရှိအသုံးပြုနေသော ဂက်စ်အိုးကို အခြား brand တစ်ခုသို့ လဲလှယ်ခြင်း သို့မဟုတ် ဂက်စ်အိုးအလွတ်ကို ဂက်စ်အပြည့်ရှိသော အိုးဖြင့် လဲပေးခြင်းဖြစ်ပါသည်။ အော်ဒါတင်သည့် flow ၏ Step 2 တွင် order type ကို ရွေးချယ်နိုင်ပါသည်။ Order type တစ်မျိုးစီအတွက် Price Breakdown screen တွင် စျေးနှုန်းနှင့် delivery fee မတူနိုင်ပါသည်။",
    },
  },
  {
    en: {
      q: "How is the price calculated? What is the delivery fee?",
      a: "Gas price is calculated as: price per kg × cylinder size. For example, a 4 kg refill at 4,600 MMK/kg = 18,400 MMK. Refill orders include a flat 3,000 MMK delivery fee. New Setup orders have free delivery. The total price is shown transparently on the Price Breakdown screen before you confirm your order. Prices are locked at the time you place your order.",
    },
    mm: {
      q: "စျေးနှုန်းကို ဘယ်လိုတွက်ချက်သလဲ။ Delivery fee ဘယ်လောက်လဲ။",
      a: "ဂက်စ်စျေးနှုန်းကို တစ်ကီလိုလျှင် စျေးနှုန်း × cylinder size ဖြင့် တွက်ချက်ပါသည်။ ဥပမာအားဖြင့် 4 kg refill တစ်ခုကို 4,600 MMK/kg ဖြင့် တွက်လျှင် 18,400 MMK ဖြစ်ပါသည်။ Refill order များတွင် delivery fee အနေဖြင့် တစ်ခါလျှင် 3,000 MMK သတ်မှတ်ထားပါသည်။ New Setup order များအတွက် delivery fee အခမဲ့ဖြစ်ပါသည်။ အော်ဒါကို အတည်ပြုမတိုင်မီ Price Breakdown screen တွင် စုစုပေါင်းကျသင့်ငွေကို ပွင့်လင်းစွာ ဖော်ပြပေးထားပါသည်။ အော်ဒါတင်သည့်အချိန်တွင် စျေးနှုန်းကို အတည်ပြုသတ်မှတ်ထားပါသည်။",
    },
  },
  {
    en: {
      q: "What payment methods are supported?",
      a: "In the KBZPay Mini App, you can pay using KBZPay (in-app payment with PIN confirmation). When paying with KBZPay, the payment amount is deducted from your KBZPay balance after you confirm with your PIN.",
    },
    mm: {
      q: "ဘယ် payment method တွေကို ပံ့ပိုးထားသလဲ။",
      a: "KBZPay Mini App အတွင်းတွင် KBZPay ဖြင့် ငွေပေးချေနိုင်ပါသည်။ ငွေပေးချေရာတွင် PIN ဖြင့် အတည်ပြုရသော in-app payment ကို အသုံးပြုပါသည်။ KBZPay ဖြင့် ပေးချေသောအခါ သင်၏ PIN ဖြင့် အတည်ပြုပြီးနောက် ကျသင့်ငွေကို သင်၏ KBZPay balance မှ နုတ်ယူသွားမည်ဖြစ်ပါသည်။",
    },
  },
  {
    en: {
      q: "How long does delivery take?",
      a: "Delivery times depend on agent availability and your location. Typically, orders are fulfilled within 30 minutes to 2 hours during operating hours (7:00 AM to 7:00 PM Myanmar Standard Time). You can track your delivery status in real-time through the Mini App.",
    },
    mm: {
      q: "ပို့ဆောင်ချိန် ဘယ်လောက်ကြာသလဲ။",
      a: "ပို့ဆောင်ချိန်သည် agent ရရှိနိုင်မှုနှင့် သင့်တည်နေရာအပေါ် မူတည်ပါသည်။ ယေဘုယျအားဖြင့် လုပ်ငန်းလည်ပတ်ချိန်အတွင်း မြန်မာစံတော်ချိန် မနက် 7:00 နာရီမှ ည 7:00 နာရီအထိ 30 မိနစ်မှ 2 နာရီအတွင်း ပို့ဆောင်ပေးပါသည်။ Mini App မှတစ်ဆင့် သင်၏ delivery status ကို real-time ဖြင့် ကြည့်ရှုနိုင်ပါသည်။",
    },
  },
  {
    en: {
      q: "How do I track my order?",
      a: "After placing your order, you will see the Order Tracking screen with four status steps: Order Placed, Received by Delivery Agent, On the Way, and Delivered. Status updates are pushed to your screen in real-time. If you leave and return to the 8484Gas Mini App while an order is active, you will land directly on the tracking screen.",
    },
    mm: {
      q: "ကျွန်ုပ်၏ order ကို မည်သို့ ခြေရာခံကြည့်ရှုနိုင်မလဲ။",
      a: "အော်ဒါတင်ပြီးပါက Order Tracking screen ကို မြင်ရမည်ဖြစ်ပြီး status အဆင့် 4 ဆင့် ပါဝင်ပါသည်။ ၎င်းတို့မှာ Order Placed၊ Received by Delivery Agent၊ On the Way နှင့် Delivered တို့ဖြစ်ပါသည်။ Status update များကို သင့် screen ပေါ်သို့ real-time ဖြင့် ပြသပေးပါသည်။ အော်ဒါ active ဖြစ်နေစဉ် 8484Gas Mini App မှ ထွက်ပြီး ပြန်ဝင်လာပါက tracking screen သို့ တိုက်ရိုက် ရောက်သွားမည်ဖြစ်ပါသည်။",
    },
  },
  {
    en: {
      q: "What if I need to cancel my order?",
      a: "Orders that have already been paid via KBZPay cannot be cancelled. If you wish to cancel the order, please contact the 8484 hotline for assistance.",
    },
    mm: {
      q: "Order ကို cancel လုပ်လိုပါက ဘာလုပ်ရမလဲ။",
      a: "KBZPay ဖြင့် ငွေပေးချေပြီးသား order များကို cancel မလုပ်နိုင်ပါ။ အော်ဒါကို cancel လုပ်လိုပါက 8484 hotline သို့ ဆက်သွယ်၍ အကူအညီ ရယူနိုင်ပါသည်။",
    },
  },
  {
    en: {
      q: "What if the delivery is late or the cylinder is faulty?",
      a: "Please contact the 8484 hotline immediately if you experience any delivery issues, including late delivery, wrong product, or a damaged cylinder. 8484Gas investigates all reported issues and takes appropriate action. All delivery agents are monitored through our Safety Score system to maintain service quality.",
    },
    mm: {
      q: "ပို့ဆောင်မှုနောက်ကျခြင်း သို့မဟုတ် ဂက်စ်အိုးချို့ယွင်းမှုရှိပါက ဘာလုပ်ရမလဲ။",
      a: "ပို့ဆောင်မှုနောက်ကျခြင်း၊ မှာယူထားသည့်ပစ္စည်းမမှန်ခြင်း သို့မဟုတ် ဂက်စ်အိုးပျက်စီးခြင်း အပါအဝင် မည်သည့်ပို့ဆောင်ရေးပြဿနာမဆို ကြုံတွေ့ပါက 8484 hotline သို့ ချက်ချင်း ဆက်သွယ်ပါ။ 8484Gas သည် တိုင်ကြားလာသော ပြဿနာအားလုံးကို စစ်ဆေးပြီး သင့်လျော်သော လုပ်ဆောင်ချက်များကို ဆောင်ရွက်ပါသည်။ ဝန်ဆောင်မှုအရည်အသွေးကို ထိန်းသိမ်းရန် delivery agent အားလုံးကို ကျွန်ုပ်တို့၏ Safety Score system ဖြင့် စောင့်ကြည့်စစ်ဆေးထားပါသည်။",
    },
  },
  {
    en: {
      q: "How do I request a refund?",
      a: "Contact the 8484 hotline to request a refund. Refund eligibility is determined on a case-by-case basis. If approved, refunds for KBZPay payments are issued back to your KBZPay account. Processing times may vary depending on the nature of the issue.",
    },
    mm: {
      q: "Refund ကို မည်သို့ တောင်းဆိုရမလဲ။",
      a: "Refund တောင်းဆိုလိုပါက 8484 hotline သို့ ဆက်သွယ်ပါ။ Refund ရရှိနိုင်ခြင်းကို case တစ်ခုချင်းစီအလိုက် သုံးသပ်ဆုံးဖြတ်ပါသည်။ အတည်ပြုချက်ရရှိပါက KBZPay ဖြင့် ပေးချေထားသော ငွေကို သင်၏ KBZPay account သို့ ပြန်လည်ပေးအပ်မည်ဖြစ်ပါသည်။ ပြန်အမ်းချိန်သည် ပြဿနာ၏ အမျိုးအစားအပေါ် မူတည်၍ ကွာခြားနိုင်ပါသည်။",
    },
  },
  {
    en: {
      q: "Is my data safe? What data does 8484Gas collect?",
      a: "8484Gas collects your phone number (from KBZPay auto-login), name, delivery address, and order history. This data is used solely to process your orders and improve service quality. We do not sell your personal data to third parties. All data is encrypted in transit and at rest. Payment data is processed entirely by KBZPay — 8484Gas does not store any payment credentials, wallet balances, or PIN information.",
    },
    mm: {
      q: "ကျွန်ုပ်၏ data သည် လုံခြုံမှုရှိပါသလား။ 8484Gas က ဘယ် data တွေကို စုဆောင်းသလဲ။",
      a: "8484Gas သည် သင့်ဖုန်းနံပါတ် (KBZPay auto-login မှ)၊ အမည်၊ ပို့ဆောင်ရေးလိပ်စာနှင့် order history ကို စုဆောင်းပါသည်။ ဤ data များကို သင်၏ အော်ဒါများကို ဆောင်ရွက်ရန်နှင့် ဝန်ဆောင်မှုအရည်အသွေး တိုးတက်စေရန်သာ အသုံးပြုပါသည်။ ကျွန်ုပ်တို့သည် သင်၏ ကိုယ်ရေးအချက်အလက်များကို third party များထံ မရောင်းချပါ။ Data အားလုံးကို ပို့လွှတ်နေစဉ်နှင့် သိမ်းဆည်းထားစဉ် encryption ဖြင့် ကာကွယ်ထားပါသည်။ Payment data များကို KBZPay ကသာ အပြည့်အဝ ဆောင်ရွက်ပြီး 8484Gas သည် payment credential များ၊ wallet balance များ သို့မဟုတ် PIN အချက်အလက်များကို မသိမ်းဆည်းထားပါ။",
    },
  },
  {
    en: {
      q: "Which cities and townships are covered?",
      a: "8484Gas currently serves 33 townships across Yangon. We are expanding phase by phase to Mandalay, Irrawaddy, Taunggyi, and other regions across Myanmar. The Mini App will show you whether your delivery address is within the current service area when you place an order.",
    },
    mm: {
      q: "ဘယ်မြို့များနှင့် မြို့နယ်များကို ဝန်ဆောင်မှု ပေးနေသလဲ။",
      a: "လက်ရှိ 8484Gas သည် ရန်ကုန်မြို့ရှိ မြို့နယ် 33 ခုတွင် ဝန်ဆောင်မှုပေးနေပါသည်။ ထို့အပြင် မန္တလေး၊ ဧရာဝတီ၊ တောင်ကြီးနှင့် မြန်မာနိုင်ငံအနှံ့ရှိ အခြားဒေသများသို့ အဆင့်လိုက် တိုးချဲ့သွားမည်ဖြစ်ပါသည်။ အော်ဒါတင်သည့်အခါ Mini App က သင်၏ ပို့ဆောင်ရေးလိပ်စာသည် လက်ရှိ service area အတွင်း ပါဝင်မှုရှိ မရှိကို ပြသပေးပါမည်။",
    },
  },
  {
    en: {
      q: "How do I contact customer support?",
      a: "You can reach 8484Gas customer support through the following channels: Hotline: 8484 (call anytime), Facebook: 8484Gas official page, or through the Mini App's Profile section. Our support team is available during operating hours (7:00 AM to 7:00 PM Myanmar Standard Time).\n\n8484Gas Hotline: 8484 (Long code: 09880441006)\nEmail: ken@parami.com",
    },
    mm: {
      q: "Customer support ကို မည်သို့ ဆက်သွယ်ရမလဲ။",
      a: "8484Gas customer support ကို အောက်ပါ channel များမှတစ်ဆင့် ဆက်သွယ်နိုင်ပါသည်။ Hotline: 8484 (အချိန်မရွေး ခေါ်ဆိုနိုင်သည်)၊ Facebook: 8484Gas official page သို့မဟုတ် Mini App ၏ Profile section မှတစ်ဆင့် ဆက်သွယ်နိုင်ပါသည်။ ကျွန်ုပ်တို့၏ support team သည် လုပ်ငန်းလည်ပတ်ချိန်အတွင်း မြန်မာစံတော်ချိန် မနက် 7:00 နာရီမှ ည 7:00 နာရီအထိ ဝန်ဆောင်မှုပေးပါသည်။\n\n8484Gas Hotline: 8484 (Long code: 09880441006)\nEmail: ken@parami.com",
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
                <AccordionContent className="text-[13px] text-muted-foreground leading-relaxed pb-3.5">
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