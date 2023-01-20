// import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }
  const username = String(req.query.username)
  const { year, month } = req.query
  if (!year || !month) {
    return res.status(400).json({ message: 'Year or month is not defined' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })
  if (!user) {
    return res.status(400).json({ message: 'User does not exist' })
  }

  const availableWeeksDay = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })
  const blockedWeekDays = Array.from([0, 1, 2, 3, 4, 5, 6]).filter(
    (weekDay) => {
      return !availableWeeksDay.some((availableWeekDay) => {
        return availableWeekDay.week_day === weekDay
      })
    },
  )
  const blockedDatesRaw: Array<{ day: number }> = await prisma.$queryRaw`
    SELECT 
      EXTRACT(DAY FROM S.date) as day,
      count(S.date) as amount,
      FLOOR((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60) as size
    FROM schedulings S
    LEFT JOIN  user_time_intervals UTI
    ON UTI.week_day = WEEKDAY(DATE_ADD(S.date, INTERVAL 1 DAY))
    WHERE S.user_id = ${user.id}
      AND DATE_FORMAT(S.date, "%Y-%m") = ${`${year}-${month}`}

    GROUP By day, size
    having amount >= size
  `
  const blockedDates = blockedDatesRaw.map((blockedDateRaw) => {
    return blockedDateRaw.day
  })
  return res.json({ blockedWeekDays, blockedDates })
}
