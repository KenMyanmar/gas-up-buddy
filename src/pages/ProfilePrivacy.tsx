import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePrivacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <button onClick={() => navigate("/profile")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <h1 className="font-display text-lg font-extrabold text-foreground">Privacy Policy</h1>
      </div>

      <div className="px-5 space-y-4 text-[13px] text-muted-foreground leading-relaxed">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Last updated: March 2026</p>

        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground">Information We Collect</h2>
          <p>We collect your phone number for authentication, your name and delivery address for order fulfillment, and order history to improve our service.</p>

          <h2 className="text-sm font-bold text-foreground">How We Use Your Data</h2>
          <p>Your information is used solely to process orders, facilitate deliveries, and communicate service updates. We do not sell your personal data to third parties.</p>

          <h2 className="text-sm font-bold text-foreground">Data Security</h2>
          <p>We use industry-standard encryption and security measures to protect your personal information. All data is stored securely on our servers.</p>

          <h2 className="text-sm font-bold text-foreground">Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting our support team at 8484.</p>

          <h2 className="text-sm font-bold text-foreground">Contact</h2>
          <p>For privacy-related inquiries, call 8484 or email support@anygas.com.</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePrivacy;
