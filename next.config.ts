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
        // Unified list/add/edit rewrites for all major resources
        { source: '/advancepayment/add', destination: '/advancePayment/add' },
        { source: '/advancepayment/:uuid', destination: '/advancePayment/:uuid' },
        { source: '/advancepayment', destination: '/advancePayment' },

        { source: '/capscollection/add', destination: '/capsCollection/add' },
        { source: '/capscollection/:uuid', destination: '/capsCollection/:uuid' },
        { source: '/capscollection', destination: '/capsCollection' },

        { source: '/collection/add', destination: '/collection/add' },
        { source: '/collection/:uuid', destination: '/collection/:uuid' },
        { source: '/collection', destination: '/collection' },

        { source: '/distributorsdelivery/add', destination: '/distributorsDelivery/add' },
        { source: '/distributorsdelivery/:uuid', destination: '/distributorsDelivery/:uuid' },
        { source: '/distributorsdelivery', destination: '/distributorsDelivery' },

        { source: '/distributorsexchange/add', destination: '/distributorsExchange/add' },
        { source: '/distributorsexchange/:uuid', destination: '/distributorsExchange/:uuid' },
        { source: '/distributorsexchange', destination: '/distributorsExchange' },

        { source: '/distributorsinvoice/add', destination: '/distributorsInvoice/add' },
        { source: '/distributorsinvoice/:uuid', destination: '/distributorsInvoice/:uuid' },
        { source: '/distributorsinvoice', destination: '/distributorsInvoice' },

        { source: '/distributorsorder/add', destination: '/distributorsOrder/add' },
        { source: '/distributorsorder/:uuid', destination: '/distributorsOrder/:uuid' },
        { source: '/distributorsorder', destination: '/distributorsOrder' },

        { source: '/distributorsreturn/add', destination: '/distributorsReturn/add' },
        { source: '/distributorsreturn/:uuid', destination: '/distributorsReturn/:uuid' },
        { source: '/distributorsreturn', destination: '/distributorsReturn' },

        { source: '/newcustomer/add', destination: '/newCustomer/add' },
        { source: '/newcustomer/:uuid', destination: '/newCustomer/:uuid' },
        { source: '/newcustomer', destination: '/newCustomer' },

        { source: '/salesteamload/add', destination: '/salesTeamLoad/add' },
        { source: '/salesteamload/:uuid', destination: '/salesTeamLoad/:uuid' },
        { source: '/salesteamload', destination: '/salesTeamLoad' },

        { source: '/salesteamreconcile/add', destination: '/salesTeamReconcile/add' },
        { source: '/salesteamreconcile/:uuid', destination: '/salesTeamReconcile/:uuid' },
        { source: '/salesteamreconcile', destination: '/salesTeamReconcile' },

        { source: '/salesteamroutelinkage/add', destination: '/salesTeamRouteLinkage/add' },
        { source: '/salesteamroutelinkage/:uuid', destination: '/salesTeamRouteLinkage/:uuid' },
        { source: '/salesteamroutelinkage', destination: '/salesTeamRouteLinkage' },

        { source: '/salesteamtracking/add', destination: '/salesTeamTracking/add' },
        { source: '/salesteamtracking/:uuid', destination: '/salesTeamTracking/:uuid' },
        { source: '/salesteamtracking', destination: '/salesTeamTracking' },

        { source: '/salesteamunload/add', destination: '/salesTeamUnload/add' },
        { source: '/salesteamunload/:uuid', destination: '/salesTeamUnload/:uuid' },
        { source: '/salesteamunload', destination: '/salesTeamUnload' },

        { source: '/stocktransfer/add', destination: '/stocktransfer/add' },
        { source: '/stocktransfer/:uuid', destination: '/stocktransfer/:uuid' },
        { source: '/stocktransfer', destination: '/stocktransfer' },
        // agentTransaction
        { source: '/advancepayment/:path*', destination: '/advancePayment/:path*' },
        { source: '/capscollection/:path*', destination: '/capsCollection/:path*' },
        { source: '/collection/:path*', destination: '/collection/:path*' },
        { source: '/distributorsdelivery/:path*', destination: '/distributorsDelivery/:path*' },
        { source: '/distributorsexchange/:path*', destination: '/distributorsExchange/:path*' },
        { source: '/distributorsinvoice/:path*', destination: '/distributorsInvoice/:path*' },
        { source: '/distributorsorder/add', destination: '/distributorsOrder/[uuid]' },
        { source: '/distributorsorder/:path*', destination: '/distributorsOrder/:path*' },
        { source: '/distributorsreturn/:path*', destination: '/distributorsReturn/:path*' },
        { source: '/newcustomer/:path*', destination: '/newCustomer/:path*' },
        { source: '/salesteamload/:path*', destination: '/salesTeamLoad/:path*' },
        { source: '/salesteamreconcile/:path*', destination: '/salesTeamReconcile/:path*' },
          // Unified list/add/edit rewrites for salesTeamRouteLinkage
          { source: '/salesteamroutelinkage/add', destination: '/salesTeamRouteLinkage/add' },
          { source: '/salesteamroutelinkage/:uuid', destination: '/salesTeamRouteLinkage/:uuid' },
          { source: '/salesteamroutelinkage', destination: '/salesTeamRouteLinkage' },
        { source: '/salesteamtracking/:path*', destination: '/salesTeamTracking/:path*' },
        { source: '/salesteamunload/:path*', destination: '/salesTeamUnload/:path*' },
        { source: '/stocktransfer/:path*', destination: '/stocktransfer/:path*' },
        // assetsManagement
        { source: '/assetsmaster/:path*', destination: '/assetsMaster/:path*' },
        { source: '/assetsrequest/:path*', destination: '/assetsRequest/:path*' },
        { source: '/callregister/:path*', destination: '/callRegister/:path*' },
        { source: '/chillerinstallation/:path*', destination: '/chillerInstallation/:path*' },
        { source: '/chillerinstallation/acf/:path*', destination: '/chillerInstallation/acf/:path*' },
        { source: '/chillerinstallation/bulktransfer/:path*', destination: '/chillerInstallation/bulkTransfer/:path*' },
        { source: '/chillerinstallation/installationreport/:path*', destination: '/chillerInstallation/installationReport/:path*' },
        { source: '/chillerinstallation/iro/:path*', destination: '/chillerInstallation/iro/:path*' },
        { source: '/fridgeupdatecustomer/:path*', destination: '/fridgeUpdateCustomer/:path*' },
        { source: '/serviceterritory/:path*', destination: '/serviceTerritory/:path*' },
        { source: '/servicevisit/:path*', destination: '/serviceVisit/:path*' },
        // claimManagement
        { source: '/compensationreport/:path*', destination: '/compensationReport/:path*' },
        { source: '/compiledclaims/:path*', destination: '/compiledClaims/:path*' },
        { source: '/petitclaim/:path*', destination: '/petitClaim/:path*' },
        // companyTransaction
        { source: '/caps/:path*', destination: '/caps/:path*' },
        { source: '/creditnote/:path*', destination: '/creditNote/:path*' },
        { source: '/delivery/:path*', destination: '/delivery/:path*' },
        { source: '/invoice/:path*', destination: '/invoice/:path*' },
        { source: '/order/:path*', destination: '/order/:path*' },
        { source: '/purchaseorder/:path*', destination: '/purchaseOrder/:path*' },
        { source: '/return/:path*', destination: '/return/:path*' },
        { source: '/sapintegration/:path*', destination: '/sapIntegration/:path*' },
        { source: '/tmpreturn/:path*', destination: '/tmpReturn/:path*' },
        // loyaltyProgram
        { source: '/customerloyaltypoints/:path*', destination: '/customerLoyaltyPoints/:path*' },
        { source: '/pointsadjustment/:path*', destination: '/pointsAdjustment/:path*' },
        // manageDistributors
        { source: '/distributors/:path*', destination: '/distributors/:path*' },
        { source: '/distributorsoverview/:path*', destination: '/distributorsOverview/:path*' },
        { source: '/distributorsstock/:path*', destination: '/distributorsStock/:path*' },
        // master
        { source: '/companycustomer/:path*', destination: '/companyCustomer/:path*' },
        { source: '/discount/:path*', destination: '/discount/:path*' },
        { source: '/fieldcustomer/:path*', destination: '/fieldCustomer/:path*' },
        { source: '/item/:path*', destination: '/item/:path*' },
        { source: '/pricing/:path*', destination: '/pricing/:path*' },
        { source: '/promotion/:path*', destination: '/promotion/:path*' },
        { source: '/route/:path*', destination: '/route/:path*' },
        { source: '/routetransfer/:path*', destination: '/routeTransfer/:path*' },
        { source: '/routevisit/:path*', destination: '/routeVisit/:path*' },
        { source: '/salesteam/:path*', destination: '/salesTeam/:path*' },
        { source: '/vehicle/:path*', destination: '/vehicle/:path*' },
        // merchandiser
        { source: '/campaign/:path*', destination: '/campaign/:path*' },
        { source: '/competitor/:path*', destination: '/competitor/:path*' },
        { source: '/complaintfeedback/:path*', destination: '/complaintFeedback/:path*' },
        { source: '/planogram/:path*', destination: '/planogram/:path*' },
        { source: '/planogramimage/:path*', destination: '/planogramImage/:path*' },
        { source: '/shelfdisplay/:path*', destination: '/shelfDisplay/:path*' },
        { source: '/stockinstore/:path*', destination: '/stockinstore/:path*' },
        { source: '/survey/:path*', destination: '/survey/:path*' },
        { source: '/surveyquestion/:path*', destination: '/surveyQuestion/:path*' },
        { source: '/view/:path*', destination: '/view/:path*' },
        // reports 
        { source: '/customerreport/:path*', destination: '/customerReport/:path*' },
        { source: '/salesreportdashboard/:path*', destination: '/salesReportDashboard/:path*' },
        // alert
        { source: '/alert/:path*', destination: '/alert/:path*' },
        // harrisTransaction
        { source: '/customerorder/:path*', destination: '/customerOrder/:path*' },
        // profile 
        { source: '/profile/:path*', destination: '/profile/:path*' },
        // settingProfile
        { source: '/settingprofile/:path*', destination: '/settingProfile/:path*' },
        // settings
        { source: '/settings/:path*', destination: '/settings/:path*' },
        // settingsdev
        { source: '/settingsdev/:path*', destination: '/settingsdev/:path*' },
        // data
        { source: '/data/:path*', destination: '/data/:path*' },
        { source: '/settings/:path*', destination: '/settings/:path*' },
        { source: '/settings/approval/:path*', destination: '/settings/approval/:path*' },
        { source: '/settings/area/:path*', destination: '/settings/area/:path*' },
        { source: '/settings/audittrail/:path*', destination: '/settings/audittrail/:path*' },
        { source: '/settings/bank/:path*', destination: '/settings/bank/:path*' },
        { source: '/settings/brand/:path*', destination: '/settings/brand/:path*' },
        { source: '/settings/changetheme/:path*', destination: '/settings/changetheme/:path*' },
        { source: '/settings/country/:path*', destination: '/settings/country/:path*' },
        { source: '/settings/customer/:path*', destination: '/settings/customer/:path*' },
        { source: '/settings/distributorsstock/:path*', destination: '/settings/distributorsstock/:path*' },
        { source: '/settings/globalsetting/:path*', destination: '/settings/globalsetting/:path*' },
        { source: '/settings/item/:path*', destination: '/settings/item/:path*' },
        { source: '/settings/location/:path*', destination: '/settings/location/:path*' },
        { source: '/settings/manageassets/:path*', destination: '/settings/manageassets/:path*' },
        { source: '/settings/managecompany/:path*', destination: '/settings/managecompany/:path*' },
        { source: '/settings/map/:path*', destination: '/settings/map/:path*' },
        { source: '/settings/menu/:path*', destination: '/settings/menu/:path*' },
        { source: '/settings/outlet-channel/:path*', destination: '/settings/outlet-channel/:path*' },
        { source: '/settings/permission/:path*', destination: '/settings/permission/:path*' },
        { source: '/settings/processflow/:path*', destination: '/settings/processflow/:path*' },
        { source: '/settings/promotiontypes/:path*', destination: '/settings/promotiontypes/:path*' },
        { source: '/settings/region/:path*', destination: '/settings/region/:path*' },
        { source: '/settings/role/:path*', destination: '/settings/role/:path*' },
        { source: '/settings/routetype/:path*', destination: '/settings/routetype/:path*' },
        { source: '/settings/submenu/:path*', destination: '/settings/submenu/:path*' },
        { source: '/settings/user/:path*', destination: '/settings/user/:path*' },
      ];
  },
};

export default nextConfig;