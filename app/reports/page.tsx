'use client'

import ReportListPage from '@/components/report-list'
import React, { Suspense } from 'react'
import Loading from '../Loading'

function ReportsPage() {
  return (
    <div>
      <Suspense fallback={<Loading/>}>
      <ReportListPage />
      </Suspense>
    </div>
  )
}

export default ReportsPage