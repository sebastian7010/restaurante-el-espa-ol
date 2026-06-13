import { ClientMenu } from '@/components/menu-editor/client-menu'
import { MenuProvider } from '@/lib/menu-context'

export default function ClientPage() {
  return (
    <MenuProvider>
      <ClientMenu />
    </MenuProvider>
  )
}
