"use client"
import SalesReportDashboard from '@/app/components/drag'

const page = () => {
  return (
    <div>
        <SalesReportDashboard 
          title='Item Report Dashboard' 
          titleNearExport="Item Report"
          apiEndpoints={{
            filters: 'http://172.16.6.205:8005/api/filters',
            dashboard: 'http://172.16.6.205:8005/api/dashboard',
            table: 'http://172.16.6.205:8005/api/item-table',
            export: 'http://172.16.6.205:8005/api/export'
          }}
          reportType="item"
        />
    </div>
  )
}

export default page