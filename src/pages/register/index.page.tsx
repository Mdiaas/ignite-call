import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { Container, Form, FormError, Header } from './styles'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { api } from '../../lib/axios'
import { AxiosError } from 'axios'
const RegisterFormSchema = z.object({
  username: z
    .string()
    .min(3, {
      message: 'Mínimo de 3 caracteres por usuário',
    })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'Digite somente letras e hifen',
    })
    .transform((username) => username.toLowerCase()),
  fullname: z.string().min(3, {
    message: 'Nome precisa de pelo menos 3 caracteres',
  }),
})

type RegisterFormData = z.infer<typeof RegisterFormSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue, // será usado para settar o valor padrao do username no formulário
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterFormSchema),
  })

  const router = useRouter()
  useEffect(() => {
    if (router.query?.username) {
      setValue('username', String(router.query.username))
    }
  }, [router.query?.username, setValue])

  async function handleRegister({ fullname, username }: RegisterFormData) {
    try {
      await api.post('/users', {
        name: fullname,
        username,
      })
      await router.push('/register/connect-calendar')
    } catch (err) {
      if (err instanceof AxiosError && err?.response?.data?.message) {
        alert(err.response.data.message)
        return
      }
      console.log(err)
    }
  }
  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>
        <MultiStep size={4} currentStep={1}></MultiStep>
      </Header>

      <Form as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            prefix="schedule.com/"
            placeholder="seu-usuário"
            {...register('username')}
          ></TextInput>
          {errors.username && (
            <FormError size="sm">{errors.username.message}</FormError>
          )}
        </label>
        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput
            placeholder="seu nome"
            {...register('fullname')}
          ></TextInput>
          {errors.fullname && (
            <FormError size="sm">{errors.fullname.message}</FormError>
          )}
        </label>
        <Button type="submit" disabled={isSubmitting}>
          Próximo passo <ArrowRight></ArrowRight>
        </Button>
      </Form>
    </Container>
  )
}
