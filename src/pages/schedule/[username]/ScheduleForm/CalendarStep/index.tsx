import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Calendar } from '../../../../../components/Calendar'
import { api } from '../../../../../lib/axios'
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerItem,
  TimePickerList,
} from './styles'

interface Availability {
  possibleTimes: number[]
  availableTimes: number[]
}
export function CalendarStep() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const isDateSelected = !!selectedDate
  const router = useRouter()
  const username = String(router.query.username)
  const selectedDateWithoutTime = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null
  const { data: availability } = useQuery<Availability>(
    ['availability', selectedDateWithoutTime],
    async () => {
      const response = await api.get(`/users/${username}/availability`, {
        params: {
          date: selectedDateWithoutTime,
        },
      })
      return response.data
    },
    {
      enabled: !!selectedDate,
    },
  )

  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null
  const selectedDay = selectedDate
    ? dayjs(selectedDate).format('DD [ de ] MMMM')
    : null
  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />
      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{selectedDay}</span>
          </TimePickerHeader>
          <TimePickerList>
            {availability?.possibleTimes.map((time) => {
              return (
                <TimePickerItem
                  key={time}
                  disabled={!availability.availableTimes.includes(time)}
                >
                  {String(time).padStart(2, '0')}:00
                </TimePickerItem>
              )
            })}
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  )
}
