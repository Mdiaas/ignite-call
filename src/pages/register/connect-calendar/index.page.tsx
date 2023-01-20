import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'
import { Container, Header } from '../styles'
import { ArrowRight, Check } from 'phosphor-react'
import { AuthError, ConnectBox, ConnectItem } from './styles'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'

export default function ConnectCalendar() {
  const session = useSession()
  const router = useRouter()
  const hasAuthError = !!router.query.error
  const isSignedIn = session.status === 'authenticated'
  async function handleConnectCalendar() {
    await signIn('google')
  }
  async function handleNavigateToNextStep() {
    router.push('/register/time-intervals')
  }
  return (
    <>
      <NextSeo
        title="Conecte seu usuário com a conta do google | Ignite Call"
        noindex
      />
      <Container>
        <Header>
          <Heading as="strong">Conecte sua agenda!</Heading>
          <Text>
            Conecte seu calendário para verificar automaticamente as horas
            ocupadas e os novos eventos à medica em que são agendados
          </Text>
          <MultiStep size={4} currentStep={2}></MultiStep>
        </Header>
        <ConnectBox>
          <ConnectItem>
            <Text>Google Calendar</Text>
            {isSignedIn ? (
              <Button variant="secondary" size="sm" disabled>
                Conectado <Check />
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleConnectCalendar}>
                Conectar <ArrowRight />
              </Button>
            )}
          </ConnectItem>
          {hasAuthError && (
            <AuthError size="sm">
              É necessário conceder permissão ao calendário para prosseguir
            </AuthError>
          )}
          <Button
            type="submit"
            disabled={!isSignedIn}
            onClick={handleNavigateToNextStep}
          >
            Próximo passo <ArrowRight />
          </Button>
        </ConnectBox>
      </Container>
    </>
  )
}
