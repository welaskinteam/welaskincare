import { useState } from "react";
import PrivacyConsent from "../components/PrivacyConsent";
import SkinAnalysisForm from "../components/SkinAnalysisForm";

export default function Home() {
  const [accepted, setAccepted] = useState(false);

  if (!accepted) {
    return <PrivacyConsent onAccept={() => setAccepted(true)} />;
  }

  return <SkinAnalysisForm />;
}