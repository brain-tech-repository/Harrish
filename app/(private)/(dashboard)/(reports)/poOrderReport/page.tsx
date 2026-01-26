"use client"
import SalesReportDashboard from '@/app/components/drag'

const page = () => {
  return (
    <div>
        <SalesReportDashboard 
          title='PO Order Report Dashboard'
          titleNearExport="PO Order Report"
          reportType="poOrder"
          apiEndpoints={{
              filters: 'http://172.16.6.205:8001/api/po-order-filters',
              dashboard: '',
              table: 'http://172.16.6.205:8001/api/attendance-table',
              export: 'http://172.16.6.205:8001/api/attendance-export-xlsx'
            }}
        />
    </div>
  )
}

export default page;