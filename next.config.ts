import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.coreexl.com',
                port: '',
                pathname: '/**',
            },
        ]
    },
    async rewrites() {
      return [
        // agentTransaction
        { source: '/advancepayment', destination: '/advancePayment' },
        { source: '/advancepayment/:path+', destination: '/advancePayment/:path*' },
        { source: '/capscollection', destination: '/capsCollection' },
        { source: '/capscollection/:path+', destination: '/capsCollection/:path*' },
        { source: '/distributorsdelivery', destination: '/distributorsDelivery' },
        { source: '/distributorsdelivery/:path+', destination: '/distributorsDelivery/:path*' },
        { source: '/distributorsexchange', destination: '/distributorsExchange' },
        { source: '/distributorsexchange/:path+', destination: '/distributorsExchange/:path*' },
        { source: '/distributorsinvoice', destination: '/distributorsInvoice' },
        { source: '/distributorsinvoice/:path+', destination: '/distributorsInvoice/:path*' },
        { source: '/distributorsorder', destination: '/distributorsOrder' },
        { source: '/distributorsorder/:path+', destination: '/distributorsOrder/:path*' },
        { source: '/distributorsreturn', destination: '/distributorsReturn' },
        { source: '/distributorsreturn/:path+', destination: '/distributorsReturn/:path*' },
        { source: '/newcustomer', destination: '/newCustomer' },
        { source: '/newcustomer/:path+', destination: '/newCustomer/:path*' },
        { source: '/salesteamload', destination: '/salesTeamLoad' },
        { source: '/salesteamload/:path+', destination: '/salesTeamLoad/:path*' },
        { source: '/salesteamreconcile', destination: '/salesTeamReconcile' },
        { source: '/salesteamreconcile/:path+', destination: '/salesTeamReconcile/:path*' },
        { source: '/salesteamroutelinkage', destination: '/salesTeamRouteLinkage' },
        { source: '/salesteamroutelinkage/:path+', destination: '/salesTeamRouteLinkage/:path*' },
        { source: '/salesteamtracking', destination: '/salesTeamTracking' },
        { source: '/salesteamtracking/:path+', destination: '/salesTeamTracking/:path*' },
        { source: '/salesteamunload', destination: '/salesTeamUnload' },
        { source: '/salesteamunload/:path+', destination: '/salesTeamUnload/:path*' },

        // assetsManagement
        { source: '/assetsmaster', destination: '/assetsMaster' },
        { source: '/assetsmaster/:path+', destination: '/assetsMaster/:path*' },
        { source: '/assetsrequest', destination: '/assetsRequest' },
        { source: '/assetsrequest/:path+', destination: '/assetsRequest/:path*' },
        { source: '/callregister', destination: '/callRegister' },
        { source: '/callregister/:path+', destination: '/callRegister/:path*' },
        { source: '/chillerinstallation', destination: '/chillerInstallation' },
        { source: '/chillerinstallation/:path+', destination: '/chillerInstallation/:path*' },
        { source: '/fridgeupdatecustomer', destination: '/fridgeUpdateCustomer' },
        { source: '/fridgeupdatecustomer/:path+', destination: '/fridgeUpdateCustomer/:path*' },
        { source: '/serviceterritory', destination: '/serviceTerritory' },
        { source: '/serviceterritory/:path+', destination: '/serviceTerritory/:path*' },
        { source: '/servicevisit', destination: '/serviceVisit' },
        { source: '/servicevisit/:path+', destination: '/serviceVisit/:path*' },

        // claimManagement
        { source: '/compensationreport', destination: '/compensationReport' },
        { source: '/compensationreport/:path+', destination: '/compensationReport/:path*' },
        { source: '/compiledclaims', destination: '/compiledClaims' },
        { source: '/compiledclaims/:path+', destination: '/compiledClaims/:path*' },
        { source: '/petitclaim', destination: '/petitClaim' },
        { source: '/petitclaim/:path+', destination: '/petitClaim/:path*' },

        // companyTransaction
        { source: '/creditnote', destination: '/creditNote' },
        { source: '/creditnote/:path+', destination: '/creditNote/:path*' },
        { source: '/purchaseorder', destination: '/purchaseOrder' },
        { source: '/purchaseorder/:path+', destination: '/purchaseOrder/:path*' },
        { source: '/sapintegration', destination: '/sapIntegration' },
        { source: '/sapintegration/:path+', destination: '/sapIntegration/:path*' },
        { source: '/tmpreturn', destination: '/tmpReturn' },
        { source: '/tmpreturn/:path+', destination: '/tmpReturn/:path*' },

        // loyaltyProgram
        { source: '/customerloyaltypoints', destination: '/customerLoyaltyPoints' },
        { source: '/customerloyaltypoints/:path+', destination: '/customerLoyaltyPoints/:path*' },
        { source: '/pointsadjustment', destination: '/pointsAdjustment' },
        { source: '/pointsadjustment/:path+', destination: '/pointsAdjustment/:path*' },

        // manageDistributors
        { source: '/distributorsoverview', destination: '/distributorsOverview' },
        { source: '/distributorsoverview/:path+', destination: '/distributorsOverview/:path*' },
        { source: '/distributorsstock', destination: '/distributorsStock' },
        { source: '/distributorsstock/:path+', destination: '/distributorsStock/:path*' },

        // master
        { source: '/companycustomer', destination: '/companyCustomer' },
        { source: '/companycustomer/:path+', destination: '/companyCustomer/:path*' },
        { source: '/fieldcustomer', destination: '/fieldCustomer' },
        { source: '/fieldcustomer/:path+', destination: '/fieldCustomer/:path*' },
        { source: '/routetransfer', destination: '/routeTransfer' },
        { source: '/routetransfer/:path+', destination: '/routeTransfer/:path*' },
        { source: '/routevisit', destination: '/routeVisit' },
        { source: '/routevisit/:path+', destination: '/routeVisit/:path*' },
        { source: '/salesteam', destination: '/salesTeam' },
        { source: '/salesteam/:path+', destination: '/salesTeam/:path*' },

        // merchandiser
        { source: '/complaintfeedback', destination: '/complaintFeedback' },
        { source: '/complaintfeedback/:path+', destination: '/complaintFeedback/:path*' },
        { source: '/planogramimage', destination: '/planogramImage' },
        { source: '/planogramimage/:path+', destination: '/planogramImage/:path*' },
        { source: '/shelfdisplay', destination: '/shelfDisplay' },
        { source: '/shelfdisplay/:path+', destination: '/shelfDisplay/:path*' },
        { source: '/surveyquestion', destination: '/surveyQuestion' },
        { source: '/surveyquestion/:path+', destination: '/surveyQuestion/:path*' },

        // reports & Profile
        { source: '/customerreport', destination: '/customerReport' },
        { source: '/customerreport/:path+', destination: '/customerReport/:path*' },
        { source: '/salesreportdashboard', destination: '/salesReportDashboard' },
        { source: '/salesreportdashboard/:path+', destination: '/salesReportDashboard/:path*' },
        { source: '/customerorder', destination: '/customerOrder' },
        { source: '/customerorder/:path+', destination: '/customerOrder/:path*' },
        { source: '/settingprofile', destination: '/settingProfile' },
        { source: '/settingprofile/:path+', destination: '/settingProfile/:path*' },
      ];
  },
};

export default nextConfig;