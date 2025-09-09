import CustomerDetails from "@/app/components/addCustomer/customerDetails";
import ContactInfo from "@/app/components/addCustomer/contactInfo";
import LocationInfo from "@/app/components/addCustomer/locationInfo";
import FinancialInfo from "@/app/components/addCustomer/financialInfo";
import TransactionPromo from "@/app/components/addCustomer/transactionPromo";
import AdditionalInfo from "@/app/components/addCustomer/additionalInfo";

export default function AddCustomerPage() {
  return (
    <div className=" bg-gray-50 min-h-screen">
      <h1 className="font-semibold text-[20px] leading-[30px] tracking-[0] mb-6">← Add New Customer</h1>

      <div className="space-y-6">
        <CustomerDetails />
        <ContactInfo />
        <LocationInfo />
        <FinancialInfo />
        <TransactionPromo />
        <AdditionalInfo />
      </div>
    </div>
  );
}
