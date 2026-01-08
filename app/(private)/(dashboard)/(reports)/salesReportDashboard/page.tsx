"use client"
import SalesReportDashboard from '@/app/components/drag'
import React from 'react'
// import Drag from '../components/dragdrop/index'

const page = () => {
  return (
    <div>
        <SalesReportDashboard 
          title='Sales Report Dashboard'
          titleNearExport="Sales Report"
          reportType="sales"
          apiEndpoints={{
              filters: 'http://172.16.6.205:8001/api/filters',
              dashboard: 'http://172.16.6.205:8001/api/dashboard',
              table: 'http://172.16.6.205:8001/api/table',
              export: 'http://172.16.6.205:8001/api/export'
            }}
        />
    </div>
  )
}

export default page