import { AdminApp } from '@/components/menu-editor/admin-app'
import { MenuProvider } from '@/lib/menu-context'

export default function AdminPage() {
  return (
    <MenuProvider>
      <AdminApp />
    </MenuProvider>
  )
}
