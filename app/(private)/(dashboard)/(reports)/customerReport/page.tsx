"use client"
import SalesReportDashboard from '@/app/components/drag'

const page = () => {
  return (
    <div>
        <SalesReportDashboard 
          title='Customer Report Dashboard' 
          titleNearExport="Customer Report"
          apiEndpoints={{
            filters: 'http://172.16.6.205:8004/api/filters',
            dashboard: 'http://172.16.6.205:8004/api/customer-sales-dashboard',
            table: 'http://172.16.6.205:8004/api/table',
            export: 'http://172.16.6.205:8004/api/download-customer-sales'
          }}
          reportType="customer"
        />
    </div>
  )
}

export default page