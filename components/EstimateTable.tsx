import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"

interface LineItem {
  serviceName: string
  price: number
}

interface EstimateTableProps {
  lineItems: LineItem[]
  totalCost: number
}

export function EstimateTable({ lineItems, totalCost }: EstimateTableProps) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70%]">Service</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.serviceName}</TableCell>
              <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/50">
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="text-right font-bold">${totalCost.toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  )
}
