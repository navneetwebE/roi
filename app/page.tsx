'use client'

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { DollarSign, PieChart, Plus, Minus, BarChart } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

const calculateBudgetRange = (revenue: number, lowPercentage: number, highPercentage: number): { min: number; max: number } => {
  const baseRevenue = Math.max(revenue, 10000000)
  const marketingBudget5 = baseRevenue * 0.05
  const marketingBudget10 = baseRevenue * 0.10

  if (baseRevenue > 1000000000) {
    return {
      min: Math.round(50000000 * lowPercentage / 1000) * 1000,
      max: Math.round(100000000 * highPercentage / 1000) * 1000
    }
  }
  return {
    min: Math.round(marketingBudget5 * lowPercentage / 1000) * 1000,
    max: Math.round(marketingBudget10 * highPercentage / 1000) * 1000
  }
}

type ModalProps = {
  title: string
  description: string
  children: React.ReactNode
}

const InfoModal: React.FC<ModalProps> = ({ title, description, children }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto font-semibold">{children}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p>{description}</p>
      </DialogContent>
    </Dialog>
  )
}

type AnimatedValueProps = {
  value: number
  duration?: number
}

const AnimatedValue: React.FC<AnimatedValueProps> = ({ value, duration = 500 }) => {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValueRef = useRef(value)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime

      if (progress < duration) {
        const percentage = progress / duration
        setDisplayValue(Math.floor(previousValueRef.current + (value - previousValueRef.current) * percentage))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      previousValueRef.current = displayValue
    }
  }, [value, duration])

  return formatCurrency(displayValue)
}

type BudgetChartProps = {
  revenue: number
}

const BudgetChart: React.FC<BudgetChartProps> = ({ revenue }) => {
  const generateChartData = () => {
    const data = []
    for (let i = 1; i <= 10; i++) {
      const currentRevenue = revenue * i / 5
      const simple = calculateBudgetRange(currentRevenue, 0.025, 0.02)
      const average = calculateBudgetRange(currentRevenue, 0.0375, 0.03)
      const complex = calculateBudgetRange(currentRevenue, 0.05, 0.04)
      data.push({
        revenue: currentRevenue,
        simple: (simple.min + simple.max) / 2,
        average: (average.min + average.max) / 2,
        complex: (complex.min + complex.max) / 2,
      })
    }
    return data
  }

  const data = generateChartData()

  const formatXAxis = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else {
      return `${(value / 1000).toFixed(1)}K`
    }
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else {
      return `${(value / 1000).toFixed(0)}K`
    }
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="revenue" 
          tickFormatter={formatXAxis}
          label={{ value: 'Revenue', position: 'insideBottom', offset: -10 }}
        />
        <YAxis 
          tickFormatter={formatYAxis}
          label={{ value: 'Website Budget', angle: -90, position: 'insideLeft', offset: 0 }}
        />
        <Tooltip 
          formatter={(value) => formatCurrency(Number(value))}
          labelFormatter={(value) => `Revenue: ${formatCurrency(Number(value))}`}
        />
        <Legend verticalAlign="top" height={36}/>
        <Line type="monotone" dataKey="simple" stroke="#8884d8" name="Simple" />
        <Line type="monotone" dataKey="average" stroke="#fa198c" name="Average" />
        <Line type="monotone" dataKey="complex" stroke="#82ca9d" name="Complex" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function Component() {
  const [revenue, setRevenue] = useState<number>(100000000)
  const [inputValue, setInputValue] = useState<string>(formatCurrency(100000000))

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '')
    const numericValue = Number(rawValue)
    setRevenue(numericValue)
    setInputValue(formatCurrency(numericValue))
  }

  const incrementRevenue = () => {
    const newRevenue = Math.max(revenue + 1000000, 1000000)
    setRevenue(newRevenue)
    setInputValue(formatCurrency(newRevenue))
  }

  const decrementRevenue = () => {
    const newRevenue = Math.max(revenue - 1000000, 1000000)
    setRevenue(newRevenue)
    setInputValue(formatCurrency(newRevenue))
  }

  const baseRevenue = Math.max(revenue, 10000000)
  const marketingBudget5 = Math.round(baseRevenue * 0.05 / 1000) * 1000
  const marketingBudget10 = Math.round(baseRevenue * 0.10 / 1000) * 1000

  const priorityDescriptions = {
    SupportiveRole: "The website contributes minimally to revenue generation and serves a supportive role.",
    SignificantInfluence: "The website significantly influences revenue generation but is not the primary source.",
    KeyDriver: "The website is a key driver of revenue and essential for business profitability."
  }

  const complexityDescriptions = {
    Simple: "Involves basic redesigns or new builds, possibly using no-code platforms with minimal features and straightforward design.",
    Average: "Requires moderate redesigns or new builds, possibly using content management systems (CMS) like WordPress or Drupal with custom features and enhanced user experience.",
    Complex: "Entails comprehensive redesigns or new builds, possibly using digital experience platforms (DXP) or custom databases with intricate designs, advanced features, and full system integrations."
  }

  const budgetMatrix = [
    {
      priority: "Supportive Role",
      simple: calculateBudgetRange(revenue, 0.0125, 0.01),
      average: calculateBudgetRange(revenue, 0.02, 0.02),
      complex: calculateBudgetRange(revenue, 0.0375, 0.03)
    },
    {
      priority: "Significant Influence",
      simple: calculateBudgetRange(revenue, 0.025, 0.02),
      average: calculateBudgetRange(revenue, 0.0375, 0.03),
      complex: calculateBudgetRange(revenue, 0.05, 0.04)
    },
    {
      priority: "Key Driver",
      simple: calculateBudgetRange(revenue, 0.0375, 0.03),
      average: calculateBudgetRange(revenue, 0.05, 0.04),
      complex: calculateBudgetRange(revenue, 0.0625, 0.05)
    }
  ]

  const averageMediumBudget = budgetMatrix[1].average
  const websiteBudgetMin = averageMediumBudget.min
  const websiteBudgetMax = averageMediumBudget.max

  return (
    <div className="container mx-auto p-4 space-y-6 sm:space-y-8 max-w-4xl font-sans">
      <Card className="bg-black text-white">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center sm:text-left">B2B Website Budgeting Calculator</CardTitle>
            <span className="text-base sm:text-lg font-semibold">by Clear Digital</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base sm:text-lg opacity-90 text-center sm:text-left">Estimate your website budget based on your company's annual revenue and project complexity.</p>
        </CardContent>
      </Card>
      
      <Card className="border-black border-2">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-[#fa198c]" />
            Company Annual Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={decrementRevenue}
              aria-label="Decrease revenue by 1 million"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="relative flex-grow">
              <Input
                id="revenue"
                type="text"
                value={inputValue}
                onChange={handleRevenueChange}
                className="text-xl sm:text-2xl font-bold pl-2"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={incrementRevenue}
              aria-label="Increase revenue by 1 million"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {revenue < 10000000 && (
            <p className="text-yellow-600 text-sm mt-2">Note: Budget calculations are based on a minimum revenue of $10,000,000</p>
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2 font-normal">
              <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-[#fa198c]" />
              </div>
              <span className="break-words">5-10% Marketing Budget Suggestion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-500">
              <AnimatedValue value={marketingBudget5} /> - <AnimatedValue value={marketingBudget10} />
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#fa198c] border-4 bg-[#e5e4e7]">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg md:text-xl flex items-center gap-2 font-normal">
              <div className="bg-gray-100 p-2 rounded-full flex-shrink-0">
                <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-[#fa198c]" />
              </div>
              <span className="break-words">Website Budget Suggestion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg sm:text-xl md:text-2xl text-[#fa198c]">
              <AnimatedValue value={websiteBudgetMin} /> - <AnimatedValue value={websiteBudgetMax} />
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl font-normal">Budget Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <BudgetChart revenue={revenue} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg md:text-xl font-normal">Website Budget Ranges</CardTitle>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Business Priority vs. Website Complexity</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]"></TableHead>
                <TableHead><InfoModal title="Simple Complexity" description={complexityDescriptions.Simple}>Simple</InfoModal></TableHead>
                <TableHead>
                  <InfoModal title="Average Complexity" description={complexityDescriptions.Average}>Average</InfoModal>
                </TableHead>
                <TableHead>
                  <InfoModal title="Complex Complexity" description={complexityDescriptions.Complex}>Complex</InfoModal>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetMatrix.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <InfoModal title={`${row.priority}`} description={priorityDescriptions[row.priority as keyof typeof priorityDescriptions]}>{row.priority}</InfoModal>
                  </TableCell>
                  <TableCell className="text-sm sm:text-base">
                    <AnimatedValue value={row.simple.min} /> - <AnimatedValue value={row.simple.max} />
                  </TableCell>
                  <TableCell 
                    className={`text-sm sm:text-base ${row.priority === "Significant Influence" ? "bg-green-100" : ""}`}
                  >
                    <AnimatedValue value={row.average.min} /> - <AnimatedValue value={row.average.max} />
                  </TableCell>
                  <TableCell className="text-sm sm:text-base">
                    <AnimatedValue value={row.complex.min} /> - <AnimatedValue value={row.complex.max} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="text-xs sm:text-sm text-gray-500 justify-center">
          Powered by Clear Digital | © {new Date().getFullYear()} All Rights Reserved
        </CardFooter>
      </Card>
    </div>
  )
}