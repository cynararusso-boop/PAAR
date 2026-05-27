import { createFileRoute } from '@tanstack/react-router'
import TriageSystem from '../components/TriageSystem'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return <TriageSystem />
}
