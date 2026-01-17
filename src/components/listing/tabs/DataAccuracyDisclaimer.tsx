import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Scale, AlertTriangle } from "lucide-react";

export const DataAccuracyDisclaimer = () => {
  return (
    <Alert className="border-muted bg-muted/30 mt-8">
      <Scale className="h-5 w-5 text-muted-foreground" />
      <AlertTitle className="text-sm font-semibold text-foreground mb-2">
        Data Accuracy & Legal Disclaimer
      </AlertTitle>
      <AlertDescription className="text-xs text-muted-foreground space-y-3">
        <p>
          <strong>No Guarantee of Accuracy:</strong> The statistics, figures, and data presented on this website are compiled from publicly available sources including the U.S. Centers for Disease Control and Prevention (CDC), Substance Abuse and Mental Health Services Administration (SAMHSA), National Institute on Drug Abuse (NIDA), and state health departments. While we strive to ensure accuracy, we make <strong>no warranties, representations, or guarantees</strong> regarding the completeness, accuracy, reliability, or timeliness of any information displayed.
        </p>
        
        <p>
          <strong>For Informational Purposes Only:</strong> All data is provided for general informational and educational purposes only. This information should <strong>not</strong> be used as a substitute for professional medical advice, diagnosis, treatment, or legal counsel. Always seek the advice of qualified healthcare providers or legal professionals with any questions you may have.
        </p>
        
        <p>
          <strong>Data Limitations:</strong> Addiction statistics are inherently subject to underreporting, methodological variations between sources, and delays in official reporting. Provisional data may be revised significantly. Historical data may reflect different collection methodologies. Projections and estimates are based on statistical models and may not reflect actual outcomes.
        </p>
        
        <p>
          <strong>International Users:</strong> This data primarily reflects conditions within the United States. Laws, regulations, treatment protocols, and statistical methodologies vary significantly by country and jurisdiction. Users outside the U.S. should consult local authorities and healthcare systems for applicable information.
        </p>
        
        <p>
          <strong>Limitation of Liability:</strong> Under no circumstances shall the operators of this website, its affiliates, contributors, or data providers be held liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your access to, use of, or reliance upon any information contained herein. This limitation applies regardless of the legal theory upon which such damages are claimed and whether or not we have been advised of the possibility of such damages.
        </p>
        
        <p>
          <strong>Third-Party Sources:</strong> We do not control and are not responsible for the accuracy or reliability of data from third-party sources. Links to external websites are provided for convenience only and do not constitute endorsement.
        </p>
        
        <p className="text-[10px] pt-2 border-t border-muted">
          By accessing this website, you acknowledge that you have read, understood, and agree to be bound by this disclaimer. If you do not agree with any part of this disclaimer, please discontinue use of this website immediately. This disclaimer is governed by applicable laws and shall be interpreted in accordance with legal principles that favor the limitation of liability to the fullest extent permitted by law in any applicable jurisdiction worldwide.
        </p>
      </AlertDescription>
    </Alert>
  );
};
