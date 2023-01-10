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
  return res.json({ blockedWeekDays })
}
