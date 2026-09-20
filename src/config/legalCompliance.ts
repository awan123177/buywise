/**
 * BuyWise Central Legal & Compliance Configuration
 * 
 * IMPORTANT:
 * - Do NOT invent or hard-code unverified PAN, GSTIN, legal entity names, or registration numbers.
 * - Items marked with "PENDING_CONFIRMATION" require business, tax (CA), or legal (CS/Lawyer) review.
 * - This configuration serves as the single source of truth for compliance notices, contact points,
 *   data retention categories, and consumer disclosures across the application.
 */

export interface LegalComplianceConfig {
  entity: {
    registeredBusinessName: string;
    legalEntityType: string;
    pan: string;
    gstin: string;
    registeredOfficeAddress: string;
    statusNote: string;
  };
  officers: {
    privacyContactEmail: string;
    grievanceOfficerName: string;
    grievanceOfficerDesignation: string;
    grievanceOfficerEmail: string;
    grievanceOfficerAddress: string;
    grievanceTurnaroundHours: number;
    grievanceResolutionDays: number;
  };
  serviceRole: {
    roleDescription: string;
    isMerchantOfGoods: boolean;
    isAggregatorAndReferral: boolean;
    isDigitalServiceProvider: boolean;
    disclaimerText: string;
  };
  payment: {
    activeGateway: string;
    supportedCurrencies: string[];
    sensitiveDataStorage: {
      storesCardNumbers: boolean;
      storesCvv: boolean;
      storesUpiPin: boolean;
    };
    refundPolicySummary: string;
  };
  thirdPartyProcessors: Array<{
    name: string;
    purpose: string;
    category: string;
  }>;
  dataRetention: {
    userAccountData: string;
    gamificationAndActivityData: string;
    statutoryLegalRecords: string;
    neutralStatutoryStatement: string;
  };
  targetAudience: {
    playConsoleTargetAges: string[];
    childAudienceNotice: string;
  };
}

export const LEGAL_COMPLIANCE: LegalComplianceConfig = {
  entity: {
    registeredBusinessName: "BuyWise (Business entity details pending confirmation by owner)",
    legalEntityType: "PENDING_CONFIRMATION (Sole Proprietorship / Partnership / LLP / Private Limited)",
    pan: "PENDING_CONFIRMATION (Not declared in application workspace)",
    gstin: "PENDING_CONFIRMATION (Subject to CA determination based on turnover and service categorization)",
    registeredOfficeAddress: "PENDING_CONFIRMATION (Registered business office address not yet declared)",
    statusNote: "Official corporate and tax identifiers must be verified with Chartered Accountant / Company Secretary."
  },

  officers: {
    privacyContactEmail: "mohammdsaeed24@gmail.com",
    grievanceOfficerName: "PENDING_CONFIRMATION (Designated Grievance Officer name to be formally declared)",
    grievanceOfficerDesignation: "Grievance Redressal & Data Protection Officer",
    grievanceOfficerEmail: "mohammdsaeed24@gmail.com",
    grievanceOfficerAddress: "PENDING_CONFIRMATION (Official physical postal address for legal notices)",
    grievanceTurnaroundHours: 48, // Acknowledgment within 48 hours under E-Commerce Rules, 2020
    grievanceResolutionDays: 30    // Resolution within 1 month under E-Commerce Rules, 2020
  },

  serviceRole: {
    roleDescription: "Price comparison aggregator, shopping search intelligence, and digital premium subscription provider.",
    isMerchantOfGoods: false,
    isAggregatorAndReferral: true,
    isDigitalServiceProvider: true,
    disclaimerText: "BuyWise is a price comparison and search discovery tool. We do not sell or fulfill physical merchant products directly. Product prices, deals, and inventory availability are controlled by respective retailers and may change. Always verify final pricing at checkout."
  },

  payment: {
    activeGateway: "Razorpay (INR - Indian Rupees)",
    supportedCurrencies: ["INR"],
    sensitiveDataStorage: {
      storesCardNumbers: false, // PCI-DSS: Handled entirely by Razorpay vault
      storesCvv: false,         // Never captured or stored
      storesUpiPin: false       // Never captured or stored
    },
    refundPolicySummary: "Digital subscriptions are generally non-refundable once activated. Verified duplicate charges and failed activations that cannot be provisioned are refunded within 7-10 business days."
  },

  thirdPartyProcessors: [
    {
      name: "Razorpay",
      purpose: "Payment processing for digital Premium subscriptions (PCI-DSS compliant partner)",
      category: "Payment Gateway"
    },
    {
      name: "Google Gemini API",
      purpose: "Server-side price comparison intelligence and conversational shopping assistant",
      category: "AI Service"
    },
    {
      name: "Supabase / Firebase",
      purpose: "User authentication, profile records, and application data storage",
      category: "Cloud Infrastructure"
    }
  ],

  dataRetention: {
    userAccountData: "Retained during active account tenure. Permanently deleted upon user deletion request.",
    gamificationAndActivityData: "Coins, login streaks, radar alerts, scans, and support conversations are permanently erased upon account deletion.",
    statutoryLegalRecords: "Certain financial, tax, accounting, payment, or transaction records may be retained where required by applicable law or regulatory obligations. These records are restricted to the minimum necessary legal purpose and are not used for marketing.",
    neutralStatutoryStatement: "Certain financial, tax, accounting, payment, or transaction records may be retained where required by applicable law or regulatory obligations. These records are restricted to the minimum necessary legal purpose and are not used for marketing."
  },

  targetAudience: {
    playConsoleTargetAges: ["13-15", "16-17", "18+"],
    childAudienceNotice: "BuyWise is not directed toward children under 13 years of age. We do not knowingly collect personal data from children under 13."
  }
};
