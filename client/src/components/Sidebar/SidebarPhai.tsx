import React from 'react'
import AiDaTheoDoi from '../AiDaTheoDoi'
import SidebarQuangCao from './SidebarQuangcao'

export default function SidebarPhai() {
  return (
    <div className="sticky top-20 space-y-4"> 
      <AiDaTheoDoi />
      <SidebarQuangCao />
    </div>
  )
}
