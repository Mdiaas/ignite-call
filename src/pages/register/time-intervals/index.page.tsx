import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'
import { z } from 'zod'
import { Container, Header } from '../styles'
import {
  FormError,
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
} from './styles'

import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { getWeekDays } from '../../../utils/get-week-days'
import { zodResolver } from '@hookform/resolvers/zod'
import { convertTimeStringToMinutes } from '../../../utils/convert-time-string-to-minutes'
import { api } from '../../../lib/axios'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7) // checando se existe 7 dias dentro do array
    .transform((intervals) => intervals.filter((interval) => interval.enabled)) // filtrando para remover do array os campos desabilitados
    .refine((intervals) => intervals.length > 0, {
      // refine é uma operação de validação, no caso verificando se algum dia da semana foi selecionado, caso nao, exibe mensagem
      message: 'É necessário selecionar pelo menos um dia da semana',
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'Horário de término deve ser pelo menos 1h a mais do que o horário de início',
      },
    ),
})
type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>
export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      // set the default values to intervals
      intervals: [
        { weekDay: 0, enabled: false, startTime: '07:00', endTime: '16:00' }, // domingo
        { weekDay: 1, enabled: true, startTime: '07:00', endTime: '16:00' },
        { weekDay: 2, enabled: true, startTime: '07:00', endTime: '16:00' },
        { weekDay: 3, enabled: true, startTime: '07:00', endTime: '16:00' },
        { weekDay: 4, enabled: true, startTime: '07:00', endTime: '16:00' },
        { weekDay: 5, enabled: true, startTime: '07:00', endTime: '16:00' },
        { weekDay: 6, enabled: false, startTime: '07:00', endTime: '16:00' }, // sábado
      ],
    },
  })

  const weekDays = getWeekDays()
  const { fields } = useFieldArray({
    control,
    name: 'intervals',
  }) // permite iterar campos do formulários que são arrays
  const intervals = watch('intervals')
  const router = useRouter()

  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TimeIntervalsFormOutput
    await api.post('/users/time-intervals', { intervals })
    router.push('/register/update-profile')
  }

  return (
    <>
      <NextSeo
        title="Configure os seus horários disponíveis | Ignite call"
        noindex
      />
      <Container>
        <Header>
          <Heading as="strong">Quase lá!</Heading>
          <Text>
            Defina o intervalo de horários que você está disponível em cada dia
            da semana.
          </Text>
          <MultiStep size={4} currentStep={3}></MultiStep>
        </Header>
        <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
          <IntervalsContainer>
            {fields.map((field, index) => {
              return (
                <IntervalItem key={field.id}>
                  <IntervalDay>
                    <Controller
                      name={`intervals.${index}.enabled`}
                      control={control}
                      render={({ field }) => {
                        return (
                          <Checkbox
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true)
                            }}
                            checked={field.value}
                          />
                        )
                      }}
                    />

                    <Text>{weekDays[field.weekDay]}</Text>
                  </IntervalDay>
                  <IntervalInputs>
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      {...register(`intervals.${index}.startTime`)}
                      disabled={intervals[index].enabled === false}
                    />
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      {...register(`intervals.${index}.endTime`)}
                      disabled={intervals[index].enabled === false}
                    />
                  </IntervalInputs>
                </IntervalItem>
              )
            })}
          </IntervalsContainer>
          {errors?.intervals?.message && (
            <FormError size="sm">{errors.intervals.message}</FormError>
          )}
          <Button type="submit" disabled={isSubmitting}>
            Próximo passo <ArrowRight />
          </Button>
        </IntervalBox>
      </Container>
    </>
  )
}
